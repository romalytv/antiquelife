<template>
  <main class="refund-page">
    <div class="container">

      <header class="refund-header">
        <h1>{{ $t('refund.h1') }}</h1>
        <p class="subtitle">{{ $t('refund.subtitle') }}</p>
      </header>

      <section class="refund-content">
        <p>{{ $t('refund.intro') }}</p>

        <h2>{{ $t('refund.h2_1') }}</h2>
        <p>{{ $t('refund.p_1') }}</p>

        <h2>{{ $t('refund.h2_2') }}</h2>
        <p>{{ $t('refund.p_2') }}</p>

        <h2>{{ $t('refund.h2_3') }}</h2>
        <p>{{ $t('refund.p_3') }}</p>

        <div class="refund-conclusion">
          <p class="highlight-text">{{ $t('refund.h1') }}</p>
          <p>{{ $t('refund.conclusion') }}</p>
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
  title: computed(() => t('refund.seo.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('refund.seo.description'))
    }
  ]
})
</script>

<style scoped>
/* Стилі повністю ідентичні refundUs для збереження цілісності дизайну */
.refund-page {
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

.refund-header {
  text-align: center;
  margin-bottom: 50px;
}

.refund-header h1 {
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

.refund-content h2 {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 26px;
  color: #001a01;
  margin: 40px 0 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.refund-content p {
  font-size: 17px;
  margin-bottom: 20px;
  text-align: justify;
}

.refund-conclusion {
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
  .refund-header h1 { font-size: 28px; }
  .refund-content h2 { font-size: 22px; }
  .refund-content p {
    font-size: 16px;
    text-align: left;
  }
}
</style>