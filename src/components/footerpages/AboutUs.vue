<template>
  <main class="about-page">
    <div class="container">

      <header class="about-header">
        <h1>{{ $t('about.h1') }}</h1>
        <p class="subtitle">{{ $t('about.subtitle') }}</p>
      </header>

      <section class="about-content">
        <p v-html="$t('about.intro_1')"></p>
        <p>{{ $t('about.intro_2') }}</p>

        <h2>{{ $t('about.h2_1') }}</h2>
        <p>{{ $t('about.p_1_1') }}</p>
        <p v-html="$t('about.p_1_2')"></p>

        <h2>{{ $t('about.h2_2') }}</h2>
        <p>{{ $t('about.p_2_1') }}</p>
        <p>{{ $t('about.p_2_2') }}</p>

        <h2>{{ $t('about.h2_3') }}</h2>
        <p v-html="$t('about.p_3_1')"></p>
        <p>{{ $t('about.p_3_2') }}</p>

        <h2>{{ $t('about.h2_4') }}</h2>
        <ul class="collection-list">
          <li v-html="$t('about.list_1')"></li>
          <li v-html="$t('about.list_2')"></li>
          <li v-html="$t('about.list_3')"></li>
        </ul>

        <div class="about-conclusion">
          <p class="highlight-text">{{ $t('about.conclusion_1') }}</p>
          <p>{{ $t('about.conclusion_2') }}</p>
          <p v-html="$t('about.conclusion_3')"></p>
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

// Динамічне SEO: змінюється миттєво при зміні мови
useHead({
  title: computed(() => t('about.seo.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('about.seo.description'))
    },
    {
      name: 'keywords',
      content: computed(() => t('about.seo.keywords'))
    }
  ]
})
</script>

<style scoped>
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
  .about-content p, .collection-list li {
    font-size: 16px;
    text-align: left;
  }
}
</style>