<template>
  <div class="market-page">

    <header class="market-header">
      <h1 class="page-title">Колекція</h1>
      <div class="controls-bar">
        <div class="search-wrapper">
          <input v-model="searchQuery" type="text" placeholder="Знайти предмет..." class="search-input"/>
        </div>
        <select v-model="selectedCategory" class="category-select">
          <option value="">Всі категорії</option>
          <option v-for="c in categoriesList" :key="c.category_id" :value="c.category_name">{{ c.category_name }}</option>
        </select>
      </div>
    </header>

    <div class="products-grid" v-if="products.length > 0">
      <div
          v-for="product in filteredProducts"
          :key="product.product_id"
          class="product-card"
          :class="{ 'card-unavailable': product.status !== 'AVAILABLE' }"
          @mouseleave="resetImage(product.product_id)"
      >
        <div class="image-container">
          <router-link :to="{ name: 'Item', params: { id: product.product_id }}">
            <img
                :src="getCurrentImage(product)"
                :alt="product.name"
                loading="lazy"
                :class="{ 'img-dimmed': product.status === 'SOLD' }"
            />
          </router-link>

          <div v-if="hasMultipleImages(product)" class="slider-controls">
            <button class="nav-btn prev" @click.prevent="prevImage(product)">❮</button>
            <button class="nav-btn next" @click.prevent="nextImage(product)">❯</button>
            <span class="img-counter">  {{ (imageIndices[product.product_id] || 0) + 1 }} / {{ getDisplayImages(product).length }} </span>
          </div>

          <span v-if="product.status === 'SOLD'" class="status-badge sold">ПРОДАНО</span>
          <span v-else-if="product.status === 'RESERVED'" class="status-badge reserved">РЕЗЕРВ</span>
        </div>

        <div class="card-info">
          <span class="category-label">
            {{ product.category ? product.category.category_name : 'Інше' }}
          </span>

          <h3 class="product-name">
            <router-link :to="{ name: 'Item', params: { id: product.product_id }}">
              {{ product.name }}
            </router-link>
          </h3>

          <div class="bottom-row">
            <span class="price" :class="{ 'price-crossed': product.status === 'SOLD' }">
              {{ formatPrice(product.price) }} ₴
            </span>

            <button
                class="btn-icon"
                :class="{ 'btn-disabled': product.status !== 'AVAILABLE' }"
                :disabled="product.status !== 'AVAILABLE'"
                @click.prevent="addToCart(product)"
            >
              <span v-if="product.status === 'AVAILABLE'">+</span>
              <span v-else>🔒</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">Завантаження колекції...</div>
    <div v-else class="empty-state"><p>Експонатів не знайдено.</p></div>

  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch} from 'vue';
import { useCartStore } from '../stores/cart'
import axios from 'axios';
import {useRoute} from "vue-router";

const route = useRoute();
const cartStore = useCartStore();
const products = ref([]);
const categoriesList = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const imageIndices = ref({});

// --- ЛОГІКА СЛАЙДЕРА ТА ОБКЛАДИНКИ ---

// Допоміжна функція: Збирає повний список фото для показу
// 1. Якщо є coverImage -> воно стає ПЕРШИМ у списку.
// 2. Далі йдуть всі інші фото з imageUrls.
const getDisplayImages = (product) => {
  const images = [];

  // Якщо є AI обкладинка - додаємо її на початок
  if (product.coverImage) {
    images.push(product.coverImage);
  }

  // Додаємо решту фото з галереї
  if (product.imageUrls && product.imageUrls.length > 0) {
    images.push(...product.imageUrls);
  }

  // Якщо зовсім нічого немає - плейсхолдер
  if (images.length === 0) {
    images.push('/placeholder.png');
  }

  return images;
};

// Перевіряємо, чи є більше однієї картинки (для стрілок слайдера)
const hasMultipleImages = (product) => {
  const images = getDisplayImages(product);
  return images.length > 1;
};

// Отримуємо поточне фото для відображення
const getCurrentImage = (product) => {
  const images = getDisplayImages(product);
  const index = imageIndices.value[product.product_id] || 0;

  // Захист від виходу за межі масиву (якщо фото видалили, а індекс лишився)
  if (index >= images.length) {
    return images[0];
  }

  return images[index];
};

const nextImage = (product) => {
  const images = getDisplayImages(product);
  const currentIndex = imageIndices.value[product.product_id] || 0;
  imageIndices.value[product.product_id] = (currentIndex + 1) % images.length;
};

const prevImage = (product) => {
  const images = getDisplayImages(product);
  const currentIndex = imageIndices.value[product.product_id] || 0;
  const total = images.length;
  imageIndices.value[product.product_id] = currentIndex === 0 ? total - 1 : currentIndex - 1;
};

const resetImage = (productId) => {
  if (imageIndices.value[productId]) imageIndices.value[productId] = 0;
};
// -----------------------

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/products`);
    products.value = response.data; // Бекенд тепер повертає поле status ("AVAILABLE", "SOLD", "RESERVED")
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await axios.get(`/api/categories`);
    categoriesList.value = response.data;
  } catch (e) { console.error(e); }
};

onMounted(async () => {
  await fetchProducts();
  await fetchCategories();
  if (route.query.category) selectedCategory.value = route.query.category;
});

const filteredProducts = computed(() => {
  // 1. Спочатку фільтруємо (пошук + категорія) — це твій старий код
  const list = products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const catName = product.category ? product.category.category_name : 'Інше';
    const matchesCategory = selectedCategory.value === '' || catName === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });

  // 2. Тепер СОРТУЄМО відфільтрований список
  return list.sort((a, b) => {
    // Карта пріоритетів: менше число = вище в списку
    const statusPriority = {
      'AVAILABLE': 1,
      'RESERVED': 2,
      'SOLD': 3
    };

    const priorityA = statusPriority[a.status] || 4; // 4 для невідомих статусів
    const priorityB = statusPriority[b.status] || 4;

    // КРОК 1: Порівнюємо за статусом
    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Сортування від меншого до більшого (1 -> 2 -> 3)
    }

    // КРОК 2: Якщо статуси однакові — сортуємо за новизною (датою)
    // Припускаємо, що бекенд віддає поле created_at.
    // Якщо його немає, можна видалити цей блок, тоді порядок буде як в БД (за ID).
    if (a.created_at && b.created_at) {
      return new Date(b.created_at) - new Date(a.created_at); // Новіші дати зверху
    }

    return 0;
  });
});

watch(() => route.query.category, (newVal) => { selectedCategory.value = newVal || ''; });

const formatPrice = (p) => p?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const addToCart = (product) => {
  if (product.status === 'AVAILABLE') {
    cartStore.addToCart(product);
  } else {
    // На всяк випадок, хоча кнопка disabled
    alert("Цей товар вже недоступний для замовлення.");
  }
};
</script>

<style scoped>
/* Стилі контейнера та хедера (залишаємо як були) */
.market-page { max-width: 1200px; margin: 0 auto; padding: 40px 20px; font-family: 'Georgia', serif; color: #2c3e50; }
.market-header { text-align: center; margin-bottom: 50px; }
.page-title { font-size: 36px; margin-bottom: 30px; position: relative; display: inline-block; }
.page-title::after { content: ''; display: block; width: 60px; height: 3px; background-color: #d4af37; margin: 15px auto 0; }
.controls-bar { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
.search-input, .category-select { padding: 12px 20px; border: 1px solid #ddd; font-size: 16px; min-width: 250px; }
.search-input:focus, .category-select:focus { outline: none; border-color: #d4af37; }

/* СІТКА */
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 40px; }

/* КАРТКА */
.product-card { background: #fff; border: 1px solid #eee; transition: 0.3s; display: flex; flex-direction: column; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); border-color: #d4af37; }

/* Якщо товар недоступний, картка трохи прозора */
.card-unavailable { opacity: 0.85; }
.card-unavailable:hover { transform: none; box-shadow: none; border-color: #eee; }

.image-container { position: relative; height: 250px; overflow: hidden; background: #f9f9f9; }
.image-container img { width: 100%; height: 100%; object-fit: cover; transition: 0.3s; }
.img-dimmed { filter: grayscale(100%) contrast(1.2); opacity: 0.7; } /* ЧБ для проданих */

/* Навігація слайдера */
.nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); border: none; width: 30px; height: 30px; cursor: pointer; z-index: 2; opacity: 0; transition: 0.2s; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.product-card:hover .nav-btn { opacity: 1; }
.prev { left: 10px; } .next { right: 10px; }
.img-counter { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; opacity: 0; }
.product-card:hover .img-counter { opacity: 1; }

/* СТАТУСИ (ПЛАШКИ) */
.status-badge {
  position: absolute; top: 10px; right: 10px; padding: 4px 10px;
  font-size: 11px; text-transform: uppercase; color: white; font-weight: bold;
  z-index: 3; letter-spacing: 1px; border-radius: 2px;
}
.sold { background-color: #c0392b; box-shadow: 0 2px 5px rgba(0,0,0,0.2); } /* Темно-червоний */
.reserved { background-color: #f39c12; box-shadow: 0 2px 5px rgba(0,0,0,0.2); } /* Помаранчевий */

/* ІНФО */
.card-info { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; }
.category-label { font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 8px; }
.product-name { margin: 0 0 15px; font-size: 18px; line-height: 1.4; font-weight: normal; }
.product-name a { text-decoration: none; color: #2c3e50; }
.product-name a:hover { color: #d4af37; }

.bottom-row { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.price { font-size: 20px; font-weight: bold; }
.price-crossed { text-decoration: line-through; color: #999; font-size: 18px; }

/* КНОПКА + */
.btn-icon {
  background: #2c3e50; color: white; border: none; width: 35px; height: 35px; font-size: 20px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;
}
.btn-icon:hover { background: #d4af37; }

/* Вимкнена кнопка */
.btn-disabled { background: #e0e0e0; color: #999; cursor: not-allowed; }
.btn-disabled:hover { background: #e0e0e0; }

.loading-state, .empty-state { text-align: center; padding: 60px; color: #888; }
</style>