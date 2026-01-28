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
          {{ c.category_name }}
          <span v-if="index < post.categories.length - 1" class="separator">• </span>
        </span>
          </template>

          <span v-if="post.categories?.length" class="main-separator">| </span>

          <span class="date">{{ formatDate(post.createdAt) }}</span>
        </div>

        <h1>{{ post.title || extractTitle(post.content) }}</h1>
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
            <h3>Знайдіть подібне у каталозі</h3>
            <p class="market-subtitle">Перегляньте товари у відповідних категоріях:</p>

            <div class="market-links">
              <router-link
                  v-for="cat in post.categories"
                  :key="'c-' + cat.categoryId"
                  :to="{ path: '/market', query: { category: cat.category_name } }"
                  class="market-chip"
              >
                {{ cat.category_name }}
              </router-link>
            </div>
          </div>

        </div>

        <aside class="sidebar-column">
          <div class="sticky-gallery-wrapper">
            <div v-if="post.galleryImages && post.galleryImages.length > 0" class="gallery-widget">
              <h3>Галерея знахідок</h3>
              <div class="gallery-grid">
                <div v-for="(img, idx) in post.galleryImages" :key="idx" class="gallery-item" @click="openLightbox(img)">
                  <img :src="img" alt="Antique detail" loading="lazy" />
                </div>
              </div>
            </div>

            <div v-else class="gallery-placeholder">
              <p>Фотографії до цього запису знаходяться в обробці.</p>
            </div>
          </div>
        </aside>

      </div>

      <button @click="$router.back()" class="back-btn">
        <span>⟵</span> Повернутися до журналу
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const route = useRoute();
const post = ref(null);

onMounted(async () => {
  try {
    const res = await axios.get(`/api/journal/${route.params.id}`);
    post.value = res.data;
  } catch (e) {
    console.error("Error loading post:", e);
  }
});

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('uk-UA', {
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
  const rawHtml = marked.parse(post.value.content);
  return DOMPurify.sanitize(rawHtml);
});

const openLightbox = (imgUrl) => {
  window.open(imgUrl, '_blank');
};
</script>

<style scoped>
/* Імпорт шрифтів */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:wght@300;400;700&family=Lato:wght@400;700&display=swap');

.single-post-page {
  background: #fdfdfd;
  color: #2c2c2c;
  min-height: 100vh;
}

/* --- HERO SECTION --- */
.hero-image {
  height: 60vh;
  min-height: 400px;
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
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6) 80%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  padding-bottom: 60px;
  max-width: 900px;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.post-meta {
  font-family: 'Lato', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.8rem;
  margin-bottom: 15px;
  opacity: 0.9;
}
.dot { margin: 0 8px; }

.hero-content h1 {
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  margin: 0;
  line-height: 1.1;
  font-weight: 700;
}

/* --- MAIN CONTAINER --- */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.article-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 50px;
  margin-top: 60px;
}

/* --- ЛІВА КОЛОНКА (ТЕКСТ) --- */
.text-column {
  background: transparent;
}

:deep(.markdown-body) {
  font-family: 'Merriweather', serif;
  font-size: 1.125rem;
  line-height: 1.8;
  color: #2c2c2c;
}

:deep(.markdown-body h2) {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  color: #1a1a1a;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

:deep(.markdown-body p) {
  margin-bottom: 1.5em;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid #8b6c4b;
  padding-left: 20px;
  margin: 2em 0;
  font-style: italic;
  font-size: 1.2rem;
  color: #555;
  background: #faf8f5;
  padding: 20px;
}

:deep(.markdown-body img) {
  max-width: 100%;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  margin: 1em 0;
}

/* --- RELATED MARKET LINKS --- */
.related-market {
  margin-top: 50px;
  padding-top: 30px;
}

.separator-line {
  width: 60px;
  height: 3px;
  background-color: #8b6c4b;
  margin-bottom: 20px;
}

.related-market h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  color: #1a1a1a;
  margin-bottom: 5px;
}

.market-subtitle {
  font-family: 'Lato', sans-serif;
  color: #666;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.market-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.market-chip {
  display: inline-flex;
  align-items: center;
  padding: 10px 24px;
  border: 1px solid #dcdcdc;
  border-radius: 2px;
  text-decoration: none;
  font-family: 'Lato', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 700; /* Жирний шрифт для категорій */
  letter-spacing: 1px;
  color: #333;
  transition: all 0.3s ease;
  background: #fff;
}

.market-chip:hover {
  border-color: #8b6c4b;
  color: #8b6c4b;
  background: #fffaf5;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(139, 108, 75, 0.15);
}


/* --- ПРАВА КОЛОНКА (ГАЛЕРЕЯ) --- */
.sidebar-column {
  position: relative;
}

.sticky-gallery-wrapper {
  position: sticky;
  top: 40px;
}

.gallery-widget {
  background: #fff;
  padding: 25px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  border-radius: 8px;
}

.gallery-widget h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 20px;
  color: #1a1a1a;
  border-bottom: 2px solid #f3f3f3;
  padding-bottom: 10px;
  display: inline-block;
  width: 100%;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.gallery-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  cursor: zoom-in;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #eee;
}

.gallery-item img:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* --- TAGS & FOOTER --- */
.tags-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.tag-hash {
  color: #8b6c4b;
  margin-right: 15px;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-block;
  margin-bottom: 5px;
}

.tag-hash:hover {
  color: #5e4630;
  text-decoration: underline;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 60px;
  background: transparent;
  border: 1px solid #d1d1d1;
  padding: 12px 28px;
  cursor: pointer;
  border-radius: 2px;
  font-family: 'Lato', sans-serif;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  color: #555;
}

.back-btn:hover {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

/* =========================================
   MOBILE RESPONSIVENESS
   ========================================= */
@media (max-width: 900px) {
  .hero-content h1 {
    font-size: 2.5rem;
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
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 600px) {
  .hero-image {
    height: 50vh;
  }
  .hero-content h1 {
    font-size: 2rem;
  }
  .content-wrapper {
    padding: 0 15px 40px;
  }
  .article-layout {
    margin-top: 30px;
  }
  :deep(.markdown-body) {
    font-size: 1rem;
  }

  .market-links {
    justify-content: center;
  }

  .related-market {
    text-align: center;
  }

  .separator-line {
    margin: 0 auto 20px;
  }
}
</style>