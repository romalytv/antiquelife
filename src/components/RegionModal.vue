<template>
  <div v-if="isVisible" class="popup-overlay">
    <div class="popup-wrapper">
      <button class="close-btn" @click="closePopup">✕</button>

      <div class="popup-box">
        <h2>Select your store</h2>

        <div class="store-options">
          <button @click="selectStore('com')" class="store-btn">
            <span class="domain-name">.com</span>
            <span class="domain-desc">Continue to the<br>international store</span>
          </button>

          <button @click="selectStore('ua')" class="store-btn">
            <span class="domain-name">.ua</span>
            <span class="domain-desc">Visit the Ukrainian<br>store</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n' // 1. Додаємо імпорт i18n

const isVisible = ref(false)
const { locale } = useI18n() // 2. Дістаємо поточну мову

const isDev = import.meta.env.DEV
const DOMAIN_COM = isDev ? 'http://antique.test:5173' : 'https://antique-life.com'
const DOMAIN_UA = isDev ? 'http://antique.test.ua:5173' : 'https://antique-life.com.ua'

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)

  if (urlParams.get('store_selected') === '1') {
    localStorage.setItem('store_selected', 'true')
    isVisible.value = false

    urlParams.delete('store_selected')
    urlParams.delete('lang')

    const newQuery = urlParams.toString() ? `?${urlParams.toString()}` : ''
    const cleanUrl = `${window.location.pathname}${newQuery}${window.location.hash}`

    window.history.replaceState({}, document.title, cleanUrl)
    return
  }

  const hasSelected = localStorage.getItem('store_selected')
  if (!hasSelected) {
    isVisible.value = true
  }
})

const closePopup = () => {
  localStorage.setItem('store_selected', 'true')
  isVisible.value = false
}

const selectStore = (storeType) => {
  localStorage.setItem('store_selected', 'true')
  isVisible.value = false

  const currentHostname = window.location.hostname
  const currentPath = window.location.pathname
  const isUaDomain = currentHostname.includes('.com.ua') || currentHostname.includes('.test.ua')

  if (storeType === 'com') {
    // РОЗУМНИЙ ВИБІР МОВИ ДЛЯ .COM
    // Читаємо мову браузера (наприклад: 'en-US', 'ru-RU', 'uk-UA')
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase()

    // Якщо в мові браузера є 'ru', ставимо 'ru'. Для всіх інших (вкл. Європу/США) - 'en'
    const defaultLang = browserLang.includes('ru') ? 'ru' : 'en'

    if (isUaDomain) {
      // Якщо ми були на .ua, перекидаємо на .com і ПЕРЕДАЄМО обрану мову в URL
      window.location.href = `${DOMAIN_COM}${currentPath}?store_selected=1&lang=${defaultLang}`
    } else {
      // Якщо ми ВЖЕ на .com (просто зайшли вперше і клікнули .com)
      // Ми фізично записуємо вибір у пам'ять і миттєво змінюємо інтерфейс
      localStorage.setItem('com_locale', defaultLang)
      locale.value = defaultLang
    }
  } else if (storeType === 'ua') {
    if (!isUaDomain) {
      window.location.href = `${DOMAIN_UA}${currentPath}?store_selected=1`
    }
    // Якщо ми вже на .ua і клікнули .ua — нічого не робимо, бо мова там жорстко 'uk'
  }
}
</script>

<style scoped>
/* Затемнений фон */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.popup-wrapper {
  position: relative;
  width: 90%;
  max-width: 420px;
}

/* Кнопка "Х" у стилі LONDI (ззовні білого блоку або на краю) */
.close-btn {
  position: absolute;
  top: -35px;
  right: 0;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #ffffff;
  opacity: 0.8;
  padding: 5px;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

/* Білий квадратний блок */
.popup-box {
  background: #ffffff;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.popup-box h2 {
  font-family: var(--font-sans, "Lato", sans-serif);
  font-size: 22px;
  font-weight: 400;
  margin: 0 0 30px 0;
  color: #000;
}

.store-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Кнопки в стилі LONDI (квадратні з рамкою) */
.store-btn {
  flex: 1;
  background: transparent;
  border: 1px solid #000;
  padding: 30px 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1; /* Робить кнопки ідеальними квадратами */
  transition: all 0.2s ease;
}

.store-btn:hover {
  background: #fcfcfc;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.domain-name {
  font-family: var(--font-sans, "Lato", sans-serif);
  font-size: 38px;
  font-weight: 400;
  margin-bottom: 12px;
  color: #000;
  line-height: 1;
}

.domain-desc {
  font-family: var(--font-sans, "Lato", sans-serif);
  font-size: 13px;
  color: #333;
  line-height: 1.3;
}

/* Адаптація для маленьких екранів */
@media (max-width: 400px) {
  .store-options {
    gap: 10px;
  }
  .popup-box {
    padding: 30px 20px;
  }
  .domain-name {
    font-size: 28px;
  }
  .domain-desc {
    font-size: 11px;
  }
}
</style>