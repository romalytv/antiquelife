<template>
  <div class="single-post-page" v-if="post">

    <div class="hero-image" :style="{ backgroundImage: `url(${post.mainImageUrl || '/placeholder-antique.jpg'})` }">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <div class="post-meta">
          <template v-if="post.categories && post.categories.length">
            <span
                v-for="(c, index) in post.categories"
                :key="c.categoryId"
                class="cat-label"
            >
              {{ getCatName(c.categoryId, c.category_name) }}
              <span v-if="index < post.categories.length - 1" class="separator">• </span>
            </span>
          </template>

          <span v-if="post.categories?.length" class="main-separator">| </span>

          <span class="date">{{ formatDate(post.createdAt) }}</span>
        </div>

        <h1>{{ getLocalizedText(post.title) || extractTitle(getLocalizedText(post.content)) }}</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <div class="article-layout">

        <div class="text-column">
          <div class="markdown-body" v-html="renderedContent"></div>

          <div class="tags-section" v-if="post.customTags?.length">
            <span v-for="tag in post.customTags" :key="tag" class="tag-hash">#{{ tag }}</span>
          </div>

          <div class="related-market" v-if="post.categories?.length">
            <div class="separator-line"></div>
            <h3>{{ $t('journal.relatedFinds') }}</h3>
            <p class="market-subtitle">{{ $t('journal.relatedSubtitle') }}</p>

            <div class="market-links">
              <router-link
                  v-for="cat in post.categories"
                  :key="'c-' + cat.categoryId"
                  :to="{ path: $localPath('/market'), query: { cat: getCategorySlug(cat) } }"
                  class="market-chip"
              >
                {{ getCatName(cat.categoryId, cat.category_name) }}
              </router-link>
            </div>
          </div>
        </div>

        <aside class="sidebar-column">
          <div class="sticky-gallery-wrapper">
            <div v-if="post.galleryImages && post.galleryImages.length > 0" class="gallery-widget">
              <h3>{{ $t('journal.galleryTitle') }}</h3>
              <div class="gallery-grid">
                <div v-for="(img, idx) in post.galleryImages" :key="idx" class="gallery-item" @click="openLightbox(img)">
                  <img :src="img" alt="Antique detail" loading="lazy" />
                </div>
              </div>
            </div>

            <div v-else class="gallery-placeholder">
              <p>{{ $t('journal.galleryProcessing') }}</p>
            </div>
          </div>
        </aside>

      </div>

      <button @click="$router.back()" class="back-btn">
        <span>⟵</span> {{ $t('journal.backToJournal') }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'; // ДОДАНО
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const route = useRoute();
const post = ref(null);
const { t, locale } = useI18n(); // ДОДАНО

// Повний список категорій для правильного пошуку перекладів (якщо потрібно)
const categoriesList = ref([]);

onMounted(async () => {
  try {
    const res = await axios.get(`/api/journal/${route.params.id}`);
    post.value = res.data;

    // Отримуємо категорії для формування правильних slug в URL
    const catRes = await axios.get(`/api/categories`);
    categoriesList.value = catRes.data || [];
  } catch (e) {
    console.error("Error loading post:", e);
  }
});

// --- Хелпери локалізації ---
const getLocalizedText = (localizedObj) => {
  if (!localizedObj) return '';
  if (typeof localizedObj === 'string') return localizedObj;
  return localizedObj[locale.value] || localizedObj['en'] || localizedObj['uk'] || '';
};

const getCatName = (id, fallbackName) => {
  const key = `categories.c_${id}.name`;
  const trans = t(key);
  if (trans !== key) return trans;
  return fallbackName || '';
};

// Хелпери для URL
const slugify = (text) => {
  if (!text) return '';
  return String(text).toLowerCase().trim()
      .replace(/['"«»,()]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\-а-яіїєґ]/gi, '')
      .replace(/\-\-+/g, '-');
};

const getCategorySlug = (cat) => {
  const id = cat.categoryId;
  const name = getCatName(id, cat.category_name);
  return `${id}-${slugify(name)}`;
};
// ---------------------------

const formatDate = (d) => {
  if (!d) return '';
  // Динамічна мова для дати
  const localeString = locale.value === 'uk' ? 'uk-UA' : (locale.value === 'ru' ? 'ru-RU' : 'en-US');
  return new Date(d).toLocaleDateString(localeString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const extractTitle = (md) => {
  if (!md) return '';
  return md.split('\n')[0].replace(/[#*]/g, '').trim();
};

const renderedContent = computed(() => {
  if (!post.value) return '';
  const markdownText = getLocalizedText(post.value.content);
  const rawHtml = marked.parse(markdownText);
  return DOMPurify.sanitize(rawHtml);
});

const openLightbox = (imgUrl) => {
  window.open(imgUrl, '_blank');
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap");

.single-post-page {
  background-color: var(--color-bg-main); /* Чисто білий фон */
  color: var(--color-text-dark);
  min-height: 100vh;
}

/* --- HERO SECTION --- */
.hero-image {
  height: 65vh;
  min-height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  /* Темний градієнт для читабельності тексту поверх картинки */
  background: linear-gradient(to bottom, rgba(10, 46, 28, 0.1), rgba(10, 46, 28, 0.8) 90%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  padding-bottom: 70px;
  max-width: 1000px;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
}

.post-meta {
  font-family: "Montserrat", sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 11px;
  margin-bottom: 20px;
  opacity: 0.9;
  font-weight: 500;
}

.cat-label {
  color: #fff; /* Білий колір для контрасту */
}

.hero-content h1 {
  font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif;
  font-size: 46px;
  margin: 0;
  line-height: 1.2;
  font-weight: 400;
}

/* --- MAIN CONTAINER --- */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

.article-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
  margin-top: 60px;
}

/* --- ЛІВА КОЛОНКА (ТЕКСТ) --- */
.text-column {
  background: transparent;
}

:deep(.markdown-body) {
  font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif; /* Змінив на Palatino */
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-dark);
}

:deep(.markdown-body h2) {
  font-family: "Palatino Linotype", serif;
  font-size: 28px;
  margin-top: 2em;
  margin-bottom: 1em;
  color: var(--color-text-dark);
  font-weight: 400;
}

:deep(.markdown-body p) {
  margin-bottom: 1.6em;
}

:deep(.markdown-body blockquote) {
  border-left: 1px solid var(--color-highlight); /* Золотиста лінія */
  padding-left: 30px;
  margin: 2.5em 0;
  font-style: italic;
  font-size: 22px;
  color: var(--color-text-light);
  background: transparent; /* Прибрали сірий фон */
}

:deep(.markdown-body img) {
  max-width: 100%;
  border-radius: 0; /* Прибрали рамки */
  box-shadow: none; /* Прибрали тінь */
  margin: 2em 0;
}

/* --- RELATED MARKET LINKS --- */
.related-market {
  padding-top: 40px;
}

.separator-line {
  width: 100%;
  height: 1px;
  background-color: #eaeaea;
  margin-bottom: 40px;
}

.related-market h3 {
  font-family: "Palatino Linotype", serif;
  font-size: 26px;
  color: var(--color-text-dark);
  margin-bottom: 10px;
  font-weight: 400;
}

.market-subtitle {
  font-family: "Montserrat", sans-serif;
  color: var(--color-text-light);
  margin-bottom: 25px;
  font-size: 14px;
}

.market-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.market-chip {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border: 1px solid var(--color-text-dark);
  border-radius: 0; /* Квадратні кнопки */
  text-decoration: none;
  font-family: "Montserrat", sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--color-text-dark);
  transition: all 0.3s ease;
  background: transparent;
}

.market-chip:hover {
  background-color: var(--color-text-dark);
  color: #fff;
}

/* --- ПРАВА КОЛОНКА (ГАЛЕРЕЯ) --- */
.sidebar-column {
  position: relative;
}

.sticky-gallery-wrapper {
  position: sticky;
  top: 120px; /* Опустив трохи нижче, щоб не прилипало до хедера */
}

.gallery-widget {
  background: transparent; /* Прибрали білий фон-картку */
  padding: 0;
  border: none;
  box-shadow: none;
}

.gallery-widget h3 {
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: left; /* Вирівнювання зліва */
  margin-bottom: 20px;
  color: var(--color-text-light);
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 15px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 колонки замість авто */
  gap: 15px;
}

.gallery-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 0; /* Квадратні фото */
  cursor: zoom-in;
  transition: opacity 0.3s ease;
  border: none; /* Прибрали сіру рамку */
}

.gallery-item img:hover {
  opacity: 0.8;
}

/* --- TAGS & FOOTER --- */
.tags-section {
  margin-top: 40px;
  padding-top: 20px;
}

.tag-hash {
  color: var(--color-highlight); /* Золотистий */
  margin-right: 15px;
  font-family: "Montserrat", sans-serif;
  font-weight: 500;
  font-size: 12px;
  text-transform: lowercase;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-block;
  margin-bottom: 5px;
}

.tag-hash:hover {
  color: var(--color-text-dark);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 80px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--color-text-dark);
  padding: 0 0 5px 0;
  cursor: pointer;
  border-radius: 0;
  font-family: "Montserrat", sans-serif;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  color: var(--color-text-dark);
  font-weight: 500;
}

.back-btn:hover {
  color: var(--color-highlight);
  border-bottom-color: var(--color-highlight);
}

/* =========================================
   MOBILE RESPONSIVENESS
   ========================================= */
@media (max-width: 900px) {
  .hero-content h1 {
    font-size: 36px;
  }

  .article-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .sidebar-column {
    order: 2;
  }

  .sticky-gallery-wrapper {
    position: static;
  }

  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .hero-image {
    height: 50vh;
    min-height: 400px;
  }
  .hero-content h1 {
    font-size: 28px;
  }
  .content-wrapper {
    padding: 0 15px 40px;
  }
  .article-layout {
    margin-top: 30px;
  }
  :deep(.markdown-body) {
    font-size: 16px;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>