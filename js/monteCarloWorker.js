// monteCarloWorker

onmessage = e => {
    monteCarlo(...e.data);
}

function within(v, a, b) {
    return a <= v && v < b;
}

function monteCarlo(star5, star4, star3) {
    // probabilities
    let bonus5 = [0, 20, 50, 75, 100, 150];
    let bonus4 = [0, 5, 15, 25, 35, 50];
    let bonus3 = [0, 1, 2, 3, 4, 5];
    let maxBonus = 5 * star3 + 200;
    let maxSpark = 800 * star5 + 500 * star4 + 250 * star3;
    if (star5 == 2) {
        bonus5 = [0, 15, 35, 50, 70, 100];
        maxBonus += 50;
    }
    if (star4 == 2) {
        bonus4 = [0, 4, 11, 18, 25, 35];
        maxBonus += 20;
    }
    else if (star4 == 1 && star3 == 0) {
        bonus4 = [0, 7, 20, 30, 45, 60];
        maxBonus += 10;
    }

    // record probabilities
    let probs = Array(maxBonus + 1).fill(0).map(_ => Array(maxSpark / 10 + 1).fill(0));

    function reportResult(count, result) {
        postMessage({
            simulationCount: count,
            simulationResult: result,
            time: new Date().getTime()
        });
    }
    reportResult(0, probs);

    let c = 0;
    for (; c < 1000000;) {
        let pulled = [, , , Array(star3).fill(0), Array(star4).fill(0), Array(star5).fill(0)];
        // main loop
        for (let i = 0, isMaxBonus = false; i < maxSpark;) {
            // don't simulate if max bonus, but still write data into it
            if (isMaxBonus) {
                i += 10;
                probs[maxBonus][i / 10]++;
                continue;
            }

            // ten pull
            for (let j = 0; j < 10; j++, i++) {
                let o = Math.random();
                for (let s = 0; s < star5; s++) if (within(o, s * 0.01, (s + 1) * 0.01) && pulled[5][s] < 5) pulled[5][s]++;
                if (j < 9) {
                    for (let s = 0; s < star4; s++) if (within(o - 0.03, s * 0.02, (s + 1) * 0.02) && pulled[4][s] < 5) pulled[4][s]++;
                    for (let s = 0; s < star3; s++) if (within(o - 0.1, s * 0.1, (s + 1) * 0.1) && pulled[3][s] < 5) pulled[3][s]++;
                }
                else {
                    const puRate = 0.28 / star4;
                    for (let s = 0; s < star4; s++) if (within(o - 0.03, s * puRate, (s + 1) * puRate) && pulled[4][s] < 5) pulled[4][s]++;
                }
            }
            const _pulled = pulled.map(x => x && [...x].sort((a, b) => b - a));

            // add sparks
            let coins = i;
            for (let s = 0; s < star5; s++) {
                for (let x = 0; _pulled[5][s] < 5 && coins >= Math.max(300 - x * 100, 100); x++) {
                    coins -= Math.max(300 - x * 100, 100);
                    _pulled[5][s]++;
                }
            }
            for (let s = 0; s < star4; s++) {
                for (let x = 0; _pulled[4][s] < 5 && coins >= 100; x++) {
                    coins -= 100;
                    _pulled[4][s]++;
                }
            }
            for (let s = 0; s < star3; s++) {
                for (let x = 0; _pulled[3][s] < 5 && coins >= 50; x++) {
                    coins -= 50;
                    _pulled[3][s]++;
                }
            }
            const prob = _pulled[3].reduce((a, x) => a + bonus3[x], 0)
                    + _pulled[4].reduce((a, x) => a + bonus4[x], 0)
                    + _pulled[5].reduce((a, x) => a + bonus5[x], 0);
            if (prob == maxBonus) isMaxBonus = true;
            probs[prob][i / 10]++;
        }

        c++;
        if (c == 10000 || c % 100000 == 0) reportResult(c, probs);
    }
}
