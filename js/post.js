/**
 * Logos 博客文章详情页脚本
 */

/**
 * 加载文章详情
 * @param {number} postId - 文章ID
 */
async function loadPostDetail(postId) {
    const postDetailContainer = document.getElementById('postDetail');
    const postTagsContainer = document.getElementById('postTags');
    
    postDetailContainer.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/posts/${postId}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('文章不存在');
            }
            throw new Error('获取文章详情失败');
        }
        
        const data = await response.json();
        const { post, tags } = data;
        
        // 设置页面标题
        document.title = `${post.title} - Logos 博客`;
        
        // 渲染文章内容（使用Markdown渲染）
        postDetailContainer.innerHTML = `
            <h1>${post.title}</h1>
            <div class="post-meta">
                <span>发布于 ${formatDate(post.created_at)}</span>
                <span>${post.view_count || 0} 阅读</span>
            </div>
            <div class="post-content">${renderMarkdown(post.content)}</div>
        `;
        
        // 渲染文章标签
        if (tags && tags.length > 0) {
            postTagsContainer.innerHTML = tags.map(tag => 
                `<a href="tags.html?id=${tag.id}" class="tag">${tag.name}</a>`
            ).join('');
        } else {
            postTagsContainer.innerHTML = '<span class="no-tags">暂无标签</span>';
        }
        
        // 代码高亮
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
        
        // 加载评论
        loadComments(postId);
    } catch (error) {
        console.error('加载文章详情出错:', error);
        showError(`${error.message || '加载文章详情失败'}，请稍后重试`, postDetailContainer);
    }
}

/**
 * 加载文章评论
 * @param {number} postId - 文章ID
 * @param {number} page - 页码
 */
async function loadComments(postId, page = 1) {
    const commentsListContainer = document.getElementById('commentsList');
    
    commentsListContainer.innerHTML = '<div class="loading">加载评论中...</div>';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/posts/${postId}/comments?page=${page}&limit=${CONFIG.COMMENTS_PER_PAGE}`);
        if (!response.ok) throw new Error('获取评论失败');
        
        const data = await response.json();
        
        if (data.comments.length === 0) {
            commentsListContainer.innerHTML = '<div class="no-comments">暂无评论，快来发表第一条评论吧！</div>';
            return;
        }
        
        commentsListContainer.innerHTML = '';
        
        // 渲染评论列表
        data.comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${comment.nickname}</span>
                    <span class="comment-date">${formatDate(comment.created_at)}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            
            commentsListContainer.appendChild(commentElement);
        });
        
        // 如果有分页，添加分页控件
        if (data.total_pages > 1) {
            const paginationElement = document.createElement('div');
            paginationElement.className = 'pagination';
            paginationElement.appendChild(
                createPagination(data.page, data.total_pages, (newPage) => {
                    loadComments(postId, newPage);
                    // 滚动到评论区顶部
                    document.querySelector('.comments-section').scrollIntoView({ behavior: 'smooth' });
                })
            );
            
            commentsListContainer.appendChild(paginationElement);
        }
    } catch (error) {
        console.error('加载评论出错:', error);
        commentsListContainer.innerHTML = '<div class="error">加载评论失败，请稍后重试</div>';
    }
}

/**
 * 提交评论
 * @param {Event} event - 表单提交事件
 * @param {number} postId - 文章ID
 */
async function submitComment(event, postId) {
    event.preventDefault();
    
    const nicknameInput = document.getElementById('nickname');
    const emailInput = document.getElementById('email');
    const contentInput = document.getElementById('content');
    const submitButton = document.querySelector('.btn-submit');
    
    // 表单验证
    if (!nicknameInput.value.trim()) {
        alert('请输入昵称');
        nicknameInput.focus();
        return;
    }
    
    if (!emailInput.value.trim()) {
        alert('请输入邮箱');
        emailInput.focus();
        return;
    }
    
    if (!contentInput.value.trim()) {
        alert('请输入评论内容');
        contentInput.focus();
        return;
    }
    
    // 禁用提交按钮，防止重复提交
    submitButton.disabled = true;
    submitButton.textContent = '提交中...';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId,
                nickname: nicknameInput.value.trim(),
                email: emailInput.value.trim(),
                content: contentInput.value.trim()
            })
        });
        
        if (!response.ok) throw new Error('提交评论失败');
        
        // 重置表单
        document.getElementById('commentForm').reset();
        
        // 重新加载评论
        loadComments(postId);
        
        alert('评论提交成功！');
    } catch (error) {
        console.error('提交评论出错:', error);
        alert(`提交评论失败: ${error.message}`);
    } finally {
        // 恢复提交按钮
        submitButton.disabled = false;
        submitButton.textContent = '提交评论';
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取URL中的文章ID参数
    const postId = getUrlParam('id');
    
    if (!postId) {
        const postDetailContainer = document.getElementById('postDetail');
        showError('未指定文章ID', postDetailContainer);
        return;
    }
    
    // 加载文章详情
    loadPostDetail(postId);
    
    // 绑定评论表单提交事件
    const commentForm = document.getElementById('commentForm');
    commentForm.addEventListener('submit', (event) => submitComment(event, postId));
});
