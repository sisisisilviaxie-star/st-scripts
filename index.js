
const logicUrl = 'https://cdn.jsdelivr.net/gh/sisisisilviaxie-star/st-scripts@main/greeting.js';

import(logicUrl + '?t=' + Date.now())
    .then(() => {
        console.log('[开场白管理器] 脚本加载成功 (最新版)');
    })
    .catch((err) => {
        console.error('[开场白管理器] 脚本加载失败:', err);
        // 如果 toastr 可用，弹窗提示
        if (typeof toastr !== 'undefined') {
            toastr.error('开场白管理器加载失败，请检查网络或控制台');
        }
    });
