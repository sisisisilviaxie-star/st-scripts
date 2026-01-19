/**
 * 引导加载器 - 强制加载最新版本的开场白管理器
 * 这样用户只需要 import 这个 url，就能自动获取 greeting.js 的最新代码
 */

// 1. 定义你的主逻辑文件地址 (注意替换你的仓库名)
// 假设你的仓库叫 st-scripts，如果不是，请修改下面这行 url
const logicUrl = 'https://cdn.jsdelivr.net/gh/sisisisilviaxie-star/st-scripts@main/greeting.js';

// 2. 使用动态导入，并加上时间戳参数 (?t=...)
// Date.now() 会生成当前时间，骗过 CDN 和浏览器，强制它们去服务器拉取最新文件
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
