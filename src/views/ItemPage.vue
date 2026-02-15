<template>
  <div class="page-wrapper">
    <div v-if="!product" class="loading-screen">
      <div class="loader"></div>
      <p>Завантаження експонату...</p>
    </div>

    <div v-else class="item-container">

      <nav class="breadcrumbs">
        <span @click="router.push('/market')" class="crumb-link">Каталог</span>

        <template v-if="product.category">
          <span class="separator">/</span>
          <span
              @click="router.push({ path: '/market', query: { category: product.category.category_name } })"
              class="crumb-link"
          >
            {{ product.category.category_name }}
          </span>
        </template>

        <template v-if="product.subCategory">
          <span class="separator">/</span>
          <span
              @click="router.push({ path: '/market', query: { category: product.category?.category_name, subcategory: product.subCategory.name } })"
              class="crumb-link"
          >
            {{ product.subCategory.name }}
          </span>
        </template>
      </nav>

      <div class="content-split">

        <div class="image-section">
          <div
              class="main-image-frame"
              :class="{ 'frame-sold': product.status === 'SOLD' }"
              @touchstart="handleTouchStart"
              @touchend="handleTouchEnd"
          >
            <img
                :src="selectedImage || '/placeholder.png'"
                :alt="product.name"
                class="main-img"
                :class="{ 'img-grayscale': product.status === 'SOLD' }"
            />

            <template v-if="product.imageUrls && product.imageUrls.length > 1">
              <button class="slider-arrow arrow-left" @click="prevImage">&#10094;</button>
              <button class="slider-arrow arrow-right" @click="nextImage">&#10095;</button>
            </template>

            <div v-if="product.status === 'SOLD'" class="stamp-overlay">SOLD</div>
            <div v-if="product.status === 'RESERVED'" class="stamp-overlay reserved">RESERVED</div>
          </div>

          <div class="mobile-dots" v-if="product.imageUrls && product.imageUrls.length > 1">
            <span
                v-for="(img, index) in product.imageUrls"
                :key="index"
                class="dot"
                :class="{ active: selectedImage === img }"
                @click="selectedImage = img"
            ></span>
          </div>

          <div v-if="product.imageUrls && product.imageUrls.length > 1" class="thumbnails-grid" ref="thumbGrid" @mousedown="startDrag" @mouseleave="stopDrag" @mouseup="stopDrag" @mousemove="onDrag">
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

          <h1 class="product-title">{{ product.name }}</h1>

          <div class="status-price-row">
            <span :class="['status-badge', getStatusClass(product.status)]">
              {{ translateStatus(product.status) }}
            </span>
            <span class="price" :class="{ 'price-muted': product.status !== 'AVAILABLE' }">
              {{ formatPrice(product.price) }} ₴
            </span>
          </div>

          <div class="action-area">

            <div class="stock-info" v-if="product.status === 'AVAILABLE' && product.quantity > 1">
              Доступно на складі: <strong>{{ product.quantity }}</strong> шт.
            </div>

            <div class="quantity-selector" v-if="product.status === 'AVAILABLE' && product.quantity > 1">
              <button class="qty-btn" @click="decreaseQty" :disabled="selectedQuantity <= 1">-</button>
              <span class="qty-value">{{ selectedQuantity }}</span>
              <button class="qty-btn" @click="increaseQty" :disabled="selectedQuantity >= product.quantity">+</button>
            </div>

            <button
                class="btn-main"
                :class="getActionBtnClass(product.status)"
                :disabled="product.status !== 'AVAILABLE' || isAddedAnim"
                @click="addToCart"
            >
              <span v-if="isAddedAnim">У кошику ✔️</span>
              <span v-else>{{ getActionBtnText(product.status) }} <template v-if="product.quantity > 1">({{ selectedQuantity }} шт.)</template></span>
            </button>

          </div>

          <h2 class="section-cursive-title">Технічні характеристики</h2>

          <div class="specs-list">
            <div class="spec-item" v-if="product.origin">
              <span class="spec-label">Походження:</span>
              <span class="spec-value">{{ product.origin }}</span>
            </div>
            <div class="spec-item" v-if="product.epoch">
              <span class="spec-label">Епоха:</span>
              <span class="spec-value">{{ product.epoch }}</span>
            </div>
            <div class="spec-item" v-if="product.dimensions">
              <span class="spec-label">Розміри:</span>
              <span class="spec-value">{{ product.dimensions }}</span>
            </div>
            <div class="spec-item" v-if="product.material">
              <span class="spec-label">Матеріал:</span>
              <span class="spec-value">{{ product.material }}</span>
            </div>
            <div class="spec-item" v-if="product.brand">
              <span class="spec-label">Бренд:</span>
              <span class="spec-value">{{ product.brand }}</span>
            </div>
            <div class="spec-item" v-if="product.color">
              <span class="spec-label">Колір:</span>
              <span class="spec-value">{{ product.color }}</span>
            </div>
          </div>

          <div v-if="product.description" class="description-section">
            <h2 class="section-cursive-title">Опис предмета</h2>
            <div class="description-box" v-html="product.description">
            </div>
          </div>

        </div>
      </div>

      <div v-if="recommendedProducts.length > 0" class="recommendations-section">
        <h2 class="section-cursive-title">Рекомендовані товари</h2>

        <div class="rec-grid">
          <div
              v-for="rec in recommendedProducts"
              :key="rec.id"
              class="rec-card"
              @click="goToProduct(rec.id)"
          >
            <div class="rec-img-wrapper">
              <img :src="rec.imageUrls?.[0] || '/placeholder.png'" :alt="rec.name" class="rec-img" />
            </div>
            <h3 class="rec-title">{{ rec.name }}</h3>
            <div class="rec-price">{{ formatPrice(rec.price) }} ₴</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// Залишаємо дужки порожніми, щоб VS Code не сварився на "null"
const product = ref();
const selectedImage = ref('');
const cartStore = useCartStore();
const isAddedAnim = ref(false);
const selectedQuantity = ref(1);
const recommendedProducts = ref([]);

const fetchProductData = async (id) => {
  try {
    const response = await axios.get(`/api/products/${id}`);
    product.value = response.data;

    if (product.value.imageUrls && product.value.imageUrls.length > 0) {
      selectedImage.value = product.value.imageUrls[0];
    } else {
      selectedImage.value = '';
    }

    selectedQuantity.value = 1;
    fetchRecommendations();
  } catch (error) {
    console.error("Помилка:", error);
  }
};

const fetchRecommendations = async () => {
  try {
    // Беремо всі товари
    const res = await axios.get('/api/products');

    // Дізнаємося категорію поточного товару
    const currentCategory = product.value?.category?.category_name;
    const currentProductId = product.value?.product_id;

    recommendedProducts.value = res.data
        // 1. Залишаємо ТІЛЬКИ товари з такою ж категорією
        .filter((p) => p.category?.category_name === currentCategory)
        // 2. Викидаємо поточний товар (щоб не рекомендувати те, що людина вже дивиться)
        .filter((p) => p.product_id !== currentProductId)
        // 3. (Якщо бекенд не сортує, можна додати .reverse() або сортування по даті тут)
        // 4. Беремо 4 штуки
        .slice(0, 4);

  } catch (error) {
    console.error("Помилка завантаження рекомендацій:", error);
  }
};

onMounted(() => {
  fetchProductData(route.params.id);
});

watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        product.value = null; // Тимчасово обнуляємо для показу лоадера
        fetchProductData(newId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
);

// Переходимо на сторінку конкретного товару
const goToProduct = (id) => {
  router.push(`/product/${id}`);
};

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

const increaseQty = () => {
  if (product.value && selectedQuantity.value < product.value.quantity) {
    selectedQuantity.value++;
  }
};

const decreaseQty = () => {
  if (selectedQuantity.value > 1) {
    selectedQuantity.value--;
  }
};

const addToCart = () => {
  if (product.value && product.value.status === 'AVAILABLE') {
    cartStore.addToCart(product.value, selectedQuantity.value);

    isAddedAnim.value = true;
    setTimeout(() => {
      isAddedAnim.value = false;
    }, 2000);
  }
};

const nextImage = () => {
  if (!product.value?.imageUrls || product.value.imageUrls.length <= 1) return;
  const currentIndex = product.value.imageUrls.indexOf(selectedImage.value);
  let nextIndex = currentIndex + 1;
  // Якщо дійшли до кінця - повертаємося на перше фото
  if (nextIndex >= product.value.imageUrls.length) {
    nextIndex = 0;
  }
  selectedImage.value = product.value.imageUrls[nextIndex];
};

const prevImage = () => {
  if (!product.value?.imageUrls || product.value.imageUrls.length <= 1) return;
  const currentIndex = product.value.imageUrls.indexOf(selectedImage.value);
  let prevIndex = currentIndex - 1;
  // Якщо ми на першому фото - переходимо на останнє
  if (prevIndex < 0) {
    prevIndex = product.value.imageUrls.length - 1;
  }
  selectedImage.value = product.value.imageUrls[prevIndex];
};

// --- Логіка свайпів для мобільних пристроїв ---
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
};

const handleSwipeGesture = () => {
  // Якщо користувач провів пальцем вліво більше ніж на 50px
  if (touchEndX < touchStartX - 50) {
    nextImage();
  }
  // Якщо користувач провів пальцем вправо більше ніж на 50px
  if (touchEndX > touchStartX + 50) {
    prevImage();
  }
};
</script>

<style scoped>
/* --- СТРІЛОЧКИ СЛАЙДЕРА --- */
.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #eaeaea;
  border-radius: 50%;
  color: #333;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10; /* Щоб завжди бути поверх картинки */
}

.slider-arrow:hover {
  background: rgba(255, 255, 255, 1);
  color: #061c0b; /* Темно-зелений колір вашого дизайну */
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.arrow-left {
  left: 15px;
}

.arrow-right {
  right: 15px;
}

/* --- ЗАГАЛЬНІ СТИЛІ --- */
.page-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Palatino Linotype', 'Times New Roman', serif;
  color: #1a1a1a;
  min-height: 100vh;
}

/* Хлібні крихти */
.breadcrumbs {
  margin-bottom: 30px;
  font-size: 0.9rem;
  color: #888;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
.crumb-link {
  cursor: pointer;
  transition: color 0.2s;
}
.crumb-link:hover { color: #071a0b; }
.separator { margin: 0 8px; color: #ccc; }
.crumb-static { color: #555; }
.crumb-active { color: #071a0b; }

/* Сітка контенту */
.content-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

/* --- ФОТО --- */
.image-section { display: flex; flex-direction: column; gap: 15px; }

.main-image-frame {
  position: relative;
  width: 100%;
  padding-top: 120%; /* Трохи витягнутий прямокутник для дзеркал */
  background: #fff;
  overflow: hidden;
  border: 1px solid #eaeaea;
}

.main-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
}

.img-grayscale { filter: grayscale(100%) contrast(1.1); opacity: 0.8; }

.stamp-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  border: 3px solid #8b0000;
  color: #8b0000;
  font-size: 2.5rem;
  font-weight: bold;
  padding: 10px 25px;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.9);
  pointer-events: none;
}
.stamp-overlay.reserved { border-color: #b8860b; color: #b8860b; }

/* Мініатюри */
.thumbnails-grid {
  display: flex;
  flex-wrap: wrap; /* Додаємо це, щоб мініатюри падали в наступний ряд */
  gap: 10px;
  padding-bottom: 5px;
  /* overflow-x: auto; - ПРИБИРАЄМО ЦЕ */
}
.thumb-wrapper {
  width: 80px; height: 80px;
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid #eaeaea;
  transition: border-color 0.2s;
}
.thumb-wrapper.active { border-color: #071a0b; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }

/* --- КРАПОЧКИ ДЛЯ МОБІЛЬНОГО --- */
.mobile-dots {
  display: none; /* На комп'ютері ховаємо */
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #d1d1d1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  background-color: #061c0b; /* Темно-зелений */
  transform: scale(1.3); /* Трохи збільшуємо активну крапку */
}

/* --- ІНФО --- */
.product-title {
  font-size: 1.6rem;
  font-weight: normal;
  margin: 0 0 30px 0;
  line-height: 1.4;
  color: #222;
  letter-spacing: 0.5px;
}

.status-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.price {
  font-size: 1.6rem;
  font-weight: bold;
  color: #111;
}
.price-muted { color: #95a5a6; text-decoration: line-through; font-size: 1.3rem; }

.status-badge {
  display: inline-block;
  padding: 8px 16px;
  font-size: 0.85rem;
  letter-spacing: 1px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
.badge-available { background: #061c0b; color: #fff; } /* Темно-зелений */
.badge-reserved { background: #d35400; color: #fff; }
.badge-sold { background: #7f8c8d; color: #fff; }

/* --- КНОПКИ ДІЙ ТА КІЛЬКОСТІ --- */
.action-area {
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Вирівнює все по лівому краю */
}

.stock-info {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 15px; /* Відступ вниз до лічильника */
}
.stock-info strong {
  color: #111;
}

.quantity-selector {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #1a1a1a; /* Тонка темна рамка як на скріншоті */
  height: 40px;
  border-radius: 4px;
  width: 120px; /* Фіксована ширина для лічильника */
  margin-bottom: 20px; /* Відступ вниз до великої кнопки */
  background-color: #fff;
}

.qty-btn {
  background: transparent;
  border: none;
  width: 35px;
  height: 100%;
  font-size: 1.2rem;
  color: #666; /* Світліший колір для мінуса/плюса */
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
  color: #111;
}
.qty-btn:disabled { color: #bdc3c7; cursor: not-allowed; }

.qty-value {
  flex: 1;
  text-align: center;
  font-size: 1rem;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #111;
}

.btn-main {
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  font-family: 'Georgia', serif;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: background 0.3s, opacity 0.3s;
}
.btn-buy { background: #061c0b; color: white; }
.btn-buy:hover { background: #0a2e12; }
.btn-disabled { background: #bdc3c7; color: #fff; cursor: not-allowed; }

/* --- ТЕКСТОВІ БЛОКИ ТА ХАРАКТЕРИСТИКИ --- */
.section-cursive-title {
  /* Елегантний рукописний шрифт */
  font-family: 'Snell Roundhand', 'Bickham Script Pro', 'Brush Script MT', 'Great Vibes', cursive, serif;
  font-style: italic;
  font-size: 2.2rem;
  font-weight: normal;
  color: #333;
  margin-top: 0;
  margin-bottom: 25px;
  border-bottom: none;
}

.specs-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 50px;
}

.spec-item {
  display: flex;
  align-items: flex-start;
}

.spec-label {
  flex: 0 0 35%; /* Відступ зліва для назви характеристики */
  font-size: 1rem;
  color: #333;
}

.spec-value {
  flex: 1;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  font-size: 0.95rem;
  color: #777; /* Світло-сірий текст для значень */
  line-height: 1.5;
  letter-spacing: 0.3px;
}

/* Опис */
.description-section { margin-bottom: 40px; }

:deep(.description-box h3), :deep(.description-box h4), .description-box h3 {
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  font-weight: normal;
  color: #222;
  margin-top: 30px;
  margin-bottom: 15px;
}

/* Оновлені стилі для тексту опису (з Figma) */
:deep(.description-box), :deep(.description-box p), .description-box p {
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 14px;
  line-height: 120%; /* або 1.2 */
  letter-spacing: 0.09em; /* 9% від розміру шрифту */
  color: #333; /* Можете змінити колір на той, що в макеті, якщо він відрізняється */
  margin-bottom: 15px;
}

/* --- РЕКОМЕНДОВАНІ ТОВАРИ --- */
.recommendations-section {
  margin-top: 80px;
  padding-top: 40px;
}

.rec-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Робимо 4 колонки */
  gap: 20px;
  max-width: 100%; /* Розтягуємо на всю ширину сторінки */
}

.rec-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s ease;
}

.rec-card:hover {
  transform: translateY(-5px);
}

.rec-img-wrapper {
  width: 100%;
  padding-top: 130%; /* Пропорції картинки (витягнуті вертикально) */
  position: relative;
  background: #fff;
  border: 1px solid #eaeaea;
  margin-bottom: 15px;
  overflow: hidden;
}

.rec-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}

.rec-title {
  font-family: 'Georgia', serif;
  font-size: 1rem;
  font-weight: normal;
  color: #222;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.rec-price {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 1.05rem;
  color: #777;
}


/* Мобільна адаптація */
@media (max-width: 768px) {
  .recommendations-section {
    margin-top: 10px;
    padding-top: 0px;
  }
  /* Ховаємо хлібні крихти */
  .breadcrumbs {
    display: none;
  }

  /* Трохи зменшуємо відступ зверху, оскільки крихти зникли */
  .page-wrapper {
    padding-top: 0px;
  }

  /* Розтягуємо фото від краю до краю */
  .main-image-frame {
    margin-left: -20px;
    margin-right: -20px;
    width: calc(100% + 40px);
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }

  .content-split { grid-template-columns: 1fr; gap: 10px; }

  /* Трохи відсуваємо заголовок від фотографії */
  .product-title { font-size: 1.5rem; margin-bottom: 20px; margin-top: 10px; }

  .spec-label { flex: 0 0 45%; }
  .quantity-selector { align-self: stretch; width: auto; justify-content: space-between; }
  .qty-value { flex: 1; }

  /* Мобільні рекомендації */
  .rec-grid { grid-template-columns: repeat(2, 1fr); gap: 15px; max-width: 100%; }

  .slider-arrow {
    display: none;
  }
  .thumbnails-grid {
    display: none;
  }

  /* ПОКАЗУЄМО крапочки */
  .mobile-dots {
    display: flex;
  }
}

/* Лоадер */
.loading-screen {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 50vh; color: #7f8c8d;
}
.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #061c0b;
  border-radius: 50%;
  width: 40px; height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>