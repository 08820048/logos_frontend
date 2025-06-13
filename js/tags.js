/**
 * Logos 博客标签页脚本
 */

/**
 * 加载所有标签
 */
async function loadAllTags() {
    const tagsCloudContainer = document.getElementById('tagsCloud');
    
    tagsCloudContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/tags`);
        if (!response.ok) throw new Error('获取标签列表失败');
        
        const tags = await response.json();
        
        if (tags.length === 0) {
            tagsCloudContainer.innerHTML = '<div class="no-tags">暂无标签</div>';
            return;
        }
        
        tagsCloudContainer.innerHTML = '';
        
        // 渲染标签云
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.textContent = tag.name;
            tagElement.dataset.id = tag.id;
            
            tagElement.addEventListener('click', () => {
                // 更新URL，不刷新页面
                const url = new URL(window.location);
                url.searchParams.set('id', tag.id);
                window.history.pushState({}, '', url);
                
                // 加载该标签下的文章
                loadTagPosts(tag.id);
                
                // 更新选中状态
                document.querySelectorAll('.tag-item').forEach(item => {
                    item.classList.remove('active');
                });
                tagElement.classList.add('active');
            });
            
            tagsCloudContainer.appendChild(tagElement);
        });
        
        // 检查URL中是否有标签ID参数
        const tagId = getUrlParam('id');
        if (tagId) {
            // 模拟点击对应的标签
            const tagElement = document.querySelector(`.tag-item[data-id="${tagId}"]`);
            if (tagElement) {
                tagElement.click();
            } else {
                loadTagPosts(tagId);
            }
        }
    } catch (error) {
        console.error('加载标签列表出错:', error);
        showError('加载标签列表失败，请稍后重试', tagsCloudContainer);
    }
}

/**
 * 加载标签下的文章
 * @param {number} tagId - 标签ID
 * @param {number} page - 页码
 */
async function loadTagPosts(tagId, page = 1) {
    const tagPostsContainer = document.getElementById('tagPosts');
    const paginationContainer = document.getElementById('pagination');
    
    tagPostsContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/tags/${tagId}/posts?page=${page}&limit=${CONFIG.POSTS_PER_PAGE}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('标签不存在');
            }
            throw new Error('获取标签文章失败');
        }
        
        const data = await response.json();
        
        // 渲染标签标题
        tagPostsContainer.innerHTML = `
            <h2 class="tag-title">${data.tag.name}</h2>
        `;
        
        if (data.posts.length === 0) {
            tagPostsContainer.innerHTML += '<div class="no-posts">该标签下暂无文章</div>';
            return;
        }
        
        const postsListElement = document.createElement('div');
        postsListElement.className = 'posts-container';
        
        // 渲染文章列表
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
            
            postsListElement.appendChild(postElement);
        });
        
        tagPostsContainer.appendChild(postsListElement);
        
        // 创建分页
        if (data.total_pages > 1) {
            paginationContainer.innerHTML = '';
            paginationContainer.appendChild(
                createPagination(data.page, data.total_pages, (newPage) => {
                    loadTagPosts(tagId, newPage);
                    // 滚动到标签文章区域顶部
                    tagPostsContainer.scrollIntoView({ behavior: 'smooth' });
                })
            );
        } else {
            paginationContainer.innerHTML = '';
        }
    } catch (error) {
        console.error('加载标签文章出错:', error);
        showError(`${error.message || '加载标签文章失败'}，请稍后重试`, tagPostsContainer);
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    loadAllTags();
});
