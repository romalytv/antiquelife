<template>
  <div class="journal-page">

    <header class="journal-header">
      <h1>{{ $t('journal.title') }}</h1>
      <p>{{ $t('journal.subtitle') }}</p>
    </header>

    <div class="journal-grid">
      <div
          v-for="post in posts"
          :key="post.id"
          class="journal-card"
          @click="openPost(post.id)"
      >
        <div class="card-image-wrapper">
          <img :src="post.mainImageUrl || '/placeholder.jpg'" alt="Cover" />
          <div class="date-badge">
            <span class="day">{{ getDay(post.createdAt) }}</span>
            <span class="month">{{ getMonth(post.createdAt) }}</span>
          </div>
        </div>

        <div class="card-content">
          <div class="categories-row">
            <span v-for="cat in post.categories.slice(0, 2)" :key="cat.categoryId" class="cat-badge">
              {{ getCatName(cat.categoryId, cat.category_name) }}
            </span>
          </div>

          <h3 class="card-title">{{ getLocalizedText(post.title) || $t('journal.noTitle') }}</h3>

          <p class="card-excerpt">
            {{ getExcerpt(getLocalizedText(post.content)) }}
          </p>

          <div class="card-footer">
            <button class="read-more-btn">
              {{ $t('journal.readMore') }} <span class="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="posts.length === 0 && !isLoading" class="empty-state">
      <p>{{ $t('journal.empty') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // ДОДАНО
import axios from 'axios';

const posts = ref([]);
const isLoading = ref(true);
const router = useRouter();
const { t, locale } = useI18n(); // ДОДАНО

onMounted(async () => {
  try {
    const res = await axios.get('/api/journal');
    posts.value = res.data;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});

const openPost = (id) => {
  router.push({ name: 'JournalPost', params: { id } });
};

// --- Helpers для Мультимовності ---
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

// --- Форматування Дати ---
const getDay = (d) => new Date(d).getDate();

const getMonth = (d) => {
  const date = new Date(d);
  // Налаштовуємо мову для Date API залежно від обраної мови на сайті
  const localeString = locale.value === 'uk' ? 'uk-UA' : (locale.value === 'ru' ? 'ru-RU' : 'en-US');
  return date.toLocaleString(localeString, { month: 'short' }).replace('.', '');
};

const getExcerpt = (md) => {
  if (!md) return '';
  // Видаляємо Markdown символи
  const text = md.replace(/[#*`_\[\]]/g, '');
  if (text.length < 5) return '';
  return text.length > 90 ? text.substring(0, 90) + '...' : text;
};
</script>

<style scoped>
/* Підтягуємо ті самі шрифти, що й у main.css (на випадок, якщо тут вони потрібні окремо, хоча зазвичай вони вже доступні глобально) */
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");

.journal-page {
  max-width: 1500px; /* Уніфікуємо ширину з products-widget-wrapper */
  margin: 0 auto;
  padding: 60px 20px 40px 20px;
  background-color: var(--color-bg-main); /* Чисто білий фон з main.css */
}

/* --- HEADER СТОРИНКИ --- */
.journal-header {
  text-align: center; /* <--- Змінено з left на center */
  margin-bottom: 50px;
  padding: 0;
}

.journal-header h1 {
  font-family: var(--font-hand); /* Рукописний шрифт (Great Vibes/Snell) */
  color: var(--color-text-dark);
  font-size: 52px; /* Великий розмір для рукописного шрифту */
  font-weight: 500;
  margin: 0 0 10px 0;
  text-transform: none;
  letter-spacing: 1px;
}

.journal-header p {
  font-family: "Montserrat", sans-serif;
  color: var(--color-text-light);
  font-style: normal;
  font-size: 16px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* --- GRID SYSTEM (4 В РЯД) --- */
.journal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 50px 30px; /* Уніфікуємо відступи з products-grid */
}

/* --- CARD DESIGN (БЕЗ РАМОК, ЯК У ТОВАРІВ) --- */
.journal-card {
  background: transparent;
  border: none; /* Прибираємо рамку */
  border-radius: 0; /* Гострі кути */
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: opacity 0.3s ease;
  height: 100%;
}

.journal-card:hover {
  transform: none; /* Прибираємо підстрибування */
  box-shadow: none; /* Прибираємо тінь */
  opacity: 0.85; /* Робимо ефект як у product-card */
}

/* IMAGE */
.card-image-wrapper {
  position: relative;
  aspect-ratio: 4 / 3; /* Журнальна пропорція */
  margin-bottom: 20px; /* Відступ як у товарів */
  overflow: hidden;
  background-color: #fcfcfc;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.journal-card:hover .card-image-wrapper img {
  transform: scale(1.03); /* Легкий зум, менш агресивний */
}

/* DATE BADGE (РОБИМО ЛАКОНІЧНИМ) */
.date-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--color-bg-main);
  padding: 8px 12px;
  border: 1px solid #eaeaea; /* Дуже тонка рамка замість тіні */
  border-radius: 0; /* Квадратний бейдж */
  text-align: center;
  min-width: 50px;
}

.date-badge .day {
  display: block;
  font-family: "Palatino Linotype", serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 1;
  color: var(--color-text-dark);
}

.date-badge .month {
  display: block;
  font-family: "Montserrat", sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-light);
  font-weight: 500;
  margin-top: 4px;
  letter-spacing: 1px;
}

/* CONTENT */
.card-content {
  padding: 0; /* Прибираємо падінги, вирівнюємо по краю фото */
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left; /* Текст зліва */
}

/* CATEGORIES */
.categories-row {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-badge {
  background-color: transparent;
  color: var(--color-primary-green);
  font-family: "Montserrat", sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  padding: 0;
  letter-spacing: 1px;
  font-weight: 600;
}

.cat-badge::after {
  content: ',';
}
.cat-badge:last-child::after {
  content: '';
}

/* TITLE (Як у товарів) */
.card-title {
  font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 1.3;
  color: var(--color-text-dark);
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* EXCERPT */
.card-excerpt {
  font-family: "Montserrat", sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: var(--color-text-light);
  line-height: 1.6;
  margin: 0 0 20px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* BUTTON AREA */
.card-footer {
  margin-top: auto;
  text-align: left;
}

.read-more-btn {
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-text-dark);
  color: var(--color-text-dark);
  padding: 0 0 5px 0;
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.read-more-btn:hover {
  color: var(--color-highlight);
  border-bottom-color: var(--color-highlight);
}

.arrow {
  transition: transform 0.3s ease;
}

.read-more-btn:hover .arrow {
  transform: translateX(4px);
}

.empty-state {
  text-align: center;
  font-family: "Montserrat", sans-serif;
  color: var(--color-text-light);
  padding: 50px 0;
}

/* ======================= */
/* АДАПТИВНІСТЬ            */
/* ======================= */
@media (max-width: 1200px) {
  .journal-grid { grid-template-columns: repeat(3, 1fr); gap: 40px 20px; }
}

@media (max-width: 900px) {
  .journal-grid { grid-template-columns: repeat(2, 1fr); }
  .journal-header h1 { font-size: 42px; }
}

@media (max-width: 768px) {
  .journal-page {
    padding: 40px 15px 20px 15px;
  }

  .journal-header {
    text-align: center; /* <--- Змінено тут також */
    margin-bottom: 30px;
  }

  .journal-header h1 {
    font-size: 36px !important;
    margin-bottom: 10px;
    line-height: 1.2;
  }

  .journal-header p {
    font-size: 12px;
  }

  /* На мобілці робимо 1 колонку або 2 (залежить від того, як ти хочеш). Зробив 1 для кращої читабельності статей */
  .journal-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .card-title {
    font-size: 18px !important;
  }
}
</style>