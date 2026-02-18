<template>
  <section class="products-showcase">
    <div class="product-header">
      <h2>{{ $t('home.newArrivals') }}</h2>
    </div>

    <div class="products-widget-wrapper">
      <div v-if="loading" class="status-message">{{ $t('home.loading') }}</div>

      <div v-else class="products-grid">
        <div
            v-for="product in displayedProducts"
            :key="product.id"
            class="product-card"
            @click="goToProduct(product.id)"
        >
          <div class="image-wrapper">
            <img :src="getProductImage(product)" :alt="getLocalizedText(product.name)" />
          </div>
          <div class="product-info">
            <h3 class="product-title">{{ getLocalizedText(product.name) }}</h3>
            <p class="product-price">{{ formatPrice(product.price) }} €</p>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination-container">
        <button
            v-for="page in totalPages"
            :key="page"
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="setPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <div class="view-all-container">
        <button class="btn-catalog" @click="$router.push($localPath('/market'))">
          {{ $t('home.viewCatalog') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // ДОДАНО
import axios from 'axios';

const router = useRouter();
const { t, locale } = useI18n(); // ДОДАНО
const products = ref([]);
const loading = ref(true);

const currentPage = ref(1);
const itemsPerPage = 8;

// --- ХЕЛПЕР ЛОКАЛІЗАЦІЇ ---
const getLocalizedText = (localizedObj) => {
  if (!localizedObj) return '';
  if (typeof localizedObj === 'string') return localizedObj; // Якщо це ще старий формат бази
  return localizedObj[locale.value] || localizedObj['en'] || localizedObj['uk'] || '';
};

const fetchLatestProducts = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/api/products/latest-home`); // Отримуємо 16 товарів
    products.value = response.data.map(item => ({
      id: item.product_id,
      name: item.name,
      price: item.price,
      coverImage: item.coverImage,
      imageUrls: item.imageUrls || []
    }));
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    loading.value = false;
  }
};

const getProductImage = (product) => {
  if (product.coverImage) return product.coverImage;
  if (product.imageUrls && product.imageUrls.length > 0) return product.imageUrls[0];
  return 'https://placehold.co/400x500/ffffff/1a1a1a?text=Antique+Life';
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const goToProduct = (id) => {
  if (!id) return;
  // Використовуємо об'єктний синтаксис (як в ItemPage), щоб роутер сам підставив правильну мову
  router.push({ name: 'Item', params: { id: id } });
};

const displayedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return products.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));

const setPage = (page) => {
  currentPage.value = page;
  document.querySelector('.products-showcase').scrollIntoView({ behavior: 'smooth' });
};

onMounted(() => {
  fetchLatestProducts();
});
</script>

<style scoped>
.status-message {
  text-align: center;
  padding: 40px;
  font-family: var(--font-sans);
  font-size: 1.1rem;
  color: var(--color-text-light);
}
</style>