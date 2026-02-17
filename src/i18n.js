import { createI18n } from 'vue-i18n'
import uk from './locales/uk.json'
import en from './locales/en.json'
import ru from './locales/ru.json'

function getLocaleFromDomain() {
    // Захист для серверного рендерингу (якщо буде)
    if (typeof window === 'undefined') return 'uk'

    const hostname = window.location.hostname

    // 1. Якщо ми на українському домені (.com.ua або .test.ua) - ЗАВЖДИ 'uk'
    if (hostname.includes('.com.ua') || hostname.includes('.test.ua')) {
        return 'uk'
    }

    // 2. Якщо ми на міжнародному домені (.com або .test)
    if (hostname.includes('.com') || hostname.includes('.test')) {
        const urlParams = new URLSearchParams(window.location.search)
        const urlLang = urlParams.get('lang')

        // А) Якщо мова була передана в URL (після вибору в попапі)
        if (urlLang === 'en' || urlLang === 'ru' || urlLang === 'uk') {
            localStorage.setItem('com_locale', urlLang)
            return urlLang
        }

        // Б) Якщо користувач вже обирав мову раніше (читаємо з пам'яті)
        const savedLocale = localStorage.getItem('com_locale')
        if (savedLocale) {
            return savedLocale
        }

        // В) Якщо людина зайшла ВПЕРШЕ: визначаємо по браузеру, за замовчуванням EN
        const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase()
        return browserLang.includes('ru') ? 'ru' : 'en'
    }

    // Запасний варіант на випадок збоїв
    return 'uk'
}

export const i18n = createI18n({
    legacy: false, // Обов'язково для Composition API
    locale: getLocaleFromDomain(),
    fallbackLocale: 'en', // Якщо якогось слова немає в перекладі, покаже англійське
    messages: { uk, en, ru }
})