document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '';
    const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';
    const translationCache = new Map();
    let currentLanguage = 'en';

    // Profile Menu Elements
    const profileIcon = document.querySelector('.current-user-picture');
    const profileMenu = document.getElementById('profileMenu');
    const appearanceSubmenu = document.getElementById('appearanceSubmenu');
    const languageSubmenu = document.getElementById('languageSubmenu');
    const appearanceMenuItem = document.getElementById('appearanceMenuItem');
    const languageMenuItem = document.getElementById('languageMenuItem');
    const backButtons = document.querySelectorAll('.back-button');
    const themeOptions = document.querySelectorAll('.theme-option');
    const languageOptions = document.querySelectorAll('.language-option');

    // Toggle Functions
    function closeAllMenus() {
        profileMenu.style.display = 'none';
        appearanceSubmenu.style.display = 'none';
        languageSubmenu.style.display = 'none';
    }

    profileIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
        appearanceSubmenu.style.display = 'none';
        languageSubmenu.style.display = 'none';
    });

    appearanceMenuItem.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.style.display = 'none';
        appearanceSubmenu.style.display = 'block';
    });

    languageMenuItem.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.style.display = 'none';
        languageSubmenu.style.display = 'block';
    });

    backButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            appearanceSubmenu.style.display = 'none';
            languageSubmenu.style.display = 'none';
            profileMenu.style.display = 'block';
        });
    });

    document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target) && 
            !appearanceSubmenu.contains(e.target) && 
            !languageSubmenu.contains(e.target) && 
            e.target !== profileIcon) {
            closeAllMenus();
        }
    });

    // Translation Functions
    async function translateText(text, targetLang) {
        if (!text) return '';
        const cacheKey = `${text}-${targetLang}`;
        if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

        try {
            const response = await fetch(`${TRANSLATE_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: text, target: targetLang })
            });
            const data = await response.json();
            const translated = data.data.translations[0].translatedText;
            translationCache.set(cacheKey, translated);
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }

    async function translateInterface(targetLang) {
        currentLanguage = targetLang;
        const elements = [
            ...document.querySelectorAll('[data-translate]'),
            ...document.querySelectorAll('.video-title, .video-author, .sidebar-link div, .tooltip'),
            document.querySelector('.search-bar')
        ];

        await Promise.all(elements.map(async el => {
            const original = el.dataset.originalText || el.textContent;
            el.textContent = await translateText(original, targetLang);
            if (!el.dataset.originalText) el.dataset.originalText = original;
        }));

        document.documentElement.lang = targetLang;
    }

    // Language Handling
    languageOptions.forEach(option => {
        option.addEventListener('click', async () => {
            const languageName = option.querySelector('.language-name').textContent;
            const langCode = languageName === 'English (US)' ? 'en' :
                           languageName === 'Español (España)' ? 'es' :
                           languageName === 'Français' ? 'fr' : 'en';

            languageOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            await translateInterface(langCode);
            localStorage.setItem('youtube-language', languageName);
        });
    });

    // Theme Handling (Keep Original)
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            const theme = option.dataset.theme;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('youtube-theme', theme);
        });
    });

    // Initialize
    function initialize() {
        const savedTheme = localStorage.getItem('youtube-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.theme === savedTheme));

        const savedLang = localStorage.getItem('youtube-language') || 'English (US)';
        languageOptions.forEach(opt => opt.classList.toggle('active', 
            opt.querySelector('.language-name').textContent === savedLang
        ));
        
        translateInterface(savedLang === 'English (US)' ? 'en' : 
                          savedLang === 'Español (España)' ? 'es' : 'fr');
    }

    initialize();
});