// monteCarloWorker

onmessage = e => {
    monteCarlo(...e.data);
}

function within(v, a, b) {
    return a <= v && v < b;
}

function maxBonus(compositions) {
    let maxBonusValue = 0;
    const maxBonusValues = [];
    for (const [_5, _4, _3] of compositions) {
        maxBonusValues.push(...Array(_5).fill([0, 150, 100][_5]));
        maxBonusValues.push(...Array(_4).fill((_3 == 0 ? [0, 60, 35, 25] : [0, 50, 35, 25])[_4]));
        maxBonusValues.push(...Array(_3).fill(5));
    }
    return maxBonusValues.sort((a, b) => b - a).slice(0, 7).reduce((a, x) => a + x, 0);
}

function maxSpark(compositions) {
    let maxSparkValue = 0;
    for (const [_5, _4, _3] of compositions) {
        maxSparkValue += 800 * _5;
        maxSparkValue += 500 * _4;
        maxSparkValue += 250 * _3;
    }
    return maxSparkValue;
}

function monteCarlo(composition, scoutCoins) {
    const compositions = composition.split(/\D/).map(x => [...x].map(parseFloat));

    // probabilities
    const bonus5 = [[], [0, 20, 50, 75, 100, 150], [0, 15, 35, 50, 70, 100]];
    const bonus4 = [[], [0, 5, 15, 25, 35, 50], [0, 4, 11, 18, 25, 35], [0, 3, 9, 11, 15, 25]];
    const bonus4Special = [0, 7, 20, 30, 45, 60];
    const bonus3 = [0, 1, 2, 3, 4, 5];
    const maxB = maxBonus(compositions);
    const maxBSeparated = compositions.map(x => maxBonus([x]));
    const maxS = maxSpark(compositions);
    const maxSSeparated = compositions.map(x => maxSpark([x]));

    // record probabilities
    let probs = Array(maxB + 1).fill(0).map(_ => Array(maxS / 10 + 1).fill(0));

    function reportResult(count, result) {
        postMessage({
            simulationCount: count,
            simulationResult: result,
            time: new Date().getTime()
        });
    }
    reportResult(0, probs);

    let c = 0;
    for (; c < 20000;) {
        const pulledAll = Array(3).fill().map(_ => compositions.map(([star5, star4, star3]) => ({
            results: [, , , Array(star3).fill(0), Array(star4).fill(0), Array(star5).fill(0)],
            pulls: 0
        })));
        // main loop
        for (let i = 0, isMaxBonus = false; i < maxS;) {
            // don't simulate if max bonus, but still write data into it
            if (isMaxBonus) {
                i += 10;
                probs[maxB][i / 10]++;
                continue;
            }

            let maxBonusThisRound = 0;
            for (let k = 0; k < (compositions.length == 1 ? 1 : 3); k++) {
                // 0: First gacha 1, then gacha 2; 1: First gacha 2, then gacha 1; 2: Evenly pulled
                let pickedScout = 0;
                if (compositions.length > 1) {
                    if (k == 0) pickedScout = pulledAll[k][0].pulls < maxSSeparated[0] ? 0 : 1;
                    else if (k == 1) pickedScout = pulledAll[k][1].pulls < maxSSeparated[1] ? 1 : 0;
                    else {
                        pickedScout = i / 5 % 1;
                        if (pulledAll[k][pickedScout].pulls >= maxSSeparated[pickedScout]) pickedScout = 1 - pickedScout;
                    }
                }
                const pulled = pulledAll[k][pickedScout];
                pulled.pulls += 10;
                const [star5, star4, star3] = compositions[pickedScout];
                
                // ten pull
                for (let j = 0; j < 10; j++) {
                    let o = Math.random();
                    for (let s = 0; s < star5; s++) if (within(o, s * 0.015, (s + 1) * 0.015) && pulled.results[5][s] < 5) pulled.results[5][s]++;
                    if (j < 9) {
                        for (let s = 0; s < star4; s++) if (within(o - 0.03 * star5, s * 0.023, (s + 1) * 0.023) && pulled.results[4][s] < 5) pulled.results[4][s]++;
                        for (let s = 0; s < star3; s++) if (within(o - 0.08 - 0.03 * star5, s * 0.1, (s + 1) * 0.1) && pulled.results[3][s] < 5) pulled.results[3][s]++;
                    }
                    else {
                        const puRate = 0.3 / star4;
                        for (let s = 0; s < star4; s++) if (within(o - 0.03 * star5, s * puRate, (s + 1) * puRate) && pulled.results[4][s] < 5) pulled.results[4][s]++;
                    }
                }

                for (let l = 0; l < 2; l++) {
                    const _pulled = [, , , [], [], []];
                    for (let n = 0; n < pulledAll[k].length; n++) {
                        for (let star = 3; star < 6; star++) {
                            for (const j of pulledAll[k][n].results[star]) {
                                _pulled[star].push({
                                    copies: j,
                                    bonus: [
                                        , 
                                        , 
                                        , 
                                        bonus3, 
                                        pulledAll[k][n].results[3].length == 0 && pulledAll[k][n].results[4].length == 1 ? bonus4Special : bonus4[pulledAll[k][n].results[4].length],
                                        bonus5[pulledAll[k][n].results[5].length]
                                    ][star]
                                });
                            }
                        }
                    }

                    let coins = i + 10 + scoutCoins;
                    // add sparks
                    if (l == 0) {
                        // l = 0: Exchange for 5* first
                        for (let s = 0; s < _pulled[5].length; s++) {
                            for (let x = 0; _pulled[5][s].copies < 5 && coins >= Math.max(300 - x * 100, 100); x++) {
                                coins -= Math.max(300 - x * 100, 100);
                                _pulled[5][s].copies++;
                            }
                        }
                    }
                    for (let s = 0; s < _pulled[4].length; s++) {
                        for (let x = 0; _pulled[4][s].copies < 5 && coins >= 100; x++) {
                            coins -= 100;
                            _pulled[4][s].copies++;
                        }
                    }
                    if (l == 1) {
                        // l = 1: Exchange for 4* first
                        for (let s = 0; s < _pulled[5].length; s++) {
                            for (let x = 0; _pulled[5][s].copies < 5 && coins >= Math.max(300 - x * 100, 100); x++) {
                                coins -= Math.max(300 - x * 100, 100);
                                _pulled[5][s].copies++;
                            }
                        }
                    }
                    for (let s = 0; s < _pulled[3].length; s++) {
                        for (let x = 0; _pulled[3][s].copies < 5 && coins >= 50; x++) {
                            coins -= 50;
                            _pulled[3][s].copies++;
                        }
                    }

                    const probs = _pulled.map(x => x ? x.map(y => y.bonus[y.copies]) : []).flat().sort((a, b) => b - a).slice(0, 7);
                    const prob = probs.reduce((a, x) => a + x, 0);
                    if (prob > maxBonusThisRound) maxBonusThisRound = prob;
                }
            }

            i += 10;
            if (maxBonusThisRound == maxBonus) isMaxBonus = true;
            probs[maxBonusThisRound][i / 10]++;
        }

        c++;
        if (c == 100 || c % 1000 == 0) reportResult(c, probs);
    }
}
