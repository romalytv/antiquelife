<template>
  <div class="journal-page">

    <header class="journal-header">
      <h1>Антикварний Журнал</h1>
      <p>Історії, знахідки та подорожі</p>
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
              {{ cat.category_name }}
            </span>
          </div>

          <h3 class="card-title">{{ post.title || 'Без заголовка' }}</h3>

          <p class="card-excerpt">
            {{ getExcerpt(post.content) }}
          </p>

          <div class="card-footer">
            <button class="read-more-btn">
              Читати далі <span class="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="posts.length === 0 && !isLoading" class="empty-state">
      <p>Журнал поки що порожній.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const posts = ref([]);
const isLoading = ref(true);
const router = useRouter();

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

// --- Helpers ---
const getDay = (d) => new Date(d).getDate();
const getMonth = (d) => new Date(d).toLocaleString('uk-UA', { month: 'short' }).replace('.', '');

const getExcerpt = (md) => {
  if (!md) return '';
  // Видаляємо Markdown символи
  const text = md.replace(/[#*`_\[\]]/g, '');
  // Якщо текст дуже короткий, повертаємо як є
  if (text.length < 5) return '';
  // Обрізаємо до 100 символів
  return text.length > 90 ? text.substring(0, 90) + '...' : text;
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap');

.journal-page {
  max-width: 1400px; /* Збільшили ширину контейнера, бо 4 картки */
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Lato', sans-serif;
  background-color: #fcfcfc;
}

.journal-header {
  text-align: center;
  margin-bottom: 50px;
}

.journal-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  color: #222;
  margin-bottom: 10px;
}

.journal-header p {
  color: #888;
  font-style: italic;
  font-size: 1.1rem;
}

/* --- GRID SYSTEM (4 В РЯД) --- */
.journal-grid {
  display: grid;
  /* На великих екранах 4 колонки */
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

/* Адаптивність */
@media (max-width: 1200px) {
  .journal-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .journal-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .journal-grid { grid-template-columns: 1fr; }
}

/* --- CARD DESIGN --- */
.journal-card {
  background: #fff;
  border: 1px solid #eaeaea; /* Тонка рамка замість тіні */
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  height: 100%; /* Щоб всі картки були однакової висоти */
}

.journal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
  border-color: transparent;
}

/* IMAGE */
.card-image-wrapper {
  position: relative;
  height: 220px; /* Трохи менша висота для 4 колонок */
  overflow: hidden;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.journal-card:hover .card-image-wrapper img {
  transform: scale(1.08);
}

/* DATE BADGE */
.date-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  min-width: 50px;
}

.date-badge .day {
  display: block;
  font-weight: 700;
  font-size: 1.1rem;
  line-height: 1;
  color: #222;
}

.date-badge .month {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #e67e22;
  font-weight: 700;
  margin-top: 2px;
}

/* CONTENT */
.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* CATEGORIES */
.categories-row {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cat-badge {
  background-color: #f5f5f5;
  color: #666;
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  font-weight: 600;
  transition: background 0.2s;
}

.journal-card:hover .cat-badge {
  background-color: #222;
  color: #fff;
}

/* TITLE */
.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  line-height: 1.3;
  color: #222;
  margin: 0 0 10px 0;
  /* Обрізаємо заголовок, якщо > 2 рядків */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* EXCERPT */
.card-excerpt {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1; /* Розтягує блок, притискаючи кнопку до низу */

  /* Обрізаємо текст, якщо > 3 рядків */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* BUTTON AREA */
.card-footer {
  margin-top: auto;
  text-align: center; /* Центрування кнопки */
}

.read-more-btn {
  background: none;
  border: 1px solid #222;
  color: #222;
  padding: 10px 24px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.read-more-btn:hover {
  background: #222;
  color: #fff;
}

.arrow {
  transition: transform 0.3s ease;
}

.read-more-btn:hover .arrow {
  transform: translateX(4px);
}
</style>