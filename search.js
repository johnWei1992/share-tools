// 全局搜索组件与逻辑（含右上角常驻输入框与移动端优化）
(function () {
    // 1. 自动在页面右上角注入常驻搜索栏和弹窗结构
    const injectedHTML = `
    <!-- PC端右上角常驻搜索栏提示 -->
    <div id="desktop-search-trigger" onclick="openSearch()" style="position:fixed; top:20px; right:24px; background:#18181b; border:1px solid #27272a; border-radius:8px; padding:8px 12px; display:flex; align-items:center; gap:8px; cursor:pointer; z-index:998; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:border-color 0.2s;" onmouseover="this.style.borderColor='#3f3f46'" onmouseout="this.style.borderColor='#27272a'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span style="font-size:13px; color:#a1a1aa; font-family:inherit;">搜索工具...</span>
        <span style="font-size:11px; color:#71717a; background:#27272a; padding:2px 6px; border-radius:4px; font-family:monospace;">Cmd + K</span>
    </div>

    <!-- 移动端悬浮搜索按钮 -->
    <div id="mobile-search-fab" style="display:none; position:fixed; bottom:24px; right:24px; width:50px; height:50px; background:#27272a; border:1px solid #3f3f46; border-radius:50%; box-shadow:0 4px 12px rgba(0,0,0,0.5); z-index:9998; justify-content:center; align-items:center; cursor:pointer;" onclick="openSearch()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </div>

    <!-- 全局搜索弹窗 -->
    <div id="global-search-modal" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); justify-content:center; align-items:flex-start; padding-top:12vh; z-index:9999; box-sizing:border-box; padding-left:16px; padding-right:16px;">
        <div style="width:100%; max-width:600px; background:#18181b; border:1px solid #27272a; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5); overflow:hidden; color:#f4f4f5; font-family:inherit;">
            <div style="display:flex; align-items:center; border-bottom:1px solid #27272a; padding-right:16px;">
                <input type="text" id="global-search-input" placeholder="输入关键词搜索工具..." autocomplete="off" style="width:100%; padding:16px; background:transparent; border:none; outline:none; color:#fff; font-size:16px;">
                <span onclick="closeSearch()" style="font-size:12px; color:#a1a1aa; background:#27272a; padding:4px 8px; border-radius:4px; cursor:pointer;">ESC</span>
            </div>
            <div id="search-results-list" style="max-height:50vh; overflow-y:auto; padding:8px;"></div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', injectedHTML);

    // 适配移动端：小屏幕时隐藏右上角常驻栏，显示右下角悬浮按钮
    if (window.innerWidth <= 768 || 'ontouchstart' in window) {
        const desktopTrigger = document.getElementById('desktop-search-trigger');
        if (desktopTrigger) desktopTrigger.style.display = 'none';
        document.getElementById('mobile-search-fab').style.display = 'flex';
    }

    // 你的所有工具页面索引
    const sitePages = [
        { title: "链接工具", url: "index.html", desc: "常用网站与开发导航" },
        { title: "沉浸番茄钟", url: "pomodoro.html", desc: "高效专注时间管理" },
        { title: "强密码生成器", url: "password.html", desc: "生成军工级高强度安全密码" },
        { title: "FPV 计算器", url: "fpv.html", desc: "无人机参数与物理计算" },
        { title: "互动留言板", url: "feedback.html", desc: "留下你的意见和反馈" }
    ];

    const searchModal = document.getElementById('global-search-modal');
    const searchInput = document.getElementById('global-search-input');
    const resultsList = document.getElementById('search-results-list');
    let selectedIndex = 0;

    // 快捷键监听 Cmd+K 或 Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openSearch();
        }
        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    window.openSearch = function () {
        searchModal.style.display = 'flex';
        searchInput.value = '';
        renderResults(sitePages);
        setTimeout(() => searchInput.focus(), 50);
    }

    window.closeSearch = function () {
        searchModal.style.display = 'none';
    }

    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeSearch();
    });

    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = sitePages.filter(p =>
            p.title.toLowerCase().includes(keyword) || p.desc.toLowerCase().includes(keyword)
        );
        selectedIndex = 0;
        renderResults(filtered);
    });

    function renderResults(items) {
        if (items.length === 0) {
            resultsList.innerHTML = `<div style="padding:20px; text-align:center; color:#71717a;">没有找到相关工具</div>`;
            return;
        }
        resultsList.innerHTML = items.map((item, index) => `
            <div onclick="location.href='${item.url}'" style="padding:14px 16px; border-radius:8px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; color:#d4d4d8; background:${index === selectedIndex ? '#27272a' : 'transparent'}; margin-bottom:4px;" onmouseover="this.style.background='#27272a'" onmouseout="this.style.background='transparent'">
                <div>
                    <div style="font-weight:500; color:#fff; font-size:15px;">${item.title}</div>
                    <div style="font-size:12px; color:#a1a1aa; margin-top:2px;">${item.desc}</div>
                </div>
                <span style="font-size:12px; color:#71717a; background:#27272a; padding:4px 8px; border-radius:4px;">前往</span>
            </div>
        `).join('');
    }
})();