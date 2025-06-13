/**
 * Logos 博客首页脚本
 */

/**
 * 加载文章列表
 * @param {number} page - 页码
 * @param {number} limit - 每页显示数量
 */
async function loadPosts(page = 1, limit = CONFIG.POSTS_PER_PAGE) {
    const postsContainer = document.getElementById('postsContainer');
    const paginationContainer = document.getElementById('pagination');
    
    postsContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/posts?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error('获取文章列表失败');
        
        const data = await response.json();
        
        if (data.posts.length === 0) {
            postsContainer.innerHTML = '<div class="no-posts">暂无文章</div>';
            return;
        }
        
        postsContainer.innerHTML = '';
        
        // 渲染文章列表
        data.posts.forEach(postData => {
            const { post, tags } = postData;
            console.log('Creating link for post.id:', post.id, 'Title:', post.title); // Debugging post.id
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
            
            postsContainer.appendChild(postElement);
        });
        
        // 创建分页
        if (data.total_pages > 1) {
            paginationContainer.innerHTML = '';
            paginationContainer.appendChild(
                createPagination(data.page, data.total_pages, (newPage) => {
                    loadPosts(newPage, limit);
                    // 滚动到顶部
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                })
            );
        } else {
            paginationContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('加载文章列表出错:', error);
        showError('加载文章列表失败，请稍后重试', postsContainer);
    }
}

// 页面加载完成后加载文章列表
document.addEventListener('DOMContentLoaded', () => {
    // 获取URL中的页码参数
    const pageParam = getUrlParam('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    
    loadPosts(page);
});
