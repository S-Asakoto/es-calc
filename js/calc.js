Number.prototype.padZero = function(length) {
    if (String.prototype.padStart)
        return ("" + this).padStart(length, 0);
    else {
        let a = "" + this;
        while (a.length < length)
            a = "0" + this;
        return a;
    }
};

Date.prototype.toMyString = function() {
    let tz = this.getTimezoneOffset(), tzSign = tz <= 0 ? "+" : "-", tzH = Math.abs(tz) / 60 |0, tzM = Math.abs(tz) % 60;
    return this.getFullYear().padZero(4) + "-"
           + (this.getMonth() + 1).padZero(2) + "-"
           + this.getDate().padZero(2) + " "
           + this.getHours().padZero(2) + ":"
           + this.getMinutes().padZero(2) + ":"
           + this.getSeconds().padZero(2) + "+" + tzH.padZero(2) + tzM.padZero(2);
};

function isInEvent(date, isBasic) {
    let y = date.getUTCFullYear(), isLeap = y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
    let nowDayUTC = date.getUTCDate() + date.getUTCHours() / 24;
    if (nowDayUTC > 28)
        nowDayUTC -= [31, 28 + isLeap, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][date.getUTCMonth()];
    return (nowDayUTC >= 0.25 && nowDayUTC < 8 + 13/24 + isBasic) || (nowDayUTC >= 15.25 && nowDayUTC < 23 + 13/24 + isBasic);
}

function eventEnd(date, isBasic) {
    let y = date.getUTCFullYear(), isLeap = y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
    let nowDayUTC = date.getUTCDate() + date.getUTCHours() / 24;
    date.setUTCHours(13, 0, 0);
    if (nowDayUTC < 8 + 13/24 + isBasic) 
        date.setUTCDate(8 + isBasic);
    else if (nowDayUTC < 23 + 13/24 + isBasic) 
        date.setUTCDate(23 + isBasic);
    else 
        date.setUTCDate([31, 28 + isLeap, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][date.getUTCMonth()] + 8 + isBasic);
    return date;
}

let func = null;
    
function bindController(block, value = "", changeFunc = null) {
    if (block.bound)
        return;

    let blockInput = $("select, input", block),
        blockHead = $("h6", block),
        blockShowValue = $("h6 .value", block);

    (block.setValue = function(value) {
        if (block.id != "param1" && block.id != "param2") {
            $("#comparison").hide();
            func = null;
        }
        if (value instanceof Function)
            value = value();
        blockInput.val(value);
        if (blockInput[0].checkValidity()) {
            block.value = value;
            let format = blockShowValue.attr("data-format");
            blockShowValue.text(
                value
                ? blockInput.is("select")  
                    ? $("option[value=" + blockInput.val() + "]", blockInput).text()
                    : format ? (format.indexOf("translate:") == 0 ? format.slice(10).translate() : format).replace(/\{(.*?)\}/, function(_, a) {
                        if (a.indexOf(",") == -1)
                            return blockInput.val();
                        else {
                            let temp = /\d+/.exec(a), digits = temp ? +temp[0] : 0;
                            return (+blockInput.val()).toLocaleString(undefined, {minimumFractionDigits: digits, maximumFractionDigits: digits});
                        }
                    })
                    : blockInput.val()
                : "NOT_SET".translate()
            );
            window.localStorage.setItem(block.id, value);
            
            if (changeFunc)
                changeFunc();
            return true;
        }
        else
            return false;
    })(block.defaultValue = value);

    $("button.confirm", block).on("click", function() {
        if (block.setValue(blockInput.val()) && $(".card-body", block).is(":visible"))
            blockHead.trigger("click");
    });

    $("button.reset", block).on("click", block.reset = function() {
        block.setValue(block.defaultValue);
        if ($(".card-body", block).is(":visible"))
            blockHead.trigger("click");
    });

    block.bound = true;
}

function bpRewards(score) {
    if (score < 6000)
        return 0;
    else if (score < 40000)
        return 3;
    else if (score < 90000)
        return 6;
    else if (score < 140000)
        return 9;
    else if (score < 260000)
        return 12;
    else if (score < 360000)
        return 15;
    else if (score < 420000)
        return 20;
    else if (score < 540000)
        return 25;
    else if (score < 1050000)
        return 30;
    else if (score < 2550000)
        return 40;
    else if (score < 3000000)
        return 50;
    else 
        return 60;
}

function nextRank(rank) {
    return rank * 200 - Math.max(0, (rank - 25) * 100);
}

const expectedPullsLookup = [
    [0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    [10, [0, 1, 2, 3, 4, 5, 6, 7, 19, 20, 21, 56]],
    [20, [0, 1, 2, 3, 4, 5, 9, 20, 29, 30, 31, 79]],
    [30, [0, 1, 3, 4, 6, 10, 19, 30, 41, 42, 43, 95]],
    [40, [0, 2, 5, 7, 9, 14, 27, 40, 55, 56, 57, 111]],
    [50, [1, 5, 7, 10, 13, 23, 34, 50, 64, 65, 66, 132]],
    [60, [1, 7, 9, 14, 15, 27, 43, 59, 79, 80, 81, 142]],
    [70, [1, 8, 10, 15, 25, 35, 45, 65, 85, 86, 87, 160]],
    [80, [1, 9, 14, 24, 25, 42, 59, 78, 95, 96, 97, 175]],
    [90, [1, 10, 15, 25, 35, 45, 60, 80, 110, 111, 112, 195]],
    [100, [5, 15, 25, 35, 45, 60, 79, 85, 110, 111, 112, 210]],
    [110, [5, 15, 35, 45, 55, 60, 80, 108, 110, 111, 112, 210]],
    [120, [5, 25, 35, 45, 60, 61, 80, 110, 135, 136, 137, 210]],
    [130, [5, 25, 35, 58, 60, 61, 80, 110, 135, 136, 137, 210]],
    [140, [5, 25, 45, 60, 61, 62, 80, 110, 135, 136, 137, 210]],
    [150, [6, 35, 45, 60, 61, 80, 81, 110, 135, 136, 137, 210]],
    [160, [6, 35, 55, 60, 61, 80, 81, 110, 135, 136, 137, 210]],
    [170, [6, 35, 60, 61, 62, 80, 95, 110, 135, 136, 137, 210]],
    [180, [6, 35, 60, 61, 62, 80, 110, 135, 160, 161, 162, 210]],
    [190, [6, 45, 60, 61, 62, 80, 110, 135, 160, 161, 162, 210]],
    [200, [15, 60, 61, 62, 63, 80, 110, 135, 160, 161, 162, 210]],
    [230, [15, 60, 61, 62, 80, 81, 110, 135, 160, 161, 162, 210]],
    [250, [16, 60, 61, 62, 80, 81, 110, 135, 210, 210, 210, 210]],
    [260, [16, 60, 61, 62, 80, 81, 110, 160, 210, 210, 210, 210]],
    [270, [16, 60, 61, 62, 80, 110, 135, 160, 210, 210, 210, 210]],
    [300, [25, 80, 81, 110, 111, 135, 160, 210, 210, 210, 210, 210]],
    [350, [26, 80, 81, 110, 111, 135, 160, 210, 210, 210, 210, 210]],
    [370, [26, 80, 81, 110, 111, 135, 210, 210, 210, 210, 210, 210]],
    [390, [26, 80, 81, 110, 135, 136, 210, 210, 210, 210, 210, 210]],
    [400, [35, 80, 81, 110, 135, 160, 210, 210, 210, 210, 210, 210]],
    [450, [36, 80, 81, 110, 135, 160, 210, 210, 210, 210, 210, 210]],
    [460, [36, 80, 110, 111, 135, 160, 210, 210, 210, 210, 210, 210]],
    [480, [36, 80, 110, 135, 136, 160, 210, 210, 210, 210, 210, 210]],
    [500, [50, 110, 135, 160, 161, 210, 210, 210, 210, 210, 210, 210]],
    [540, [50, 110, 135, 160, 210, 210, 210, 210, 210, 210, 210, 210]],
    [550, [51, 110, 135, 160, 210, 210, 210, 210, 210, 210, 210, 210]],
    [600, [75, 135, 160, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [650, [76, 135, 160, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [670, [76, 135, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [690, [76, 160, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [700, [100, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [750, [101, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [800, [150, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [850, [151, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [900, [155, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [950, [156, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1000, [165, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1050, [166, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1100, [175, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1150, [176, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1200, [185, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1250, [186, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1300, [200, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1350, [201, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1400, [202, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1450, [203, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1500, [204, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1550, [205, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1600, [206, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1650, [207, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1700, [208, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1750, [209, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]],
    [1800, [210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210]]
];

const percentiles = [1, 0.999, 0.99, 0.95, 0.9, 0.75, 0.5, 0.25, 0.1, 0.05, 0.01, 0.001];

function maxBonus(noFiveStar) {
    let maxBonusValue = 5 * $("#star_3")[0].value;
    maxBonusValue += [, $("#star_3")[0].value == 0 ? 60 : 50, 70][+$("#star_4")[0].value];
    if (!noFiveStar) maxBonusValue += [, 150, 200][+$("#star_5")[0].value];
    return maxBonusValue;
}

function expectedPullsSingle(bonus, percentile) {
    if (bonus == 0) return 0;
    if (bonus > maxBonus(false)) return Infinity;
    
    if (window.Worker) {
        if (monteCarloResult && monteCarloResult.simulationCount)
            for (let i = 1; i < monteCarloResult.simulationResult[bonus].length; i++)
                if (monteCarloResult.simulationResult[bonus][i] >= percentiles[percentile] * monteCarloResult.simulationCount)
                    return i * 10;

        return 0;
    }

    if (bonus > 210) bonus = 210; // legacy code
    return expectedPullsLookup.find(x => x[1][percentile] >= bonus)[0];
}

function expectedPulls(bonus, percentile, isCrossScout) {
    if (bonus == 0) return 0;

    const noFiveStarMaxBonus = maxBonus(true);
    const allMaxBonus = maxBonus(false);
    if (bonus > allMaxBonus * 2) return Infinity;
    
    const tryBonuses = [];
    if (isCrossScout) tryBonuses.push(2 * expectedPullsSingle(Math.ceil(bonus / 2), percentile));
    if (bonus <= allMaxBonus) tryBonuses.push(expectedPullsSingle(bonus, percentile));
    if (bonus >= noFiveStarMaxBonus && bonus <= allMaxBonus + noFiveStarMaxBonus)
        tryBonuses.push(expectedPullsSingle(bonus - noFiveStarMaxBonus, percentile) + expectedPullsSingle(noFiveStarMaxBonus, percentile));
    
    return Math.min(...tryBonuses);
}

function calcMusic(parameters, verbose) {
    let {
        eventType, nowTime, endTime, nowPt, targetPt, 
        score1, score2, score3, bp1, bp2, bpWork, usePass, 
        bonus, bonus4, bonusE, fever, sleep, advanced, bp, 
        ticket, pass, rank, remExp, ticketLimit, 
        ticketSpeed, isEventWork, loginBonus, nowWhistles, nowMegaphones, 
        nowBells, percentile, isCrossScout
    } = parameters;

    bonus = 1 + bonus / 100;
    bonus4 = 1 + bonus4 / 100;
    bonusE = 1 + bonusE / 100;
    fever = 1 + fever / 100;
    if (!advanced) 
        bp = ticket = 0;
    
    let hoursRemaining = (new Date(endTime).getTime() - new Date(nowTime).getTime()) / 3600000,
        daysRemaining = (new Date(endTime).getTime() / 86400000 + 0.375 |0) - (new Date(nowTime).getTime() / 86400000 + 0.375 |0),
        bpRecovery = bpRewards(targetPt) - bpRewards(nowPt);
    bp += (hoursRemaining * 2 |0) - Math.max(0, sleep * 2 - 10) * daysRemaining + bpRecovery + nowWhistles + nowMegaphones * 10;
    
    let returnVerbose = {}, dias = 0, rank1 = rank, remExp1 = remExp;
    let work = (isEventWork ? 375 : 250) * [1, 4, 8, 12][bpWork];
    let rankUp = 0, _ru = 0;

    if (eventType == 0 || eventType == 3) {
        let pt1 = (2000 + score1 / 5000 |0) * bp1 * bonus |0,
            pt2 = (10000 + score2 / 5000 |0) * usePass * bonusE / 100 |0,
            ptPerBP = pt1 / bp1 + pt2 * 10 / usePass;

        if (loginBonus == 0 && eventType != 3)
            pass += [0, 50, 100, 150, 200, 250, 300, 350, 450][daysRemaining];
        /*else if (loginBonus == 1)
            bp += [0, 3, 6, 9, 12, 15, 18, 21, 121][daysRemaining];*/
        else {
            pass += [0, 50, 100, 150, 200, 250, 300, 400, 400][daysRemaining];
            if (daysRemaining == 8) bp += [eventType == 3 ? 50 : 0, , 100, 125][loginBonus];
        }

        let ptsRemaining = targetPt - nowPt;

        returnVerbose = {
            pointsFromNormalSongs: pt1,
            pointsFromSpecialSongs: pt2,
            pointsPerBP: ptPerBP,
            daysRemaining,
            hoursRemaining,
            bpRemaining: bp
        };

        ptsRemaining -= pass * pt2 / usePass;
        
        let bpNeeded = Math.ceil(ptsRemaining / ptPerBP);
        let eventSongTimes = Math.ceil((bpNeeded * 10 + pass) / usePass);
        let normalSongTimes = Math.ceil(bpNeeded / bp1);

        if (advanced) { 
            returnVerbose.rankUps = 0;
            returnVerbose.ticketsRemaining = ticket += (hoursRemaining * 60 / ticketSpeed |0) - Math.max(0, Math.ceil(sleep * 60 / ticketSpeed - ticketLimit)) * daysRemaining + nowBells;
       
            while (true) {
                let _ptsRemaining = ptsRemaining - ticket * (work + pt2 * [1, 4, 8, 12][bpWork] / usePass),
                    _bpNeeded = Math.ceil(_ptsRemaining / ptPerBP),
                    _eventSongTimes = Math.ceil((_bpNeeded * 10 + pass + ticket * [1, 4, 8, 12][bpWork]) / usePass),
                    _normalSongTimes = Math.ceil(_bpNeeded / bp1);

                _ru = 0;
                let totalExp = (ticket * (bpWork + 1) + _eventSongTimes + _normalSongTimes * [1, 5, 8, 10, , , 15, , , , 20][bp1]) * 20,
                    _remExp = remExp;

                while (totalExp >= _remExp + 400 + 20 * ticketLimit * (bpWork + 1)) {
                    _ru++;
                    totalExp -= _remExp;
                    _remExp = nextRank(rank + _ru);
                }
                remExp1 = _remExp - totalExp;
                rank1 = rank + _ru;

                if (_ru >= rankUp) {
                    bpNeeded = _bpNeeded;
                    eventSongTimes = _eventSongTimes;
                    normalSongTimes = _normalSongTimes;
                    returnVerbose.ticketsRemaining = ticket;
                    returnVerbose.bpRemaining = bp;
                    returnVerbose.rankUps = rankUp;
                }
                else
                    break;

                rankUp++;
                ticket += ticketLimit;
                bp += 10;
            }
            bpNeeded += returnVerbose.ticketsRemaining * bpWork;
        }

        dias = (bpNeeded - returnVerbose.bpRemaining) * 2;
        returnVerbose.bpNeeded = bpNeeded;
        returnVerbose.eventSongTimes = eventSongTimes;
        returnVerbose.normalSongTimes = normalSongTimes;
        if (advanced)
            returnVerbose.totalRibbons = (bpNeeded - returnVerbose.ticketsRemaining * bpWork) * 3 + eventSongTimes * usePass / 10 + (isEventWork ? 4.6 * returnVerbose.ticketsRemaining * (bpWork + 1) : 0);
        else
            returnVerbose.totalRibbons = bpNeeded * 3 + eventSongTimes * usePass / 10;
        returnVerbose.liveFans = normalSongTimes * [2, 10, 16, 20, , , 30, , , , 40][bp1] + eventSongTimes * 2;
        returnVerbose.timeNeeded = (eventSongTimes + normalSongTimes) * 0.05;

        if (bp1 == 10) {
            let resetBP = Math.ceil(normalSongTimes * 0.1);
            returnVerbose.bpRemaining -= resetBP;
            dias += resetBP * 2;
        }
    }
    else if (eventType == 1) {
        let pt1 = (2500 + score1 / 5000 |0) * bp1 * bonus |0,
            pt3 = (2250 + score3 / 5000 |0) * bp2 * bonus4 * fever |0,
            ptPerBP = (pt1 * 3 + pt3) / (bp1 * 3 + bp2);
            
        bp += [0, 3, 6, 9, 12, 15, 18, 21, loginBonus == 3 ? 146 : loginBonus ? 121 : 24][daysRemaining];
        
        let ptsRemaining = targetPt - nowPt;

        returnVerbose = {
            pointsFromNormalSongs: pt1,
            pointsFromFeverSongs: pt3,
            pointsPerBP: ptPerBP,
            daysRemaining,
            hoursRemaining,
            bpRemaining: bp
        };
        
        let bpNeeded = Math.ceil(ptsRemaining / ptPerBP);
        let setlistTimes = Math.ceil(bpNeeded / (bp1 * 3 + bp2));
        
        if (advanced) {
            returnVerbose.rankUps = 0;
            returnVerbose.ticketsRemaining = ticket += (hoursRemaining * 60 / ticketSpeed |0) - Math.max(0, Math.ceil(sleep * 60 / ticketSpeed - ticketLimit)) * daysRemaining + nowBells;
       
            while (true) {
                let _ptsRemaining = ptsRemaining - ticket * work,
                    _bpNeeded = Math.ceil(_ptsRemaining / ptPerBP),
                    _setlistTimes = Math.ceil(_bpNeeded / (bp1 * 3 + bp2));

                _ru = 0;
                let totalExp = (ticket * (bpWork + 1) + _setlistTimes * ([1, 5, 8, 10, , , 15, , , , 20][bp1] * 3 + [1, 5, 8, 10, , , 15, , , , 20][bp2])) * 20,
                    _remExp = remExp;

                while (totalExp >= _remExp + 400 + 20 * ticketLimit * (bpWork + 1)) {
                    _ru++;
                    totalExp -= _remExp;
                    _remExp = nextRank(rank + _ru);
                }
                remExp1 = _remExp - totalExp;
                rank1 = rank + _ru;

                if (_ru >= rankUp) {
                    bpNeeded = _bpNeeded;
                    setlistTimes = _setlistTimes;
                    returnVerbose.ticketsRemaining = ticket;
                    returnVerbose.bpRemaining = bp;
                    returnVerbose.rankUps = rankUp;
                }
                else
                    break;

                rankUp++;
                ticket += ticketLimit;
                bp += 10;
            }
            bpNeeded += returnVerbose.ticketsRemaining * bpWork;
        }
        
        dias = (bpNeeded - returnVerbose.bpRemaining) * 2;
        returnVerbose.bpNeeded = bpNeeded;
        returnVerbose.setlistTimes = setlistTimes;
        returnVerbose.liveFans = setlistTimes * ([2, 10, 16, 20, , , 30, , , , 40][bp1] * 3 + [2, 10, 16, 20, , , 30, , , , 40][bp2]);
        returnVerbose.timeNeeded = setlistTimes * 0.2;
        
        if (bp1 == 10 || bp2 == 10) {
            let resetBP = Math.ceil(returnVerbose.timeNeeded * 2);
            returnVerbose.bpRemaining -= resetBP;
            dias += resetBP * 2;
        }
    }
    else {
        let pt1 = (2500 + score1 / 5000 |0) * bp1 * bonus |0,
            pt2 = (10000 + score2 / 5000 |0) * usePass * bonusE / 100 |0,
            pt3 = (2250 + score3 / 5000 |0) * bp2 * bonus4 * fever |0,
            ptPerBP = (pt1 * 3 + pt3) / (bp1 * 3 + bp2) + pt2 * 10 / usePass;

        if (loginBonus == 3){
            bp += [0, 0, 0, 0, 5, 10, 15, 15, 145][daysRemaining];
            pass += [0, 50, 100, 150, 200, 250, 300, 400, 400][daysRemaining];
        }
        else 
            bp += [0, 3, 6, 9, 12, 15, 18, 21, loginBonus ? 121 : 24][daysRemaining];
        
        let ptsRemaining = targetPt - nowPt;

        returnVerbose = {
            pointsFromNormalSongs: pt1,
            pointsFromSpecialSongs: pt2,
            pointsFromFeverSongs: pt3,
            pointsPerBP: ptPerBP,
            daysRemaining,
            hoursRemaining,
            bpRemaining: bp
        };
        
        ptsRemaining -= pass * pt2 / usePass;
        
        let bpNeeded = Math.ceil(ptsRemaining / ptPerBP);
        let setlistTimes = Math.ceil(bpNeeded / (bp1 * 3 + bp2));
        let eventSongTimes = Math.ceil((bpNeeded * 10 + pass) / usePass);
        
        if (advanced) {
            returnVerbose.rankUps = 0;
            returnVerbose.ticketsRemaining = ticket += (hoursRemaining * 60 / ticketSpeed |0) - Math.max(0, Math.ceil(sleep * 60 / ticketSpeed - ticketLimit)) * daysRemaining + nowBells;
       
            while (true) {
                let _ptsRemaining = ptsRemaining - ticket * (work + pt2 * [1, 4, 8, 12][bpWork] / usePass),
                    _bpNeeded = Math.ceil(_ptsRemaining / ptPerBP),
                    _setlistTimes = Math.ceil(_bpNeeded / (bp1 * 3 + bp2)),
                    _eventSongTimes = Math.ceil((_bpNeeded * 10 + pass + ticket * [1, 4, 8, 12][bpWork]) / usePass);

                _ru = 0;
                let totalExp = (ticket * (bpWork + 1) + _eventSongTimes + _setlistTimes * ([1, 5, 8, 10, , , 15, , , , 20][bp1] * 3 + [1, 5, 8, 10, , , 15, , , , 20][bp2])) * 20,
                    _remExp = remExp;

                while (totalExp >= _remExp + 400 + 20 * ticketLimit * (bpWork + 1)) {
                    _ru++;
                    totalExp -= _remExp;
                    _remExp = nextRank(rank + _ru);
                }
                remExp1 = _remExp - totalExp;
                rank1 = rank + _ru;

                if (_ru >= rankUp) {
                    bpNeeded = _bpNeeded;
                    setlistTimes = _setlistTimes;
                    eventSongTimes = _eventSongTimes;
                    returnVerbose.ticketsRemaining = ticket;
                    returnVerbose.bpRemaining = bp;
                    returnVerbose.rankUps = rankUp;
                }
                else
                    break;
                    
                rankUp++;
                ticket += ticketLimit;
                bp += 10;
            }
            bpNeeded += returnVerbose.ticketsRemaining * bpWork;
        }
        
        dias = (bpNeeded - returnVerbose.bpRemaining) * 2;
        returnVerbose.bpNeeded = bpNeeded;
        returnVerbose.setlistTimes = setlistTimes;
        returnVerbose.eventSongTimes = eventSongTimes;
        if (advanced)
            returnVerbose.totalRibbons = (bpNeeded - returnVerbose.ticketsRemaining * bpWork) * 3 + eventSongTimes * usePass / 10 + (isEventWork ? 4.6 * returnVerbose.ticketsRemaining * (bpWork + 1): 0);
        else
            returnVerbose.totalRibbons = bpNeeded * 3 + eventSongTimes * usePass / 10;
        returnVerbose.liveFans = setlistTimes * ([2, 10, 16, 20, , , 30, , , , 40][bp1] * 3 + [2, 10, 16, 20, , , 30, , , , 40][bp2]) + eventSongTimes * 2;
        returnVerbose.timeNeeded = eventSongTimes * 0.05 + setlistTimes * 0.2;
        
        if (bp1 == 10 || bp2 == 10) {
            let resetBP = Math.ceil(setlistTimes * 0.4);
            returnVerbose.bpRemaining -= resetBP;
            dias += resetBP * 2;
        }
    }

    returnVerbose.dias = dias;
    
    if (advanced) {
        if (percentile >= 0) {
            let pulls = expectedPulls(Math.round((Math.max(bonus, bonus4, bonusE) - 1) * 100), percentile, isCrossScout);
            returnVerbose.pulls = pulls;
            returnVerbose.totalDias = Math.max(0, dias) + pulls * 35;
        }
        
        returnVerbose.rankUpDetail = "RANK_UP_DETAILS".translate().replace(/\{(\d)\}/g, (_, x) => [rank1, remExp1][x]);
    }

    if (verbose) 
        return returnVerbose;
    else
        return dias;
}

function initCommon() {

}

function checkParamOptions() {
    let eventType = $("#event_type")[0],
        param1 = $("#param1")[0],
        param2 = $("#param2")[0];

    if (!param2.bound || !param1.bound || !eventType.bound)
        return;

    if (eventType.value == 0 || eventType.value == 3) {
        if ($("#details").prop("checked")) 
            $("#comparison option[value=bp1]").show().prop("disabled", false);
        else {
            $("#comparison option[value=bp1]").hide().prop("disabled", true);
            $("#param1, #param2").each(function() {
                if (this.value == "bp1")
                    this.reset();
            });
        }

        $("#comparison option[value=bp2]").hide().prop("disabled", true);
        $("#param1, #param2").each(function() {
            if (this.value == "bp2")
                this.reset();
        });
        
        $("#comparison option[value=fever]").hide().prop("disabled", true);
        $("#param1, #param2").each(function() {
            if (this.value == "fever")
                this.reset();
        });
        
        $("#comparison option[value=score2]").show().prop("disabled", false);
        $("#comparison option[value=score3]").hide().prop("disabled", true);
        $("#param1, #param2").each(function() {
            if (this.value == "score3")
                this.reset();
        });
    }
    else if (eventType.value == 1) {
        $("#comparison option[value=bp1]").show().prop("disabled", false);
        $("#comparison option[value=bp2]").show().prop("disabled", false);
        $("#comparison option[value=fever]").show().prop("disabled", false);
        
        $("#comparison option[value=score3]").show().prop("disabled", false);
        $("#comparison option[value=score2]").hide().prop("disabled", true);
        $("#param1, #param2").each(function() {
            if (this.value == "score2")
                this.reset();
        });
    }
    else {
        $("#comparison option[value=bp1]").show().prop("disabled", false);
        $("#comparison option[value=bp2]").show().prop("disabled", false);
        $("#comparison option[value=fever]").show().prop("disabled", false);
        $("#comparison option[value=score3]").show().prop("disabled", false);
        $("#comparison option[value=score2]").show().prop("disabled", false);
    }
}

let monteCarloResult = {
    simulationCount: 0,
    simulationResult: Array(271).fill(0).map(_ => Array(261).fill(0))
};
let monteCarloWorker = null;

function drawMusic(params, key) {
    let copy = Object.assign({}, params);
    let canvas = $("#graph")[0],
        ctx = canvas.getContext("2d");
    let w = canvas.width = canvas.clientWidth,
        h = canvas.height = canvas.clientHeight = Math.max(500, canvas.clientWidth / 2.5),
        m = Math.min(w, h) / 100;

    ctx.fillStyle = "white";
    ctx.strokeStyle = "transparent";
    ctx.fillRect(0, 0, w, h);
    
    let min = 0, max = 0, step = 1;
    let lb = 75, rb = w - 10, tb = 10, bb = h - 80, q = 0;
    let unit = "";
    if (key == "nowPt" || key == "targetPt")
        [min, max, step] = [0, params.eventType == 2 ? 30000000 : 22000000, 10000];
    else if (key == "score1" || key == "score2" || key == "score3")
        [min, max, step] = [5000, 5500000, 5000];
    else if (key == "bp1") {
        [min, max, step] = params.eventType == 0 || params.eventType == 3 ? [1, 10, [1, 2, 3, 6, 10]] : [3, 10, [3, 6, 10]];
        unit = " BP";
        q = 20;
    }
    else if (key == "bp2") {
        [min, max, step] = [3, 10, [3, 6, 10]];
        unit = " BP";
        q = 20;
    }
    else if (key == "bonus") {
        [min, max, step] = [0, maxBonus(false) * 2, 1];
        unit = "%";
        q = 20;
    }
    else if (key == "fever") {
        [min, max, step] = [60, 110.000000001, 5/3];
        unit = "%";
        q = 20;
    }
    
    let values = [], vmin = Infinity, vmax = -Infinity;
    if (step instanceof Array) {
        values = step.map(function(x) {
            copy[key] = x;
            if (key == "bonus") {
                copy.bonus4 = x;
                copy.bonusE = x;
            }
            let v = calcMusic(copy, false);
            let v1 = copy.advanced && copy.percentile >= 0 ? v + expectedPulls(copy.bonus, copy.percentile, copy.isCrossScout) * 35 : v;
            if (v < vmin)
                vmin = v;
            if (v1 > vmax)
                vmax = v1;
            return [x, v, v1];
        });
    }
    else {
        for (let i = min; i <= max; i += step) {
            copy[key] = i;
            if (key == "bonus") {
                copy.bonus4 = i;
                copy.bonusE = i;
            }
            let v = calcMusic(copy, false);
            let v1 = copy.advanced && copy.percentile >= 0 ? v + expectedPulls(copy.bonus, copy.percentile, copy.isCrossScout) * 35 : v;
            if (v < vmin)
                vmin = v;
            if (v1 > vmax)
                vmax = v1;
            values.push([i, v, v1]);
        }    
    }
    
    let zeroPos = 0;
    if (vmax <= 0) {
        zeroPos = tb;
        bb = h - 30;
    }
    else if (vmin < 0) {
        bb = Math.min(h - 30, (h - 90 + q) * (1 - vmin / vmax) + tb * (1 - 1 / vmax));    
        zeroPos = tb + vmax * (bb - tb) / (vmax - vmin);
    } 
    else
        zeroPos = bb = h - 80 + q;
    
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText($("option[value=" + key + "]", "#param1").text(), lb + (rb - lb) / 2, h - 10);
    ctx.save();
    ctx.translate(10, tb + (bb - tb) / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText("DIAMONDS_NEEDED".translate(), 0, 0);
    ctx.restore();

    ctx.textAlign = "right";


    ctx.lineWidth = 1;

    for (let i = lb; i <= rb; i += 25) {
        let u = (i - lb) / (rb - lb) * (max - min) + min;
        
        ctx.strokeStyle = "grey";
        ctx.beginPath();
        ctx.moveTo(i, tb);
        ctx.lineTo(i, bb);
        ctx.stroke();
        
        ctx.strokeStyle = "black";
        ctx.save();
        ctx.translate(i + 2, zeroPos + 8);
        ctx.rotate(Math.PI * 5 / 3);
        ctx.fillText(u.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}) + unit, 0, 0);
        ctx.restore();
    }
    
    for (let i = bb; i >= tb; i -= 25) {
        let u = (bb - i) / (bb - tb) * (vmax - vmin) + vmin;
        
        ctx.strokeStyle = "grey";
        ctx.beginPath();
        ctx.moveTo(lb, i);
        ctx.lineTo(rb, i);
        ctx.stroke();
        
        ctx.strokeStyle = "black";
        ctx.fillText(u.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}), lb - 6, i + 3);
    }
    
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(lb, tb);
    ctx.lineTo(lb, bb);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(lb, zeroPos);
    ctx.lineTo(rb, zeroPos);
    ctx.stroke();
    
    let count = values.length;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    for (let i = 0; i < count; i++)
        ctx[i ? "lineTo" : "moveTo"](lb + (values[i][0] - min) * (rb - lb) / (max - min), vmax - vmin ? tb + (vmax - values[i][1]) * (bb - tb) / (vmax - vmin) : bb);
    ctx.stroke();
    if (params.advanced && params.percentile >= 0) {
        ctx.strokeStyle = "red";
        ctx.beginPath();
        for (let i = 0; i < count; i++)
            ctx[i ? "lineTo" : "moveTo"](lb + (values[i][0] - min) * (rb - lb) / (max - min), vmax - vmin ? tb + (vmax - values[i][2]) * (bb - tb) / (vmax - vmin) : bb);
        ctx.stroke();
    }

    let vv = calcMusic(params, false), vv1 = params.advanced && params.percentile >= 0 ? vv + expectedPulls(params.bonus, params.percentile, params.isCrossScout) * 35 : vv;
    let vx = (params[key] - min) / (max - min), vy = vmax - vmin ? (vv - vmin) / (vmax - vmin) : 0, vy1 = vmax - vmin ? (vv1 - vmin) / (vmax - vmin) : 0;
    if (vx >= 0 && vx <= 1 && vy >= 0 && vy <= 1) {
        ctx.strokeStyle = "magenta";
        ctx.fillStyle = "magenta";

        vx = lb + (rb - lb) * vx;
        vy = bb - (bb - tb) * vy;
        vy1 = bb - (bb - tb) * vy1;

        ctx.beginPath();
        ctx.moveTo(lb, vy);
        ctx.lineTo(vx, vy);
        ctx.lineTo(vx, zeroPos);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(vx - 3, vy - 3);
        ctx.lineTo(vx + 3, vy + 3);
        ctx.moveTo(vx - 3, vy + 3);
        ctx.lineTo(vx + 3, vy - 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(lb, vy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vx, zeroPos, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(vv.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}), lb - 6, vy + 3);

        if (params.advanced && params.percentile >= 0) {
            ctx.beginPath();
            ctx.moveTo(lb, vy1);
            ctx.lineTo(vx, vy1);
            ctx.lineTo(vx, vy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(vx - 3, vy1 - 3);
            ctx.lineTo(vx + 3, vy1 + 3);
            ctx.moveTo(vx - 3, vy1 + 3);
            ctx.lineTo(vx + 3, vy1 - 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(lb, vy1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(vx, zeroPos, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText(vv1.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}), lb - 6, vy1 + 3);
        }

        ctx.save();
        ctx.translate(vx + 2, zeroPos + 8);
        ctx.rotate(Math.PI * 5 / 3);
        ctx.fillText(params[key].toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) + unit, 0, 0);
        ctx.restore();
    }

    let drawResult = new Image();
    drawResult.src = canvas.toDataURL("image/png");

    function drawCursor(e, down) {
        ctx.drawImage(drawResult, 0, 0);

        var bcr = e.target.getBoundingClientRect();
        let offsetX = e.targetTouches && e.targetTouches[0] ? e.targetTouches[0].clientX - bcr.x : e.offsetX,
            offsetY = e.targetTouches && e.targetTouches[0] ? e.targetTouches[0].clientY - bcr.y : e.offsetY;


        if (down && offsetX >= lb && offsetX <= rb && offsetY >= tb && offsetY <= bb) {
            let vx1 = (offsetX - lb) / (rb - lb);
            copy[key] = min + vx1 * (max - min);

            if (step instanceof Array) {
                let _diff = Infinity, _cv = min;
                for (let _v of step) {
                    let _d = Math.abs(_v - copy[key]);
                    if (_d < _diff) {
                        _cv = _v;
                        _diff = _d;
                    }
                }
                copy[key] = _cv;
            }
            else {
                copy[key] = min + Math.round(vx1 * (max - min) / step) * step;
                if (key == "bonus") {
                    copy.bonus4 = copy.bonus;
                    copy.bonusE = copy.bonus;
                }
            }

            let vv1 = calcMusic(copy, false), vv11 = copy.advanced && copy.percentile >= 0 ? Math.max(vv1, 0) + expectedPulls(copy.bonus, copy.percentile, copy.isCrossScout) * 35 : vv1;
            vx1 = (copy[key] - min) / (max - min);
            let vy1 = vmax - vmin ? (vv1 - vmin) / (vmax - vmin) : 0,  vy11 = vmax - vmin ? (vv11 - vmin) / (vmax - vmin) : 0;

            ctx.strokeStyle = "green";
            ctx.fillStyle = "green";

            vx1 = lb + (rb - lb) * vx1;
            vy1 = bb - (bb - tb) * vy1;
            vy11 = bb - (bb - tb) * vy11;

            ctx.beginPath();
            ctx.moveTo(lb, vy1);
            ctx.lineTo(vx1, vy1);
            ctx.lineTo(vx1, zeroPos);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(vx1 - 3, vy1 - 3);
            ctx.lineTo(vx1 + 3, vy1 + 3);
            ctx.moveTo(vx1 - 3, vy1 + 3);
            ctx.lineTo(vx1 + 3, vy1 - 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(lb, vy1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(vx1, zeroPos, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillText(vv1.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}), lb - 6, vy1 + 3);

            if (params.advanced && params.percentile >= 0) {
                ctx.beginPath();
                ctx.moveTo(lb, vy11);
                ctx.lineTo(vx1, vy11);
                ctx.lineTo(vx1, vy1);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(vx1 - 3, vy11 - 3);
                ctx.lineTo(vx1 + 3, vy11 + 3);
                ctx.moveTo(vx1 - 3, vy11 + 3);
                ctx.lineTo(vx1 + 3, vy11 - 3);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(lb, vy11, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(vx, zeroPos, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillText(vv11.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}), lb - 6, vy11 + 3);
            }

            ctx.save();
            ctx.translate(vx1 + 2, zeroPos + 8);
            ctx.rotate(Math.PI * 5 / 3);
            ctx.fillText(copy[key].toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) + unit, 0, 0);
            ctx.restore();
        }
    }

    $(canvas).off("mousedown mousemove touchstart touchmove").on("mousedown mousemove touchstart touchmove", e => drawCursor(e, true));
    $(canvas).off("mouseout mouseup touchend touchcancel").on("mouseout mouseup touchend touchcancel", e => drawCursor(e, false));
}

function tableMusic(params, key1, key2) {
    let copy = Object.assign({}, params);

    $(".primary").text($("option[value=" + key1 + "]", "#param1").text());
    $(".secondary").text($("option[value=" + key2 + "]", "#param2").text());
    
    let ps = [[0, 0, 1], [0, 0, 1]];
    let unit = ["", ""];
    for (let i = 0; i < 2; i++) {
        let key = [key1, key2][i];
        if (key == "nowPt" || key == "targetPt")
            ps[i] = [0, params.eventType == 2 ? 30000000 : 22000000, 250000];
        else if (key == "score1" || key == "score2" || key == "score3")
            ps[i] = [50000, 5500000, 50000];
        else if (key == "bp1") {
            ps[i] = params.eventType == 0 || params.eventType == 3 ? [1, 10, [1, 2, 3, 6, 10]] : [3, 10, [3, 6, 10]];
            unit[i] = " BP";
        }
        else if (key == "bp2") {
            ps[i] = [3, 10, [3, 6, 10]];
            unit[i] = " BP";
        }
        else if (key == "bonus") {
            ps[i] = [0, maxBonus(false) * 2, [0]];
            let j = 0;
            while (j < 60)
                ps[i][2].push(++j);
            while (j < maxBonus(false) * 2)
                ps[i][2].push(j += 5);
            
            unit[i] = "%";
        }
        else if (key == "fever") {
            ps[i] = [60, 110.000000001, 5/3];
            unit[i] = "%";
        }
    }
    
    let legends = [[], []];
    for (let i = 0; i < 2; i++) {
        if (ps[i][2] instanceof Array)
            legends[i] = ps[i][2];
        else {
            for (let j = ps[i][0]; j <= ps[i][1]; j += ps[i][2])
                legends[i].push(j);
        }
    }
    
    $(".scrollable-table > div:not(.left-top)").empty().off("scroll");
    let rt = $(".right-top"), lb = $(".left-bottom"), rb = $(".right-bottom");
    let nearest = [-1, -1], dist = [Infinity, Infinity];
    
    for (let u of legends[0]) {
        let w = document.createElement("div");
        w.classList.add("table-cell", "table-legend");
        w.innerText = u.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) + unit[0];
        rt.append(w);
        
        let d = Math.abs(params[key1] - u);
        if (d < dist[0]) {
            nearest[0] = u;
            dist[0] = d;
        }
    }
    
    for (let u of legends[1]) {
        let w = document.createElement("div");
        w.classList.add("table-cell", "table-legend");
        w.innerText = u.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) + unit[1];
        lb.append(w);
        
        let d = Math.abs(params[key2] - u);
        if (d < dist[1]) {
            nearest[1] = u;
            dist[1] = d;
        }
    }
    
    for (let v of legends[1]) {
        copy[key2] = v;
        
        let r = document.createElement("div");
        r.classList.add("table-row");
        for (let u of legends[0]) {
            copy[key1] = u;
            copy.bonus4 = copy.bonus;
            copy.bonusE = copy.bonus;
            
            let w = document.createElement("div");
            w.classList.add("table-cell");
            let d = calcMusic(copy, false);
            w.innerHTML = d.toLocaleString();

            if (copy.advanced && copy.percentile >= 0) {
                let d1 = Math.max(0, d) + expectedPulls(copy.bonus, copy.percentile, copy.isCrossScout) * 35;
                w.innerHTML = d1.toLocaleString() + ` <span class="original-dias">(${d.toLocaleString()})</span>`;
                d = d1;
            }

            if (d <= 0)
                w.classList.add("negative");
            if (u == nearest[0])
                w.classList.add("nearest-1");
            if (v == nearest[1])
                w.classList.add("nearest-2");
            r.appendChild(w);
        }
        rb.append(r);
    }
    
    $(".right-top").on("scroll", function() {
        $(".right-bottom")[0].scrollLeft = this.scrollLeft;
    });
    $(".left-bottom").on("scroll", function() {
        $(".right-bottom")[0].scrollTop = this.scrollTop;
    });
    $(".right-bottom").on("scroll", function() {
        $(".right-top")[0].scrollLeft = this.scrollLeft;
        $(".left-bottom")[0].scrollTop = this.scrollTop;
    });
}

function initMusic() {
    initCommon();
    
    let savedValues = {};
    let controlKeys = [
        "end_time", "now_score", "target_score", "normal_score", "special_score", "fever_score",
        "bonus", "bonus_4", "bonus_e", "fever", "use_bp_1", "use_bp_2", "use_bp_work", "use_pass", 
        "sleep_time", "now_bp", "now_pass", "user_rank", "remaining_exp", 
        "ticket_limit", "ticket_speed", "now_ticket", "is_event_work", "login_bonus", 
        "event_type", "now_whistles", "now_megaphones", "now_bells", "percentile", 
        "param1", "param2", "star_3", "star_4", "star_5"
    ];
    for (let i of controlKeys)
        savedValues[i] = window.localStorage.getItem(i) || "";
    
    bindController($("#now_time")[0], function() {
        let d = new Date();
        if (isInEvent(d, false)) {
            $(".title", "#now_time").text("NOW_TIME".translate());
            return d.toMyString();
        }
        else {
            let y = d.getUTCFullYear(), isLeap = y % 4 == 0 && (y % 100 != 0 || y % 400 == 0);
            $(".title", "#now_time").text("START_TIME".translate());
            return new Date(d.toMyString().replace(
                /(^\d{4}-\d{2}-)(.+)/, 
                (_, a, b) => 
                    a + (d.getUTCDate() + d.getUTCHours() / 24 < 15.25 
                    ? 15 
                    : [31, 28 + isLeap, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][d.getUTCMonth()]) + "T06:00:00Z"
            )).toMyString();
        }
    });
    
    bindController($("#end_time")[0], () => eventEnd(new Date(), false).toMyString());
    bindController($("#now_score")[0], "0");
    bindController($("#target_score")[0], "3500000");
    bindController($("#normal_score")[0], "600000");
    bindController($("#special_score")[0], "600000");
    bindController($("#fever_score")[0], "600000");
    bindController($("#bonus")[0], "0");
    bindController($("#bonus_4")[0], "0");
    bindController($("#bonus_e")[0], "0");
    bindController($("#fever")[0], "100", function() {
        let f = Math.round($("#fever")[0].value * 0.6) / 0.6;
        if (f != $("#fever")[0].value)
            $("#fever")[0].setValue(f);        
    });
    bindController($("#use_bp_1")[0], "1");
    bindController($("#use_bp_2")[0], "3");
    bindController($("#use_bp_work")[0], "0");
    bindController($("#use_pass")[0], "100");
    bindController($("#sleep_time")[0], "8");
    bindController($("#now_bp")[0], "0");
    bindController($("#now_ticket")[0], "0");
    bindController($("#now_pass")[0], "0");
    bindController($("#now_whistles")[0], "0");
    bindController($("#now_megaphones")[0], "0");
    bindController($("#now_bells")[0], "0");
    bindController($("#remaining_exp")[0], "10");
    bindController($("#user_rank")[0], "1", function() {
        let max = nextRank($("#user_rank")[0].value);
        $("input", "#remaining_exp").attr("max", max);
        $("#remaining_exp")[0].setValue(max);
    });
    bindController($("#ticket_limit")[0], "3", function() {
        $("input", "#now_ticket").attr("max", $("#ticket_limit")[0].value * 2);
        $("#now_ticket")[0].setValue("0");
    });
    bindController($("#ticket_speed")[0], "60");
    bindController($("#is_event_work")[0], "0");
    bindController($("#login_bonus")[0], "0");
    bindController($("#percentile")[0], "-1");
    bindController($("#param1")[0], "nowPt", function() {
        if ($("#param2")[0].bound && $("#param2")[0].value == $("#param1")[0].value) 
            $("#param2")[0].setValue($("#param1")[0].originalValue);

        $("#param1")[0].originalValue = $("#param1")[0].value;
        checkParamOptions();
        $(window).trigger("resize");
        if (func)
            func();
    });
    bindController($("#param2")[0], "targetPt", function() {
        if ($("#param1")[0].bound && $("#param1")[0].value == $("#param2")[0].value) 
            $("#param1")[0].setValue($("#param2")[0].originalValue);
        
        $("#param2")[0].originalValue = $("#param2")[0].value;
        checkParamOptions();
        $(window).trigger("resize");
        if (func)
            func();
    });
    
    bindController($("#event_type")[0], "0", function() {
        const isClimax = $("#event_type")[0].value == "3";
        if ($("#event_type")[0].value == "0" || isClimax) {
            $("#use_bp_2, #fever, #fever_score, #bonus_4").hide();
            $("#use_pass, #now_pass, #special_score, #bonus_e").show();
            checkParamOptions();
            $("option[value=1], option[value=2]", "#use_bp_1 select").prop("disabled", false).show();
            $("#use_bp_1 .title, #comparison option[value=bp1]").text("USE_BP_1".translate());
            $("#normal_score .title, #comparison option[value=score1]").text("NORMAL_SCORE".translate());
            $(".setting_block", "#comparison").each(function() {
                this.setValue(this.value);
            });
            
            $("option[value=0]", "#login_bonus").text((isClimax ? "BONUS_ORDINARY_CLIMAX" : "BONUS_ORDINARY").translate());
            //$("option[value=2]", "#login_bonus").text((isClimax ? "BONUS_EXTRA_CLIMAX" : "BONUS_EXTRA").translate());
            $("option[value=2]", "#login_bonus").text("BONUS_EXTRA".translate());
            $("#login_bonus")[0].setValue($("#login_bonus")[0].value);
        }
        else if ($("#event_type")[0].value == "1") {
            $("#use_bp_2, #fever, #fever_score, #bonus_4").show();
            $("#use_pass, #now_pass, #special_score, #bonus_e").hide();
            checkParamOptions();
            $("option[value=1], option[value=2]", "#use_bp_1 select").prop("disabled", true).hide();
            if (+$("#use_bp_1")[0].value < 3)
                $("#use_bp_1")[0].setValue("3");
            $("#use_bp_1 .title, #comparison option[value=bp1]").text("USE_BP_1_3".translate());
            $("#normal_score .title, #comparison option[value=score1]").text("1_3_SCORE".translate());
            $(".setting_block", "#comparison").each(function() {
                this.setValue(this.value);
            });
            
            $("option[value=0]", "#login_bonus").text("BONUS_ORDINARY_TOUR".translate());
            $("option[value=2]", "#login_bonus").text("BONUS_EXTRA".translate());
            $("#login_bonus")[0].setValue($("#login_bonus")[0].value);
        } 
        else {
            $("#use_bp_2, #fever, #fever_score, #bonus_4").show();
            $("#use_pass, #now_pass, #special_score, #bonus_e").show();
            checkParamOptions();
            $("option[value=1], option[value=2]", "#use_bp_1 select").prop("disabled", true).hide();
            if (+$("#use_bp_1")[0].value < 3)
                $("#use_bp_1")[0].setValue("3");
            $("#use_bp_1 .title, #comparison option[value=bp1]").text("USE_BP_1_3".translate());
            $("#normal_score .title, #comparison option[value=score1]").text("1_3_SCORE".translate());
            $(".setting_block", "#comparison").each(function() {
                this.setValue(this.value);
            });
            
            $("option[value=0]", "#login_bonus").text("BONUS_ORDINARY_TOUR".translate());
            $("option[value=2]", "#login_bonus").text("BONUS_EXTRA".translate());
            $("#login_bonus")[0].setValue($("#login_bonus")[0].value);
        }
    });
    
    $("#detail_data").hide();
    $("#details").on("change", function() {
        if (this.checked)
            $("#detail_data").show();
        else
            $("#detail_data").hide();
        
        window.localStorage.setItem("details", "" + this.checked);

        checkParamOptions();
    }).prop("checked", window.localStorage.getItem("details") == "true").trigger("change");

    bindController($("#is_cross_scout")[0], "0");
    bindController($("#star_3")[0], "2");
    bindController($("#star_4")[0], "1");
    bindController($("#star_5")[0], "1");
    
    
    for (let i of controlKeys) {
        if (savedValues[i])
            $("#" + i)[0].setValue(savedValues[i]);
    }

    $("#calculate").on("click", function() {
        let parameters = {
            eventType: +$("#event_type")[0].value,
            nowTime: $("#now_time")[0].value.replace(" ", "T"),
            endTime: $("#end_time")[0].value.replace(" ", "T"),
            nowPt: +$("#now_score")[0].value,
            targetPt: +$("#target_score")[0].value,
            score1: +$("#normal_score")[0].value,
            score2: +$("#special_score")[0].value,
            score3: +$("#fever_score")[0].value,
            bonus: +$("#bonus")[0].value,
            bonus4: +$("#bonus_4")[0].value,
            bonusE: +$("#bonus_e")[0].value,
            fever: +$("#fever")[0].value,
            bp1: +$("#use_bp_1")[0].value,
            bp2: +$("#use_bp_2")[0].value,
            bpWork: +$("#use_bp_work")[0].value,
            usePass: +$("#use_pass")[0].value,
            sleep: +$("#sleep_time")[0].value,
            advanced: +$("#details").prop("checked"),
            bp: +$("#now_bp")[0].value,
            ticket: +$("#now_ticket")[0].value,
            pass: +$("#now_pass")[0].value,
            rank: +$("#user_rank")[0].value,
            remExp: +$("#remaining_exp")[0].value,
            ticketLimit: +$("#ticket_limit")[0].value,
            ticketSpeed: +$("#ticket_speed")[0].value,
            isEventWork: +$("#is_event_work")[0].value,
            loginBonus: +$("#login_bonus")[0].value,
            nowWhistles: +$("#now_whistles")[0].value,
            nowMegaphones: +$("#now_megaphones")[0].value,
            nowBells: +$("#now_bells")[0].value,
            percentile: +$("#percentile")[0].value,
            isCrossScout: +$("#is_cross_scout")[0].value
        };

        function updateOutput() {
            let result = calcMusic(parameters, true);
            $("#comparison").show();
            $("#results").html(`<table>${
                ["RESULT_TEMPLATE1", "RESULT_TEMPLATE2", "RESULT_TEMPLATE3"][parameters.eventType % 3].translate()
                    .replace(/\[(.+?)\]/g, parameters.advanced ? "$1" : "")
                    .replace(/(.+)(?:︰|: )\{(!?)(.+)\}/g, (_, a, b, c) => {
                        if (c == "pulls" && percentile.value != -1) {
                            if (!monteCarloResult.simulationCount)
                                result["pulls"] = "CALCULATING".translate()
                            else
                                result["pulls"] += "<br>" + "SIMULATION_RESULT".translate().replace('{0}', monteCarloResult.simulationCount);
                        }
                        else if (c == "timeNeeded") {
                            let timeNeeded = result["timeNeeded"];
                            result["timeNeeded"] = "HOURS".translate().replace('{,1}', (Math.ceil(timeNeeded * 10) / 10).toFixed(1));
                            if (timeNeeded >= result["hoursRemaining"])
                                result["timeNeeded"] = `<span style='color: #ff0000'>${result["timeNeeded"]}</span>`;
                        }
                        return result[c] == undefined ? "" : b ? `
                        <tr>
                            <td colspan="2">(${_.replace(`{!${c}}`, `<span class="result" style="padding-left: 0; margin-left: 0;">${result[c]}</span>`)})</td>
                        </tr>` : `
                        <tr>
                            <td>${a}</td>
                            <td class="result res-${c}">${result[c].toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                        </tr>`;
                    })
            }</table>`);
            
            $(window).off("resize").on("resize", function() {
                drawMusic(parameters, $("#param1")[0].value);
            }).trigger("resize");
            (func = function() {
                tableMusic(parameters, $("#param1")[0].value, $("#param2")[0].value);
            })();
        }

        if (percentile.value != -1 && window.Worker) {
            if (monteCarloWorker) 
                monteCarloWorker.terminate();
            monteCarloWorker = new Worker("js/monteCarloWorker.js");
            monteCarloWorker.onmessage = x => {
                monteCarloResult = x.data;
                for (let i = monteCarloResult.simulationResult.length - 2; i >= 0; i--) 
                    for (let j = 0; j < monteCarloResult.simulationResult[0].length; j++)
                        monteCarloResult.simulationResult[i][j] += monteCarloResult.simulationResult[i + 1][j];
                updateOutput();
            };
            // test
            monteCarloWorker.postMessage([+$("#star_5")[0].value, +$("#star_4")[0].value, +$("#star_3")[0].value]);
        } 
        else
            updateOutput();
    });
}
