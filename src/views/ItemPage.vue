<template>
  <div class="page-wrapper">
    <div v-if="!product" class="loading-screen">
      <div class="loader"></div>
      <p>Завантаження експонату...</p>
    </div>

    <div v-else class="item-container">

      <nav class="breadcrumbs">
        <span @click="router.push('/market')" class="crumb-link">Каталог</span>
        <span class="separator">/</span>
        <span class="crumb-static">{{ product.category?.categoryName || 'Антикваріат' }}</span>
        <template v-if="product.subCategory">
          <span class="separator">/</span>
          <span class="crumb-active">{{ product.subCategory.name }}</span>
        </template>
      </nav>

      <div class="content-split">

        <div class="image-section">
          <div class="main-image-frame" :class="{ 'frame-sold': product.status === 'SOLD' }">
            <img
                :src="selectedImage || '/placeholder.png'"
                :alt="product.name"
                class="main-img"
                :class="{ 'img-grayscale': product.status === 'SOLD' }"
            />

            <div v-if="product.status === 'SOLD'" class="stamp-overlay">SOLD</div>
            <div v-if="product.status === 'RESERVED'" class="stamp-overlay reserved">RESERVED</div>
          </div>

          <div v-if="product.imageUrls && product.imageUrls.length > 1" class="thumbnails-grid">
            <div
                v-for="(img, index) in product.imageUrls"
                :key="index"
                class="thumb-wrapper"
                :class="{ active: selectedImage === img }"
                @click="selectedImage = img"
            >
              <img :src="img" class="thumb-img" />
            </div>
          </div>
        </div>

        <div class="info-section">

          <div class="header-block">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="price-wrapper">
              <span class="price" :class="{ 'price-muted': product.status !== 'AVAILABLE' }">
                {{ formatPrice(product.price) }} ₴
              </span>
            </div>
          </div>

          <div class="status-block">
            <span :class="['status-badge', getStatusClass(product.status)]">
              {{ translateStatus(product.status) }}
            </span>
          </div>

          <div class="divider"></div>

          <div class="specs-grid">
            <div class="spec-item" v-if="product.epoch">
              <span class="spec-label">Епоха</span>
              <span class="spec-value">{{ product.epoch }}</span>
            </div>
            <div class="spec-item" v-if="product.origin">
              <span class="spec-label">Походження</span>
              <span class="spec-value">{{ product.origin }}</span>
            </div>
            <div class="spec-item" v-if="product.dimensions">
              <span class="spec-label">Розміри</span>
              <span class="spec-value">{{ product.dimensions }}</span>
            </div>

            <div class="spec-item" v-if="product.brand">
              <span class="spec-label">Мануфактура</span>
              <span class="spec-value">{{ product.brand }}</span>
            </div>
            <div class="spec-item" v-if="product.material">
              <span class="spec-label">Матеріал</span>
              <span class="spec-value">{{ product.material }}</span>
            </div>
            <div class="spec-item" v-if="product.color">
              <span class="spec-label">Колір</span>
              <span class="spec-value">{{ product.color }}</span>
            </div>
          </div>

          <div class="description-box" v-if="product.description">
            <h3>Опис</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="action-area">
            <button
                class="btn-main"
                :class="getActionBtnClass(product.status)"
                :disabled="product.status !== 'AVAILABLE' || isAddedAnim"
                @click="addToCart"
            >
              <span v-if="isAddedAnim">У кошику ✔️</span>
              <span v-else>{{ getActionBtnText(product.status) }}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
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
const isAddedAnim = ref(false); // Для анімації кнопки

onMounted(async () => {
  try {
    const id = route.params.id;
    const response = await axios.get(`/api/products/${id}`);
    product.value = response.data;

    // Ставимо перше фото як головне
    if (product.value.imageUrls && product.value.imageUrls.length > 0) {
      selectedImage.value = product.value.imageUrls[0];
    }
  } catch (error) {
    console.error("Помилка:", error);
    // Якщо помилка, можна перекинути в каталог
    // router.push('/market');
  }
});

const formatPrice = (price) => price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const translateStatus = (status) => {
  const map = { 'AVAILABLE': 'В наявності', 'RESERVED': 'В резерві', 'SOLD': 'Продано' };
  return map[status] || status;
};

const getStatusClass = (status) => {
  if (status === 'AVAILABLE') return 'badge-available';
  if (status === 'RESERVED') return 'badge-reserved';
  if (status === 'SOLD') return 'badge-sold';
  return '';
};

const getActionBtnText = (status) => {
  if (status === 'AVAILABLE') return 'Додати в кошик';
  if (status === 'RESERVED') return 'В резерві';
  if (status === 'SOLD') return 'Продано';
  return 'Недоступно';
};

const getActionBtnClass = (status) => {
  if (status === 'AVAILABLE') return 'btn-buy';
  if (status === 'RESERVED') return 'btn-disabled';
  if (status === 'SOLD') return 'btn-disabled';
};

const addToCart = () => {
  if (product.value && product.value.status === 'AVAILABLE') {
    cartStore.addToCart(product.value);

    // Анімація успіху
    isAddedAnim.value = true;
    setTimeout(() => {
      isAddedAnim.value = false;
    }, 2000);
  }
};
</script>

<style scoped>
/* --- ЗАГАЛЬНІ СТИЛІ --- */
.page-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Georgia', serif;
  color: #2c3e50;
}

/* Хлібні крихти */
.breadcrumbs {
  margin-bottom: 30px;
  font-size: 0.95rem;
  color: #7f8c8d;
  font-family: 'Helvetica Neue', sans-serif;
}
.crumb-link {
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: all 0.2s;
}
.crumb-link:hover {
  color: #b8860b;
  border-bottom-color: #b8860b;
}
.separator { margin: 0 10px; color: #ccc; }
.crumb-static { color: #2c3e50; }
.crumb-active { color: #b8860b; font-weight: bold; }

/* Сітка контенту */
.content-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
}

/* --- ФОТО --- */
.image-section { display: flex; flex-direction: column; gap: 20px; }

.main-image-frame {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Квадрат 1:1 */
  background: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.main-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: contain; /* Або cover, щоб заповнити все */
  transition: all 0.5s ease;
}

.img-grayscale { filter: grayscale(100%) contrast(1.2); opacity: 0.7; }

.stamp-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  border: 4px solid #c0392b;
  color: #c0392b;
  font-size: 3rem;
  font-weight: bold;
  padding: 10px 30px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  pointer-events: none;
}
.stamp-overlay.reserved { border-color: #e67e22; color: #e67e22; }

/* Мініатюри */
.thumbnails-grid {
  display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;
}
.thumb-wrapper {
  width: 70px; height: 70px;
  flex-shrink: 0;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.thumb-wrapper.active { border-color: #b8860b; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }

/* --- ІНФО --- */
.product-title {
  font-size: 2.2rem;
  font-weight: normal;
  margin: 0 0 15px 0;
  line-height: 1.2;
}
.price-wrapper { margin-bottom: 15px; }
.price { font-size: 2rem; font-weight: bold; color: #2c3e50; font-family: 'Helvetica Neue', sans-serif; }
.price-muted { color: #95a5a6; text-decoration: line-through; font-size: 1.5rem; }

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  font-family: sans-serif;
  font-weight: 600;
}
.badge-available { background: #e8f5e9; color: #27ae60; }
.badge-reserved { background: #fff3e0; color: #e67e22; }
.badge-sold { background: #f2f2f2; color: #7f8c8d; }

.divider { height: 1px; background: #ecf0f1; margin: 25px 0; }

/* Характеристики */
.specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Дві колонки */
  gap: 15px 30px;
  margin-bottom: 30px;
}
.spec-item { display: flex; flex-direction: column; }
.spec-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #95a5a6;
  margin-bottom: 4px;
  font-family: sans-serif;
}
.spec-value { font-size: 1.05rem; font-weight: 500; }

.description-box h3 {
  font-size: 1.1rem;
  border-bottom: 2px solid #b8860b;
  display: inline-block;
  margin-bottom: 15px;
  padding-bottom: 5px;
  color: #b8860b;
}
.description-box p { line-height: 1.6; color: #555; }

/* Кнопка */
.btn-main {
  width: 100%;
  padding: 18px;
  margin-top: 30px;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: background 0.3s;
}
.btn-buy { background: #2c3e50; color: white; }
.btn-buy:hover { background: #b8860b; }
.btn-disabled { background: #ecf0f1; color: #95a5a6; cursor: not-allowed; }

/* Мобільна адаптація */
@media (max-width: 768px) {
  .content-split { grid-template-columns: 1fr; gap: 30px; }
  .product-title { font-size: 1.8rem; }
  .specs-grid { grid-template-columns: 1fr; }
}

/* Лоадер */
.loading-screen {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 50vh; color: #7f8c8d;
}
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #b8860b;
  border-radius: 50%;
  width: 40px; height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>