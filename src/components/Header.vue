<template>
  <header class="main-header" :class="{ 'menu-open': isMenuOpen }">
    <div class="mobile-branding mobile-only">
      <router-link to="/" class="logo-link">
        <span class="logo-text">Antique Life</span>
      </router-link>
    </div>

    <div class="header-inner">
      <div class="desktop-branding desktop-only">
        <router-link to="/" class="logo-link">
          <span class="logo-text">Antique Life</span>
        </router-link>
      </div>

      <div
        class="header-collapsible-content"
        :class="{ 'is-open': isMenuOpen }"
      >
        <div class="centered-nav-group">
          <nav class="main-nav">

            <div class="catalog-dropdown-wrapper">
              <a
                href="/market"
                class="nav-link catalog-trigger"
                @click.prevent="toggleMarket"
              >
                Каталог
              </a>
              <ul
                class="dropdown-menu"
                :class="{ 'is-expanded': isMarketExpanded }"
              >
                <li>
                  <router-link to="/market" @click="closeMenu">
                    Усі Товари
                  </router-link>
                </li>
                <li
                  v-for="cat in categoriesList"
                  :key="cat.category_id || cat.id"
                >
                  <router-link
                    :to="{
                      path: '/market',
                      query: { category: cat.category_name || cat.name },
                    }"
                    @click="closeMenu"
                  >
                    {{ cat.category_name || cat.name }}
                  </router-link>
                </li>
              </ul>
            </div>

            <router-link to="/journal" class="nav-link" @click="closeMenu">
              Журнал
            </router-link>
            <router-link to="/contacts" class="nav-link" @click="closeMenu">
              Контакти
            </router-link>
            <router-link to="/ai" class="nav-link" @click="closeMenu">
              Експертиза антикваріату
            </router-link>

            <!-- Корзина в низу меню (тільки мобільна) -->
            <router-link
              to="/cart"
              class="nav-link nav-link-cart mobile-only"
              @click="closeMenu"
            >
              <img
                src="/src/public/buy-icon.png"
                alt="Кошик"
                class="cart-icon-inline"
              />
              <span v-if="cartStore.itemsCount > 0" class="badge-inline">
                {{ cartStore.itemsCount }}
              </span>
            </router-link>
          </nav>
        </div>
      </div>

      <div class="user-menu">
        <router-link to="/cart" class="cart-icon" @click="closeMenu">
          <img src="/src/public/buy-icon.png" alt="Кошик" />
          <span v-if="cartStore.itemsCount > 0" class="badge">
            {{ cartStore.itemsCount }}
          </span>
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
import axios from "axios";

const cartStore = useCartStore();

const isMenuOpen = ref(false);
const isMarketExpanded = ref(false);
const savedScrollY = ref(0);

const categoriesList = ref([
  { id: 1, name: "Антикварний Та Вінтажний Посуд" },
  { id: 2, name: "Антикварні Та Вінтажні Meблі" },
  { id: 3, name: "Декор Та Предмети Інтер'єру" },
  { id: 4, name: "Антикварні Лампи Та Світильники" },
  { id: 5, name: "Дзеркала Та Рами" },
  { id: 6, name: "Живопис Та Графіка" },
  { id: 7, name: "Вироби З Металу Та Срібла" },
  { id: 8, name: "Антикварні Годинники" },
  { id: 9, name: "Антикварне Та Вінтажне Скло І Кришталь" },
  { id: 10, name: "Вінтажна Та Антикварна Біжутерія" },
  { id: 11, name: "Елітний Та Колекційний Антикваріат" },
  { id: 12, name: "Різне" },
]);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
  isMarketExpanded.value = false;
};

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
        (a, b) => a.category_id - b.category_id,
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

/**
 * ✅ BODY SCROLL LOCK — КЛЮЧОВИЙ ФІКС
 */
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
