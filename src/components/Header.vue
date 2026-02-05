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
            <div class="nav-dropdown-container">
              <ul
                class="dropdown-menu"
                :class="{ 'is-expanded': isMarketExpanded }"
              >
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
              Головна
            </router-link>
            <router-link to="/news" class="nav-link" @click="closeMenu">
              Каталог
            </router-link>
            <router-link to="/contacts" class="nav-link" @click="closeMenu">
              Новини
            </router-link>
            <router-link to="/contacts" class="nav-link" @click="closeMenu">
              Контакти
            </router-link>
            <router-link to="/ai" class="nav-link" @click="closeMenu">
              Експертиза антикваріату
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

const categoriesList = ref([]);

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
    categoriesList.value = response.data.sort(
      (a, b) => a.category_id - b.category_id,
    );
  } catch (error) {
    console.error("Помилка завантаження категорій", error);
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
