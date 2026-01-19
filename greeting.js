//name: 开场白管理器
//description: V2.0
//author: Yellows

(function() {
    // === 0. 配置常量 ===
    const STORAGE_KEY_AUTO_CLOSE = 'gj_auto_close_setting_v1';
    let saveTimeout = null;

    // === 1. 样式 ===
    const STYLE_ID = 'greeting-jumper-css-v2-2'; 
    $('[id^=greeting-jumper-css]').remove();

    $('head').append(`
        <style id="${STYLE_ID}">
            /* 通用设置 - 弹窗全屏化 */
            .swal2-popup { 
                width: 98% !important; 
                max-width: 1600px !important; 
                height: 95vh !important; /* 1. 弹窗高度最大化 */
                padding: 0 !important; 
                border-radius: 8px !important; 
                display: flex !important; 
                flex-direction: column; 
            }
            .swal2-html-container { 
                flex-grow: 1; 
                overflow: hidden; 
                padding: 0 !important; 
                margin: 0 !important; 
                text-align: left !important; 
            }
            *:focus { outline: none !important; box-shadow: none !important; }
            
            .gj-wrapper {
                width: 100%; height: 100%; display: flex; flex-direction: column; 
                background: var(--smart-theme-bg); position: relative;
            }
            
            /* === 顶部控制区 === */
            .gj-header-wrapper {
                flex-shrink: 0; background: var(--smart-theme-content-bg);
                border-bottom: 1px solid var(--smart-theme-border-color-1);
                display: flex; flex-direction: column;
            }
            
            /* 第一行 */
            .gj-header-row-1 {
                display: flex; justify-content: center; align-items: center;
                padding: 12px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); 
                position: relative; /* 关键：为绝对定位做参照 */
                min-height: 24px;
            }
            
            /* 2. 标题 (移除计数) */
            .gj-app-title { font-weight: bold; font-size: 1.2em; color: var(--smart-theme-body-color); }

            /* 2. 自动关闭 (绝对定位最右上角，字号缩小) */
            .gj-auto-close-wrapper {
                position: absolute; 
                right: 15px; 
                top: 50%; 
                transform: translateY(-50%);
                display: flex; align-items: center; gap: 4px; 
                font-size: 0.75em; /* 字号缩小 */
                opacity: 0.7; 
                z-index: 10;
            }
            .gj-checkbox-label { cursor: pointer; user-select: none; color: var(--smart-theme-body-color); display: flex; align-items: center; gap: 4px; }

            /* 第二行 */
            .gj-header-row-2 { 
                display: flex; justify-content: space-between; align-items: center; 
                padding: 8px 15px; gap: 10px; 
            }
            
            .gj-top-btn {
                background: transparent; border: 1px solid var(--smart-theme-border-color-2);
                color: var(--smart-theme-body-color); border-radius: 4px; padding: 6px 12px;
                cursor: pointer; font-size: 0.9em; display: flex; align-items: center; gap: 6px;
                transition: all 0.2s; opacity: 0.85; font-weight: bold;
            }
            .gj-top-btn:hover { opacity: 1; background: var(--smart-theme-border-color-1); transform: translateY(-1px); }
            .gj-top-btn i { color: #7a9a83; }

            .gj-icon-group { display: flex; gap: 5px; }
            /* 3. 纯图标按钮 (去除丑陋边框) */
            .gj-icon-btn {
                background: transparent; border: none; color: var(--smart-theme-body-color);
                width: 34px; height: 34px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; opacity: 0.6; font-size: 1.1em; transition: all 0.2s;
            }
            .gj-icon-btn:hover { background: rgba(0,0,0,0.05); opacity: 1; transform: scale(1.1); color: #7a9a83; }

            /* === 滚动区域 === */
            .gj-scroll-area { flex-grow: 1; overflow-y: auto; padding: 10px 8px 120px 8px; }

            /* === 卡片主体 === */
            .gj-card {
                background: var(--smart-theme-content-bg);
                border: 1px solid var(--smart-theme-border-color-1);
                border-radius: 6px; margin-bottom: 12px; 
                display: flex; flex-direction: column; flex-shrink: 0;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s;
            }
            .gj-card.active { 
                background: rgba(122, 154, 131, 0.05) !important;
                border-left: 4px solid #7a9a83; 
            }

            .gj-card-header-main {
                display: flex; align-items: flex-start; padding: 10px; gap: 10px; min-height: 30px;
            }
            .gj-card.editing .gj-card-header-main {
                border-bottom: 1px solid var(--smart-theme-border-color-1);
                background: rgba(0,0,0,0.02);
            }

            .gj-btn-max {
                color: var(--smart-theme-body-color); opacity: 0.4; cursor: pointer;
                background: transparent; border: none; padding: 2px; font-size: 0.9em; flex-shrink: 0; margin-top: 3px;
            }
            .gj-btn-max:hover { opacity: 1; color: #7a9a83; transform: scale(1.1); }

            .gj-title-area { 
                flex-grow: 1; display: block; word-break: break-all; white-space: normal; line-height: 1.4;
            }
            .gj-title-main { font-weight: bold; font-size: 1.05em; color: var(--smart-theme-body-color); margin-right: 6px; }
            .gj-title-sub { font-size: 0.9em; color: var(--smart-theme-body-color); opacity: 0.7; }

            .gj-header-right { margin-left: auto; flex-shrink: 0; }
            
            .gj-btn-edit-toggle {
                border: 1px solid transparent; background: transparent;
                color: var(--smart-theme-body-color); border-radius: 4px; padding: 4px 10px;
                cursor: pointer; font-size: 0.9em; opacity: 0.6; display: flex; align-items: center; gap: 5px;
            }
            .gj-btn-edit-toggle:hover { opacity: 1; background: rgba(0,0,0,0.05); }
            .gj-card.editing .gj-btn-edit-toggle { 
                background: #7a9a83; color: white; opacity: 1; border-color: #7a9a83; font-weight: bold;
            }

            .gj-card-header-tools {
                display: none; flex-direction: column; padding: 8px 10px; gap: 8px;
                background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--smart-theme-border-color-1);
            }
            .gj-card.editing .gj-card-header-tools { display: flex; }

            .gj-subtitle-input {
                width: 100%; height: 32px; box-sizing: border-box;
                background: var(--smart-theme-bg); border: 1px solid var(--smart-theme-border-color-1);
                color: var(--smart-theme-body-color); padding: 0 8px; border-radius: 4px; font-size: 0.9em;
            }
            
            .gj-tools-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
            
            .gj-btn-new-item {
                background: transparent; border: 1px dashed var(--smart-theme-border-color-2);
                color: #7a9a83; border-radius: 4px; padding: 4px 10px; font-size: 0.85em;
                cursor: pointer; display: flex; align-items: center; gap: 6px; opacity: 0.9;
            }
            .gj-btn-new-item:hover { background: rgba(122, 154, 131, 0.1); opacity: 1; border-color: #7a9a83; }

            .gj-tools-right { display: flex; gap: 5px; }
            .gj-action-btn {
                width: 28px; height: 28px; border: 1px solid var(--smart-theme-border-color-1);
                background: var(--smart-theme-bg); color: var(--smart-theme-body-color);
                border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                opacity: 0.7; font-size: 0.85em;
            }
            .gj-action-btn:hover { opacity: 1; transform: translateY(-1px); }
            .gj-action-btn.del:hover { color: #ff6b6b; border-color: #ff6b6b; }

            .gj-card-body { padding: 0; display: flex; flex-direction: column; }
            .gj-textarea {
                width: 100%; min-height: 80px; height: 100px; resize: vertical; border: none;
                background: transparent; padding: 10px;
                color: var(--smart-theme-body-color); font-family: inherit; font-size: 0.95em; line-height: 1.5;
                box-sizing: border-box; outline: none; transition: height 0.2s;
            }
            .gj-textarea.expanded { height: 400px !important; }
            
            .gj-textarea[readonly] { opacity: 0.8; cursor: default; }
            .gj-textarea:not([readonly]) { background: var(--smart-theme-input-bg); }

            .gj-expand-bar {
                width: 100%; text-align: center; background: rgba(0,0,0,0.03);
                border-top: 1px solid var(--smart-theme-border-color-1);
                color: var(--smart-theme-body-color); font-size: 0.8em; padding: 2px 0;
                cursor: pointer; opacity: 0.6; transition: all 0.2s;
            }
            .gj-expand-bar:hover { opacity: 1; background: rgba(0,0,0,0.08); }

            .gj-footer { display: flex; gap: 10px; padding: 10px; border-top: 1px solid var(--smart-theme-border-color-1); }
            .gj-footer-btn {
                border-radius: 4px; font-weight: bold; font-size: 0.9em; padding: 8px 0;
                cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
                transition: all 0.2s; height: 36px;
            }
            
            .gj-footer-btn.insert {
                flex: 4; background: transparent; border: 1px solid var(--smart-theme-border-color-2);
                color: var(--smart-theme-body-color); opacity: 0.8;
            }
            .gj-footer-btn.insert:hover { background: rgba(0,0,0,0.03); opacity: 1; border-color: var(--smart-theme-body-color); }
            
            .gj-footer-btn.switch {
                flex: 6; background: transparent; border: 1px solid var(--smart-theme-border-color-2);
                color: var(--smart-theme-body-color); opacity: 0.9;
            }
            .gj-footer-btn.switch:hover { border-color: #7a9a83; color: #7a9a83; background: rgba(122, 154, 131, 0.05); }
            
            .gj-footer-btn.active { 
                background: #7a9a83; color: white; border: none; cursor: default; opacity: 1; pointer-events: none; 
            }

            .gj-fullscreen-editor { display: flex; flex-direction: column; height: 100%; width: 100%; background: var(--smart-theme-bg); }
            .gj-fs-header { padding: 8px 12px; background: var(--smart-theme-content-bg); border-bottom: 1px solid var(--smart-theme-border-color-1); display: flex; flex-direction: column; gap: 6px; transition: all 0.2s; }
            .gj-fs-header.collapsed .gj-fs-tools-container { display: none; }
            .gj-fs-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
            .gj-fs-title-input { flex-grow: 1; background: transparent; border: 1px solid transparent; font-weight: bold; font-size: 1.05em; color: var(--smart-theme-body-color); padding: 4px; border-radius: 4px; }
            .gj-fs-title-input:hover, .gj-fs-title-input:focus { border-color: var(--smart-theme-border-color-1); background: var(--smart-theme-input-bg); }
            .gj-fs-toggle-btn { background: transparent; border: none; color: var(--smart-theme-body-color); cursor: pointer; opacity: 0.6; padding: 5px; }
            .gj-fs-tools-container { display: flex; flex-direction: column; gap: 6px; padding-top: 4px; }
            .gj-fs-row { display: flex; align-items: center; gap: 6px; width: 100%; }
            .gj-fs-icon { width: 20px; text-align: center; opacity: 0.6; font-size: 0.9em; flex-shrink: 0; }
            .gj-fs-input { flex: 1; min-width: 0; height: 28px; background: var(--smart-theme-input-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); padding: 0 6px; border-radius: 4px; font-size: 0.9em; }
            .gj-fs-btn { width: 30px; height: 30px; border-radius: 4px; flex-shrink: 0; background: var(--smart-theme-content-bg); border: 1px solid var(--smart-theme-border-color-2); color: var(--smart-theme-body-color); cursor: pointer; display: flex; align-items: center; justify-content: center; }
            .gj-fs-btn:hover { background: var(--smart-theme-border-color-1); }
            .gj-fs-btn.replace { color: #e6a23c; border-color: #e6a23c; background: rgba(230,162,60,0.1); }
            .gj-fs-btn.replace:hover { background: #e6a23c; color: white; }
            .gj-fullscreen-textarea { flex-grow: 1; padding: 15px; font-size: 1.1em; line-height: 1.6; background: var(--smart-theme-bg); color: var(--smart-theme-body-color); border: none; outline: none; resize: none; padding-bottom: 50vh; }

            .gj-parse-container { display: flex; flex-direction: column; height: 100%; text-align: left; padding-bottom: 10px; box-sizing: border-box; }
            .gj-tabs-header { display: flex; border-bottom: 1px solid var(--smart-theme-border-color-1); margin-bottom: 10px; }
            .gj-tab { flex: 1; text-align: center; padding: 10px; cursor: pointer; font-weight: bold; opacity: 0.7; border-bottom: 3px solid transparent; transition: all 0.2s; }
            .gj-tab:hover { opacity: 1; background: rgba(0,0,0,0.02); }
            .gj-tab.active { opacity: 1; color: #7a9a83; border-bottom-color: #7a9a83; }
            .gj-tab-content { display: none; flex-direction: column; flex-grow: 1; }
            .gj-tab-content.active { display: flex; }
            .gj-parse-textarea-wrapper { flex-grow: 1; display: flex; flex-direction: column; margin-top: 5px; }
            .gj-parse-textarea { flex-grow: 1; width: 100%; resize: none; padding: 10px; background: var(--smart-theme-input-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); border-radius: 4px; font-size: 0.95em; outline: none; }
            .gj-parse-textarea:focus { border-color: #7a9a83; }
            .gj-parse-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
            .gj-parse-hint { font-size: 0.9em; opacity: 0.8; font-weight: bold; }
            .gj-parse-preview-header { display: flex; justify-content: space-between; align-items: center; padding: 5px 0 10px 0; border-bottom: 1px solid var(--smart-theme-border-color-1); margin-bottom: 5px; flex-shrink: 0; }
            .gj-parse-info { font-size: 0.95em; }
            .gj-parse-start-select-group { display: flex; align-items: center; gap: 5px; font-size: 0.85em; }
            .gj-parse-select { background: var(--smart-theme-input-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); padding: 3px 6px; border-radius: 3px; font-size: 1em; }
            .gj-parse-preview-list { flex-grow: 1; border: 1px solid var(--smart-theme-border-color-1); border-radius: 4px; overflow-y: auto; background: rgba(0,0,0,0.02); padding: 5px; margin-bottom: 10px; }
            .gj-parse-item { display: flex; gap: 8px; padding: 8px; border-bottom: 1px solid var(--smart-theme-border-color-1); align-items: flex-start; background: var(--smart-theme-content-bg); margin-bottom: 4px; border-radius: 4px; }
            .gj-parse-row-select { background: #7a9a83; color: white; padding: 4px 2px; border-radius: 3px; border: 1px solid transparent; font-size: 0.8em; white-space: nowrap; font-weight: bold; margin-top: 2px; cursor: pointer; outline: none; max-width: 90px; }
            .gj-parse-row-select.error { background: #d32f2f; border-color: #ff6b6b; animation: shake 0.3s; }
            @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(0); } }
            .gj-parse-row-textarea { flex: 1; background: var(--smart-theme-input-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); padding: 6px; font-size: 0.95em; border-radius: 4px; resize: vertical; min-height: 42px; line-height: 1.4; }
            .gj-parse-row-textarea:focus { border-color: #7a9a83; outline: none; }
            .gj-parse-custom-footer { display: flex; gap: 10px; justify-content: flex-end; align-items: center; margin-top: auto; }
            .gj-custom-btn { padding: 8px 16px; border-radius: 4px; border: 1px solid var(--smart-theme-border-color-2); background: transparent; color: var(--smart-theme-body-color); cursor: pointer; font-size: 0.95em; display: flex; align-items: center; gap: 6px; }
            .gj-custom-btn:hover { background: rgba(0,0,0,0.05); }
            .gj-custom-btn.primary { background: #7a9a83; color: white; border: none; }
            .gj-custom-btn.primary:hover { filter: brightness(1.1); }
            .gj-custom-btn.danger { background: #d32f2f; color: white; border: none; }
            .gj-custom-btn.danger:hover { filter: brightness(1.1); }

            .gj-search-top-bar { padding: 0 5px 8px 5px; border-bottom: 1px solid var(--smart-theme-border-color-1); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px; }
            .gj-search-group { margin-bottom: 8px; border: 1px solid var(--smart-theme-border-color-1); border-radius: 4px; overflow: hidden; }
            .gj-search-header { background: rgba(0,0,0,0.05); padding: 5px 10px; font-weight: bold; font-size: 0.9em; display: flex; justify-content: space-between; align-items: center; color: #7a9a83; }
            .gj-search-row { padding: 6px 10px; border-top: 1px solid var(--smart-theme-border-color-1); display: flex; flex-direction: column; gap: 4px; }
            .gj-search-context { font-size: 0.9em; opacity: 0.9; white-space: pre-wrap; line-height: 1.4; color: var(--smart-theme-body-color); background: rgba(0,0,0,0.02); padding: 4px; border-radius: 3px; font-family: monospace; }
            .gj-highlight { background: rgba(255, 235, 59, 0.4); color: inherit; font-weight: bold; padding: 0 1px; border-radius: 2px; }
            .gj-search-actions { display: flex; gap: 8px; justify-content: flex-end; width: 100%; margin-top: 2px; }
            .gj-search-btn { padding: 3px 10px; font-size: 0.85em; border-radius: 3px; border: 1px solid var(--smart-theme-border-color-2); background: transparent; color: var(--smart-theme-body-color); cursor: pointer; }
            .gj-search-btn:hover { background: rgba(0,0,0,0.05); }
            .gj-search-btn.edit { color: #5b8db8; border-color: #5b8db8; font-weight: bold; }
            .gj-search-btn.replace-all-global { background: #d32f2f; color: white; border: none; padding: 4px 8px; border-radius: 3px; }
            .gj-search-btn.replace { color: #e6a23c; border-color: #e6a23c; }
            
            /* 3. 搜索框自适应最大高度 */
            .gj-search-results-container { 
                padding-bottom: 60px; 
                max-height: 80vh !important; /* 自适应屏幕高度 */
                overflow-y: auto;
            }
        </style>
    `);

    async function forceSave(charId) {
        if (saveTimeout) clearTimeout(saveTimeout);
        if (typeof window.saveCharacterDebounced === 'function') {
            await window.saveCharacterDebounced();
        } else if (typeof SillyTavern.saveCharacter === 'function') {
            await SillyTavern.saveCharacter(Number(charId));
        }
    }

    function getSubtitles(charObj) {
        if (!charObj.data) charObj.data = {};
        if (!charObj.data.greeting_subtitles) charObj.data.greeting_subtitles = { first_mes: "", alts: [] };
        if (Array.isArray(charObj.data.greeting_subtitles)) charObj.data.greeting_subtitles = { first_mes: "", alts: charObj.data.greeting_subtitles };
        return charObj.data.greeting_subtitles;
    }

    function getSubtitle(charId, index) {
        const charObj = SillyTavern.characters[charId];
        const subs = getSubtitles(charObj);
        if (index === -1) return subs.first_mes || "";
        return subs.alts[index] || "";
    }

    function setSubtitle(charId, index, value) {
        const charObj = SillyTavern.characters[charId];
        const subs = getSubtitles(charObj);
        if (index === -1) subs.first_mes = value;
        else subs.alts[index] = value;
    }

    function syncSubtitles(charId, action, index) {
        const charObj = SillyTavern.characters[charId];
        const subs = getSubtitles(charObj);
        if (!subs.alts) subs.alts = [];
        if (action === 'add') subs.alts.splice(index + 1, 0, ""); 
        else if (action === 'delete') subs.alts.splice(index, 1);
        else if (action === 'move-up' && index > 0) [subs.alts[index-1], subs.alts[index]] = [subs.alts[index], subs.alts[index-1]];
        else if (action === 'move-down' && index < subs.alts.length - 1) [subs.alts[index], subs.alts[index+1]] = [subs.alts[index+1], subs.alts[index]];
    }

    async function openDirectoryTool(charId, refreshCallback) {
        const popupFunc = SillyTavern.callGenericPopup || window.callGenericPopup;
        const charObj = SillyTavern.characters[charId];
        
        let currentStep = 'tabs';
        let importText = charObj.first_mes || ""; 
        let parsedMatches = [];
        let startIndex = 0; 
        let exportText = "";

        const generateExportText = () => {
            const subs = getSubtitles(charObj);
            let lines = [];
            (charObj.data.alternate_greetings || []).forEach((g, i) => {
                const sub = subs.alts[i];
                if (sub && sub.trim()) lines.push(`${i + 1}. ${sub.trim()}`);
            });
            return lines.join('\n');
        };
        exportText = generateExportText();

        const altsCount = (charObj.data.alternate_greetings || []).length;
        const generateOptionsHtml = (selectedVal) => {
            let html = `<option value="-1" ${selectedVal === -1 ? 'selected' : ''}>开场白 #0</option>`;
            for (let i = 0; i < altsCount; i++) html += `<option value="${i}" ${selectedVal === i ? 'selected' : ''}>开场白 #${i + 1}</option>`;
            return html;
        };

        let myPopup = null;

        const renderTabUI = () => {
            const $container = $(`
                <div class="gj-parse-container" style="height: 500px;">
                    <div class="gj-tabs-header">
                        <div class="gj-tab ${currentStep === 'tabs' ? 'active' : ''}" data-tab="import">导入/解析</div>
                        <div class="gj-tab" data-tab="export">导出/生成</div>
                    </div>
                    <div class="gj-tab-content active" id="tab-import">
                        <div class="gj-parse-header-row"><span class="gj-parse-hint">修改首页或粘贴开场白列表:</span></div>
                        <div class="gj-parse-textarea-wrapper"><textarea class="gj-parse-textarea import-area" placeholder="粘贴内容...">${_.escape(importText)}</textarea></div>
                        <div class="gj-parse-custom-footer" style="margin-top:10px;">
                            <button class="gj-custom-btn clear-btn"><i class="fa-solid fa-trash"></i> 清空</button>
                            <button class="gj-custom-btn primary parse-btn"><i class="fa-solid fa-wand-magic-sparkles"></i> 解析目录</button>
                        </div>
                    </div>
                    <div class="gj-tab-content" id="tab-export">
                        <div class="gj-parse-header-row"><span class="gj-parse-hint">已根据副标题生成目录:</span></div>
                        <div class="gj-parse-textarea-wrapper"><textarea class="gj-parse-textarea export-area" placeholder="没有副标题数据...">${_.escape(exportText)}</textarea></div>
                        <div class="gj-parse-custom-footer" style="margin-top:10px;">
                            <button class="gj-custom-btn copy-btn"><i class="fa-solid fa-copy"></i> 复制</button>
                            <button class="gj-custom-btn danger overwrite-btn"><i class="fa-solid fa-triangle-exclamation"></i> 覆盖首页</button>
                        </div>
                    </div>
                </div>
            `);

            $container.find('.gj-tab').on('click', function() {
                const tabId = $(this).data('tab');
                $container.find('.gj-tab').removeClass('active');
                $(this).addClass('active');
                $container.find('.gj-tab-content').removeClass('active');
                $container.find(`#tab-${tabId}`).addClass('active');
            });

            $container.find('.clear-btn').on('click', () => $container.find('.import-area').val('').focus());
            $container.find('.copy-btn').on('click', () => navigator.clipboard.writeText($container.find('.export-area').val()).then(() => toastr.success("已复制")));
            
            $container.find('.import-area').on('input', function() { importText = $(this).val(); });
            $container.find('.export-area').on('input', function() { exportText = $(this).val(); });

            $container.find('.parse-btn').on('click', () => {
                importText = $container.find('.import-area').val();
                if (!importText.trim()) { toastr.warning("内容为空"); return; }
                const regex = /(?:^|\n)\s*(?:[(（]?(?:开场白|场景|Part|No\.?|Scene|Scenario)\s*)?([0-9]+|[一二三四五六七八九十]+)[)）]?\s*[:：.、\-\—\s]+\s*(.*?)(?=\n|$)/igm;
                parsedMatches = [];
                let match;
                while ((match = regex.exec(importText)) !== null) {
                    parsedMatches.push({ title: match[2].trim(), selectedIndex: null });
                }
                if (parsedMatches.length === 0) { toastr.warning("未识别到目录格式"); return; }
                myPopup.complete(SillyTavern.POPUP_RESULT.CANCELLED);
                setTimeout(() => openPreviewUI(), 50);
            });

            $container.find('.overwrite-btn').on('click', async () => {
                if(!confirm("确定要用当前的文本覆盖【开场白 #0】的内容吗？\n原内容将会丢失。")) return;
                charObj.first_mes = exportText;
                await forceSave(charId);
                toastr.success("首页已更新");
                if(refreshCallback) refreshCallback();
                myPopup.complete(SillyTavern.POPUP_RESULT.AFFIRMATIVE);
            });

            return $container;
        };

        const openTabsUI = async () => {
            const $content = renderTabUI();
            myPopup = new SillyTavern.Popup($content, SillyTavern.POPUP_TYPE.TEXT, "", { large: true, okButton: "关闭" });
            myPopup.show();
        };

        const openPreviewUI = async () => {
            const $previewContainer = $(`
                <div class="gj-parse-container" style="height: 550px;">
                    <div class="gj-parse-preview-header">
                        <div class="gj-parse-info">识别到 <b>${parsedMatches.length}</b> 个标题</div>
                        <div class="gj-parse-start-select-group">
                            <label>匹配起点:</label>
                            <select class="gj-parse-select main-starter">${generateOptionsHtml(startIndex)}</select>
                        </div>
                    </div>
                    <div class="gj-parse-preview-list"></div>
                    <div class="gj-parse-custom-footer" style="margin-top:auto;">
                        <button class="gj-custom-btn back-btn"><i class="fa-solid fa-arrow-left"></i> 返回修改</button>
                        <button class="gj-custom-btn primary confirm-btn"><i class="fa-solid fa-check"></i> 确认写入</button>
                    </div>
                </div>
            `);

            const $list = $previewContainer.find('.gj-parse-preview-list');
            const $globalSelect = $previewContainer.find('.main-starter');

            const checkDuplicates = () => {
                const valueCounts = {};
                const $selects = $list.find('.gj-parse-row-select');
                $selects.each(function() { const val = $(this).val(); valueCounts[val] = (valueCounts[val] || 0) + 1; });
                $selects.each(function() {
                    const val = $(this).val();
                    if (valueCounts[val] > 1) $(this).addClass('error');
                    else $(this).removeClass('error');
                });
            };

            const renderRows = () => {
                $list.empty();
                let currentStart = parseInt($globalSelect.val());
                parsedMatches.forEach((m, i) => {
                    m.selectedIndex = currentStart + i;
                    const $item = $(`
                        <div class="gj-parse-item">
                            <select class="gj-parse-row-select">${generateOptionsHtml(m.selectedIndex)}</select>
                            <textarea class="gj-parse-row-textarea" rows="2">${_.escape(m.title)}</textarea>
                        </div>
                    `);
                    $item.find('.gj-parse-row-select').on('change', function() {
                        m.selectedIndex = parseInt($(this).val());
                        checkDuplicates();
                    });
                    $item.find('textarea').on('input', function() { m.title = $(this).val(); });
                    $list.append($item);
                });
                checkDuplicates();
            };

            $globalSelect.on('change', () => {
                startIndex = parseInt($globalSelect.val());
                renderRows();
            });
            renderRows();

            $previewContainer.find('.back-btn').on('click', () => {
                myPopup.complete(SillyTavern.POPUP_RESULT.CANCELLED);
                setTimeout(openTabsUI, 50);
            });

            $previewContainer.find('.confirm-btn').on('click', async () => {
                let updatedCount = 0;
                parsedMatches.forEach((m) => {
                    if (m.title.trim() === "" || isNaN(m.selectedIndex)) return;
                    if (m.selectedIndex === -1) { setSubtitle(charId, -1, m.title); updatedCount++; }
                    else if (m.selectedIndex < (charObj.data.alternate_greetings || []).length) { setSubtitle(charId, m.selectedIndex, m.title); updatedCount++; }
                });
                await forceSave(charId);
                toastr.success(`更新 ${updatedCount} 个副标题`);
                if (refreshCallback) refreshCallback();
                myPopup.complete(SillyTavern.POPUP_RESULT.AFFIRMATIVE);
            });

            myPopup = new SillyTavern.Popup($previewContainer, SillyTavern.POPUP_TYPE.TEXT, "", { large: true, okButton: "关闭" });
            myPopup.show();
        };

        openTabsUI();
    }

    async function openFullscreenEditor(index, label, initialFindStr = "", initialReplaceStr = "") {
        const charId = SillyTavern.characterId;
        const charObj = SillyTavern.characters[charId];
        const originalContent = (index === -1) ? charObj.first_mes : charObj.data.alternate_greetings[index];
        const originalSubtitle = getSubtitle(charId, index);
        const titleValue = `${label}${originalSubtitle ? ' - ' + originalSubtitle : ''}`;

        const popupFunc = SillyTavern.callGenericPopup || window.callGenericPopup;
        const isCollapsed = !initialFindStr; 

        const $container = $(`
            <div class="gj-fullscreen-editor">
                <div class="gj-fs-header ${isCollapsed ? 'collapsed' : ''}">
                    <div class="gj-fs-title-row">
                        <input class="gj-fs-title-input" value="${_.escape(titleValue)}">
                        <button class="gj-fs-toggle-btn" title="切换工具栏">
                            ${isCollapsed ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-up"></i>'}
                        </button>
                    </div>
                    <div class="gj-fs-tools-container">
                        <div class="gj-fs-row">
                            <i class="fa-solid fa-magnifying-glass gj-fs-icon"></i>
                            <input class="gj-fs-input find" type="text" placeholder="查找..." value="${initialFindStr}">
                            <button class="gj-fs-btn btn-prev"><i class="fa-solid fa-chevron-up"></i></button>
                            <button class="gj-fs-btn btn-next"><i class="fa-solid fa-chevron-down"></i></button>
                        </div>
                        <div class="gj-fs-row">
                            <i class="fa-solid fa-pen-to-square gj-fs-icon"></i>
                            <input class="gj-fs-input replace" type="text" placeholder="替换..." value="${initialReplaceStr}">
                            <button class="gj-fs-btn replace btn-replace"><i class="fa-solid fa-check"></i></button>
                            <button class="gj-fs-btn replace btn-replace-all"><i class="fa-solid fa-list-check"></i></button>
                        </div>
                    </div>
                </div>
                <textarea class="gj-fullscreen-textarea">${_.escape(originalContent)}</textarea>
            </div>
        `);

        const $textarea = $container.find('textarea');
        const $inputFind = $container.find('.gj-fs-input.find');
        const $inputReplace = $container.find('.gj-fs-input.replace');
        const $header = $container.find('.gj-fs-header');
        const $toggleBtn = $container.find('.gj-fs-toggle-btn');
        const $titleInput = $container.find('.gj-fs-title-input');

        $toggleBtn.on('click', () => {
            $header.toggleClass('collapsed');
            $toggleBtn.html($header.hasClass('collapsed') ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-up"></i>');
        });

        const doFind = (direction) => {
            const val = $textarea.val();
            const term = $inputFind.val();
            if (!term) return;
            let startPos = $textarea[0].selectionEnd;
            if (direction === 'prev') startPos = $textarea[0].selectionStart;
            let nextPos = -1;
            if (direction === 'next') {
                nextPos = val.indexOf(term, startPos);
                if (nextPos === -1) nextPos = val.indexOf(term, 0); 
            } else {
                nextPos = val.lastIndexOf(term, startPos - 1);
                if (nextPos === -1) nextPos = val.lastIndexOf(term); 
            }
            if (nextPos !== -1) {
                $textarea.focus();
                $textarea[0].setSelectionRange(nextPos, nextPos + term.length);
                
                const textBefore = val.substring(0, nextPos);
                const lines = textBefore.split("\n").length;
                const lineHeight = 24; 
                const containerHeight = $textarea.height();
                $textarea.scrollTop(lines * lineHeight - containerHeight / 2);
            } else {
                toastr.warning("未找到匹配内容");
            }
        };

        const doReplace = () => {
            const start = $textarea[0].selectionStart;
            const end = $textarea[0].selectionEnd;
            const term = $inputFind.val();
            const rep = $inputReplace.val();
            const val = $textarea.val();
            if (val.substring(start, end) === term) {
                const newVal = val.substring(0, start) + rep + val.substring(end);
                $textarea.val(newVal);
                $textarea[0].setSelectionRange(start, start + rep.length);
                doFind('next');
            } else {
                doFind('next');
            }
        };

        const doReplaceAll = () => {
            const term = $inputFind.val();
            const rep = $inputReplace.val();
            if (!term) return;
            const val = $textarea.val();
            const newVal = val.split(term).join(rep);
            if (val !== newVal) {
                $textarea.val(newVal);
                toastr.success("已全部替换");
            } else {
                toastr.info("没有找到可替换的内容");
            }
        };

        $container.find('.btn-next').on('click', () => doFind('next'));
        $container.find('.btn-prev').on('click', () => doFind('prev'));
        $container.find('.btn-replace').on('click', doReplace);
        $container.find('.btn-replace-all').on('click', doReplaceAll);

        if (initialFindStr) setTimeout(() => doFind('next'), 300);

        const result = await popupFunc($container, SillyTavern.POPUP_TYPE.CONFIRM, "", { 
            large: true, wide: true, okButton: "保存", cancelButton: "取消" 
        });

        if (result) {
            const finalContent = $textarea.val();
            if (index === -1) charObj.first_mes = finalContent;
            else charObj.data.alternate_greetings[index] = finalContent;

            let newTitleVal = $titleInput.val();
            let newSub = "";
            const separator = " - ";
            if (newTitleVal.includes(separator)) {
                const parts = newTitleVal.split(separator);
                if (parts.length > 1) newSub = parts.slice(1).join(separator);
            } else if (newTitleVal !== label) {
                newSub = newTitleVal.replace(label, "").trim();
            }
            setSubtitle(charId, index, newSub);
            
            await forceSave(charId);
            toastr.success("已保存");
            setTimeout(() => showGreetingManager(), 100);
        }
    }

    async function openSearchAndReplaceLogic(charId) {
        const popupFunc = SillyTavern.callGenericPopup || window.callGenericPopup;
        
        const $container = $('<div style="display:flex; flex-direction:column; gap:10px; text-align:left;"></div>');
        const $inputFind = $('<input class="text_pole" style="width:100%; margin-top:5px;" type="text" placeholder="输入查找内容...">');
        const $inputReplace = $('<input class="text_pole" style="width:100%; margin-top:5px;" type="text" placeholder="替换为 (留空则删除)...">');
        
        $container.append(
            $('<div>').append('<label style="font-weight:bold;">查找:</label>').append($inputFind),
            $('<div>').append('<label style="font-weight:bold;">替换:</label>').append($inputReplace)
        );

        const inputRes = await popupFunc($container, SillyTavern.POPUP_TYPE.CONFIRM, "", { okButton: "开始搜索", cancelButton: "取消" });
        if (!inputRes) return;
        const findStr = $inputFind.val();
        if (!findStr) return;
        const replaceStr = $inputReplace.val();

        const charObj = SillyTavern.characters[charId];
        let results = [];
        const checkContent = (content, index, label) => {
            if (!content) return;
            let indices = [];
            let pos = content.indexOf(findStr);
            while (pos !== -1) {
                indices.push(pos);
                pos = content.indexOf(findStr, pos + 1);
            }
            if (indices.length > 0) results.push({ index, label, content, indices });
        };

        checkContent(charObj.first_mes, -1, "开场白 #0");
        if (charObj.data && charObj.data.alternate_greetings) {
            charObj.data.alternate_greetings.forEach((g, i) => checkContent(g, i, `开场白 #${i + 1}`));
        }

        if (results.length === 0) { toastr.info("未找到匹配内容"); return; }

        const $resultContainer = $('<div class="gj-search-results-container" style="text-align:left; max-height:600px; overflow-y:auto; padding-right:2px;"></div>');
        
        const $topBar = $(`<div class="gj-search-top-bar"></div>`);
        $topBar.append(`<span>找到 <b>${results.length}</b> 处包含 "${_.escape(findStr)}"</span>`);
        if (typeof replaceStr === 'string') {
            const $btnGlobalReplace = $(`<button class="gj-search-btn replace-all-global">全局替换所有</button>`);
            $btnGlobalReplace.on('click', async () => {
                if(!confirm(`确定替换所有 "${findStr}" 为 "${replaceStr}" 吗？`)) return;
                const char = SillyTavern.characters[charId];
                if (char.first_mes) char.first_mes = char.first_mes.split(findStr).join(replaceStr);
                if (char.data.alternate_greetings) {
                    char.data.alternate_greetings = char.data.alternate_greetings.map(g => g ? g.split(findStr).join(replaceStr) : g);
                }
                await forceSave(charId);
                toastr.success("全局替换完成");
                if (typeof Swal !== 'undefined') Swal.close();
                setTimeout(showGreetingManager, 300);
            });
            $topBar.append($btnGlobalReplace);
        }
        $resultContainer.append($topBar);

        results.forEach(res => {
            const sub = getSubtitle(charId, res.index);
            const labelDisplay = sub ? `${res.label} (${sub})` : res.label;
            const $group = $(`<div class="gj-search-group"></div>`);
            const $header = $(`<div class="gj-search-header"><span>${labelDisplay}</span></div>`);
            
            if (typeof replaceStr === 'string') {
                const $btnReplaceAll = $(`<button class="gj-search-btn replace">替换本条</button>`);
                $btnReplaceAll.on('click', async () => {
                    const currentContent = (res.index === -1) ? charObj.first_mes : charObj.data.alternate_greetings[res.index];
                    const newContent = currentContent.split(findStr).join(replaceStr);
                    if (res.index === -1) charObj.first_mes = newContent;
                    else charObj.data.alternate_greetings[res.index] = newContent;
                    await forceSave(charId);
                    toastr.success("已替换");
                    $group.slideUp();
                });
                $header.append($btnReplaceAll);
            }
            $group.append($header);
            
            res.indices.forEach(idx => {
                const start = Math.max(0, idx - 30); 
                const end = Math.min(res.content.length, idx + findStr.length + 30);
                const prefix = start > 0 ? "..." : "";
                const suffix = end < res.content.length ? "..." : "";
                const contextRaw = res.content.substring(start, end);
                const contextHtml = _.escape(contextRaw).replace(new RegExp(_.escape(findStr), 'g'), `<span class="gj-highlight">${_.escape(findStr)}</span>`);
                const $row = $(`<div class="gj-search-row"></div>`);
                $row.append(`<div class="gj-search-context">${prefix}${contextHtml}${suffix}</div>`);
                const $actions = $(`<div class="gj-search-actions"></div>`);
                
                if (typeof replaceStr === 'string') {
                    const $btnRep = $(`<button class="gj-search-btn replace">替换</button>`);
                    $btnRep.on('click', async () => {
                        const currentContent = (res.index === -1) ? charObj.first_mes : charObj.data.alternate_greetings[res.index];
                        const newContent = currentContent.replace(findStr, replaceStr);
                        if (res.index === -1) charObj.first_mes = newContent;
                        else charObj.data.alternate_greetings[res.index] = newContent;
                        await forceSave(charId);
                        toastr.success("已替换");
                        $row.slideUp();
                    });
                    $actions.append($btnRep);
                }

                const $btnJump = $(`<button class="gj-search-btn edit">跳转</button>`);
                $btnJump.on('click', () => {
                    if (typeof Swal !== 'undefined') Swal.close();
                    setTimeout(() => { openFullscreenEditor(res.index, res.label, findStr, replaceStr); }, 300);
                });
                $actions.append($btnJump);
                $row.append($actions);
                $group.append($row);
            });
            $resultContainer.append($group);
        });

        popupFunc($resultContainer, SillyTavern.POPUP_TYPE.TEXT, "", { wide: true, okButton: "关闭" });
    }

    async function jumpToGreeting(targetIndex, contentToUse) {
        if (!SillyTavern.chat || SillyTavern.chat.length === 0) return false;
        
        if (SillyTavern.chat.length > 1) {
            const popupFunc = SillyTavern.callGenericPopup || window.callGenericPopup;
            const htmlMsg = `
                <div style="text-align:center; padding:10px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:3em; color:#e6a23c; margin-bottom:10px;"></i>
                    <h3>确认修改开场白？</h3>
                    <p style="opacity:0.8; margin-bottom:10px;">当前聊天已有 ${SillyTavern.chat.length} 条消息记录。</p>
                    <p style="color:#d32f2f; font-weight:bold;">修改第0层开场白会改变故事起点，<br>可能导致现有上下文逻辑不连贯。</p>
                    <p style="font-size:0.9em; opacity:0.7; margin-top:10px;">如果您只是想插入新剧情，请点击左侧的“插入聊天”。</p>
                </div>
            `;
            const confirmSwitch = await popupFunc(htmlMsg, SillyTavern.POPUP_TYPE.CONFIRM, "", { okButton: "确定替换", cancelButton: "取消" });
            
            // 修复点：在SillyTavern中，CONFIRM类型的弹窗点击OK返回的是 1 (truthy)，取消是 0/false。
            // 原代码 'confirmSwitch !== true' 在返回 1 时会判定为失败，因此导致逻辑中断。
            // 修改为检查非真值。
            if (!confirmSwitch) return false; 
        }

        const msgZero = SillyTavern.chat[0];
        let currentSwipes = msgZero.swipes ? [...msgZero.swipes] : [msgZero.mes];
        while (currentSwipes.length <= targetIndex) currentSwipes.push("...");
        currentSwipes[targetIndex] = contentToUse;
        await window.TavernHelper.setChatMessages([{ message_id: 0, swipes: currentSwipes }], { refresh: 'none' });
        await window.TavernHelper.setChatMessages([{ message_id: 0, swipe_id: targetIndex }], { refresh: 'affected' });
        return true; 
    }

    async function backToStart() {
        if (!SillyTavern.chat || SillyTavern.chat.length === 0) return;
        await window.TavernHelper.setChatMessages([{ message_id: 0, swipe_id: 0 }], { refresh: 'affected' });
        toastr.success("已切换至首页");
    }

    async function showGreetingManager() {
        const charId = SillyTavern.characterId;
        const charData = window.TavernHelper.getCharData('current');
        if (!charData) { toastr.warning("请先打开一个角色聊天"); return ""; }

        let mainPopupInstance = null;
        const savedSetting = localStorage.getItem(STORAGE_KEY_AUTO_CLOSE);
        let isAutoClose = savedSetting === 'true';

        const tryAutoClose = () => {
            if ($('#gj-auto-close-checkbox').is(':checked')) {
                if (mainPopupInstance && typeof mainPopupInstance.complete === 'function') {
                    mainPopupInstance.complete(SillyTavern.POPUP_RESULT.AFFIRMATIVE);
                } else if (typeof Swal !== 'undefined') {
                    Swal.close();
                }
            }
        };

        const $wrapper = $('<div class="gj-wrapper"></div>');
        
        const alts = Array.isArray(SillyTavern.characters[charId].data.alternate_greetings) ? SillyTavern.characters[charId].data.alternate_greetings : [];

        const $headerWrapper = $(`
            <div class="gj-header-wrapper">
                <div class="gj-header-row-1">
                    <div class="gj-app-title">开场白管理</div>
                    <div class="gj-auto-close-wrapper">
                        <label class="gj-checkbox-label">
                            <input type="checkbox" id="gj-auto-close-checkbox" ${isAutoClose ? 'checked' : ''}>
                            自动关闭窗口
                        </label>
                    </div>
                </div>
                <div class="gj-header-row-2">
                    <button class="gj-top-btn directory"><i class="fa-solid fa-list-ol"></i> 目录工具</button>
                    <div class="gj-icon-group">
                        <button class="gj-icon-btn add" title="新建"><i class="fa-solid fa-plus"></i></button>
                        <button class="gj-icon-btn search" title="搜索"><i class="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                </div>
            </div>
        `);
        
        const $scrollArea = $('<div class="gj-scroll-area"></div>');
        $wrapper.append($headerWrapper).append($scrollArea);

        $headerWrapper.find('#gj-auto-close-checkbox').on('change', function() {
            localStorage.setItem(STORAGE_KEY_AUTO_CLOSE, $(this).is(':checked'));
        });

        const renderList = () => {
            $scrollArea.empty();
            const charObj = SillyTavern.characters[charId];
            if (!charObj.data) charObj.data = {};
            const alts = Array.isArray(charObj.data.alternate_greetings) ? charObj.data.alternate_greetings : [];
            const subtitles = getSubtitles(charObj);
            const msgZero = SillyTavern.chat[0];
            let currentSwipeIndex = msgZero && msgZero.swipe_id !== undefined ? msgZero.swipe_id : 0;

            let allGreets = [
                { type: 'first', content: charObj.first_mes, label: "开场白 #0", protected: true, index: -1 },
                ...alts.map((g, i) => ({ type: 'alt', index: i, content: g, label: `开场白 #${i + 1}`, protected: false }))
            ];

            allGreets.forEach((item, loopIndex) => {
                const isCurrent = (loopIndex === currentSwipeIndex);
                const subtitle = getSubtitle(charId, item.index);
                
                const $card = $(`
                    <div class="gj-card ${isCurrent ? 'active' : ''}" data-index="${loopIndex}">
                        <div class="gj-card-header-main">
                            <button class="gj-btn-max" title="全屏编辑"><i class="fa-solid fa-maximize"></i></button>
                            <div class="gj-title-area">
                                <span class="gj-title-main">${item.label}</span>
                                ${subtitle ? `<span class="gj-title-sub">(${_.escape(subtitle)})</span>` : ''}
                            </div>
                            <div class="gj-header-right">
                                <button class="gj-btn-edit-toggle" title="编辑"><i class="fa-solid fa-pen"></i></button>
                            </div>
                        </div>
                        <div class="gj-card-header-tools">
                            <input type="text" class="gj-subtitle-input" placeholder="输入副标题..." value="${_.escape(subtitle)}">
                            <div class="gj-tools-row" style="margin-top:8px;">
                                <button class="gj-btn-new-item add"><i class="fa-solid fa-plus"></i> 在下方插入新开场</button>
                                <div class="gj-tools-right">
                                    ${!item.protected && item.index > 0 ? `<button class="gj-action-btn up"><i class="fa-solid fa-arrow-up"></i></button>` : ''}
                                    ${!item.protected && item.index < alts.length - 1 ? `<button class="gj-action-btn down"><i class="fa-solid fa-arrow-down"></i></button>` : ''}
                                    ${!item.protected ? `<button class="gj-action-btn del"><i class="fa-solid fa-trash"></i></button>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="gj-card-body">
                            <textarea class="gj-textarea" readonly placeholder="内容预览...">${_.escape(item.content)}</textarea>
                            <div class="gj-expand-bar" title="展开/收起"><i class="fa-solid fa-chevron-down"></i></div>
                            <div class="gj-footer">
                                <button class="gj-footer-btn insert"><i class="fa-solid fa-paper-plane"></i> 插入聊天</button>
                                <button class="gj-footer-btn switch ${isCurrent ? 'active' : ''}">
                                    ${isCurrent ? '<i class="fa-solid fa-check-circle"></i> 当前开场' : '<i class="fa-solid fa-rotate"></i> 设为开场'}
                                </button>
                            </div>
                        </div>
                    </div>
                `);

                const $textarea = $card.find('.gj-textarea');
                const $subInput = $card.find('.gj-subtitle-input');
                const $toggle = $card.find('.gj-btn-edit-toggle');
                const $expandBar = $card.find('.gj-expand-bar');

                $toggle.on('click', async () => {
                    $card.toggleClass('editing');
                    const isEditing = $card.hasClass('editing');
                    if (isEditing) {
                        $toggle.html('<i class="fa-solid fa-floppy-disk"></i> 保存');
                        $textarea.prop('readonly', false).focus();
                    } else {
                        $toggle.html('<i class="fa-solid fa-pen"></i>');
                        $textarea.prop('readonly', true);
                        const newText = $textarea.val();
                        const newSub = $subInput.val();
                        if (item.protected) charObj.first_mes = newText;
                        else charObj.data.alternate_greetings[item.index] = newText;
                        setSubtitle(charId, item.index, newSub);
                        await forceSave(charId);
                        toastr.success("已保存修改");
                        renderList();
                    }
                });

                $expandBar.on('click', () => {
                    const isExpanded = $textarea.hasClass('expanded');
                    if (isExpanded) {
                        $textarea.removeClass('expanded');
                        $expandBar.html('<i class="fa-solid fa-chevron-down"></i>');
                    } else {
                        $textarea.addClass('expanded');
                        $expandBar.html('<i class="fa-solid fa-chevron-up"></i>');
                    }
                });

                $card.find('.gj-btn-max').on('click', () => {
                    if (typeof Swal !== 'undefined') Swal.close();
                    setTimeout(() => openFullscreenEditor(item.index, item.label), 200);
                });
                $card.find('.add').on('click', async () => {
                    if (!charObj.data.alternate_greetings) charObj.data.alternate_greetings = [];
                    charObj.data.alternate_greetings.splice(item.index + 1, 0, "");
                    syncSubtitles(charId, 'add', item.index);
                    await forceSave(charId);
                    renderList();
                    toastr.success("已插入");
                });
                if (!item.protected) {
                    $card.find('.up').on('click', async () => {
                        const arr = charObj.data.alternate_greetings;
                        [arr[item.index - 1], arr[item.index]] = [arr[item.index], arr[item.index - 1]];
                        syncSubtitles(charId, 'move-up', item.index);
                        await forceSave(charId);
                        renderList();
                    });
                    $card.find('.down').on('click', async () => {
                        const arr = charObj.data.alternate_greetings;
                        [arr[item.index], arr[item.index + 1]] = [arr[item.index + 1], arr[item.index]];
                        syncSubtitles(charId, 'move-down', item.index);
                        await forceSave(charId);
                        renderList();
                    });
                    $card.find('.del').on('click', async () => {
                        const popupFunc = SillyTavern.callGenericPopup || window.callGenericPopup;
                        if(await popupFunc(`删除 ${item.label}？`, SillyTavern.POPUP_TYPE.CONFIRM)) {
                            charObj.data.alternate_greetings.splice(item.index, 1);
                            syncSubtitles(charId, 'delete', item.index);
                            await forceSave(charId);
                            toastr.success("已删除");
                            renderList();
                        }
                    });
                }
                $card.find('.insert').on('click', async () => {
                    const txt = window.TavernHelper.substitudeMacros($textarea.val());
                    await window.TavernHelper.createChatMessages([{ role: 'assistant', message: txt }], { refresh: 'affected' });
                    toastr.success("已插入");
                    tryAutoClose();
                });
                
                // 4. 逻辑修复：等待返回值 + 强制关闭
                $card.find('.switch').on('click', async () => {
                    if ($card.hasClass('active')) return;
                    
                    const success = await jumpToGreeting(loopIndex, $textarea.val());
                    if (success) {
                        toastr.success(`已切换`);
                        renderList();
                        tryAutoClose();
                    }
                });

                $scrollArea.append($card);
            });
        };

        $headerWrapper.find('.add').on('click', async () => {
            const charObj = SillyTavern.characters[charId];
            if (!charObj.data.alternate_greetings) charObj.data.alternate_greetings = [];
            charObj.data.alternate_greetings.push("");
            const subs = getSubtitles(charObj);
            if (!subs.alts) subs.alts = [];
            subs.alts.push("");
            await forceSave(charId);
            renderList();
            setTimeout(() => $scrollArea.scrollTop($scrollArea[0].scrollHeight), 100);
        });

        $headerWrapper.find('.directory').on('click', () => {
            if (typeof Swal !== 'undefined') Swal.close();
            setTimeout(() => openDirectoryTool(charId, () => {
                setTimeout(showGreetingManager, 300);
            }), 200);
        });

        $headerWrapper.find('.search').on('click', () => {
            if (typeof Swal !== 'undefined') Swal.close();
            setTimeout(() => openSearchAndReplaceLogic(charId), 200);
        });

        renderList();

        if (window.SillyTavern && SillyTavern.Popup) {
            mainPopupInstance = new SillyTavern.Popup($wrapper, SillyTavern.POPUP_TYPE.TEXT, "", { large: true, okButton: "关闭" });
            mainPopupInstance.show();
        } else {
            (SillyTavern.callGenericPopup || window.callGenericPopup)($wrapper, 1, "", { large: true, okButton: "关闭" });
        }
    }

    if (window.SillyTavern && SillyTavern.SlashCommandParser) {
        SillyTavern.SlashCommandParser.addCommandObject(SillyTavern.SlashCommand.fromProps({ name: 'greetings', callback: showGreetingManager, helpString: '开场白管理器' }));
        SillyTavern.SlashCommandParser.addCommandObject(SillyTavern.SlashCommand.fromProps({ name: 'go-start', callback: backToStart, helpString: '回到首页' }));
    }

    if (typeof replaceScriptButtons === 'function' && typeof getButtonEvent === 'function' && typeof eventOn === 'function') {
        const BUTTON_GREETINGS = '开场白切换';
        const BUTTON_BACK_START = '回到首页';
        replaceScriptButtons([ { name: BUTTON_GREETINGS, visible: true }, { name: BUTTON_BACK_START, visible: true } ]);
        eventOn(getButtonEvent(BUTTON_GREETINGS), showGreetingManager);
        eventOn(getButtonEvent(BUTTON_BACK_START), backToStart);
    }
})();
