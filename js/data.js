/**
 * アプリケーション全体のデータを保持するグローバル変数
 * @type {Object}
 */
let appData;

/**
 * 初期データ構造を作成して返します。
 * @returns {Object} 初期データオブジェクト
 */
function createInitialData() {
    return {
        mode: 'fictional',
        fictional: {
            horseName: '',
            horseNameEn: '',
            father: '',
            mother: '',
            bms: '',
            sexAge: '',
            affiliationSelect: '美浦',
            affiliationText: '',
            owner: '',
            breeder: '',
            totalResults: '',
            totalPrize: '',
            mainWin: '',
            birthday: '',
            meaning: '',
            nextRace: ''
        },
        original: {
            name: '',
            nameEn: '',
            ear: '右',
            grade: '中等部',
            dormSelect: '美浦',
            dormText: '',
            totalResults: '',
            totalFans: '',
            mainWin: '',
            birthday: '',
            meaning: '',
            nextRace: ''
        },
        races: []
    };
}

/**
 * レースデータの入力値を検証します。
 * @param {Object} data - 検証するレースデータ
 * @returns {boolean} 検証に成功した場合はtrue、失敗した場合はfalse
 */
function validateRaceData(data) {
    const errors = [];
    const pop = parseInt(data.pop, 10);
    const rank = parseInt(data.rank, 10);
    const prize = parseInt(data.prize, 10);
    const fans = parseInt(data.fans, 10);

    if (data.pop && pop <= 0) {
        errors.push("・人気は1以上の整数で入力してください。");
    }
    if (data.rank && rank <= 0) {
        errors.push("・着順は1以上の整数で入力してください。");
    }
    if (data.prize && prize < 0) {
        errors.push("・獲得賞金は0以上の整数で入力してください。");
    }
    if (data.fans && fans < 0) {
        errors.push("・獲得ファン数は0以上の整数で入力してください。");
    }
    if (errors.length > 0) {
        alert("入力内容を確認してください:\n\n" + errors.join("\n"));
        return false;
    }
    return true;
}

/**
 * レース成績から通算成績、総賞金、総ファン数を計算します。
 * @param {Array} races - レースデータの配列
 * @returns {Object} 計算結果 { wins: [1着数, 2着数, 3着数, 着外数], totalPrize: number, totalFans: number, resultsStr: string }
 */
function calculateStats(races) {
    let wins = [0, 0, 0, 0];
    let totalPrize = 0,
        totalFans = 0;

    races.forEach(race => {
        const rank = parseInt(race.rank, 10);
        if (rank > 0) {
            if (rank === 1) wins[0]++;
            else if (rank === 2) wins[1]++;
            else if (rank === 3) wins[2]++;
            else wins[3]++;
        }
        totalPrize += parseInt(race.prize, 10) || 0;
        totalFans += parseInt(race.fans, 10) || 0;
    });

    const totalRaces = races.length;
    const resultsStr = `${totalRaces}戦${wins[0]}勝 [${wins[0]}-${wins[1]}-${wins[2]}-${wins[3]}]`;

    return {
        wins,
        totalPrize,
        totalFans,
        resultsStr
    };
}
