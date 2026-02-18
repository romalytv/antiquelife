<template>
  <section class="products-showcase">
    <div class="product-header">
      <h2>{{ $t('home.tableware') }}</h2>
    </div>

    <div class="products-widget-wrapper">
      <div v-if="loading" class="status-message">{{ $t('home.loading') }}</div>

      <div v-else class="products-grid compact-grid-height">
        <div
            v-for="product in products"
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

      <div class="view-all-container">
        <button class="btn-catalog" @click="goToTablewareCatalog">
          {{ $t('home.viewTableware') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

// Вказуємо чітке ім'я для дебагу та архітектури
defineOptions({
  name: 'TablewareShowcase'
});

const router = useRouter();
const { locale } = useI18n();
const products = ref([]);
const loading = ref(true);

const getLocalizedText = (localizedObj) => {
  if (!localizedObj) return '';
  if (typeof localizedObj === 'string') return localizedObj;
  return localizedObj[locale.value] || localizedObj['en'] || localizedObj['uk'] || '';
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

const fetchTableware = async () => {
  try {
    loading.value = true;
    // Виклик твого нового методу з ProductService через контролер
    const response = await axios.get('/api/products/tableware');
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

const goToProduct = (id) => {
  if (!id) return;
  router.push({ name: 'Item', params: { id: id } });
};

const goToTablewareCatalog = () => {
  router.push({
    name: 'Market',
    query: { cat: '5-посуд' }
  });
};

onMounted(() => {
  fetchTableware();
});
</script>

<style scoped>
/* Ми використовуємо класи з main.css, але оскільки там для .products-grid
  задано min-height: 800px (для 8 товарів), ми перебиваємо його тут
  на автоматичну висоту, щоб не було великої пустої діри під 4 товарами.
*/
.compact-grid-height {
  min-height: auto !important;
  margin-bottom: 20px;
}

.status-message {
  text-align: center;
  padding: 40px;
  font-family: var(--font-sans);
  font-size: 1.1rem;
  color: var(--color-text-light);
}

@media (max-width: 768px) {
  .view-all-container {
    padding: 0 15px;
    margin-top: 20px;
  }
}

/* На мобільних пристроях 2х2 воно підтягнеться з main.css автоматично */
</style>