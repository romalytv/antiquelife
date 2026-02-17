<template>
  <div class="lang-switcher">
    <button class="current-lang" @click="toggleMenu" :class="{ 'is-active': isOpen }">
      {{ currentLangLabel }}
    </button>

    <ul v-if="isOpen" class="lang-menu">
      <li @click="selectLang('uk')">UA</li>
      <li @click="selectLang('en')">EN</li>
      <li @click="selectLang('ru')">RU</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// 1. Створюємо динамічні змінні для доменів
const isDev = import.meta.env.DEV
const DOMAIN_COM = isDev ? 'http://antique.test:5173' : 'https://antique-life.com'
const DOMAIN_UA = isDev ? 'http://antique.test.ua:5173' : 'https://antique-life.com.ua'

const { locale } = useI18n()
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

// Показуємо UA в інтерфейсі, хоча під капотом працює uk
const currentLangLabel = computed(() => {
  return locale.value === 'uk' ? 'UA' : locale.value.toUpperCase()
})

const selectLang = (lang) => {
  isOpen.value = false

  const currentHostname = window.location.hostname
  const isUaDomain = currentHostname.includes('.com.ua') || currentHostname.includes('.test.ua')
  const currentPath = window.location.pathname

  if (lang === 'uk') {
    if (!isUaDomain) {
      window.location.href = `${DOMAIN_UA}${currentPath}?store_selected=1`
    }
  } else {
    if (isUaDomain) {
      window.location.href = `${DOMAIN_COM}${currentPath}?store_selected=1&lang=${lang}`
    } else {
      // 1. Оновлюємо мову в пам'яті та інтерфейсі
      locale.value = lang
      localStorage.setItem('com_locale', lang)

      // 2. ОНОВЛЮЄМО АДРЕСНИЙ РЯДОК (без перезавантаження сторінки)
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('lang')) {
        urlParams.set('lang', lang) // Замінюємо 'en' на 'ru' (або навпаки)
        const newUrl = `${currentPath}?${urlParams.toString()}${window.location.hash}`
        // Тихо переписуємо URL у браузері
        window.history.replaceState({}, '', newUrl)
      }
    }
  }
}
</script>

<style scoped>
/* ===============================
   БАЗОВІ ТА ДЕСКТОПНІ СТИЛІ
   =============================== */
.lang-switcher {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.current-lang {
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans, "Lato", sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: #ffffff; /* Білий текст для темного хедера */
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s, transform 0.2s;
}

.current-lang:hover, .current-lang.is-active {
  color: #b08d57; /* Золотий акцент */
}

.dropdown-arrow {
  font-size: 0.6em;
  transition: transform 0.3s ease;
}

.dropdown-arrow.is-open {
  transform: scaleY(-1);
}

/* Десктопне випадаюче меню */
.lang-menu {
  position: absolute;
  top: calc(100% + 15px);
  right: -10px;
  background-color: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  list-style: none;
  padding: 10px 0;
  margin: 0;
  min-width: 80px;
  z-index: 1000;
  border-radius: 2px;
}

/* Прозорий міст, щоб мишка не губила меню */
.lang-menu::before {
  content: "";
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
}

.lang-menu li {
  padding: 10px 20px;
  cursor: pointer;
  text-align: center;
  font-family: var(--font-sans, "Lato", sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
}

.lang-menu li:hover {
  background-color: #f4ece2;
  color: #b08d57;
  padding-left: 25px; /* Легкий зсув при наведенні */
}

/* ===============================
   МОБІЛЬНІ СТИЛІ (всередині білого меню)
   =============================== */
@media (max-width: 768px) {
  .lang-switcher {
    width: 100%;
    flex-direction: column;
    border-bottom: 1px solid #f1f1f1;
  }

  .current-lang {
    width: 100%;
    justify-content: center;
    color: #0f1f12; /* Темний текст на білому фоні */
    font-size: 14px;
    padding: 16px 0;
  }

  /* Розгортання вниз, як у каталозі */
  .lang-menu {
    position: static;
    width: 100%;
    box-shadow: inset 0 4px 8px -4px rgba(0, 0, 0, 0.08);
    background: #fcfaf7;
    border: none;
    padding: 5px 0;
    margin: 0;
  }

  .lang-menu::before {
    display: none;
  }

  .lang-menu li {
    text-align: center;
    padding: 14px 0;
    font-size: 0.95rem;
  }

  .lang-menu li:hover {
    padding-left: 0; /* Вимикаємо десктопний зсув на мобільному */
  }
}
</style>