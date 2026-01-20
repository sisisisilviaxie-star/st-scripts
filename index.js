// index.js - 这是一个加载器，它很少需要修改

// 1. 指向 main 分支 (确保这里是 @main，不要写死版本号)
const logicUrl = 'https://cdn.jsdelivr.net/gh/sisisisilviaxie-star/st-scripts@main/greeting.js';

// 2. 加载逻辑
// 注意：这里的 ?t= + Date.now() 非常关键！
// 它保证了哪怕 index.js 是旧的，它拉取的 greeting.js 永远是最新的。
import(logicUrl + '?t=' + Date.now())
    .then(() => {
        console.log('[开场白管理器] 最新版核心逻辑加载成功');
        if (typeof toastr !== 'undefined') {
            // 可选：提示用户已更新（比较烦，建议注释掉，或者仅在版本变化时提示）
            // toastr.success('开场白管理器已自动更新至最新版');
        }
    })
    .catch((err) => {
        console.error('[开场白管理器] 加载失败:', err);
        if (typeof toastr !== 'undefined') {
            toastr.error('脚本加载失败，请检查网络');
        }
    });
