<template>
  <div class="item-container" v-if="product">

    <button @click="goBack" class="back-link">
      ← Повернутися до каталогу
    </button>

    <div class="content-wrapper">
      <div class="image-section">
        <div class="image-frame" :class="{ 'frame-sold': product.status === 'SOLD' }">
          <img
              :src="selectedImage || '/placeholder.png'"
              :alt="product.name"
              class="main-img"
              :class="{ 'img-grayscale': product.status === 'SOLD' }"
          />
          <div v-if="product.status === 'SOLD'" class="stamp-overlay">SOLD</div>
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
          <span class="price" :class="{ 'price-muted': product.status === 'SOLD' }">
            {{ formatPrice(product.price) }} ₴
          </span>
        </div>

        <div class="status-block">
          <span :class="['status-tag', getStatusClass(product.status)]">
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
        </div>

        <div class="description-box">
          <h3>Опис предмета</h3>
          <p>{{ product.description }}</p>
        </div>

        <button
            class="btn-buy"
            :class="getActionBtnClass(product.status)"
            :disabled="product.status !== 'AVAILABLE'"
            @click="addToCart"
        >
          {{ getActionBtnText(product.status) }}
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

onMounted(async () => {
  try {
    const id = route.params.id;
    const response = await axios.get(`/api/products/${id}`);
    product.value = response.data;
    if (product.value.imageUrls && product.value.imageUrls.length > 0) {
      selectedImage.value = product.value.imageUrls[0];
    }
  } catch (error) {
    console.error("Помилка:", error);
    router.push('/market');
  }
});

const goBack = () => router.push('/market');
const formatPrice = (price) => price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Переклад статусів
const translateStatus = (status) => {
  const map = {
    'AVAILABLE': 'В наявності',
    'RESERVED': 'В резерві',
    'SOLD': 'Продано'
  };
  return map[status] || status;
};

// CSS класи для бейджів
const getStatusClass = (status) => {
  if (status === 'AVAILABLE') return 'status-available';
  if (status === 'RESERVED') return 'status-reserved';
  if (status === 'SOLD') return 'status-sold';
  return '';
};

// Текст кнопки
const getActionBtnText = (status) => {
  if (status === 'AVAILABLE') return 'Додати в кошик';
  if (status === 'RESERVED') return 'Товар зарезервовано';
  if (status === 'SOLD') return 'Продано';
  return 'Недоступно';
};

// Клас кнопки (щоб міняти колір)
const getActionBtnClass = (status) => {
  if (status === 'AVAILABLE') return ''; // Стандартний стиль
  if (status === 'RESERVED') return 'btn-reserved';
  if (status === 'SOLD') return 'btn-sold';
};

const addToCart = () => {
  if (product.value && product.value.status === 'AVAILABLE') {
    cartStore.addToCart(product.value);
    alert(`"${product.value.name}" додано в кошик!`);
  }
};
</script>

<style scoped>
/* Основні стилі залишаємо як були, додаємо нові для статусів */

.item-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; font-family: 'Georgia', serif; color: #2c3e50; }
.back-link { background: none; border: none; cursor: pointer; color: #888; margin-bottom: 30px; font-size: 16px; }
.content-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }

/* Фото */
.image-section { display: flex; flex-direction: column; gap: 15px; }
.image-frame { border-radius: 8px; overflow: hidden; background: #fff; border: 1px solid #eee; padding: 15px; position: relative; }

/* Ефекти для проданого товару */
.frame-sold { border-color: #eee; background: #fafafa; }
.img-grayscale { filter: grayscale(100%); opacity: 0.8; }

.stamp-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  font-size: 4rem;
  font-weight: bold;
  color: rgba(192, 57, 43, 0.6);
  border: 5px solid rgba(192, 57, 43, 0.6);
  padding: 10px 40px;
  text-transform: uppercase;
  pointer-events: none;
  font-family: sans-serif;
  z-index: 10;
}

.main-img { width: 100%; height: auto; display: block; }
.thumbnails { display: flex; gap: 10px; padding-bottom: 5px; }
.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; cursor: pointer; opacity: 0.7; border: 2px solid transparent; }
.thumb.active { border-color: #d4af37; opacity: 1; }

/* Інфо */
.category-badge { text-transform: uppercase; font-size: 12px; color: #d4af37; font-weight: bold; }
.product-title { font-size: 36px; margin: 10px 0 20px; font-weight: normal; }
.price { font-size: 32px; font-weight: bold; }
.price-muted { color: #999; text-decoration: line-through; font-size: 24px; }

/* СТАТУСИ - КОЛЬОРИ */
.status-block { margin-top: 15px; }
.status-tag { padding: 6px 16px; border-radius: 4px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: inline-block; }

.status-available { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.status-reserved { background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; } /* Помаранчевий */
.status-sold { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; } /* Червоний */

.divider { height: 1px; background: #eee; margin: 25px 0; }
.specs-list .spec-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #ddd; padding-bottom: 5px; }
.label { font-weight: bold; color: #555; }
.description-box { margin-top: 20px; }
.description-box h3 { color: #d4af37; border-bottom: 2px solid #d4af37; display: inline-block; padding-bottom: 5px; margin-bottom: 15px; }
.description-box p { line-height: 1.6; color: #444; }

/* КНОПКА */
.btn-buy {
  margin-top: 30px; width: 100%; padding: 18px;
  background-color: #2c3e50; color: white;
  font-size: 18px; text-transform: uppercase;
  border: none; cursor: pointer; transition: 0.3s;
}
.btn-buy:hover { background-color: #d4af37; }

/* Стилі для неактивних кнопок */
.btn-buy:disabled { cursor: not-allowed; opacity: 0.8; }
.btn-reserved { background-color: #f39c12; color: #fff; border: 1px solid #e67e22; }
.btn-reserved:hover { background-color: #f39c12; } /* Не змінюється при ховері */

.btn-sold { background-color: #e0e0e0; color: #999; border: 1px solid #ccc; }
.btn-sold:hover { background-color: #e0e0e0; }

@media (max-width: 800px) { .content-wrapper { grid-template-columns: 1fr; } }
</style>