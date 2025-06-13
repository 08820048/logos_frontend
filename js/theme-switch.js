/**
 * 暗色模式切换功能
 */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    
    // 检查本地存储中的主题设置
    const currentTheme = localStorage.getItem('theme');
    
    // 如果有存储的主题设置，应用它
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // 如果是暗色模式，勾选切换开关
        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    } else {
        // 检查系统偏好
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        if (prefersDarkScheme.matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.checked = true;
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // 监听切换事件
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
});
