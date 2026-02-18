<template>
  <div class="catalog-wrapper">

    <header class="desktop-control-bar">
      <div class="bar-left">
        <div class="search-pill">
          <input v-model="searchQuery" type="text" :placeholder="$t('market.searchPlaceholder')" class="search-input"/>
        </div>
        <span class="results-count">{{ $t('market.foundCount') }}: {{ filteredProducts.length }}</span>
      </div>

      <div class="bar-right">
        <div class="custom-dropdown" v-click-outside="closeDropdowns">
          <button class="dropdown-btn" @click.stop="toggleCatDropdown">
            <span class="btn-text">{{ currentCategoryLabel }}</span>
            <span class="arrow-icon" :class="{ 'rotated': isCatOpen }">▼</span>
          </button>
          <transition name="fade">
            <div class="dropdown-menu" v-if="isCatOpen">
              <div class="dropdown-item main-item" :class="{ 'selected': !selectedCategoryId }" @click="resetFilters">{{ $t('market.allCategories') }}</div>

              <template v-for="cat in categoriesList" :key="cat.categoryId">
                <div class="dropdown-item main-item" :class="{ 'selected': selectedCategoryId === cat.categoryId && !selectedSubCategoryId }" @click="selectCategory(cat.categoryId)">
                  {{ getCatName(cat.categoryId) }}
                </div>
                <div v-for="sub in cat.subCategories" :key="sub.sub_categoryId" class="dropdown-item sub-item" :class="{ 'selected': selectedSubCategoryId === sub.sub_categoryId }" @click="selectSubCategory(sub.sub_categoryId)">
                  {{ getSubName(sub.sub_categoryId) }}
                </div>
              </template>

            </div>
          </transition>
        </div>

        <div class="custom-dropdown" v-click-outside="closeDropdowns">
          <button class="dropdown-btn" @click.stop="toggleSortDropdown">
            <span class="btn-text">{{ currentSortLabel }}</span>
            <span class="arrow-icon" :class="{ 'rotated': isSortOpen }">▼</span>
          </button>
          <transition name="fade">
            <div class="dropdown-menu" v-if="isSortOpen">
              <div class="dropdown-item" @click="setSort('default')">{{ $t('market.sortDefault') }}</div>
              <div class="dropdown-item" @click="setSort('price_asc')">{{ $t('market.sortPriceAsc') }}</div>
              <div class="dropdown-item" @click="setSort('price_desc')">{{ $t('market.sortPriceDesc') }}</div>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <div class="mobile-control-panel">
      <div class="mobile-search-wrapper">
        <input v-model="searchQuery" type="text" :placeholder="$t('market.searchPlaceholder')" class="mobile-search-input"/>
      </div>
      <div class="mobile-count-text">{{ $t('market.foundCount') }}: {{ filteredProducts.length }}</div>
      <div class="mobile-buttons-row">
        <div class="mobile-dropdown-wrapper">
          <button class="mobile-filter-btn" @click.stop="toggleMobileCat">
            <span class="m-btn-text">{{ currentCategoryLabel }}</span>
            <span class="m-arrow" :class="{ 'rotated': isMobileCatOpen }">▼</span>
          </button>
          <transition name="slide-down">
            <div class="mobile-dropdown-list" v-if="isMobileCatOpen">
              <div class="m-item main" @click="resetFilters">{{ $t('market.allCategories') }}</div>

              <template v-for="cat in categoriesList" :key="cat.categoryId">
                <div class="m-item main" @click="selectCategory(cat.categoryId)">
                  {{ getCatName(cat.categoryId) }}
                </div>
                <div v-for="sub in cat.subCategories" :key="sub.sub_categoryId" class="m-item sub" @click="selectSubCategory(sub.sub_categoryId)">
                  — {{ getSubName(sub.sub_categoryId) }}
                </div>
              </template>

            </div>
          </transition>
        </div>
        <div class="mobile-dropdown-wrapper">
          <button class="mobile-filter-btn" @click.stop="toggleMobileSort">
            <span class="m-btn-text">{{ currentSortLabel }}</span>
            <span class="m-arrow" :class="{ 'rotated': isMobileSortOpen }">▼</span>
          </button>
          <transition name="slide-down">
            <div class="mobile-dropdown-list" v-if="isMobileSortOpen">
              <div class="m-item" @click="setSort('default')">{{ $t('market.sorting') }}</div>
              <div class="m-item" @click="setSort('price_asc')">{{ $t('market.sortPriceAsc') }}</div>
              <div class="m-item" @click="setSort('price_desc')">{{ $t('market.sortPriceDesc') }}</div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <main class="catalog-grid-area">
      <div class="products-grid" v-if="paginatedProducts.length > 0">
        <div
            v-for="product in paginatedProducts"
            :key="product.product_id"
            class="product-card"
            @mouseleave="resetImage(product.product_id)"
        >
          <div class="image-wrapper">
            <router-link :to="{ name: 'Item', params: { id: product.product_id }}">
              <img
                  :src="getCurrentImage(product)"
                  :alt="getLocalizedText(product.name)"
                  loading="lazy"
                  :class="{ 'img-sold': product.status === 'SOLD' }"
              />
            </router-link>
            <div v-if="hasMultipleImages(product)" class="slider-arrows">
              <button class="arrow-btn prev" @click.prevent="prevImage(product)">❮</button>
              <button class="arrow-btn next" @click.prevent="nextImage(product)">❯</button>
            </div>
            <span v-if="product.status === 'SOLD'" class="badge sold">{{ $t('market.sold') }}</span>
            <span v-else-if="product.status === 'RESERVED'" class="badge reserved">{{ $t('market.reserved') }}</span>
          </div>

          <div class="card-details">
            <h3 class="card-title">
              <router-link :to="{ name: 'Item', params: { id: product.product_id }}">
                {{ getLocalizedText(product.name) }}
              </router-link>
            </h3>
            <div class="card-price" :class="{ 'crossed': product.status === 'SOLD' }">
              {{ formatPrice(product.price) }} €
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="loading" class="info-message loading">
        <span class="loader-spinner"></span> <span>{{ $t('market.loadingCollection') }}</span>
      </div>
      <div v-else class="info-message empty">
        <span>{{ $t('market.noItemsFound') }}</span>
      </div>

      <div class="pagination-container" v-if="totalPages > 1">
        <button
            class="page-btn arrow"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
        >
          ←
        </button>

        <div class="page-numbers">
          <button
              v-for="page in totalPages"
              :key="page"
              class="page-btn number"
              :class="{ 'active': currentPage === page }"
              @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
            class="page-btn arrow"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
        >
          →
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const ITEMS_PER_PAGE = 12;
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();

const products = ref([]);
const categoriesList = ref([]);
const loading = ref(true);

const searchQuery = ref('');
const selectedCategoryId = ref(null);
const selectedSubCategoryId = ref(null);
const sortOrder = ref('default');
const currentPage = ref(1);
const imageIndices = ref({});

const isCatOpen = ref(false);
const isSortOpen = ref(false);
const isMobileCatOpen = ref(false);
const isMobileSortOpen = ref(false);

const getLocalizedText = (localizedObj) => {
  if (!localizedObj) return '';
  if (typeof localizedObj === 'string') return localizedObj;
  return localizedObj[locale.value] || localizedObj['en'] || localizedObj['uk'] || '';
};

const slugify = (text) => {
  if (!text) return '';
  return String(text).toLowerCase().trim()
      .replace(/['"«»,()]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\-а-яіїєґ]/gi, '')
      .replace(/\-\-+/g, '-');
};

// --- НОВІ НАДІЙНІ ХЕЛПЕРИ ДЛЯ КАТЕГОРІЙ ---
const getCatName = (id) => {
  // ДОДАЛИ .name сюди:
  const key = `categories.c_${id}.name`;
  const trans = t(key);

  // Якщо переклад успішно знайдено (vue-i18n не повернув сам ключ)
  if (trans !== key) return trans;

  // Фолбек на базу даних
  const foundCat = categoriesList.value.find(c => c.categoryId === id);
  return foundCat ? foundCat.category_name : '';
};

const getSubName = (id) => {
  const key = `subcategories.s_${id}`;
  const trans = t(key);

  if (trans !== key) return trans;

  // Фолбек на базу даних
  for (const cat of categoriesList.value) {
    const foundSub = cat.subCategories?.find(s => s.sub_categoryId === id);
    if (foundSub) return foundSub.name;
  }
  return '';
};

const currentCategoryLabel = computed(() => {
  if (selectedSubCategoryId.value) return getSubName(selectedSubCategoryId.value);
  if (selectedCategoryId.value) return getCatName(selectedCategoryId.value);
  return t('market.categories');
});

const currentSortLabel = computed(() => {
  if (sortOrder.value === 'price_asc') return t('market.sortPriceAsc');
  if (sortOrder.value === 'price_desc') return t('market.sortPriceDesc');
  return t('market.sorting');
});

const applyFiltersFromQuery = () => {
  const catQuery = route.query.cat;
  const subCatQuery = route.query.sub;

  if (catQuery) {
    const parsedCat = parseInt(catQuery, 10);
    selectedCategoryId.value = isNaN(parsedCat) ? null : parsedCat;
  } else {
    selectedCategoryId.value = null;
  }

  if (subCatQuery) {
    const parsedSub = parseInt(subCatQuery, 10);
    selectedSubCategoryId.value = isNaN(parsedSub) ? null : parsedSub;
  } else {
    selectedSubCategoryId.value = null;
  }
};

watch(() => route.query, () => { applyFiltersFromQuery(); }, { deep: true });

const fetchData = async () => {
  loading.value = true;
  try {
    const [pRes, cRes] = await Promise.all([
      axios.get('/api/products').catch(() => ({ data: [] })),
      axios.get('/api/categories').catch(() => ({ data: [] }))
    ]);
    products.value = pRes.data || [];
    categoriesList.value = cRes.data || [];
    applyFiltersFromQuery();
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
};

onMounted(() => { fetchData(); document.addEventListener('click', closeAllDropdowns); });
onUnmounted(() => document.removeEventListener('click', closeAllDropdowns));

const toggleCatDropdown = () => { isCatOpen.value = !isCatOpen.value; isSortOpen.value = false; };
const toggleSortDropdown = () => { isSortOpen.value = !isSortOpen.value; isCatOpen.value = false; };
const toggleMobileCat = () => { isMobileCatOpen.value = !isMobileCatOpen.value; isMobileSortOpen.value = false; };
const toggleMobileSort = () => { isMobileSortOpen.value = !isMobileSortOpen.value; isMobileCatOpen.value = false; };

const closeAllDropdowns = () => {
  isCatOpen.value = false; isSortOpen.value = false;
  isMobileCatOpen.value = false; isMobileSortOpen.value = false;
};

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => { if (!(el === event.target || el.contains(event.target))) binding.value(event); };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) { document.body.removeEventListener('click', el.clickOutsideEvent); },
};
const closeDropdowns = () => closeAllDropdowns();

const selectCategory = (id) => {
  const catName = getCatName(id);
  const slug = `${id}-${slugify(catName)}`;

  router.push({ query: { ...route.query, cat: slug, sub: undefined } });
  selectedCategoryId.value = id;
  selectedSubCategoryId.value = null;
  closeAllDropdowns();
};

const selectSubCategory = (id) => {
  let parentCatId = null;
  for (const cat of categoriesList.value) {
    if (cat.subCategories?.some(s => s.sub_categoryId === id)) {
      parentCatId = cat.categoryId;
      break;
    }
  }

  const parentName = getCatName(parentCatId);
  const subName = getSubName(id);

  const catSlug = `${parentCatId}-${slugify(parentName)}`;
  const subSlug = `${id}-${slugify(subName)}`;

  router.push({ query: { ...route.query, cat: catSlug, sub: subSlug } });
  selectedSubCategoryId.value = id;
  closeAllDropdowns();
};

const resetFilters = () => {
  const query = { ...route.query };
  delete query.cat;
  delete query.sub;
  router.push({ query });
  selectedCategoryId.value = null;
  selectedSubCategoryId.value = null;
  closeAllDropdowns();
};

const setSort = (order) => { sortOrder.value = order; closeAllDropdowns(); };

const filteredProducts = computed(() => {
  let list = products.value.filter(p => {
    const productName = getLocalizedText(p.name).toLowerCase();
    const matchSearch = productName.includes(searchQuery.value.toLowerCase());
    let matchCat = true;
    if (selectedSubCategoryId.value) {
      matchCat = p.subCategory && p.subCategory.sub_categoryId === selectedSubCategoryId.value;
    } else if (selectedCategoryId.value) {
      matchCat = p.category && p.category.categoryId === selectedCategoryId.value;
    }
    return matchSearch && matchCat;
  });

  return list.sort((a, b) => {
    if (sortOrder.value === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortOrder.value === 'price_desc') return (b.price || 0) - (a.price || 0);
    const statusPrio = { 'AVAILABLE': 1, 'RESERVED': 2, 'SOLD': 3 };
    return (statusPrio[a.status] || 4) - (statusPrio[b.status] || 4);
  });
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / ITEMS_PER_PAGE));
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return filteredProducts.value.slice(start, end);
});
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
watch([searchQuery, selectedCategoryId, selectedSubCategoryId, sortOrder], () => { currentPage.value = 1; });

const getDisplayImages = (p) => {
  const imgs = [];
  if (p.coverImage || p.cover_image) imgs.push(p.coverImage || p.cover_image);
  if (p.imageUrls) imgs.push(...p.imageUrls);
  return imgs.length ? imgs : ['/placeholder.png'];
};
const hasMultipleImages = (p) => getDisplayImages(p).length > 1;
const getCurrentImage = (p) => getDisplayImages(p)[imageIndices.value[p.product_id] || 0];
const nextImage = (p) => {
  const imgs = getDisplayImages(p);
  imageIndices.value[p.product_id] = ((imageIndices.value[p.product_id] || 0) + 1) % imgs.length;
};
const prevImage = (p) => {
  const imgs = getDisplayImages(p);
  const cur = imageIndices.value[p.product_id] || 0;
  imageIndices.value[p.product_id] = cur === 0 ? imgs.length - 1 : cur - 1;
};
const resetImage = (id) => { if (imageIndices.value[id]) imageIndices.value[id] = 0; };
const formatPrice = (p) => p?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Roboto:wght@300;400;500&display=swap');

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Montserrat:wght@300;400;500&display=swap');

@font-face {
  font-family: 'Palatino Linotype';
  src: url('@/assets/fonts/PalatinoLinotype/palatinolinotype_roman.ttf') format('woff2'),
  url('@/assets/fonts/PalatinoLinotype/palatinolinotype_roman.ttf') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.catalog-wrapper {
  max-width: 1440px;
  margin: 0 auto;
  padding: 30px 40px;
  font-family: 'Playfair Display', serif;
  color: #222;
}

.info-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* ВАЖЛИВО: Це змушує блок займати мінімум 60% висоти екрана */
  min-height: 60vh;

  /* А це каже "розтягуйся на все вільне місце" */
  flex-grow: 1;

  width: 100%;
  color: #888;
  font-style: italic;
  font-family: 'Roboto', sans-serif;
  gap: 15px; /* Відступ між іконкою та текстом */
}

/* Опціонально: Простий CSS спінер */
.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #001a01; /* Золотий колір */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ================= DESKTOP STYLES ================= */
.desktop-control-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
.bar-left { display: flex; align-items: center; gap: 20px; }
.search-pill { display: flex; align-items: center; background: #f4f4f4; padding: 12px 20px; border-radius: 30px; width: 300px; transition: 0.3s; }
.search-pill:focus-within { background: #fff; box-shadow: 0 0 0 1px #001a01; }
.search-icon { color: #888; margin-right: 10px; font-size: 15px; }
.search-input { border: none; background: transparent; outline: none; width: 100%; font-family: 'Roboto', sans-serif; font-size: 14px; color: #333; }
.results-count { font-family: 'Roboto', sans-serif; font-size: 13px; color: #999; }
.bar-right { display: flex; gap: 15px; }
.custom-dropdown { position: relative; min-width: 180px; }
.dropdown-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e0e0e0; border-radius: 30px; padding: 12px 20px; font-family: 'Roboto', sans-serif; font-size: 14px; color: #333; cursor: pointer; transition: 0.2s; }
.dropdown-btn:hover { border-color: #001a01; }
.arrow-icon { font-size: 10px; color: #999; margin-left: 10px; transition: 0.2s; }
.arrow-icon.rotated { transform: rotate(180deg); }
.dropdown-menu { position: absolute; top: calc(100% + 10px); right: 0; left: 0; background: #fff; border-radius: 16px; padding: 10px 0; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #f0f0f0; max-height: 400px; overflow-y: auto; }
.dropdown-item { padding: 10px 20px; font-family: 'Roboto', sans-serif; font-size: 14px; cursor: pointer; color: #555; }
.dropdown-item:hover { background: #f8f8f8; color: #000; }
.sub-item { padding-left: 35px; font-size: 13px; color: #777; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }
.products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
.product-card { display: flex; flex-direction: column; border: none; }
.image-wrapper { position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden; background: #f4f4f4; margin-bottom: 15px; }
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.product-card:hover img { transform: scale(1.05); }
.img-sold { filter: grayscale(100%); opacity: 0.8; }
.slider-arrows { position: absolute; inset: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 10px; opacity: 0; transition: 0.2s; pointer-events: none; }
.product-card:hover .slider-arrows { opacity: 1; }
.arrow-btn { pointer-events: auto; background: rgba(255,255,255,0.9); border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #000; }
.badge { position: absolute; top: 10px; right: 10px; padding: 4px 8px; font-size: 10px; letter-spacing: 1px; color: #fff; text-transform: uppercase; background: #222; border-radius: 2px; }
.sold { background: #8b0000; } .reserved { background: #d35400; }
.card-details { text-align: center; }
.card-title { margin: 0 0 8px; font-family: 'Palatino Linotype', serif; font-size: 16px; font-weight: 400; line-height: 1.4; color: #222; }
.card-title a { text-decoration: none; color: inherit; }
.card-price { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 500; color: #444; }
.crossed { text-decoration: line-through; color: #999; }
.mobile-control-panel { display: none; }

/* ================= PAGINATION STYLES ================= */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 60px 0 40px;
  gap: 15px;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-btn {
  background: transparent;
  border: 1px solid #e0e0e0;
  color: #1a1a1a;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  border-radius: 50%; /* Кругла форма виглядає більш витончено */
}

/* Стрілки робимо без фону та рамок для легкості */
.page-btn.arrow {
  border: none;
  font-size: 20px;
  color: #001a01;
  background: none;
}

.page-btn.arrow:hover:not(:disabled) {
  color: #b08d57; /* Золотий акцент при наведенні */
  transform: translateX(3px);
}

.page-btn.arrow:first-child:hover:not(:disabled) {
  transform: translateX(-3px);
}

.page-btn.number:hover:not(.active) {
  border-color: #b08d57;
  color: #b08d57;
}

/* Активна сторінка - твій фірмовий зелений */
.page-btn.active {
  background: #001a01;
  color: #fff;
  border-color: #001a01;
  box-shadow: 0 4px 12px rgba(0, 26, 1, 0.2);
}

.page-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

/* Адаптив під мобілку */
@media (max-width: 768px) {
  .pagination-container {
    gap: 8px;
    margin-top: 40px;
  }

  .page-btn {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }

  .page-numbers {
    gap: 5px;
  }
}

/* ================= MOBILE STYLES ================= */
@media (max-width: 992px) {
  .catalog-wrapper { padding: 20px 15px; }
  .desktop-control-bar { display: none; }
  .mobile-control-panel { display: block; margin-bottom: 25px; }
  .mobile-search-wrapper { margin-bottom: 8px; }
  .mobile-search-input { width: 100%; padding: 12px 20px; border: 1px solid #001a01; border-radius: 50px; font-family: 'Roboto', sans-serif; font-size: 15px; color: #333; outline: none; background: #fff; }
  .mobile-count-text { font-family: 'Roboto', sans-serif; font-size: 13px; color: #888; margin-bottom: 15px; padding-left: 10px; }
  .mobile-buttons-row { display: flex; gap: 12px; }
  .mobile-dropdown-wrapper { flex: 1; position: relative; }
  .mobile-filter-btn { width: 100%; padding: 10px 15px; background: #fff; border: 1px solid #ccc; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-family: 'Roboto', sans-serif; font-size: 14px; color: #222; font-weight: 500; cursor: pointer; }
  .m-arrow { font-size: 10px; color: #666; transition: 0.2s; }
  .m-arrow.rotated { transform: rotate(180deg); }
  .mobile-dropdown-list { position: absolute; top: calc(100% + 5px); left: 0; right: 0; background: #fff; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); z-index: 50; padding: 5px 0; max-height: 300px; overflow-y: auto; }
  .m-item { padding: 10px 15px; font-size: 14px; border-bottom: 1px solid #f5f5f5; color: #333; }
  .m-item.sub { padding-left: 25px; color: #777; font-size: 13px; }
  .slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
  .slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
  .products-grid { grid-template-columns: repeat(2, 1fr); gap: 20px 15px; }
  .card-title { font-size: 14px; margin-bottom: 5px; }
  .card-price { font-size: 15px; }
  .badge { padding: 3px 6px; font-size: 9px; }

  /* Менші кнопки пагінації на мобільному */
  .page-btn { width: 35px; height: 35px; font-size: 12px; }
}
</style>