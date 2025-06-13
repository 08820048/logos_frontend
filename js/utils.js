/**
 * Logos 博客工具函数
 */


/**
 * 格式化日期
 * @param {string} dateString - ISO格式的日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', CONFIG.DATE_FORMAT_OPTIONS);
}

/**
 * 将Markdown内容渲染为HTML
 * @param {string} markdown - Markdown格式的内容
 * @returns {string} 渲染后的HTML
 */
function renderMarkdown(markdown) {
    if (!markdown) return '';
    
    // 配置marked选项
    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        langPrefix: 'hljs language-',
        pedantic: false,
        gfm: true,
        breaks: false,

        smartypants: false,
        xhtml: false
    });
    
    // 渲染后用DOMPurify过滤，防止XSS
    return DOMPurify.sanitize(marked.parse(markdown));
}

/**
 * 截取文本摘要
 * @param {string} text - 原始文本
 * @param {number} length - 摘要长度
 * @returns {string} 截取后的摘要
 */
function truncateText(text, length = 150) {
    if (!text) return '';
    
    // 先移除Markdown标记
    const plainText = text.replace(/#+\s|!\[.*?\]\(.*?\)|```[\s\S]*?```|`.*?`|\[.*?\]\(.*?\)|(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g, '$2$4');
    
    if (plainText.length <= length) return plainText;
    return plainText.substring(0, length) + '...';
}

/**
 * 显示错误消息
 * @param {string} message - 错误信息
 * @param {Element} container - 显示错误的容器元素
 */
function showError(message, container) {
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="location.reload()">重试</button>
        </div>
    `;
}

/**
 * 获取URL参数
 * @param {string} param - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * 创建分页组件
 * @param {number} currentPage - 当前页码
 * @param {number} totalPages - 总页数
 * @param {Function} onPageChange - 页码变化时的回调函数
 * @returns {DocumentFragment} 分页组件的DOM片段
 */
function createPagination(currentPage, totalPages, onPageChange) {
    const fragment = document.createDocumentFragment();
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    
    // 上一页按钮
    const prevBtn = document.createElement('div');
    prevBtn.className = `pagination-item ${currentPage <= 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '&lt;';
    if (currentPage > 1) {
        prevBtn.addEventListener('click', () => onPageChange(currentPage - 1));
    }
    paginationDiv.appendChild(prevBtn);
    
    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('div');
        pageBtn.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            if (i !== currentPage) {
                onPageChange(i);
            }
        });
        paginationDiv.appendChild(pageBtn);
    }
    
    // 下一页按钮
    const nextBtn = document.createElement('div');
    nextBtn.className = `pagination-item ${currentPage >= totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '&gt;';
    if (currentPage < totalPages) {
        nextBtn.addEventListener('click', () => onPageChange(currentPage + 1));
    }
    paginationDiv.appendChild(nextBtn);
    
    fragment.appendChild(paginationDiv);
    return fragment;
}

/**
 * 初始化搜索功能
 */
function initSearch() {
    const searchIcon = document.getElementById('searchIcon');
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    // 点击搜索图标显示/隐藏搜索框
    searchIcon.addEventListener('click', () => {
        searchContainer.style.display = searchContainer.style.display === 'block' ? 'none' : 'block';
        if (searchContainer.style.display === 'block') {
            searchInput.focus();
        }
    });
    
    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });
    
    // 回车键触发搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
}

/**
 * 加载友情链接
 */
async function loadFriendLinks() {
    const friendLinksContainer = document.getElementById('friendLinks');
    if (!friendLinksContainer) return;
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/links`);
        if (!response.ok) throw new Error('获取友情链接失败');
        
        const data = await response.json();
        console.log('友情链接API返回数据:', data);
        
        // 处理不同的数据结构
        let links = data;
        
        // 如果数据是包装在对象中的数组
        if (data && typeof data === 'object' && !Array.isArray(data) && data.links) {
            links = data.links;
        }
        
        // 如果数据是包装在对象中的其他字段
        if (data && typeof data === 'object' && !Array.isArray(data) && data.data) {
            links = data.data;
        }
        
        if (!Array.isArray(links) || links.length === 0) {
            friendLinksContainer.innerHTML = '<li>暂无友情链接</li>';
            return;
        }
        
        console.log('处理后的链接数据:', links);
        
        friendLinksContainer.innerHTML = links.map(link => {
            // 检查链接对象的属性名
            const url = link.url || link.link || link.href || '#';
            const name = link.name || link.title || link.text || '未命名链接';
            
            return `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></li>`;
        }).join('');
    } catch (error) {
        console.error('加载友情链接出错:', error);
        friendLinksContainer.innerHTML = '<li>加载友情链接失败</li>';
    }
}

// 页面加载完成后初始化搜索功能和加载友情链接
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    loadFriendLinks();
});
