<template>
  <main class="work-page">
    <div class="container">

      <header class="work-header">
        <h1>{{ $t('howWeWork.h1') }}</h1>
        <p class="intro-text">{{ $t('howWeWork.intro') }}</p>
      </header>

      <section class="work-content">
        <h2>{{ $t('howWeWork.h2_1') }}</h2>
        <p>{{ $t('howWeWork.p_1_1') }}</p>
        <ul class="custom-list">
          <li>— {{ $t('howWeWork.list_1_1') }}</li>
          <li>— {{ $t('howWeWork.list_1_2') }}</li>
          <li>— {{ $t('howWeWork.list_1_3') }}</li>
          <li>— {{ $t('howWeWork.list_1_4') }}</li>
        </ul>
        <p>{{ $t('howWeWork.p_1_2') }}</p>

        <h2>{{ $t('howWeWork.h2_2') }}</h2>
        <p v-html="$t('howWeWork.p_2_1')"></p>

        <h2>{{ $t('howWeWork.h2_3') }}</h2>
        <p>{{ $t('howWeWork.p_3_1') }}</p>
        <ul class="custom-list">
          <li>— {{ $t('howWeWork.list_3_1') }}</li>
          <li>— {{ $t('howWeWork.list_3_2') }}</li>
          <li>— {{ $t('howWeWork.list_3_3') }}</li>
          <li>— {{ $t('howWeWork.list_3_4') }}</li>
        </ul>
        <p>{{ $t('howWeWork.p_3_2') }}</p>

        <h2>{{ $t('howWeWork.h2_4') }}</h2>
        <p v-html="$t('howWeWork.p_4_1')"></p>

        <h2>{{ $t('howWeWork.h2_5') }}</h2>
        <p v-html="$t('howWeWork.p_5_1')"></p>

        <div class="work-conclusion">
          <p class="highlight-text">{{ $t('howWeWork.outro_1') }}</p>
          <p class="poetic-text" v-html="$t('howWeWork.outro_2')"></p>
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

// SEO теги
useHead({
  title: computed(() => t('howWeWork.seo.title')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('howWeWork.seo.description'))
    },
    {
      name: 'keywords',
      content: computed(() => t('howWeWork.seo.keywords'))
    }
  ]
})
</script>

<style scoped>
.work-page {
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

.work-header {
  text-align: center;
  margin-bottom: 50px;
}

.work-header h1 {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 36px;
  font-weight: 500;
  color: #001a01;
  margin-bottom: 20px;
}

.intro-text {
  font-size: 18px;
  color: #555;
  font-style: italic;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.work-content h2 {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 24px;
  color: #001a01;
  margin: 50px 0 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px; /* Відступ для емодзі */
}

.work-content p {
  font-size: 17px;
  margin-bottom: 20px;
  text-align: justify;
}

/* Кастомний список зі знаками "—" замість крапок */
.custom-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 20px;
}

.custom-list li {
  font-size: 17px;
  margin-bottom: 8px;
  padding-left: 20px; /* Відступ, щоб виглядав як повноцінний список */
  text-indent: -20px;
}

.work-conclusion {
  margin-top: 60px;
  padding: 40px 30px;
  background-color: #f4f6f4;
  border-left: 4px solid #b08d57;
  text-align: center;
}

.highlight-text {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 22px;
  color: #001a01;
  margin-bottom: 15px !important;
  text-align: center !important;
}

.poetic-text {
  font-family: var(--font-serif, "Palatino Linotype", "Georgia", serif);
  font-size: 20px;
  font-style: italic;
  color: #b08d57;
  line-height: 1.8;
  text-align: center !important;
}

@media (max-width: 600px) {
  .work-header h1 { font-size: 28px; }
  .work-content h2 { font-size: 20px; }
  .work-content p, .custom-list li, .intro-text {
    font-size: 16px;
    text-align: left !important;
  }
}
</style>