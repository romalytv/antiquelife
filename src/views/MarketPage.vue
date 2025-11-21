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
          <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
    </header>

    <div class="products-grid" v-if="products.length > 0">
      <div
          v-for="product in filteredProducts"
          :key="product.productId || product.product_id"
          class="product-card"
      >
        <div class="image-container">
          <router-link :to="{ name: 'Item', params: { id: product.productId || product.product_id }}">
            <img :src="product.image_path" :alt="product.name" loading="lazy" />
          </router-link>

          <span v-if="product.status === 'sold'" class="status-badge sold">Продано</span>
          <span v-else-if="product.status === 'reserved'" class="status-badge reserved">Резерв</span>
        </div>

        <div class="card-info">
      <span class="category-label">
        {{ product.category ? product.category.categoryName : 'Інше' }}
      </span>

          <h3 class="product-name">
            <router-link :to="{ name: 'Item', params: { id: product.productId || product.product_id }}">
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// Стан
const products = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');

// 1. Завантаження даних з Spring Boot
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost:8080/api/products');
    products.value = response.data;
  } catch (error) {
    console.error("Помилка отримання товарів:", error);
    alert("Сервер не відповідає. Перевірте, чи запущено Spring Boot.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

// 2. Логіка фільтрації
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    // Пошук по назві
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());

    // Фільтр по категорії (перевіряємо назву категорії з вкладеного об'єкта)
    const categoryName = product.category ? product.category.categoryName : 'Інше';
    const matchesCategory = selectedCategory.value === '' || categoryName === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});

// 3. Автоматично збираємо список категорій з того, що є в товарах
const uniqueCategories = computed(() => {
  const categories = products.value
      .map(p => p.category ? p.category.categoryName : 'Інше')
      .filter((v, i, a) => a.indexOf(v) === i); // Залишаємо тільки унікальні
  return categories;
});

// 4. Форматування
const formatPrice = (price) => {
  return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const addToCart = (product) => {
  console.log("Додано:", product.name);
  // Тут буде логіка кошика
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
  background-color: #d4af37; /* Золото */
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
  border-radius: 0; /* Квадратні кути для вінтажного стилю */
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
  transition: transform 0.5s;
}

.product-card:hover .image-container img {
  transform: scale(1.05);
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  font-size: 12px;
  text-transform: uppercase;
  color: white;
  font-weight: bold;
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