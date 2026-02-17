<template>
  <main class="about-page">
    <div class="container">
      <header class="about-header">
        <h1>{{ $t('shipping.page_title') }}</h1>
        <p class="subtitle">{{ $t('shipping.intro') }}</p>
      </header>

      <section class="about-content">
        <h2>{{ $t('shipping.ukraine.title') }}</h2>
        <p>{{ $t('shipping.ukraine.desc') }}</p>
        <ul class="collection-list">
          <li v-for="(item, index) in $tm('shipping.ukraine.list')" :key="index">
            {{ $rt(item) }}
          </li>
        </ul>
        <p><em>{{ $t('shipping.ukraine.note') }}</em></p>

        <h2>{{ $t('shipping.europe.title') }}</h2>
        <p>{{ $t('shipping.europe.desc') }}</p>
        <ul class="collection-list">
          <li v-for="(item, index) in $tm('shipping.europe.list')" :key="index">
            {{ $rt(item) }}
          </li>
        </ul>
        <p><em>{{ $t('shipping.europe.note') }}</em></p>

        <h2>{{ $t('shipping.payment.title') }}</h2>
        <p>{{ $t('shipping.payment.desc') }}</p>

        <h2>{{ $t('shipping.assistance.title') }}</h2>
        <p>{{ $t('shipping.assistance.desc') }}</p>

        <div class="about-conclusion">
          <p class="highlight-text">{{ $t('shipping.page_title') }}</p>
          <p>{{ $t('shipping.intro') }}</p>
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
  title: computed(() => t('shipping.page_title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('shipping.intro'))
    }
  ]
})
</script>

<style scoped>
/* Ті самі стилі, що й у AboutUs для ідентичності */
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

.collection-list {
  list-style-type: square;
  padding-left: 20px;
  margin-bottom: 30px;
}

.collection-list li {
  font-size: 17px;
  margin-bottom: 10px;
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
  .about-content p, .collection-list li { font-size: 16px; text-align: left; }
}
</style>