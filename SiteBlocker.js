// ==UserScript==
// @name         SiteBlocker
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  自定义规则拦截特定网站
// @author       You
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 配置
    const STORAGE_KEY = 'siteBlockerRules';

    // 获取存储的规则
    function getRules() {
        return GM_getValue(STORAGE_KEY, []);
    }

    // 检查是否应该拦截当前URL
    function shouldBlock() {
        const url = window.location.href;
        const rules = getRules();

        return rules.some(rule => {
            if (!rule.enabled) return false;

            if (rule.type === 'string') {
                return url.includes(rule.pattern);
            } else if (rule.type === 'regex') {
                try {
                    const regex = new RegExp(rule.pattern, 'i');
                    return regex.test(url);
                } catch (e) {
                    return false;
                }
            }
            return false;
        });
    }

    // 显示拦截页面
    function showBlockedPage() {
        document.open();
        document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SiteBlocker - 访问已拦截</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
                    .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    h1 { color: #ea4335; }
                    .icon { font-size: 80px; margin: 20px 0; }
                    p { color: #5f6368; line-height: 1.6; }
                    .actions { margin-top: 30px; display: flex; gap: 10px; justify-content: center; }
                    button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                    .btn-primary { background: #4285f4; color: white; }
                    .btn-secondary { background: #5f6368; color: white; }
                    .brand { color: #4285f4; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">🚫</div>
                    <h1>SiteBlocker - 访问已拦截</h1>
                    <p>您尝试访问的网站 <strong>${window.location.hostname}</strong> 已被SiteBlocker规则拦截。</p>
                    <p>此操作由SiteBlocker脚本执行。如需访问，请在脚本管理器中禁用此脚本或修改拦截规则。</p>
                    <div class="actions">
                        <button class="btn-primary" onclick="history.back()">返回上一页</button>
                        <button class="btn-secondary" onclick="window.close()">关闭标签页</button>
                    </div>
                </div>
            </body>
            </html>
        `);
        document.close();
    }

    // 注册菜单命令
    GM_registerMenuCommand("SiteBlocker - 管理规则", showManager);

    // 显示管理界面（简化提示）
    function showManager() {
        alert('SiteBlocker 管理器\n\n1. 在脚本设置中添加JSON规则\n2. 格式：{"pattern": "facebook.com", "type": "string", "enabled": true}\n3. 临时禁用功能已移除');
    }

    // 主拦截逻辑
    if (shouldBlock()) {
        showBlockedPage();
    }
})();
