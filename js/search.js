/**
 * Logos 博客搜索页脚本
 */

/**
 * 执行搜索
 * @param {string} query - 搜索关键词
 * @param {number} page - 页码
 */
async function performSearch(query, page = 1) {
    const searchTitle = document.getElementById('searchTitle');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const paginationContainer = document.getElementById('pagination');
    
    // 更新搜索标题
    searchTitle.textContent = `"${query}" 的搜索结果`;
    
    searchResultsContainer.innerHTML = '<div class="loading">搜索中...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${CONFIG.POSTS_PER_PAGE}`);
        if (!response.ok) throw new Error('搜索失败');
        
        const data = await response.json();
        
        if (data.posts.length === 0) {
            searchResultsContainer.innerHTML = '<div class="no-results">未找到相关文章</div>';
            return;
        }
        
        searchResultsContainer.innerHTML = '';
        
        // 渲染搜索结果
        data.posts.forEach(postData => {
            const { post, tags } = postData;
            const postElement = document.createElement('div');
            postElement.className = 'post-card';
            
            // 提取文章摘要
            const excerpt = truncateText(post.content);
            
            postElement.innerHTML = `
                <div class="post-card-content">
                    <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
                    <div class="post-card-meta">
                        <span>${formatDate(post.created_at)}</span>
                        <span>${post.view_count || 0} 阅读</span>
                    </div>
                    <div class="post-card-excerpt">${excerpt}</div>
                    <div class="post-card-tags">
                        ${tags.map(tag => `<a href="tags.html?id=${tag.id}" class="tag">${tag.name}</a>`).join('')}
                    </div>
                </div>
            `;
            
            searchResultsContainer.appendChild(postElement);
        });
        
        // 创建分页
        if (data.total_pages > 1) {
            paginationContainer.innerHTML = '';
            paginationContainer.appendChild(
                createPagination(data.page, data.total_pages, (newPage) => {
                    performSearch(query, newPage);
                    // 滚动到顶部
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                })
            );
        } else {
            paginationContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('搜索出错:', error);
        showError('搜索失败，请稍后重试', searchResultsContainer);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取URL中的搜索关键词参数
    const query = getUrlParam('q');
    
    if (!query) {
        const searchResultsContainer = document.getElementById('searchResultsContainer');
        searchResultsContainer.innerHTML = '<div class="no-query">请输入搜索关键词</div>';
        return;
    }
    
    // 将搜索关键词填入搜索框
    document.getElementById('searchInput').value = query;
    
    // 执行搜索
    performSearch(query);
});
