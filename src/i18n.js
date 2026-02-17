import { createI18n } from 'vue-i18n'
import uk from './locales/uk.json'
import en from './locales/en.json'
import ru from './locales/ru.json'

const SUPPORTED_LOCALES = ['uk', 'en', 'ru']

function getInitialLocale() {
    // Захист для серверного рендерингу
    if (typeof window === 'undefined') return 'uk'

    // 1. НАЙВИЩИЙ ПРІОРИТЕТ: Читаємо мову прямо з URL (наприклад, з /en/about-us беремо 'en')
    const pathLang = window.location.pathname.split('/')[1]

    // Якщо в URL є валідна мова, одразу повертаємо її
    if (SUPPORTED_LOCALES.includes(pathLang)) {
        return pathLang
    }

    // 2. ЯКЩО МОВИ В URL НЕМАЄ (наприклад, зайшли на головну сторінку '/')
    const hostname = window.location.hostname

    // А) Якщо це український домен (.com.ua) - ЗАВЖДИ 'uk'
    if (hostname.includes('.com.ua') || hostname.includes('.test.ua')) {
        return 'uk'
    }

    // Б) Якщо це міжнародний домен (.com) - намагаємось вгадати
    if (hostname.includes('.com') || hostname.includes('.test')) {
        // Читаємо з пам'яті, якщо юзер вже щось обирав раніше
        const savedLocale = localStorage.getItem('com_locale')
        if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
            return savedLocale
        }

        // Якщо зайшли ВПЕРШЕ: визначаємо по браузеру
        const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase()
        if (browserLang.includes('ru')) return 'ru'
        if (browserLang.includes('uk')) return 'uk'
        return 'en' // За замовчуванням для іноземців
    }

    // Запасний варіант на випадок будь-яких збоїв
    return 'uk'
}

export const i18n = createI18n({
    legacy: false, // Обов'язково для Composition API
    locale: getInitialLocale(), // Викликаємо нашу нову функцію
    fallbackLocale: 'en', // Якщо якогось слова немає в перекладі, покаже англійське
    messages: { uk, en, ru }
})