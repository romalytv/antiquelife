<template>
  <header class="main-header" :class="{ 'menu-open': isMenuOpen }">
    <div class="mobile-branding mobile-only">
      <router-link :to="$localPath('/')" class="logo-link" @click="closeMenu">
        <span class="logo-text">Antique Life</span>
      </router-link>
    </div>

    <div class="header-inner">
      <div class="desktop-branding desktop-only">
        <router-link :to="$localPath('/')" class="logo-link">
          <span class="logo-text">Antique Life</span>
        </router-link>
      </div>

      <div class="header-collapsible-content" :class="{ 'is-open': isMenuOpen }">
        <div class="centered-nav-group">
          <nav class="main-nav">

            <div class="catalog-dropdown-wrapper" @mouseenter="handleDesktopHover(true)" @mouseleave="handleDesktopHover(false)">
              <router-link :to="$localPath('/market')" class="nav-link catalog-trigger" @click="toggleMarket">
                {{ $t('header.catalog') }}
              </router-link>
              <ul class="dropdown-menu" :class="{ 'is-expanded': isMarketExpanded }">
                <li><router-link :to="$localPath('/market')" @click="closeMenu">{{ $t('header.all_products') }}</router-link></li>

                <li v-for="cat in categoriesList" :key="cat.id || cat.category_id">
                  <router-link
                      :to="{ path: $localPath('/market'), query: { category: cat.category_name || cat.name } }"
                      @click="closeMenu"
                  >
                    {{ $t(`categories_list.${cat.category_id || cat.id}.name`).toUpperCase() }}
                  </router-link>
                </li>
              </ul>
            </div>

            <router-link :to="$localPath('/journal')" class="nav-link" @click="closeMenu">{{ $t('header.journal') }}</router-link>
            <router-link :to="$localPath('/contacts')" class="nav-link" @click="closeMenu">{{ $t('header.contacts') }}</router-link>
            <router-link :to="$localPath('/ai')" class="nav-link" @click="closeMenu">{{ $t('header.expertise') }}</router-link>

            <LanguageSwitcher class="mobile-only" />

            <router-link :to="$localPath('/cart')" class="nav-link nav-link-cart mobile-only" @click="closeMenu">
              <img src="/src/public/buy-icon.png" :alt="$t('header.cart')" class="cart-icon-inline" />
              <span v-if="cartStore.itemsCount > 0" class="badge-inline">{{ cartStore.itemsCount }}</span>
            </router-link>
          </nav>
        </div>
      </div>

      <div class="user-menu desktop-only">
        <LanguageSwitcher />
        <router-link :to="$localPath('/cart')" class="cart-icon" @click="closeMenu">
          <img src="/src/public/buy-icon.png" :alt="$t('header.cart')" />
          <span v-if="cartStore.itemsCount > 0" class="badge">{{ cartStore.itemsCount }}</span>
        </router-link>
      </div>
    </div>

    <button class="hamburger-button mobile-only" @click="toggleMenu">
      <span v-if="isMenuOpen">✕</span>
      <span v-else>☰</span>
    </button>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useCartStore } from "../stores/cart";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import axios from "axios";

const cartStore = useCartStore();

const isMenuOpen = ref(false);
const isMarketExpanded = ref(false);
const savedScrollY = ref(0);

// Початковий список залишається як фолбек
const categoriesList = ref([
  { id: 1, name: "Антикварний та вінтажний посуд" },
  { id: 2, name: "Антикварні та вінтажні меблі" },
  { id: 3, name: "Декор та предмети інтер'єру" },
  { id: 4, name: "Антикварні лампи та світильники" },
  { id: 5, name: "Дзеркала та рами" },
  { id: 6, name: "Живопис та графіка" },
  { id: 7, name: "Вироби з металу та срібла" },
  { id: 8, name: "Антикварні годинники" },
  { id: 9, name: "Антикварне та вінтажне скло і кришталь" },
  { id: 10, name: "Вінтажна та антикварна біжутерія" },
  { id: 11, name: "Елітний та колекційний антикваріат" },
  { id: 12, name: "Різне" },
]);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
  isMarketExpanded.value = false;
};

// Відкриття підменю при наведенні (тільки для десктопу)
const handleDesktopHover = (state) => {
  if (window.innerWidth > 768) {
    isMarketExpanded.value = state;
  }
};

// Клік по "Каталог" (на мобільному відкриває список, на десктопі пускає на сторінку)
const toggleMarket = (event) => {
  if (window.innerWidth <= 768) {
    event.preventDefault();
    isMarketExpanded.value = !isMarketExpanded.value;
  }
};

const fetchCategories = async () => {
  try {
    const response = await axios.get(`/api/categories`);
    if (response.data && response.data.length > 0) {
      categoriesList.value = response.data.sort(
          (a, b) => (a.category_id || a.id) - (b.category_id || b.id),
      );
    }
  } catch (error) {
    console.log(
        "API категорії недоступні, використовується список за замовчуванням",
    );
  }
};

onMounted(() => {
  fetchCategories();
});

watch(isMenuOpen, (isOpen) => {
  if (isOpen) {
    savedScrollY.value = window.scrollY || window.pageYOffset || 0;

    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY.value}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  } else {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, savedScrollY.value || 0);
  }

  document.body.classList.toggle("menu-open", isOpen);
});

onBeforeUnmount(() => {
  document.body.classList.remove("menu-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
});
</script>

<style scoped src="/src/assets/header.css"></style>