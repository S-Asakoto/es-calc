function successRate(target, totalFire, firstTeamFire, firstTeamSkill, lpUsage) {
	// 滿足人數計算式(猜測)︰全隊總火力 × 火力 ÷ 主隊總火力 × 技能倍率 × 隨機數 × LP倍率
	// 隨機數在同一次演出內一樣，分兩次演出完成Live就抽兩次
	// 假設︰技能發動率50%、隨機數取值範圍[0.9, 1.1)
	
	const totalFirstTeamFire = firstTeamFire.reduce((a, b) => a + b);
	const pSkill = 0.5, uBound = 1.1, lBound = 0.9;
	const multipliers = [0, 1, 2.5, 4, 6, 8, 10];

	var totalP = 0;
	var mLP = [lpUsage >= 6 ? 10 : multipliers[lpUsage], lpUsage <= 6 ? 0 : multipliers[lpUsage - 6]];

	// 最多10LP否則降級，所以只考慮最多兩次演出
	for (var i = 0; i < (lpUsage <= 6 ? 32 : 1024); i++) {
		// (a + b * theta_1) + (c + d * theta_2) >= target
		var a = 0, b = 0, c = 0, d = 0;
		var p = 1;

		// 計算火力公式
		for (var j = 0; j < (lpUsage <= 6 ? 5 : 10); j++) {
			var w = 1;
			if (i >> j & 1) {
				w += firstTeamSkill[j % 5];
				p *= pSkill;
			}
			else
				p *= 1 - pSkill;

			var basicFire = totalFire * firstTeamFire[j % 5] / totalFirstTeamFire * w;
			if (j < 5) {
				a += basicFire * lBound * mLP[0];
				b += basicFire * (uBound - lBound) * mLP[0];
			}
			else {
				c += basicFire * lBound * mLP[1];
				d += basicFire * (uBound - lBound) * mLP[1];
			}
		}

		// 圖表解法
		var e = target - a - c;
		if (e <= 0)
			totalP += p;
		else if (e < b + d) {
			if (d) {
				var t10 = e / b, t20 = e / d, t11 = (e - d) / b, t21 = (e - b) / d;
				if (t10 < 1) {
					if (t20 < 1)
						totalP += p * (1 - t10 * t20 / 2);
					else
						totalP += p * (2 - t10 - t11) / 2;
				}
				else if (t20 < 1)
					totalP += p * (2 - t20 - t21) / 2;
				else
					totalP += p * (1 - t11) * (1 - t21) / 2;
			}
			else
				totalP += p * (1 - e / b);
		}
	}

	return totalP;
}

function successRates(target, totalFire, firstTeamFire, firstTeamSkill) {
	return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => successRate(target, totalFire, firstTeamFire, firstTeamSkill, x));
}
