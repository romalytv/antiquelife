<template>
  <header class="main-header">

    <div class="mobile-branding mobile-only">
      <router-link to="/" class="logo-link">
        <span class="logo-text">ANTIQUE <span class="logo-text-lite">LIFE</span></span>
      </router-link>
    </div>

    <div class="header-collapsible-content" :class="{ 'is-open': isMenuOpen }">

      <div class="centered-nav-group">

        <nav class="main-nav">
          <div class="nav-dropdown-container">
            <a href="/market" class="nav-link" @click.prevent="toggleMarket">
              МАРКЕТ
            </a>

            <ul class="dropdown-menu" :class="{ 'is-expanded': isMarketExpanded }">
              <li v-for="cat in categoriesList" :key="cat.category_id || cat.id">
                <router-link
                    :to="{ path: '/market', query: { category: cat.category_name || cat.name } }"
                    @click="closeMenu"
                >
                  {{ cat.category_name || cat.name }}
                </router-link>
              </li>
            </ul>
          </div>

          <router-link to="/news" class="nav-link" @click="closeMenu">НОВИНИ</router-link>
          <router-link to="/contacts" class="nav-link" @click="closeMenu">КОНТАКТИ</router-link>
          <router-link to="/ai" class="nav-link" @click="closeMenu">AI</router-link>
        </nav>

        <div class="desktop-branding desktop-only">
          <router-link to="/" class="logo-link">
            <span class="logo-text">ANTIQUE <span class="logo-text-lite">LIFE</span></span>
          </router-link>
          <div class="brand-divider"></div>
          <div class="desktop-slogan-block">
            <span class="slogan-line">ВІНТАЖ ТА СТАРОВИНА</span>
            <span class="slogan-line">ДЛЯ ВАШОГО ДОМУ ТА КОЛЕКЦІЇ</span>
          </div>
        </div>

        <div class="user-menu">
          <router-link to="/cart" class="cart-icon" @click="closeMenu">
            <img src="/src/public/buy-icon.png" alt="Кошик">
            <span v-if="cartStore.itemsCount > 0" class="badge">
              {{ cartStore.itemsCount }}
            </span>
          </router-link>
        </div>

      </div> </div>

    <button class="hamburger-button mobile-only" @click="toggleMenu">
      <span v-if="isMenuOpen">✕</span>
      <span v-else>☰</span>
    </button>

  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import axios from 'axios'; // Не забудь імпортувати axios

const cartStore = useCartStore();
const isMenuOpen = ref(false);
const isMarketExpanded = ref(false);

// Список категорій (тепер динамічний)
const categoriesList = ref([]);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Функція щоб закривати меню після кліку (для мобілок зручно)
const closeMenu = () => {
  isMenuOpen.value = false;
  isMarketExpanded.value = false;
};

const toggleMarket = (event: Event) => {
  if (window.innerWidth <= 768) {
    event.preventDefault();
    isMarketExpanded.value = !isMarketExpanded.value;
  }
};

// ЗАВАНТАЖУЄМО КАТЕГОРІЇ З БЕКЕНДУ
// Це гарантує, що назви в хедері будуть ідентичні тим, що в базі
const fetchCategories = async () => {
  try {
    const response = await axios.get(`/api/categories`);
    categoriesList.value = response.data;
  } catch (error) {
    console.error("Помилка завантаження категорій в меню", error);
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped src="/src/assets/header.css"></style>