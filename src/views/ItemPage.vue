<template>
  <div class="item-container" v-if="product">

    <button @click="goBack" class="back-link">
      ← Повернутися до каталогу
    </button>

    <div class="content-wrapper">

      <div class="image-section">
        <div class="image-frame">
          <img
              :src="selectedImage || '/placeholder.png'"
              :alt="product.name"
              class="main-img"
          />
        </div>

        <div v-if="product.imageUrls && product.imageUrls.length > 1" class="thumbnails">
          <img
              v-for="(img, index) in product.imageUrls"
              :key="index"
              :src="img"
              class="thumb"
              :class="{ active: selectedImage === img }"
              @click="selectedImage = img"
          />
        </div>
      </div>

      <div class="info-section">

        <span class="category-badge">
          {{ product.category ? product.category.categoryName : 'Антикваріат' }}
        </span>

        <h1 class="product-title">{{ product.name }}</h1>

        <div class="price-block">
          <span class="price">{{ formatPrice(product.price) }} ₴</span>
        </div>

        <div class="status-block">
          <span :class="['status-tag', product.status === 'AVAILABLE' ? 'status-green' : 'status-gray']">
            {{ translateStatus(product.status) }}
          </span>
        </div>

        <div class="divider"></div>

        <div class="specs-list">
          <div class="spec-row">
            <span class="label">Епоха:</span>
            <span class="value">{{ product.epoch }}</span>
          </div>
          <div class="spec-row">
            <span class="label">Походження:</span>
            <span class="value">{{ product.origin }}</span>
          </div>
          <div class="spec-row">
            <span class="label">Артикул:</span>
            <span class="value id-text">{{ product.product_id }}</span>
          </div>
          <div class="spec-row">
            <span class="label">Кількість на складі:</span>
            <span class="value id-text">{{ product.quantity }}</span>
          </div>
        </div>

        <div class="description-box">
          <h3>Опис предмета</h3>
          <p>{{ product.description }}</p>
        </div>

        <button
            class="btn-buy"
            :disabled="product.status !== 'AVAILABLE'"
            @click="addToCart"
        >
          {{ product.status === 'AVAILABLE' ? 'Додати в кошик' : 'Немає в наявності' }}
        </button>

      </div>
    </div>
  </div>

  <div v-else class="loading-screen">
    <div class="loader"></div>
    <p>Завантаження експонату...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const product = ref(null);
const selectedImage = ref('');
const cartStore = useCartStore();

// 1. Завантаження даних
onMounted(async () => {
  try {
    const id = route.params.id; // Отримуємо UUID з URL
    const response = await axios.get(`/api/products/${id}`);
    product.value = response.data;
    if (product.value.imageUrls && product.value.imageUrls.length > 0) {
      selectedImage.value = product.value.imageUrls[0];
    }
  } catch (error) {
    console.error("Помилка завантаження:", error);
    alert("Не вдалося знайти цей товар.");
    router.push('/market'); // Якщо помилка — вертаємо в каталог
  }
});

// 2. Допоміжні функції
const goBack = () => router.push('/market');

const formatPrice = (price) => {
  // Робить "10 000" замість "10000"
  return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const translateStatus = (status) => {
  const map = {
    'AVAILABLE': 'В наявності',
    'SOLD': 'Продано',
    'RESERVED': 'В резерві'
  };
  return map[status] || status;
};

const addToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value); // Додаємо в Pinia
    alert(`Товар "${product.value.name}" успішно додано в кошик!`);
  }
};
</script>

<style scoped>
/* Стилі "Antique Life" */
.item-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Georgia', serif;
  color: #2c3e50;
}

.back-link {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 16px;
  margin-bottom: 30px;
  transition: color 0.3s;
}
.back-link:hover { color: #d4af37; }

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Дві рівні колонки */
  gap: 60px;
}

.image-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.image-frame {
  width: 100%;

  border-radius: 8px;
  overflow: hidden;
  background: #f9f9f9;
  border: 1px solid #eee;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Щоб фото не обрізалось */
}

/* Мініатюри */
.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto; /* Скрол, якщо багато фото */
  padding-bottom: 5px;
}

.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.7;
  transition: all 0.2s;
}

.thumb:hover { opacity: 1; }

.thumb.active {
  border-color: #3b82f6; /* Синя рамка для активного */
  opacity: 1;
}

/* Фото */
.image-frame {
  border: 1px solid #eee;
  padding: 15px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}
.image-frame img {
  width: 100%;
  height: auto;
  display: block;
}

/* Інфо */
.category-badge {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1px;
  color: #d4af37;
  font-weight: bold;
}

.product-title {
  font-size: 36px;
  margin: 10px 0 20px;
  line-height: 1.2;
  font-weight: normal;
}

.price {
  font-size: 32px;
  font-weight: bold;
}

.status-block { margin-top: 10px; }
.status-tag {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-family: sans-serif;
}
.status-green { background: #e8f5e9; color: #2e7d32; }
.status-gray { background: #eee; color: #666; }

.divider {
  height: 1px;
  background: #eee;
  margin: 25px 0;
}

.specs-list .spec-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px dashed #ddd;
  padding-bottom: 5px;
}

.label { font-weight: bold; color: #555; }
.value { color: #333; }
.id-text { font-size: 12px; color: #999; font-family: monospace; }

.description-box h3 {
  font-size: 18px;
  color: #d4af37;
  border-bottom: 2px solid #d4af37;
  display: inline-block;
  padding-bottom: 5px;
  margin-bottom: 15px;
}
.description-box p {
  line-height: 1.6;
  color: #444;
}

.btn-buy {
  margin-top: 30px;
  width: 100%;
  padding: 18px;
  background-color: #2c3e50;
  color: white;
  font-size: 18px;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-buy:hover { background-color: #d4af37; }
.btn-buy:disabled { background-color: #ccc; cursor: not-allowed; }

/* Лоадер по центру */
.loading-screen {
  text-align: center;
  margin-top: 100px;
  font-family: sans-serif;
  color: #888;
}

/* Адаптивність */
@media (max-width: 800px) {
  .content-wrapper { grid-template-columns: 1fr; }
}
</style>