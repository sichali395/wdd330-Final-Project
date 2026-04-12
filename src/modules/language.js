let translations = {};
let currentLang = 'en';

export async function getTranslations() {
    try {
        const response = await fetch('/json/translations.json');
        translations = await response.json();
        return translations;
    } catch (error) {
        console.error('Failed to load translations:', error);
        return {};
    }
}

export function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);
}

export function getCurrentLanguage() { return currentLang; }

export function translatePage(key) {
    if (!translations[currentLang]) return key;
    return translations[currentLang][key] || key;
}

export function translateAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = translatePage(el.getAttribute('data-i18n'));
    });
}

const savedLang = localStorage.getItem('preferredLanguage');
if (savedLang) currentLang = savedLang;