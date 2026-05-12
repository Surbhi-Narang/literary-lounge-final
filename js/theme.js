/**
 * Theme Toggle Module
 */

const ThemeManager = (function() {
    const THEME_KEY = 'll_theme';
    const THEME_BTN_ID = 'theme-toggle';
    
    let currentTheme = AppStorage.get(THEME_KEY, 'light');

    const applyTheme = () => {
        const body = document.body;
        const btn = document.getElementById(THEME_BTN_ID);
        
        if (currentTheme === 'dark') {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            if(btn) btn.innerHTML = '<span class="icon">☀️</span>';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            if(btn) btn.innerHTML = '<span class="icon">🌙</span>';
        }
    };

    const toggleTheme = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        AppStorage.set(THEME_KEY, currentTheme);
        applyTheme();
    };

    return {
        init: () => {
            applyTheme();
            const toggleBtn = document.getElementById(THEME_BTN_ID);
            if (toggleBtn) {
                toggleBtn.addEventListener('click', toggleTheme);
            }
        }
    };
})();

window.ThemeManager = ThemeManager;
