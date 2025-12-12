/**
 * 編集中のレースインデックス
 * @type {number|null}
 */
let editingIndex = null;

/**
 * 挿入予定のレースインデックス
 * @type {number|null}
 */
let insertionIndex = null;

/**
 * トーストメッセージを表示します。
 * @param {string} message - 表示するメッセージ
 */
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

/**
 * モード（架空馬/オリウマ）に応じてフォームの表示を切り替えます。
 */
function updateFormVisibility() {
    const isFictional = appData.mode === 'fictional';
    document.getElementById('form-fictional').style.display = isFictional ? 'block' : 'none';
    document.getElementById('form-original').style.display = isFictional ? 'none' : 'block';

    // レース関係の項目もモードによって出し分ける
    document.getElementById('race-prize-group').style.display = isFictional ? 'block' : 'none';
    document.getElementById('race-fans-group').style.display = isFictional ? 'none' : 'block';
    document.getElementById('race-jockey-group').style.display = isFictional ? 'block' : 'none';
    document.getElementById('race-weight-odds-row').style.display = isFictional ? 'flex' : 'none';
}

/**
 * 基本情報プレビューを更新します。
 */
function updateBasicInfoPreview() {
    const container = document.getElementById('preview-basic-info');
    const data = appData[appData.mode];
    let html = '';

    if (appData.mode === 'fictional') {
        const affiliation = [data.affiliationSelect, data.affiliationText].filter(Boolean).join(' ');
        html = `<tr><td colspan="2"><h2>${data.horseName || '馬名'} <small>${data.horseNameEn || ''}</small></h2></td></tr>
                <tr><td colspan="2"><div class="pedigree-box"><span class="pedigree-label father-label">父</span><div><div class="pedigree-name">${data.father || '-'}</div></div></div></td></tr>
                <tr><td colspan="2"><div class="pedigree-box"><span class="pedigree-label mother-label">母</span><div><div class="pedigree-name">${data.mother || '-'}</div><div class="pedigree-sire">母父: ${data.bms || '-'}</div></div></div></td></tr>
                <tr><th>性齢</th><td>${data.sexAge || '-'}</td></tr>
                <tr><th>所属</th><td>${affiliation || '-'}</td></tr>
                <tr><th>馬主</th><td>${data.owner || '-'}</td></tr>
                <tr><th>生産者</th><td>${data.breeder || '-'}</td></tr>
                <tr><th>通算成績</th><td>${document.getElementById('f-totalResults').value || '-'}</td></tr>
                <tr><th>総獲得賞金</th><td>${document.getElementById('f-totalPrize').value || '-'}</td></tr>
                <tr><th>主な勝ち鞍</th><td>${data.mainWin || '-'}</td></tr>
                <tr><th>生年月日</th><td>${data.birthday ? new Date(data.birthday + 'T00:00:00').toLocaleDateString('ja-JP') : '-'}</td></tr>
                <tr><th>馬名の意味</th><td>${data.meaning || '-'}</td></tr>
                <tr><th>次走予定</th><td>${data.nextRace || '-'}</td></tr>`;
    } else {
        const dorm = [data.dormSelect, data.dormText].filter(Boolean).join(' ');
        html = `<tr><td colspan="2"><h2>${data.name || '名前'} <small>${data.nameEn || ''}</small></h2></td></tr>
                <tr><th>耳飾り</th><td>${data.ear || '-'}</td></tr>
                <tr><th>学年</th><td>${data.grade || '-'}</td></tr>
                <tr><th>所属寮</th><td>${dorm || '-'}</td></tr>
                <tr><th>通算成績</th><td>${document.getElementById('o-totalResults').value || '-'}</td></tr>
                <tr><th>累計ファン数</th><td>${document.getElementById('o-totalFans').value || '-'}</td></tr>
                <tr><th>主な勝ち鞍</th><td>${data.mainWin || '-'}</td></tr>
                <tr><th>生年月日</th><td>${data.birthday ? new Date(data.birthday + 'T00:00:00').toLocaleDateString('ja-JP') : '-'}</td></tr>
                <tr><th>名前の意味</th><td>${data.meaning || '-'}</td></tr>
                <tr><th>次走予定</th><td>${data.nextRace || '-'}</td></tr>`;
    }
    container.innerHTML = html;
}

/**
 * レース成績プレビューを更新します。
 */
function updateResultsPreview() {
    const thead = document.getElementById('results-table-head');
    const tbody = document.getElementById('preview-results-table');
    const isFictional = appData.mode === 'fictional';

    thead.innerHTML = isFictional ?
        `<tr><th>開催</th><th>レース名</th><th>距離</th><th>人気</th><th>着順</th><th>騎手</th><th>斤量</th><th>オッズ</th><th>操作</th></tr>` :
        `<tr><th>開催</th><th>レース名</th><th>距離</th><th>人気</th><th>着順</th><th>オッズ</th><th>操作</th></tr>`;
    tbody.innerHTML = '';

    const addPlaceholderIfNeeded = (index) => {
        if (index === insertionIndex) {
            const ph = document.createElement('tr');
            ph.className = 'placeholder-row';
            ph.innerHTML = `<td colspan="${isFictional ? 9 : 7}">▼ この位置に新しい成績が挿入されます ▼</td>`;
            tbody.appendChild(ph);
        }
    };
    addPlaceholderIfNeeded(0);

    appData.races.forEach((race, index) => {
        const gradeClass = getGradeClass(race.grade);
        const popClass = getRankClass(race.pop);
        const rankClass = getRankClass(race.rank);
        const tr = document.createElement('tr');
        const actionButtons = `<div class="action-buttons"><button class="btn btn-insert" data-index="${index}">挿入</button><button class="btn btn-edit" data-index="${index}">編集</button><button class="btn btn-delete" data-index="${index}">削除</button></div>`;

        if (isFictional) {
            tr.innerHTML = `<td>${race.date || '-'}<br>${race.course || '-'}</td><td class="race-name">${race.name || '-'} <span class="race-grade ${gradeClass}">${race.grade || ''}</span></td><td>${race.distance || '-'}</td><td class="${popClass}">${race.pop || '-'}</td><td class="${rankClass}">${race.rank || '-'}</td><td>${race.jockey || '-'}</td><td>${race.weight || '-'}</td><td>${race.odds || '-'}</td><td>${actionButtons}</td>`;
        } else {
            tr.innerHTML = `<td>${race.date || '-'}<br>${race.course || '-'}</td><td class="race-name">${race.name || '-'} <span class="race-grade ${gradeClass}">${race.grade || ''}</span></td><td>${race.distance || '-'}</td><td class="${popClass}">${race.pop || '-'}</td><td class="${rankClass}">${race.rank || '-'}</td><td>${race.odds || '-'}</td><td>${actionButtons}</td>`;
        }
        tbody.appendChild(tr);
        addPlaceholderIfNeeded(index + 1);
    });
}

/**
 * 計算された成績統計を画面に表示します。
 * @param {Object} stats - calculateStatsの戻り値
 */
function updateTotalsDisplay(stats) {
    document.getElementById('f-totalResults').value = stats.resultsStr;
    document.getElementById('o-totalResults').value = stats.resultsStr;
    document.getElementById('f-totalPrize').value = formatPrize(stats.totalPrize);
    document.getElementById('o-totalFans').value = formatFans(stats.totalFans);
}

/**
 * すべてのビューを更新します。
 */
function updateAllViews() {
    const stats = calculateStats(appData.races);
    updateTotalsDisplay(stats);
    updateFormVisibility();
    updateBasicInfoPreview();
    updateResultsPreview();
}

const raceFormIds = ['race-date', 'race-course', 'race-name', 'race-grade', 'race-distance', 'race-pop', 'race-rank', 'race-jockey', 'race-weight', 'race-odds', 'race-prize', 'race-fans'];

/**
 * レース入力フォームから値を取得します。
 * @returns {Object} レースデータオブジェクト
 */
function getRaceFormValues() {
    const v = {};
    raceFormIds.forEach(id => v[id.replace('race-', '')] = document.getElementById(id).value);
    return v;
}

/**
 * レースデータを入力フォームにセットします。
 * @param {Object} data - レースデータオブジェクト
 */
function setRaceFormValues(data) {
    raceFormIds.forEach(id => document.getElementById(id).value = data[id.replace('race-', '')] || '');
}

/**
 * レース入力フォームをリセットします。
 * @param {boolean} clearFields - フィールドを空にするかどうか (デフォルト: true)
 */
function resetRaceForm(clearFields = true) {
    editingIndex = null;
    insertionIndex = null;
    const addRaceBtn = document.getElementById('add-race-btn');
    addRaceBtn.textContent = '成績を追加';
    addRaceBtn.classList.replace('btn-success', 'btn-primary');
    document.getElementById('cancel-insert-btn').style.display = 'none';
    if (clearFields) {
        raceFormIds.forEach(id => {
            document.getElementById(id).value = '';
        });
    }
}

/**
 * appDataの内容をすべての入力フォームに反映させます。
 * (JSON読み込み時などに使用)
 */
function loadDataIntoForms() {
    document.querySelector(`input[name="mode"][value="${appData.mode}"]`).checked = true;
    Object.keys(appData.fictional).forEach(k => {
        const e = document.getElementById(`f-${k}`);
        if (e && !e.readOnly) e.value = appData.fictional[k];
    });
    Object.keys(appData.original).forEach(k => {
        const e = document.getElementById(`o-${k}`);
        if (e && !e.readOnly) e.value = appData.original[k];
    });
}

/**
 * 編集モードを開始します。
 * @param {number} index - 編集対象のレースインデックス
 */
function startEditingMode(index) {
    resetRaceForm(false);
    editingIndex = index;
    setRaceFormValues(appData.races[index]);
    const addRaceBtn = document.getElementById('add-race-btn');
    addRaceBtn.textContent = '成績を更新';
    addRaceBtn.classList.replace('btn-primary', 'btn-success');
    document.getElementById('race-form-header').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * 挿入モードを開始します。
 * @param {number} index - 挿入位置の基準となるレースインデックス
 */
function startInsertionMode(index) {
    resetRaceForm(false);
    insertionIndex = index + 1;
    const addRaceBtn = document.getElementById('add-race-btn');
    addRaceBtn.textContent = 'この位置に挿入';
    addRaceBtn.classList.replace('btn-primary', 'btn-success');
    document.getElementById('cancel-insert-btn').style.display = 'block';
    updateResultsPreview();
    document.getElementById('race-form-header').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * 挿入モードをキャンセルします。
 */
function cancelInsertionMode() {
    resetRaceForm();
    updateResultsPreview();
}

/**
 * 指定した要素を画像としてエクスポートします。
 * @param {HTMLElement} targetElement - エクスポート対象のDOM要素
 * @param {string} suffix - ファイル名の接尾辞
 */
async function exportImage(targetElement, suffix) {
    const fileNameBase = appData.mode === 'fictional' ? appData.fictional.horseName : appData.original.name;
    const fileName = `${fileNameBase || 'profile'}_${suffix}.png`;
    const clone = targetElement.cloneNode(true);
    clone.classList.add('export-clone', 'force-light-theme');
    document.body.appendChild(clone);
    showToast('画像を生成中です...');
    try {
        await nextFrame();
        const canvas = await html2canvas(clone, {
            scale: 2
        });
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = fileName;
        a.click();
        showToast('画像の生成が完了しました。');
    } catch (error) {
        console.error('画像生成に失敗しました:', error);
        showToast('エラー: 画像の生成に失敗しました。');
    } finally {
        document.body.removeChild(clone);
    }
}
