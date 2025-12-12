/**
 * 賞金を「億円」「万円」形式にフォーマットします。
 * @param {number} amount - 賞金（万円単位）
 * @returns {string} フォーマットされた賞金文字列 (例: "1億2000万円")
 */
function formatPrize(amount) {
    if (amount === 0) return '0万円';
    if (amount < 10000) return `${amount.toLocaleString()}万円`;
    const oku = Math.floor(amount / 10000);
    const man = amount % 10000;
    return man === 0 ? `${oku}億円` : `${oku}億${man.toLocaleString()}万円`;
}

/**
 * ファン数をカンマ区切り形式にフォーマットします。
 * @param {number} amount - ファン数
 * @returns {string} フォーマットされたファン数文字列 (例: "12,345人")
 */
function formatFans(amount) {
    return `${amount.toLocaleString()}人`;
}

/**
 * レースのグレードに基づいてCSSクラス名を返します。
 * @param {string} g - グレード名 (例: "GⅠ", "L")
 * @returns {string} CSSクラス名
 */
function getGradeClass(g) {
    if (!g) return 'grade-other';
    if (g.includes('Ⅰ')) return 'grade-g1';
    if (g.includes('Ⅱ')) return 'grade-g2';
    if (g.includes('Ⅲ')) return 'grade-g3';
    if (g === 'L') return 'grade-l';
    return 'grade-other';
}

/**
 * 着順に基づいてCSSクラス名を返します。
 * @param {string|number} rank - 着順
 * @returns {string} CSSクラス名
 */
function getRankClass(rank) {
    const rankNum = parseInt(rank, 10);
    if (rankNum === 1) return 'cell-rank-1';
    if (rankNum === 2) return 'cell-rank-2';
    if (rankNum === 3) return 'cell-rank-3';
    return '';
}

/**
 * 次の描画フレームまで待機します。
 * @returns {Promise<void>}
 */
function nextFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(resolve);
    });
}
