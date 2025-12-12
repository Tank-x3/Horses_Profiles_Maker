document.addEventListener('DOMContentLoaded', () => {
    // データの初期化
    appData = createInitialData();

    // イベントリスナーの登録
    const addRaceBtn = document.getElementById('add-race-btn');
    document.querySelector('.input-area').addEventListener('change', handleInputChange);
    document.querySelector('.input-area').addEventListener('input', handleInputChange);
    addRaceBtn.addEventListener('click', handleAddOrUpdateRace);
    document.getElementById('save-json-btn').addEventListener('click', saveToJson);
    document.getElementById('load-json-btn').addEventListener('click', () => document.getElementById('json-file-input').click());
    document.getElementById('json-file-input').addEventListener('change', loadFromJson);
    document.getElementById('preview-results-table').addEventListener('click', handleRaceAction);
    document.getElementById('export-all-btn').addEventListener('click', () => exportImage(document.getElementById('preview-area'), 'all'));
    document.getElementById('export-profile-btn').addEventListener('click', () => exportImage(document.getElementById('profile-preview-box'), 'profile'));
    document.getElementById('export-results-btn').addEventListener('click', () => exportImage(document.getElementById('results-preview-box'), 'results'));
    document.getElementById('cancel-insert-btn').addEventListener('click', cancelInsertionMode);

    // テーマ設定
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    // 初期表示の更新
    updateAllViews();
});

/**
 * 入力変更ハンドラ
 * フォームの入力値が変更されたときにデータを更新し、ビューを再描画します。
 * @param {Event} e - イベントオブジェクト
 */
function handleInputChange(e) {
    const target = e.target;
    if (!target.id) return;

    // 基本情報の更新
    if (target.id.startsWith('f-') || target.id.startsWith('o-')) {
        appData[appData.mode][target.id.substring(2)] = target.value;
    } else if (target.name === 'mode') {
        // モード切替
        appData.mode = target.value;
    }
    updateAllViews();
}

/**
 * レース追加・更新ハンドラ
 * フォームに入力されたレースデータを検証し、追加または更新します。
 */
function handleAddOrUpdateRace() {
    const raceData = getRaceFormValues();
    if (!validateRaceData(raceData)) {
        return;
    }

    if (editingIndex !== null) {
        // 編集モード
        appData.races[editingIndex] = raceData;
    } else if (insertionIndex !== null) {
        // 挿入モード
        appData.races.splice(insertionIndex, 0, raceData);
    } else {
        // 通常追加（先頭）
        appData.races.unshift(raceData);
    }

    resetRaceForm();
    updateAllViews();
}

/**
 * レース操作ハンドラ（編集・削除・挿入ボタン）
 * @param {Event} e - イベントオブジェクト
 */
function handleRaceAction(e) {
    const target = e.target.closest('button');
    if (!target) return;
    const index = parseInt(target.dataset.index, 10);

    if (target.classList.contains('btn-edit')) {
        startEditingMode(index);
    } else if (target.classList.contains('btn-delete')) {
        deleteRace(index);
    } else if (target.classList.contains('btn-insert')) {
        startInsertionMode(index);
    }
}

/**
 * レース削除処理
 * ユーザー確認後、指定されたインデックスのレースを削除します。
 * @param {number} index - 削除対象のレースインデックス
 */
function deleteRace(index) {
    if (confirm('このレース成績を削除しますか？')) {
        appData.races.splice(index, 1);
        resetRaceForm();
        updateAllViews();
    }
}

/**
 * データをJSONファイルとして保存（ダウンロード）します。
 */
function saveToJson() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileNameBase = appData.mode === 'fictional' ? appData.fictional.horseName : appData.original.name;
    a.download = `${fileNameBase || 'profile'}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * JSONファイルからデータを読み込みます。
 * @param {Event} e - input type="file" の change イベント
 */
function loadFromJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const loadedData = JSON.parse(event.target.result);
            // 既存データ構造とマージして安全性を確保
            appData = {
                ...createInitialData(),
                ...loadedData
            };
            // レースデータの数値項目を初期化（UI用）
            appData.races = appData.races.map(r => ({
                ...{
                    prize: 0,
                    fans: 0
                },
                ...r
            }));

            resetRaceForm();
            loadDataIntoForms();
            updateAllViews();
            showToast('データの読み込みが完了しました。');
        } catch (err) {
            alert('ファイルの読み込みに失敗しました。');
            console.error(err);
        }
    };
    reader.readAsText(file);
    e.target.value = ''; // ファイル選択をリセットして再選択可能にする
}
