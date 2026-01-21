
//name: 开场白管理器
//description: 移动端安全销毁 & 极速防崩 (V3.4 Fixes: Force Save & Stability)
//author: Yellows (Modified V3.4)

(function() {
    // === 0. 配置常量 ===
    const STORAGE_KEY_AUTO_CLOSE = 'gj_auto_close_setting_v1';
    let saveTimeout = null;

    // === 1. 样式 ===
    const STYLE_ID = 'greeting-jumper-css-v3-4'; 
    $('[id^=greeting-jumper-css]').remove();

    $('head').append(`
        <style id="${STYLE_ID}">
            /* 通用设置 */
            .swal2-popup { 
                width: 98% !important; 
                max-width: 1600px !important; 
                height: 95vh !important;
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
            
            /* 顶部控制区 */
            .gj-header-wrapper {
                flex-shrink: 0; background: var(--smart-theme-content-bg);
                border-bottom: 1px solid var(--smart-theme-border-color-1);
                display: flex; flex-direction: column;
            }
            .gj-header-row-1 {
                display: flex; justify-content: center; align-items: center;
                padding: 12px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); 
                position: relative;
                min-height: 24px;
            }
            .gj-app-title { font-weight: bold; font-size: 1.2em; color: var(--smart-theme-body-color); }
            .gj-auto-close-wrapper {
                position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
                display: flex; align-items: center; gap: 4px; font-size: 0.75em; opacity: 0.7; z-index: 10;
            }
            .gj-checkbox-label { cursor: pointer; user-select: none; color: var(--smart-theme-body-color); display: flex; align-items: center; gap: 4px; }
            .gj-header-row-2 { 
                display: flex; justify-content: space-between; align-items: center; padding: 8px 15px; gap: 10px; 
            }
            
            /* 按钮样式 */
            .gj-top-btn {
                background: transparent; border: 1px solid var(--smart-theme-border-color-2);
                color: var(--smart-theme-body-color); border-radius: 4px; padding: 6px 12px;
                cursor: pointer; font-size: 0.9em; display: flex; align-items: center; gap: 6px;
                transition: all 0.2s; opacity: 0.85; font-weight: bold;
            }
            .gj-top-btn:hover { opacity: 1; background: var(--smart-theme-border-color-1); transform: translateY(-1px); }
            .gj-top-btn i { color: #7a9a83; }

            .gj-icon-group { display: flex; gap: 5px; }
            .gj-icon-btn {
                background: transparent; border: none; color: var(--smart-theme-body-color);
                width: 34px; height: 34px; border-radius: 4px; display: flex; align-items: center; justify-content: center;
                cursor: pointer; opacity: 0.6; font-size: 1.1em; transition: all 0.2s;
            }
            .gj-icon-btn:hover { background: rgba(0,0,0,0.05); opacity: 1; transform: scale(1.1); color: #7a9a83; }

            /* 列表区域 */
            .gj-scroll-area { flex-grow: 1; overflow-y: auto; padding: 10px 8px 10px 8px; scroll-behavior: smooth; }
            
            /* 主界面底部关闭栏 */
            .gj-main-footer {
                flex-shrink: 0;
                padding: 10px;
                background: var(--smart-theme-content-bg);
                border-top: 1px solid var(--smart-theme-border-color-1);
                display: flex;
                justify-content: center;
            }
            .gj-main-close-btn {
                width: 100%;
                max-width: 400px;
                padding: 10px;
                border: 1px solid var(--smart-theme-border-color-2);
                background: transparent;
                color: var(--smart-theme-body-color);
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            }
            .gj-main-close-btn:hover {
                background: rgba(0,0,0,0.05);
                border-color: var(--smart-theme-border-color-1);
            }

            .gj-card {
                background: var(--smart-theme-content-bg);
                border: 1px solid var(--smart-theme-border-color-1);
                border-radius: 6px; margin-bottom: 12px; 
                display: flex; flex-direction: column; flex-shrink: 0;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s;
            }
            .gj-card.active { background: rgba(122, 154, 131, 0.05) !important; border-left: 4px solid #7a9a83; }
            .gj-card-header-main { display: flex; align-items: flex-start; padding: 10px; gap: 10px; min-height: 30px; }
            .gj-card.editing .gj-card-header-main { border-bottom: 1px solid var(--smart-theme-border-color-1); background: rgba(0,0,0,0.02); }
            .gj-btn-max { color: var(--smart-theme-body-color); opacity: 0.4; cursor: pointer; background: transparent; border: none; padding: 2px; font-size: 0.9em; flex-shrink: 0; margin-top: 3px; }
            .gj-btn-max:hover { opacity: 1; color: #7a9a83; transform: scale(1.1); }
            .gj-title-area { flex-grow: 1; display: block; word-break: break-all; white-space: normal; line-height: 1.4; }
            .gj-title-main { font-weight: bold; font-size: 1.05em; color: var(--smart-theme-body-color); margin-right: 6px; }
            .gj-title-sub { font-size: 0.9em; color: var(--smart-theme-body-color); opacity: 0.7; }
            .gj-header-right { margin-left: auto; flex-shrink: 0; }
            .gj-btn-edit-toggle { border: 1px solid transparent; background: transparent; color: var(--smart-theme-body-color); border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 0.9em; opacity: 0.6; display: flex; align-items: center; gap: 5px; }
            .gj-btn-edit-toggle:hover { opacity: 1; background: rgba(0,0,0,0.05); }
            .gj-card.editing .gj-btn-edit-toggle { background: #7a9a83; color: white; opacity: 1; border-color: #7a9a83; font-weight: bold; }
            .gj-card-header-tools { display: none; flex-direction: column; padding: 8px 10px; gap: 8px; background: rgba(0,0,0,0.02); border-bottom: 1px solid var(--smart-theme-border-color-1); }
            .gj-card.editing .gj-card-header-tools { display: flex; }
            .gj-subtitle-input { width: 100%; height: 32px; box-sizing: border-box; background: var(--smart-theme-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); padding: 0 8px; border-radius: 4px; font-size: 0.9em; }
            .gj-tools-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
            .gj-btn-new-item { background: transparent; border: 1px dashed var(--smart-theme-border-color-2); color: #7a9a83; border-radius: 4px; padding: 4px 10px; font-size: 0.85em; cursor: pointer; display: flex; align-items: center; gap: 6px; opacity: 0.9; }
            .gj-btn-new-item:hover { background: rgba(122, 154, 131, 0.1); opacity: 1; border-color: #7a9a83; }
            .gj-tools-right { display: flex; gap: 5px; }
            .gj-action-btn { width: 28px; height: 28px; border: 1px solid var(--smart-theme-border-color-1); background: var(--smart-theme-bg); color: var(--smart-theme-body-color); border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.7; font-size: 0.85em; }
            .gj-action-btn:hover { opacity: 1; transform: translateY(-1px); }
            .gj-action-btn.del:hover { color: #ff6b6b; border-color: #ff6b6b; }
            .gj-card-body { padding: 0; display: flex; flex-direction: column; }
            .gj-textarea { width: 100%; min-height: 80px; height: 100px; resize: vertical; border: none; background: transparent; padding: 10px; color: var(--smart-theme-body-color); font-family: inherit; font-size: 0.95em; line-height: 1.5; box-sizing: border-box; outline: none; transition: height 0.2s; }
            .gj-textarea.expanded { height: 400px !important; }
            .gj-textarea[readonly] { opacity: 0.8; cursor: default; }
            .gj-textarea:not([readonly]) { background: var(--smart-theme-input-bg); }
            .gj-expand-bar { width: 100%; text-align: center; background: rgba(0,0,0,0.03); border-top: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); font-size: 0.8em; padding: 2px 0; cursor: pointer; opacity: 0.6; transition: all 0.2s; }
            .gj-expand-bar:hover { opacity: 1; background: rgba(0,0,0,0.08); }
            .gj-footer { display: flex; gap: 10px; padding: 10px; border-top: 1px solid var(--smart-theme-border-color-1); }
            .gj-footer-btn { border-radius: 4px; font-weight: bold; font-size: 0.9em; padding: 8px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; height: 36px; }
            .gj-footer-btn.insert { flex: 4; background: transparent; border: 1px solid var(--smart-theme-border-color-2); color: var(--smart-theme-body-color); opacity: 0.8; }
            .gj-footer-btn.insert:hover { background: rgba(0,0,0,0.03); opacity: 1; border-color: var(--smart-theme-body-color); }
            .gj-footer-btn.switch { flex: 6; background: transparent; border: 1px solid var(--smart-theme-border-color-2); color: var(--smart-theme-body-color); opacity: 0.9; }
            .gj-footer-btn.switch:hover { border-color: #7a9a83; color: #7a9a83; background: rgba(122, 154, 131, 0.05); }
            .gj-footer-btn.active { background: #7a9a83; color: white; border: none; cursor: default; opacity: 1; pointer-events: none; }

            /* 全屏编辑器 & 搜索高亮 */
            .gj-fullscreen-editor { display: flex; flex-direction: column; height: 100%; width: 100%; background: var(--smart-theme-bg); position: relative; }
            .gj-fs-header { padding: 8px 12px; background: var(--smart-theme-content-bg); border-bottom: 1px solid var(--smart-theme-border-color-1); display: flex; flex-direction: column; gap: 6px; transition: all 0.2s; flex-shrink: 0; }
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
            .gj-fs-textarea-wrapper { flex-grow: 1; position: relative; overflow: hidden; display: flex; }
            .gj-fullscreen-textarea { flex-grow: 1; padding: 15px; padding-bottom: 35vh; font-size: 1.1em; line-height: 1.6; background: var(--smart-theme-bg); color: var(--smart-theme-body-color); border: none; outline: none; resize: none; width: 100%; height: 100%; box-sizing: border-box; }

            /* 目录导入/导出 */
            .gj-parse-container { display: flex; flex-direction: column; height: 100%; min-height: 400px; text-align: left; padding-bottom: 10px; box-sizing: border-box; }
            .gj-tabs-header { display: flex; border-bottom: 1px solid var(--smart-theme-border-color-1); margin-bottom: 10px; flex-shrink: 0; }
            .gj-tab { flex: 1; text-align: center; padding: 10px; cursor: pointer; font-weight: bold; opacity: 0.7; border-bottom: 3px solid transparent; transition: all 0.2s; }
            .gj-tab:hover { opacity: 1; background: rgba(0,0,0,0.02); }
            .gj-tab.active { opacity: 1; color: #7a9a83; border-bottom-color: #7a9a83; }
            .gj-tab-content { display: none; flex-direction: column; flex-grow: 1; overflow: hidden; }
            .gj-tab-content.active { display: flex; }
            .gj-parse-textarea-wrapper { flex-grow: 1; display: flex; flex-direction: column; margin-top: 5px; height: 100%; overflow: hidden; }
            .gj-parse-textarea { flex-grow: 1; width: 100%; resize: none; padding: 10px; background: var(--smart-theme-input-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); border-radius: 4px; font-size: 0.95em; outline: none; }
            .gj-parse-textarea:focus { border-color: #7a9a83; }
            .gj-parse-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; flex-shrink: 0; }
            .gj-parse-hint { font-size: 0.95em; opacity: 0.9; font-weight: bold; }
            .gj-parse-preview-header { display: flex; justify-content: space-between; align-items: center; padding: 5px 0 10px 0; border-bottom: 1px solid var(--smart-theme-border-color-1); margin-bottom: 5px; flex-shrink: 0; }
            .gj-parse-info { font-size: 0.95em; }
            .gj-parse-start-select-group { display: flex; align-items: center; gap: 5px; font-size: 0.85em; }
            .gj-parse-select { background: var(--smart-theme-input-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); padding: 3px 6px; border-radius: 3px; font-size: 1em; }
            .gj-parse-preview-list { flex-grow: 1; border: 1px solid var(--smart-theme-border-color-1); border-radius: 4px; overflow-y: auto; background: rgba(0,0,0,0.02); padding: 5px; margin-bottom: 10px; }
            .gj-parse-item { display: flex; gap: 8px; padding: 8px; border-bottom: 1px solid var(--smart-theme-border-color-1); align-items: flex-start; background: var(--smart-theme-content-bg); margin-bottom: 4px; border-radius: 4px; }
            .gj-parse-row-select { background: #7a9a83; color: white; padding: 4px 2px; border-radius: 3px; border: 1px solid transparent; font-size: 0.8em; white-space: nowrap; font-weight: bold; margin-top: 2px; cursor: pointer; outline: none; max-width: 90px; }
            .gj-parse-row-select.error { background: #d32f2f; border-color: #ff6b6b; animation: shake 0.3s; }
            .gj-parse-row-textarea { flex: 1; background: var(--smart-theme-input-bg); border: 1px solid var(--smart-theme-border-color-1); color: var(--smart-theme-body-color); padding: 6px; font-size: 0.95em; border-radius: 4px; resize: vertical; min-height: 42px; line-height: 1.4; }
            .gj-parse-row-textarea:focus { border-color: #7a9a83; outline: none; }
            .gj-parse-custom-footer { display: flex; gap: 10px; justify-content: flex-end; align-items: center; margin-top: auto; flex-shrink: 0; }
            
            .gj-custom-btn { padding: 8px 16px; border-radius: 4px; border: 1px solid var(--smart-theme-border-color-2); background: transparent; color: var(--smart-theme-body-color); cursor: pointer; font-size: 0.95em; display: flex; align-items: center; justify-content: center; gap: 6px; }
            .gj-custom-btn:hover { background: rgba(0,0,0,0.05); }
            .gj-custom-btn.primary { background: #7a9a83; color: white; border: none; }
            .gj-custom-btn.primary:hover { filter: brightness(1.1); }
            .gj-custom-btn.danger { background: #d32f2f; color: white; border: none; }
            .gj-custom-btn.danger:hover { filter: brightness(1.1); }
            .gj-custom-btn.success { background: #4caf50; color: white; border: none; }
            .gj-custom-btn.success:hover { filter: brightness(1.1); }
            
            .gj-dl-btn { font-size: 0.85em !important; padding: 6px 12px !important; border: 1px solid var(--smart-theme-border-color-2); border-radius: 4px; cursor: pointer; background: rgba(0,0,0,0.05); color: var(--smart-theme-body-color); display: flex; align-items: center; gap: 6px; font-weight: bold; }
            .gj-dl-btn:hover { background: rgba(0,0,0,0.1); color: #7a9a83; border-color: #7a9a83; }

            /* 进度条弹窗样式 */
            .gj-progress-popup { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px; }
            .gj-spinner { width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-top-color: #7a9a83; border-radius: 50%; animation: gj-spin 1s linear infinite; }
            @keyframes gj-spin { to { transform: rotate(360deg); } }
            .gj-progress-text { font-size: 1.2em; font-weight: bold; color: var(--smart-theme-body-color); }
            .gj-progress-sub { font-size: 0.9em; opacity: 0.7; color: var(--smart-theme-body-color); }
            
            /* 搜索结果增加底部padding */
            .gj-search-results-container { padding-bottom: 120px; max-height: 80vh !important; overflow-y: auto; }
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
        </style>
    `);

    // Fix 1: 真正有效的强制保存逻辑
    async function forceSave(charId) {
        if (saveTimeout) clearTimeout(saveTimeout);
        try {
            // 优先使用 SillyTavern.saveCharacter，因为它是直接的异步保存，不是防抖的
            if (typeof SillyTavern.saveCharacter === 'function') {
                await SillyTavern.saveCharacter(Number(charId));
                // 给磁盘一点时间去写
                await new Promise(r => setTimeout(r, 200)); 
            } else if (typeof window.saveCharacterDebounced === 'function') {
                // 如果只有防抖函数，没办法，只能调用它然后死等
                await window.saveCharacterDebounced();
                await new Promise(r => setTimeout(r, 2000)); // 等待防抖触发
            }
        } catch (e) {
            console.error("Save failed:", e);
            toastr.error("保存失败，请检查控制台");
        }
    }

    // --- 核心工具函数 ---
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

    // --- V3.0 优化：生成带交互面板的正则 (White Style & Fixes) ---
    const generateRegexJson = (format) => {
        const scriptOpen = "<" + "script>";
        const scriptClose = "<" + "/script>";
        
        const replaceStr = `\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
    /* 简约白色风格 */
    .prologue-container {
        font-family: sans-serif;
        padding: 15px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e0e0e0;
        color: #333333;
    }
    .prologue-title {
        font-weight: bold;
        margin-bottom: 12px;
        font-size: 1.1em;
        color: #333333;
        border-bottom: 2px solid #f0f0f0;
        padding-bottom: 8px;
    }
    .prologue-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .prologue-btn {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
        color: #495057;
        display: flex;
        align-items: center;
    }
    .prologue-btn:hover {
        background: #e2e6ea;
        border-color: #ced4da;
        color: #212529;
        transform: translateX(2px);
    }
    .btn-index {
        font-weight: bold;
        margin-right: 8px;
        color: #7a9a83;
    }
</style>
</head>
<body>

<template id="prologue-data">
$1
</template>

<div class="prologue-container">
    <div class="prologue-title">开场白目录</div>
    <div id="button-list" class="prologue-grid">
    </div>
</div>

${scriptOpen}
(async function() {
    const waitForHelper = () => new Promise(resolve => {
        if (window.TavernHelper) return resolve(window.TavernHelper);
        const timer = setInterval(() => {
            if (window.TavernHelper) {
                clearInterval(timer);
                resolve(window.TavernHelper);
            }
        }, 100);
    });

    try {
        const helper = await waitForHelper();
        const template = document.getElementById('prologue-data');
        if (!template) return;
        const rawText = template.innerHTML.trim();
        const regex = /^(\\d+)[.、]\\s*([\\s\\S]+?)(?=\\n|$)/gm;
        
        const listContainer = document.getElementById('button-list');
        let match;
        
        while ((match = regex.exec(rawText)) !== null) {
            const index = match[1]; 
            const title = match[2].trim(); 
            const btn = document.createElement('div');
            btn.className = 'prologue-btn';
            btn.innerHTML = \`<span class="btn-index">#\${index}</span> \${title}\`;
            
            btn.onclick = async () => {
                const targetSwipeId = parseInt(index);
                try {
                    await helper.setChatMessages([{
                        message_id: 0, 
                        swipe_id: targetSwipeId 
                    }], { refresh: 'affected' });
                    
                    const originalBg = btn.style.background;
                    btn.style.background = "rgba(122, 154, 131, 0.2)";
                    setTimeout(() => { btn.style.background = ""; }, 200);
                } catch (e) {
                    console.error("切换失败:", e);
                    alert("切换失败，请检查页数。");
                }
            };
            listContainer.appendChild(btn);
        }
    } catch (err) {
        console.error("Script Error:", err);
    }
})();
${scriptClose}

</body>
</html>
\`\`\``; 

        return {
            "id": "feca6226-9be4-474d-acb0-b5a622993a2e",
            "scriptName": `开场白跳转`,
            "findRegex": "<greetings>([\\s\\S]*)</greetings>",
            "replaceString": replaceStr,
            "trimStrings": [],
            "placement": [2],
            "disabled": false,
            "markdownOnly": true,
            "promptOnly": false,
            "runOnEdit": true,
            "substituteRegex": 0,
            "minDepth": 0,
            "maxDepth": 0
        };
    };

    const downloadRegex = (format) => {
        const json = generateRegexJson(format);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
        const anchor = document.createElement('a');
        anchor.href = dataStr;
        anchor.download = `Regex_Greeting_Jumper_White.json`;
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        toastr.success("正则脚本已下载，请在扩展中导入");
    };

    // --- V2.8 核心：移动端安全写入逻辑 ---
    // Fix 2: 对于单次操作，不使用循环分批，而是原子化处理，减少中间态崩溃
    async function processBatchAndSave(charId, totalItems, processFunction, refreshCallback, myPopup) {
        if (myPopup) myPopup.complete(SillyTavern.POPUP_RESULT.AFFIRMATIVE);

        const $progressContent = $(`
            <div class="gj-progress-popup">
                <div class="gj-spinner"></div>
                <div class="gj-progress-text">正在处理...</div>
                <div class="gj-progress-sub">请勿关闭</div>
            </div>
        `);
        
        let progressPopup = null;
        if (window.SillyTavern && SillyTavern.Popup) {
            progressPopup = new SillyTavern.Popup($progressContent, SillyTavern.POPUP_TYPE.TEXT, "", { transparent: true, okButton: false, cancelButton: false });
            progressPopup.show();
        }

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        try {
            // 步骤 1: 应用修改
            await sleep(100); 
            // 针对插入/覆盖单次操作，不需要分批，直接执行
            // totalItems 在这种情况下通常是 1 或 matched.length
            // 我们直接让 processFunction 把活干完
            processFunction(0, totalItems);

            // 步骤 2: 强制保存
            $progressContent.find('.gj-progress-text').text("正在写入磁盘...");
            await sleep(50); 
            
            await forceSave(charId);
            
            // 步骤 3: 完成
            $progressContent.find('.gj-progress-text').text("刷新界面...");
            await sleep(200); 

            toastr.success(`操作完成`);
            if (progressPopup) progressPopup.complete(SillyTavern.POPUP_RESULT.AFFIRMATIVE);
            
            if (refreshCallback) setTimeout(refreshCallback, 100);

        } catch (err) {
            console.error(err);
            toastr.error("写入过程出错，请检查控制台");
            if (progressPopup) progressPopup.complete(SillyTavern.POPUP_RESULT.CANCELLED);
        }
    }

    // --- V2.8 核心：搜索精准定位 (镜像模拟法) ---
    function scrollToCursorPosition($textarea, position) {
        if (!$textarea || $textarea.length === 0) return;
        const textarea = $textarea[0];
        const div = document.createElement('div');
        const computed = window.getComputedStyle(textarea);
        const stylesToCopy = [
            'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'line-height',
            'text-transform', 'word-spacing', 'text-indent', 'white-space', 'word-wrap', 'word-break',
            'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
            'border-width', 'box-sizing', 'width'
        ];
        stylesToCopy.forEach(prop => div.style[prop] = computed[prop]);
        div.style.position = 'absolute'; div.style.visibility = 'hidden';
        div.style.top = '0'; div.style.left = '-9999px'; div.style.overflow = 'hidden'; div.style.height = 'auto';
        div.textContent = textarea.value.substring(0, position);
        const span = document.createElement('span'); span.textContent = '|'; div.appendChild(span);
        document.body.appendChild(div);
        const cursorTop = span.offsetTop + parseInt(computed['paddingTop']);
        const viewportHeight = textarea.clientHeight;
        const targetScroll = Math.max(0, cursorTop - (viewportHeight * 0.33));
        textarea.scrollTop = targetScroll;
        document.body.removeChild(div);
    }

    // --- 界面逻辑 ---

    async function openDirectoryTool(charId, refreshCallback) {
        const charObj = SillyTavern.characters[charId];
        let importText = charObj.first_mes || ""; 
        let parsedMatches = [];
        let startIndex = 0; 
        let exportText = "";
        const currentFormat = "{{i}}. {{text}}"; 
        let currentStep = 'tabs';
        let isSwitchingView = false; // Flag to control closing logic

        const updateExportPreview = () => {
            const subs = getSubtitles(charObj);
            let lines = [];
            (charObj.data.alternate_greetings || []).forEach((g, i) => {
                const sub = subs.alts[i];
                if (sub && sub.trim()) {
                    let line = currentFormat.replace('{{i}}', i + 1).replace('{{text}}', sub.trim());
                    lines.push(line);
                }
            });
            exportText = `<greetings>\n${lines.join('\n')}\n</greetings>`;
            $('.export-area').val(exportText);
        };

        const generateOptionsHtml = (selectedVal) => {
            let html = `<option value="-1" ${selectedVal === -1 ? 'selected' : ''}>开场白 #0</option>`;
            const len = (charObj.data.alternate_greetings || []).length;
            for (let i = 0; i < len; i++) html += `<option value="${i}" ${selectedVal === i ? 'selected' : ''}>开场白 #${i + 1}</option>`;
            return html;
        };

        let myPopup = null;

        const renderTabUI = () => {
            const $container = $(`
                <div class="gj-parse-container">
                    <div class="gj-tabs-header">
                        <div class="gj-tab ${currentStep === 'tabs' ? 'active' : ''}" data-tab="import">导入/解析</div>
                        <div class="gj-tab" data-tab="export">导出/生成</div>
                    </div>
                    <div class="gj-tab-content active" id="tab-import">
                        <div class="gj-parse-header-row"><span class="gj-parse-hint">修改首页或粘贴开场白列表:</span></div>
                        <div class="gj-parse-textarea-wrapper"><textarea class="gj-parse-textarea import-area" placeholder="粘贴内容...">${_.escape(importText)}</textarea></div>
                        <div class="gj-parse-custom-footer" style="margin-top:10px;">
                            <button type="button" class="gj-custom-btn clear-btn"><i class="fa-solid fa-trash"></i> 清空</button>
                            <button type="button" class="gj-custom-btn primary parse-btn"><i class="fa-solid fa-wand-magic-sparkles"></i> 解析目录</button>
                        </div>
                    </div>
                    <div class="gj-tab-content" id="tab-export">
                        <div class="gj-parse-header-row">
                            <span class="gj-parse-hint">开场白目录预览（据标题生成）:</span>
                            <div style="display:flex; align-items:center; gap:5px;">
                                <button type="button" class="gj-dl-btn" title="下载正则"><i class="fa-solid fa-download"></i> 下载正则</button>
                            </div>
                        </div>
                        <div class="gj-parse-textarea-wrapper"><textarea class="gj-parse-textarea export-area"></textarea></div>
                        <div class="gj-parse-custom-footer" style="margin-top:10px;">
                            <button type="button" class="gj-custom-btn copy-btn" title="复制内容"><i class="fa-solid fa-copy"></i></button>
                            <button type="button" class="gj-custom-btn success insert-as-new-btn" style="font-weight:bold;">插入为新首页</button>
                            <button type="button" class="gj-custom-btn danger overwrite-btn" style="font-weight:bold;">覆盖原首页</button>
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
                if(tabId === 'export') updateExportPreview();
            });

            $container.find('.clear-btn').on('click', (e) => { e.preventDefault(); $container.find('.import-area').val('').focus(); });
            $container.find('.copy-btn').on('click', (e) => { e.preventDefault(); navigator.clipboard.writeText($container.find('.export-area').val()).then(() => toastr.success("已复制")); });
            $container.find('.import-area').on('input', function() { importText = $(this).val(); });
            $container.find('.gj-dl-btn').on('click', (e) => { e.preventDefault(); downloadRegex(currentFormat); });

            $container.find('.parse-btn').on('click', (e) => {
                e.preventDefault();
                importText = $container.find('.import-area').val();
                if (!importText.trim()) { toastr.warning("内容为空"); return; }
                const regex = /(?:^|\n)\s*(?:[#＃] |[\[【(（]?(?:开场白|场景|Part|No\.?|Scene|Scenario)\s*)?([0-9]+|[一二三四五六七八九十]+)[\]】)）]?\s*[:：.、\-\—\s]+\s*(.*?)(?=\n|$)/igm;
                parsedMatches = [];
                let match;
                while ((match = regex.exec(importText)) !== null) parsedMatches.push({ title: match[2].trim(), selectedIndex: null });
                if (parsedMatches.length === 0) { toastr.warning("未识别到目录格式"); return; }
                
                isSwitchingView = true; 
                myPopup.complete(SillyTavern.POPUP_RESULT.CANCELLED);
                setTimeout(() => openPreviewUI(), 50);
            });

            // V3.3 Fix: Overwrite Homepage Sync Logic
            $container.find('.overwrite-btn').on('click', async (e) => {
                e.preventDefault();
                if(!confirm("确定覆盖【开场白 #0】？")) return;
                const newText = $container.find('.export-area').val();
                
                isSwitchingView = true; // Fix 1: 立即标记，防止双窗口

                await processBatchAndSave(charId, 1, (start, end) => {
                    // 1. 更新角色卡数据
                    charObj.first_mes = newText;
                    if (charObj.data) charObj.data.first_mes = newText;

                    // 2. 同步更新聊天记录 (Message #0)
                    if (window.SillyTavern.chat && window.SillyTavern.chat.length > 0) {
                        const msg0 = window.SillyTavern.chat[0];
                        let currentSwipes = msg0.swipes ? [...msg0.swipes] : [msg0.mes];
                        
                        // 确保数组存在
                        if(currentSwipes.length === 0) currentSwipes = [newText];
                        else currentSwipes[0] = newText;
                        
                        const updatePayload = { message_id: 0, swipes: currentSwipes };
                        
                        // 如果当前用户正看着首页 (Swipe 0)，则强制更新显示的 message 内容
                        if (msg0.swipe_id === 0 || msg0.swipe_id === undefined) {
                            updatePayload.message = newText;
                        }
                        
                        // 调用 Helper 刷新 UI
                        window.TavernHelper.setChatMessages([updatePayload], { refresh: 'affected' });
                    }
                }, () => {
                    if(refreshCallback) refreshCallback();
                }, myPopup);
            });

            // Fix 3: 严格同步标题 (Subtitle Sync)
            $container.find('.insert-as-new-btn').on('click', async (e) => {
                e.preventDefault();
                if(!confirm("确定插入新页面？原内容将顺移。")) return;

                isSwitchingView = true; 

                await processBatchAndSave(charId, 1, (start, end) => {
                    const oldFirstMes = charObj.first_mes || "";
                    
                    // 1. 移动内容
                    if (!charObj.data.alternate_greetings) charObj.data.alternate_greetings = [];
                    charObj.data.alternate_greetings.unshift(oldFirstMes);
                    
                    // 2. 严格同步标题 (关键步骤)
                    const subs = getSubtitles(charObj);
                    const oldFirstSubtitle = subs.first_mes || "";
                    
                    if (!subs.alts) subs.alts = [];
                    subs.alts.unshift(oldFirstSubtitle); // 把旧首页标题移到 alts[0]
                    
                    // 3. 写入新数据
                    charObj.first_mes = $container.find('.export-area').val();
                    if (charObj.data) charObj.data.first_mes = charObj.first_mes;
                    subs.first_mes = "目录页"; 

                    // Fix 2: 修正 Active Box
                    const msgZero = SillyTavern.chat[0];
                    if (msgZero && (msgZero.swipe_id === 0 || msgZero.swipe_id === undefined)) {
                        msgZero.swipe_id = 1;
                        if (window.TavernHelper) {
                            window.TavernHelper.setChatMessages([{
                                message_id: 0,
                                swipe_id: 1
                            }], { refresh: 'none' });
                        }
                    } else if (msgZero && msgZero.swipe_id > 0) {
                        msgZero.swipe_id += 1;
                        if (window.TavernHelper) {
                            window.TavernHelper.setChatMessages([{
                                message_id: 0,
                                swipe_id: msgZero.swipe_id
                            }], { refresh: 'none' });
                        }
                    }
                }, () => {
                    if(refreshCallback) refreshCallback();
                }, myPopup);
            });

            updateExportPreview();
            return $container;
        };

        const openTabsUI = async () => {
            const $content = renderTabUI();
            myPopup = new SillyTavern.Popup($content, SillyTavern.POPUP_TYPE.TEXT, "", { large: true, okButton: "关闭" });
            
            const result = await myPopup.show();
            if (!isSwitchingView) {
                setTimeout(showGreetingManager, 50);
            }
        };

        const openPreviewUI = async () => {
            const $previewContainer = $(`
                <div class="gj-parse-container">
                    <div class="gj-parse-preview-header">
                        <div class="gj-parse-info">识别到 <b>${parsedMatches.length}</b> 个标题</div>
                        <div class="gj-parse-start-select-group">
                            <label>起点:</label>
                            <select class="gj-parse-select main-starter">${generateOptionsHtml(startIndex)}</select>
                        </div>
                    </div>
                    <div class="gj-parse-preview-list"></div>
                    <div class="gj-parse-custom-footer" style="margin-top:auto;">
                        <button type="button" class="gj-custom-btn back-btn"><i class="fa-solid fa-arrow-left"></i> 返回</button>
                        <button type="button" class="gj-custom-btn primary confirm-btn"><i class="fa-solid fa-check"></i> 确认写入</button>
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
                    if (valueCounts[val] > 1) $(this).addClass('error'); else $(this).removeClass('error');
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

            $globalSelect.on('change', () => { startIndex = parseInt($globalSelect.val()); renderRows(); });
            renderRows();

            $previewContainer.find('.back-btn').on('click', (e) => {
                e.preventDefault();
                isSwitchingView = true;
                myPopup.complete(SillyTavern.POPUP_RESULT.CANCELLED);
                setTimeout(openTabsUI, 50);
            });

            $previewContainer.find('.confirm-btn').on('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                isSwitchingView = true; // Fix 1: 标记

                const processBatchLogic = (startIdx, endIdx) => {
                    for (let i = startIdx; i < endIdx; i++) {
                        const m = parsedMatches[i];
                        if (!m || m.title.trim() === "" || isNaN(m.selectedIndex)) continue;
                        if (m.selectedIndex === -1) {
                            setSubtitle(charId, -1, m.title);
                        } else if (m.selectedIndex < (charObj.data.alternate_greetings || []).length) {
                            setSubtitle(charId, m.selectedIndex, m.title);
                        }
                    }
                };

                await processBatchAndSave(charId, parsedMatches.length, processBatchLogic, () => {
                    if(refreshCallback) refreshCallback();
                }, myPopup);
            });

            myPopup = new SillyTavern.Popup($previewContainer, SillyTavern.POPUP_TYPE.TEXT, "", { large: true, okButton: "关闭" });
            myPopup.show();
        };

        openTabsUI();
    }

    // --- 全屏编辑器 (V2.8) ---
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
                        <button class="gj-fs-toggle-btn">${isCollapsed ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-up"></i>'}</button>
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
                <div class="gj-fs-textarea-wrapper">
                    <textarea class="gj-fullscreen-textarea">${_.escape(originalContent)}</textarea>
                </div>
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
                scrollToCursorPosition($textarea, nextPos);
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
            if (index === -1) {
                charObj.first_mes = finalContent;
                if (charObj.data) charObj.data.first_mes = finalContent;
            } else {
                charObj.data.alternate_greetings[index] = finalContent;
            }

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
            while (pos !== -1) { indices.push(pos); pos = content.indexOf(findStr, pos + 1); }
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
                if (typeof Swal !== 'undefined') Swal.close();
                
                await processBatchAndSave(charId, 1, (start, end) => {
                    if (charObj.first_mes) {
                        charObj.first_mes = charObj.first_mes.split(findStr).join(replaceStr);
                        if (charObj.data) charObj.data.first_mes = charObj.first_mes;
                    }
                    if (charObj.data.alternate_greetings) {
                        charObj.data.alternate_greetings = charObj.data.alternate_greetings.map(g => g ? g.split(findStr).join(replaceStr) : g);
                    }
                }, showGreetingManager, null);
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
                    if (res.index === -1) {
                        charObj.first_mes = newContent;
                        if (charObj.data) charObj.data.first_mes = newContent;
                    } else {
                        charObj.data.alternate_greetings[res.index] = newContent;
                    }
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
                        if (res.index === -1) {
                            charObj.first_mes = newContent;
                            if (charObj.data) charObj.data.first_mes = newContent;
                        } else {
                            charObj.data.alternate_greetings[res.index] = newContent;
                        }
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
            const confirmSwitch = await popupFunc("确认切换开场白？当前已有聊天记录。", SillyTavern.POPUP_TYPE.CONFIRM, "", { okButton: "确定", cancelButton: "取消" });
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

    // --- V2.8 核心：主界面列表分批渲染 ---
    // --- V2.9 核心：主界面底部自定义关闭按钮 ---
    async function showGreetingManager() {
        const charId = SillyTavern.characterId;
        const charData = window.TavernHelper.getCharData('current');
        if (!charData) { toastr.warning("请先打开一个角色聊天"); return ""; }

        let mainPopupInstance = null;
        const savedSetting = localStorage.getItem(STORAGE_KEY_AUTO_CLOSE);
        let isAutoClose = savedSetting === 'true';

        // 尝试自动关闭（安全模式）
        const tryAutoClose = async () => {
            if ($('#gj-auto-close-checkbox').is(':checked')) {
                // 清空重内容，防止卡顿
                $scrollArea.empty();
                await new Promise(r => setTimeout(r, 100)); // 让浏览器喘口气
                if (mainPopupInstance) mainPopupInstance.complete(SillyTavern.POPUP_RESULT.AFFIRMATIVE);
                else if (typeof Swal !== 'undefined') Swal.close();
            }
        };

        const $wrapper = $('<div class="gj-wrapper"></div>');
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
                    <button type="button" class="gj-top-btn directory"><i class="fa-solid fa-list-ol"></i> 目录工具</button>
                    <div class="gj-icon-group">
                        <button type="button" class="gj-icon-btn add" title="新建"><i class="fa-solid fa-plus"></i></button>
                        <button type="button" class="gj-icon-btn search" title="搜索"><i class="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                </div>
            </div>
        `);
        const $scrollArea = $('<div class="gj-scroll-area"></div>');
        
        // V2.9 增加底部自定义关闭栏
        const $mainFooter = $(`
            <div class="gj-main-footer">
                <button type="button" class="gj-main-close-btn"><i class="fa-solid fa-xmark"></i> 关闭窗口</button>
            </div>
        `);

        $wrapper.append($headerWrapper).append($scrollArea).append($mainFooter);

        $headerWrapper.find('#gj-auto-close-checkbox').on('change', function() { localStorage.setItem(STORAGE_KEY_AUTO_CLOSE, $(this).is(':checked')); });

        // V2.9 安全关闭逻辑
        const safeClose = async () => {
            $scrollArea.empty(); // 关键：先清空重内容
            await new Promise(r => setTimeout(r, 50)); // 让浏览器执行 DOM 移除
            if (mainPopupInstance) mainPopupInstance.complete(SillyTavern.POPUP_RESULT.AFFIRMATIVE);
            else if (typeof Swal !== 'undefined') Swal.close();
        };

        $mainFooter.find('.gj-main-close-btn').on('click', safeClose);

        // Fix 3: 增加 maintainScroll 参数，删除时不重置滚动条
        const renderList = async (scrollToIndex = -1, maintainScroll = false) => {
            // Fix 3: 记录当前滚动位置
            const currentScrollPos = $scrollArea.scrollTop();
            
            $scrollArea.empty();
            const charObj = SillyTavern.characters[charId];
            if (!charObj.data) charObj.data = {};
            const alts = Array.isArray(charObj.data.alternate_greetings) ? charObj.data.alternate_greetings : [];
            const msgZero = SillyTavern.chat[0];
            let currentSwipeIndex = msgZero && msgZero.swipe_id !== undefined ? msgZero.swipe_id : 0;

            let allGreets = [
                { type: 'first', content: charObj.first_mes, label: "开场白 #0", protected: true, index: -1 },
                ...alts.map((g, i) => ({ type: 'alt', index: i, content: g, label: `开场白 #${i + 1}`, protected: false }))
            ];

            const total = allGreets.length;
            const RENDER_BATCH = 5;
            
            // --- V2.8 分批渲染列表逻辑 ---
            const renderBatch = async (start) => {
                for (let i = start; i < Math.min(start + RENDER_BATCH, total); i++) {
                    const item = allGreets[i];
                    const loopIndex = i;
                    const isCurrent = (loopIndex === currentSwipeIndex);
                    const subtitle = getSubtitle(charId, item.index);
                    
                    const $card = $(`
                        <div class="gj-card ${isCurrent ? 'active' : ''}" data-index="${loopIndex}">
                            <div class="gj-card-header-main">
                                <button type="button" class="gj-btn-max" title="全屏编辑"><i class="fa-solid fa-maximize"></i></button>
                                <div class="gj-title-area">
                                    <span class="gj-title-main">${item.label}</span>
                                    ${subtitle ? `<span class="gj-title-sub">(${_.escape(subtitle)})</span>` : ''}
                                </div>
                                <div class="gj-header-right">
                                    <button type="button" class="gj-btn-edit-toggle" title="编辑"><i class="fa-solid fa-pen"></i></button>
                                </div>
                            </div>
                            <div class="gj-card-header-tools">
                                <input type="text" class="gj-subtitle-input" placeholder="输入副标题..." value="${_.escape(subtitle)}">
                                <div class="gj-tools-row" style="margin-top:8px;">
                                    <button type="button" class="gj-btn-new-item add"><i class="fa-solid fa-plus"></i> 在下方插入新开场</button>
                                    <div class="gj-tools-right">
                                        ${!item.protected && item.index > 0 ? `<button type="button" class="gj-action-btn up"><i class="fa-solid fa-arrow-up"></i></button>` : ''}
                                        ${!item.protected && item.index < alts.length - 1 ? `<button type="button" class="gj-action-btn down"><i class="fa-solid fa-arrow-down"></i></button>` : ''}
                                        ${!item.protected ? `<button type="button" class="gj-action-btn del"><i class="fa-solid fa-trash"></i></button>` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="gj-card-body">
                                <textarea class="gj-textarea" readonly placeholder="内容预览...">${_.escape(item.content)}</textarea>
                                <div class="gj-expand-bar" title="展开/收起"><i class="fa-solid fa-chevron-down"></i></div>
                                <div class="gj-footer">
                                    <button type="button" class="gj-footer-btn insert"><i class="fa-solid fa-paper-plane"></i> 插入聊天</button>
                                    <button type="button" class="gj-footer-btn switch ${isCurrent ? 'active' : ''}">
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
                        if ($card.hasClass('editing')) {
                            $toggle.html('<i class="fa-solid fa-floppy-disk"></i> 保存');
                            $textarea.prop('readonly', false).focus();
                        } else {
                            $toggle.html('<i class="fa-solid fa-pen"></i>');
                            $textarea.prop('readonly', true);
                            if (item.protected) {
                                charObj.first_mes = $textarea.val();
                                if (charObj.data) charObj.data.first_mes = charObj.first_mes;
                            } else {
                                charObj.data.alternate_greetings[item.index] = $textarea.val();
                            }
                            setSubtitle(charId, item.index, $subInput.val());
                            await forceSave(charId);
                            toastr.success("已保存");
                            renderList(loopIndex); 
                        }
                    });

                    $expandBar.on('click', () => {
                        $textarea.toggleClass('expanded');
                        $expandBar.html($textarea.hasClass('expanded') ? '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-chevron-down"></i>');
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
                        renderList(loopIndex + 1); 
                        toastr.success("已插入");
                    });

                    if (!item.protected) {
                        $card.find('.up').on('click', async () => {
                            const arr = charObj.data.alternate_greetings;
                            [arr[item.index - 1], arr[item.index]] = [arr[item.index], arr[item.index - 1]];
                            syncSubtitles(charId, 'move-up', item.index);
                            await forceSave(charId); renderList(loopIndex - 1);
                        });
                        $card.find('.down').on('click', async () => {
                            const arr = charObj.data.alternate_greetings;
                            [arr[item.index], arr[item.index + 1]] = [arr[item.index + 1], arr[item.index]];
                            syncSubtitles(charId, 'move-down', item.index);
                            await forceSave(charId); renderList(loopIndex + 1);
                        });
                        $card.find('.del').on('click', async () => {
                            const popupFunc = SillyTavern.callGenericPopup || window.callGenericPopup;
                            if(await popupFunc(`删除 ${item.label}？`, SillyTavern.POPUP_TYPE.CONFIRM)) {
                                charObj.data.alternate_greetings.splice(item.index, 1);
                                syncSubtitles(charId, 'delete', item.index);
                                await forceSave(charId); 
                                toastr.success("已删除"); 
                                // Fix 3: 删除后保持原位置，不再乱滚
                                renderList(-1, true);
                            }
                        });
                    }
                    $card.find('.insert').on('click', async () => {
                        const txt = window.TavernHelper.substitudeMacros($textarea.val());
                        await window.TavernHelper.createChatMessages([{ role: 'assistant', message: txt }], { refresh: 'affected' });
                        toastr.success("已插入"); tryAutoClose();
                    });
                    $card.find('.switch').on('click', async () => {
                        if ($card.hasClass('active')) return;
                        if (await jumpToGreeting(loopIndex, $textarea.val())) {
                            toastr.success(`已切换`); renderList(loopIndex); tryAutoClose();
                        }
                    });
                    $scrollArea.append($card);

                    // 跳转逻辑
                    if (loopIndex === scrollToIndex && !maintainScroll) {
                        setTimeout(() => {
                            $card[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                            $card.css('border-color', '#7a9a83'); 
                            setTimeout(() => $card.css('border-color', ''), 500);
                        }, 100);
                    }
                }

                // Fix 3: 如果是维持滚动模式，在第一批渲染后立即恢复位置
                if (maintainScroll && start === 0) {
                     $scrollArea.scrollTop(currentScrollPos);
                }

                if (start + RENDER_BATCH < total) {
                    setTimeout(() => renderBatch(start + RENDER_BATCH), 50);
                }
            };

            renderBatch(0);
        };

        $headerWrapper.find('.add').on('click', async () => {
            const charObj = SillyTavern.characters[charId];
            if (!charObj.data.alternate_greetings) charObj.data.alternate_greetings = [];
            charObj.data.alternate_greetings.push("");
            const subs = getSubtitles(charObj); if (!subs.alts) subs.alts = []; subs.alts.push("");
            await forceSave(charId); 
            const newTotal = 1 + charObj.data.alternate_greetings.length;
            renderList(newTotal - 1);
        });

        $headerWrapper.find('.directory').on('click', () => {
            safeClose();
            setTimeout(() => openDirectoryTool(charId, () => setTimeout(showGreetingManager, 300)), 200);
        });

        $headerWrapper.find('.search').on('click', () => {
            safeClose();
            setTimeout(() => openSearchAndReplaceLogic(charId), 200);
        });

        renderList();

        if (window.SillyTavern && SillyTavern.Popup) {
            mainPopupInstance = new SillyTavern.Popup($wrapper, SillyTavern.POPUP_TYPE.TEXT, "", { large: true, okButton: false, cancelButton: false });
            mainPopupInstance.show();
        } else {
            (SillyTavern.callGenericPopup || window.callGenericPopup)($wrapper, 1, "", { large: true, okButton: false });
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
