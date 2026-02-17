<template>
  <main class="faq-page">
    <div class="container">

      <header class="faq-header">
        <h1>{{ $t('faq.h1') }}</h1>
        <p class="subtitle">{{ $t('faq.subtitle') }}</p>
      </header>

      <section class="faq-content">
        <h2>{{ $t('faq.q1_h2') }}</h2>
        <p>{{ $t('faq.q1_p') }}</p>

        <h2>{{ $t('faq.q2_h2') }}</h2>
        <p>{{ $t('faq.q2_p') }}</p>

        <h2>{{ $t('faq.q3_h2') }}</h2>
        <p>{{ $t('faq.q3_p') }}</p>

        <h2>{{ $t('faq.q4_h2') }}</h2>
        <p>{{ $t('faq.q4_p') }}</p>

        <div class="faq-conclusion">
          <p class="highlight-text">{{ $t('faq.conclusion_1') }}</p>
          <p>{{ $t('faq.conclusion_2') }}</p>
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
  title: computed(() => t('faq.seo.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('faq.seo.description'))
    }
  ]
})
</script>

<style scoped>
/* Стилі повністю ідентичні faqUs для збереження цілісності */
.faq-page {
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

.faq-header {
  text-align: center;
  margin-bottom: 50px;
}

.faq-header h1 {
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

.faq-content h2 {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 26px;
  color: #001a01;
  margin: 40px 0 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.faq-content p {
  font-size: 17px;
  margin-bottom: 20px;
  text-align: justify;
}

.faq-conclusion {
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
  .faq-header h1 { font-size: 28px; }
  .faq-content h2 { font-size: 22px; }
  .faq-content p {
    font-size: 16px;
    text-align: left;
  }
}
</style>