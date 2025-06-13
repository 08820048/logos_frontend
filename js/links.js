/**
 * 友链页面脚本
 */
document.addEventListener('DOMContentLoaded', () => {
    // 初始化搜索功能
    initSearch();
    
    // 加载友链
    loadFriendLinks();
});

/**
 * 加载友链并以卡片形式展示
 */
async function loadFriendLinks() {
    const friendLinksContainer = document.getElementById('friendLinks');
    if (!friendLinksContainer) return;
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/links`);
        if (!response.ok) throw new Error('获取友链失败');
        
        const data = await response.json();
        
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
            friendLinksContainer.innerHTML = '<div class="empty-message">暂无友链</div>';
            return;
        }
        
        // 以卡片形式展示友链
        friendLinksContainer.innerHTML = links.map(link => {
            const url = link.url || link.link || link.href || '#';
            const name = link.name || link.title || link.text || '未命名链接';
            const description = link.description || link.desc || '';
            
            return `
                <div class="link-card">
                    <a href="${url}" target="_blank" rel="noopener noreferrer">
                        <h3 class="link-title">${name}</h3>
                        ${description ? `<p class="link-description">${description}</p>` : ''}
                    </a>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('加载友链出错:', error);
        friendLinksContainer.innerHTML = '<div class="error-message">加载友链失败</div>';
    }
}
