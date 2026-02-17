<template>
  <div id="app-wrapper">
    <TheHeader />

    <main>
      <router-view />
    </main>

    <TheFooter />

    <ContactPopup />
    <RegionModal />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

// 1. Імпортуємо компоненти (вони реєструються автоматично)
import TheHeader from './components/Header.vue'
import TheFooter from './components/Footer.vue'
import ContactPopup from "./components/ContactPopup.vue"
import RegionModal from "@/components/RegionModal.vue"

// 2. Ініціалізуємо роутер та локалізацію
const route = useRoute()
const { locale } = useI18n()

// 3. Визначаємо домени для правильної генерації посилань
const isDev = import.meta.env.DEV
const DOMAIN_COM = isDev ? 'http://antique.test:5173' : 'https://antique-life.com'
const DOMAIN_UA = isDev ? 'http://antique.test.ua:5173' : 'https://antique-life.com.ua'

// 4. Логіка відрізання поточної мови від URL (наприклад: /uk/market -> /market)
const cleanPath = computed(() => {
  // Додаємо fallback у вигляді порожнього рядка, поки роутер ще ініціалізується
  const path = (route.path || '').replace(/^\/(uk|en|ru)/, '')
  return path === '/' ? '' : path
})

// 5. Глобальне SEO: динамічно генеруємо hreflang для кожної сторінки
useHead({
  htmlAttrs: {
    lang: locale // Динамічно змінює <html lang="uk">
  },
  link: computed(() => [
    {
      rel: 'alternate',
      hreflang: 'uk',
      href: `${DOMAIN_UA}/uk${cleanPath.value}`
    },
    {
      rel: 'alternate',
      hreflang: 'en',
      href: `${DOMAIN_COM}/en${cleanPath.value}`
    },
    {
      rel: 'alternate',
      hreflang: 'ru',
      href: `${DOMAIN_COM}/ru${cleanPath.value}`
    },
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${DOMAIN_COM}/en${cleanPath.value}` // Дефолтна мова для Гугла
    }
  ])
})
</script>

<style>
/* Твої глобальні стилі залишаються тут */
</style>