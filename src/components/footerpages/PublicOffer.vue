<template>
  <main class="public-offer-page">
    <div class="container">

      <header class="public-offer-header">
        <h1>{{ $t('offer.h1') }}</h1>
        <p class="subtitle">{{ $t('offer.subtitle') }}</p>
      </header>

      <section class="public-offer-content">
        <p>{{ $t('offer.intro') }}</p>

        <h2>{{ $t('offer.h2_1') }}</h2>
        <p>{{ $t('offer.p_1') }}</p>

        <h2>{{ $t('offer.h2_2') }}</h2>
        <p>{{ $t('offer.p_2') }}</p>

        <h2>{{ $t('offer.h2_3') }}</h2>
        <p>{{ $t('offer.p_3') }}</p>

        <div class="public-offer-conclusion">
          <p class="highlight-text">{{ $t('offer.h1') }}</p>
          <p>{{ $t('offer.conclusion') }}</p>
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
  title: computed(() => t('offer.seo.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('offer.seo.description'))
    }
  ]
})
</script>

<style scoped>
.public-offer-page {
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

.public-offer-header {
  text-align: center;
  margin-bottom: 50px;
}

.public-offer-header h1 {
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

.public-offer-content h2 {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 26px;
  color: #001a01;
  margin: 40px 0 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.public-offer-content p {
  font-size: 17px;
  margin-bottom: 20px;
  text-align: justify;
}

.public-offer-conclusion {
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
  .public-offer-header h1 { font-size: 28px; }
  .public-offer-content h2 { font-size: 22px; }
  .public-offer-content p {
    font-size: 16px;
    text-align: left;
  }
}
</style>