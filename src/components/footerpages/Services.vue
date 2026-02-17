<template>
  <main class="about-page">
    <div class="container">
      <header class="about-header">
        <h1>{{ $t('services.page_title') }}</h1>
        <p class="subtitle">{{ $t('about.subtitle') }}</p> </header>

      <section class="about-content">
        <div v-for="(service, key) in $tm('services.items')" :key="key" class="service-section">
          <h2>{{ $rt(service.title) }}</h2>
          <p>{{ $rt(service.desc) }}</p>
        </div>


      </section>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'

const { t } = useI18n()

useHead({
  title: computed(() => t('services.page_title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('services.items.search.desc'))
    }
  ]
})
</script>

<style scoped>
/* Використовуємо твої стилі з AboutUs */
.about-page {
  background-color: #fcfcfc;
  color: #333;
  padding: 60px 20px;
  font-family: var(--font-sans, "Lato", sans-serif);
  line-height: 1.8;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 50px;
}

.about-header h1 {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 36px;
  font-weight: 500;
  color: #001a01;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  color: #666;
  font-style: italic;
}

.about-content h2 {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 26px;
  color: #001a01;
  margin: 40px 0 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.about-content p {
  font-size: 17px;
  margin-bottom: 20px;
  text-align: justify;
}

.about-conclusion {
  margin-top: 50px;
  padding: 30px;
  background-color: #f4f6f4;
  border-left: 4px solid #b08d57;
}

.highlight-text {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 22px;
  font-style: italic;
  color: #b08d57;
  text-align: center;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .about-header h1 { font-size: 28px; }
  .about-content h2 { font-size: 22px; }
  .about-content p { font-size: 16px; text-align: left; }
}
</style>