<template>
  <section class="products-showcase">

    <div class="product-header">
      <h2>Нові Надходження</h2>
      <span class="decorative-line"></span>
    </div>

    <div class="products-widget-wrapper">
      <div v-if="loading" style="text-align:center; padding: 20px;">
        Завантаження...
      </div>

      <div v-else-if="products.length === 0" style="text-align:center; padding: 20px;">
        Поки що немає нових надходжень
      </div>

      <div v-else class="products-grid">
        <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
        >
          <div class="image-wrapper">
            <img
                :src="getProductImage(product)"
                :alt="product.name"
                loading="lazy"
            />
            <span class="new-badge">New</span>
          </div>

          <div class="product-info">
            <h3 class="product-title">{{ truncate(product.name, 25) }}</h3>
            <p class="product-price">{{ product.price }} ₴</p>
            <button class="btn-details">Детальніше</button>
          </div>
        </div>
      </div>

      <div class="view-all-container">
        <button class="btn-primary" @click="goToCatalog">Дивитись каталог</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Переконайся, що axios встановлено

const router = useRouter();
const products = ref([]);
const loading = ref(true);

// URL твого бекенду (налаштуй під себе, якщо він інший)
// Краще винести це в .env файл, але поки хардкодимо для тесту
const API_URL = 'http://localhost:8080/api/products';

const fetchLatestProducts = async () => {
  try {
    loading.value = true;
    // Звертаємось до нашого нового ендпоінту
    const response = await axios.get(`${API_URL}/latest`);

    // Мапимо дані з бекенду під структуру фронтенду
    products.value = response.data.map(item => ({
      id: item.product_id, // UUID з беку
      name: item.name,
      price: item.price,
      // Беремо список картинок
      imageUrls: item.imageUrls || []
    }));
  } catch (error) {
    console.error('Помилка завантаження товарів:', error);
  } finally {
    loading.value = false;
  }
};

// Допоміжна функція для вибору картинки
const getProductImage = (product) => {
  if (product.imageUrls && product.imageUrls.length > 0) {
    return product.imageUrls[0]; // Беремо першу картинку
  }
  // Картинка-заглушка, якщо фото немає
  return 'https://placehold.co/400x500/fdfaf3/4a3f35?text=No+Image';
};

// Обрізка довгих назв
const truncate = (text, length) => {
  if(!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

const goToProduct = (id) => {
  router.push(`/product/${id}`);
};

const goToCatalog = () => {
  router.push('/market');
}

onMounted(() => {
  fetchLatestProducts();
});
</script>

<style scoped>
/* Стилі вже прописані в main.css, тому тут пусто */
</style>