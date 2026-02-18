<template>
  <section class="news-showcase">
    <div class="news-header">
      <h2>{{ $t('news.sectionTitle') }}</h2>
    </div>

    <div class="news-widget-wrapper">
      <div v-if="loading" class="status-message">{{ $t('home.loading') }}</div>

      <div v-else class="news-grid">
        <div v-for="post in latestPosts" :key="post.id" class="news-card">
          <div class="card-header">
            <span class="card-category">{{ getLocalizedText(post.title) }}</span>
            <span class="card-date">{{ formatDate(post.createdAt) }}</span>
          </div>

          <div class="card-image" @click="goToPost(post.id)">
            <img :src="getImgUrl(post.mainImageUrl)" :alt="post.title" loading="lazy" />
          </div>

          <div class="card-body">
            <p class="card-excerpt">
              {{ getLocalizedText(post.content) ? getLocalizedText(post.content).substring(0, 150) + '...' : '' }}
            </p>
          </div>

          <router-link :to="`/journal/${post.id}`" class="read-more-link">
            {{ $t('news.readMore') }}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </router-link>
        </div>
      </div>

      <div class="news-footer-container">
        <button class="btn-catalog" @click="$router.push('/journal')">
          {{ $t('news.readMore') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const router = useRouter();
const { locale } = useI18n();
const posts = ref([]);
const loading = ref(true);

const latestPosts = computed(() => posts.value.slice(0, 3));

const fetchNews = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/journal');
    posts.value = response.data;
  } catch (error) {
    console.error('Error fetching journal:', error);
  } finally {
    loading.value = false;
  }
};

const getLocalizedText = (localizedObj) => {
  if (!localizedObj) return '';
  if (typeof localizedObj === 'string') return localizedObj;
  return localizedObj[locale.value] || localizedObj['en'] || localizedObj['uk'] || '';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

const goToPost = (id) => {
  router.push(`/journal/${id}`);
};

const getImgUrl = (path) => {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  const SUPABASE_URL = 'https://mwgjmektlmjowbmywuep.supabase.co/storage/v1/object/public/journal/';
  return `${SUPABASE_URL}${path}`;
};

onMounted(() => {
  fetchNews();
});
</script>

<style scoped>
/* ДЕСКТОП СТИЛІ (БЕЗ ЗМІН) */
.news-showcase {
  padding: 30px 0 20px;
  background-color: var(--color-bg-main);
}

.news-header {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

.news-header h2 {
  font-family: var(--font-hand);
  font-size: 42px;
  font-weight: 500;
  color: var(--color-text-dark);
}

.news-widget-wrapper {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 20px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px 30px;
}

.news-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  /* Використовуємо em замість px, щоб висота підлаштовувалася під шрифт.
     4.8em — це запас під 3 повних рядки тексту. */
  min-height: 4.8em;
  width: 100%;
}

.card-category {
  font-family: "Palatino Linotype", serif;
  /* Трохи зменшуємо шрифт для мобілок, щоб слова не розривалися */
  font-size: 1rem;
  line-height: 1.3;
  color: var(--color-text-dark);

  /* Дозволяємо тексту займати до 3-х рядків — тепер все влізе */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  overflow: hidden;
  flex: 1;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.card-date { font-size: 0.9rem; color: var(--color-text-light); padding-left: 10px; }

.card-image {
  width: 100%;
  aspect-ratio: 16 / 10;
  background-color: #f5f5f5;
  margin-bottom: 20px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-excerpt {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-text-light);
  margin-bottom: 20px;
  min-height: 92px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more-link {
  margin-top: auto;
  align-self: flex-end;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-dark);
  font-size: 0.85rem;
  text-decoration: underline;
}

.news-footer-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 50px;
  margin-bottom: 60px;
}

/* МОБІЛКА: ФІКС ВІДСТУПІВ ТА КНОПКИ */
@media (max-width: 768px) {
  .news-header {
    padding: 0 20px; /* Відступ заголовка зліва */
    margin-bottom: 20px;
  }

  .news-header h2 {
    font-size: 24px;
    font-weight: normal;
  }

  .news-widget-wrapper {
    padding: 0; /* Прибираємо загальний падінг, щоб скрол міг йти в край */
  }

  .news-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 20px;
    /* Зліва 20px (відступ), справа 0 (прилипає) */
    padding: 0 0 20px 20px;
    scrollbar-width: none;
    scroll-padding-left: 20px; /* Щоб при магнітному скролі був відступ */
  }

  .news-grid::-webkit-scrollbar { display: none; }

  .news-card {
    flex: 0 0 82%; /* Трохи менше, щоб бачити край наступної */
    scroll-snap-align: start;
  }

  /* ФІКС КНОПКИ: Повертаємо охайний вигляд */
  .news-footer-container {
    margin-top: 20px;
    padding: 0 20px;
  }

}
</style>