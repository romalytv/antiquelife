<template>
  <div class="market-page">

    <header class="market-header">
      <h1 class="page-title">Колекція</h1>

      <div class="controls-bar">
        <div class="search-wrapper">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Знайти предмет..."
              class="search-input"
          />
        </div>

        <select v-model="selectedCategory" class="category-select">
          <option value="">Всі категорії</option>
          <option
              v-for="category in categoriesList"
              :key="category.category_id"
              :value="category.category_name"
          >
            {{ category.category_name }}
          </option>
        </select>
      </div>
    </header>

    <div class="products-grid" v-if="products.length > 0">
      <div
          v-for="product in filteredProducts"
          :key="product.product_id"
          class="product-card"
          @mouseleave="resetImage(product.product_id)"
      >
        <div class="image-container">
          <router-link :to="{ name: 'Item', params: { id: product.product_id }}">

            <img
                :src="getCurrentImage(product)"
                :alt="product.name"
                loading="lazy"
            />

          </router-link>

          <div v-if="hasMultipleImages(product)" class="slider-controls">
            <button class="nav-btn prev" @click.prevent="prevImage(product)">❮</button>
            <button class="nav-btn next" @click.prevent="nextImage(product)">❯</button>

            <span class="img-counter">
              {{ (imageIndices[product.product_id] || 0) + 1 }} / {{ product.imageUrls.length }}
            </span>
          </div>

          <span v-if="product.status === 'sold'" class="status-badge sold">Продано</span>
          <span v-else-if="product.status === 'reserved'" class="status-badge reserved">Резерв</span>
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
            <span class="price">{{ formatPrice(product.price) }} ₴</span>
            <button class="btn-icon" @click.prevent="addToCart(product)">
              +
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      Завантаження колекції...
    </div>

    <div v-else class="empty-state">
      <p>На жаль, експонатів не знайдено.</p>
    </div>

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

// --- ЛОГІКА СЛАЙДЕРА ---
const imageIndices = ref({}); // Зберігає стан: { 'id_товару': поточний_індекс }

const hasMultipleImages = (product) => {
  return product.imageUrls && product.imageUrls.length > 1;
};

const getCurrentImage = (product) => {
  // Якщо немає картинок взагалі
  if (!product.imageUrls || product.imageUrls.length === 0) return '/placeholder.png';

  // Беремо збережений індекс або 0
  const index = imageIndices.value[product.product_id] || 0;
  return product.imageUrls[index];
};

const nextImage = (product) => {
  const currentIndex = imageIndices.value[product.product_id] || 0;
  const total = product.imageUrls.length;
  // (0 + 1) % 3 -> 1 ... (2 + 1) % 3 -> 0 (зациклення)
  imageIndices.value[product.product_id] = (currentIndex + 1) % total;
};

const prevImage = (product) => {
  const currentIndex = imageIndices.value[product.product_id] || 0;
  const total = product.imageUrls.length;
  // Якщо 0 -> йдемо в кінець (total - 1)
  if (currentIndex === 0) {
    imageIndices.value[product.product_id] = total - 1;
  } else {
    imageIndices.value[product.product_id] = currentIndex - 1;
  }
};

// Скидаємо на перше фото, коли мишка йде з картки (опціонально, але красиво)
const resetImage = (productId) => {
  if (imageIndices.value[productId]) {
    imageIndices.value[productId] = 0;
  }
};
// -----------------------

const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/products`);
    products.value = response.data;
  } catch (error) {
    console.error("Помилка отримання товарів:", error);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await axios.get(`/api/categories`);
    categoriesList.value = response.data;
  } catch (error) {
    console.error("Помилка отримання категорій:", error);
  }
};

onMounted(async () => {
  await fetchProducts();
  await fetchCategories();
  checkUrlForCategory();
});

const checkUrlForCategory = () => {
  if (route.query.category) {
    selectedCategory.value = route.query.category;
  } else {
    selectedCategory.value = '';
  }
};

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const categoryName = product.category ? product.category.category_name : 'Інше';
    const matchesCategory = selectedCategory.value === '' || categoryName === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory || '';
});

const formatPrice = (price) => {
  return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const addToCart = (product) => {
  cartStore.addToCart(product);
};
</script>

<style scoped>
/* --- Основний контейнер --- */
.market-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Georgia', serif;
  color: #2c3e50;
}

/* --- Хедер --- */
.market-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-title {
  font-size: 36px;
  margin-bottom: 30px;
  position: relative;
  display: inline-block;
}
.page-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background-color: #d4af37;
  margin: 15px auto 0;
}

.controls-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-input, .category-select {
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 0;
  font-size: 16px;
  font-family: 'Georgia', serif;
  min-width: 250px;
  background: #fff;
}

.search-input:focus, .category-select:focus {
  outline: none;
  border-color: #d4af37;
}

/* --- Сітка --- */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 40px;
}

/* --- Картка товару --- */
.product-card {
  background: #fff;
  border: 1px solid #eee;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  border-color: #d4af37;
}

.image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
  background: #f9f9f9;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Забираємо scale тут, щоб не конфліктувало з перемиканням,
     але можна залишити якщо подобається */
  transition: opacity 0.3s ease-in-out;
}

/* --- Слайдер / Навігація --- */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  color: #2c3e50;
  width: 30px;
  height: 30px;
  cursor: pointer;
  z-index: 2;
  font-weight: bold;
  opacity: 0; /* Приховані за замовчуванням */
  transition: opacity 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Круглі кнопки */
}

.product-card:hover .nav-btn {
  opacity: 1; /* Показуємо при наведенні на картку */
}

.nav-btn:hover {
  background: #d4af37;
  color: white;
}

.prev { left: 10px; }
.next { right: 10px; }

.img-counter {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.product-card:hover .img-counter {
  opacity: 1;
}

/* --- Статуси --- */
.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  font-size: 12px;
  text-transform: uppercase;
  color: white;
  font-weight: bold;
  z-index: 3; /* Поверх стрілок */
}
.sold { background-color: #c0392b; }
.reserved { background-color: #f39c12; }

/* --- Інфо картки --- */
.card-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.category-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.product-name {
  margin: 0 0 15px;
  font-size: 18px;
  font-weight: normal;
  line-height: 1.4;
}

.product-name a {
  text-decoration: none;
  color: #2c3e50;
  transition: color 0.2s;
}
.product-name a:hover { color: #d4af37; }

.bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 20px;
  font-weight: bold;
}

.btn-icon {
  background: #2c3e50;
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-icon:hover { background: #d4af37; }

/* --- Стани --- */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: #888;
  font-size: 18px;
}
</style>