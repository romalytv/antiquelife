<template>
  <header class="main-header">
    <div class="header-collapsible-content" :class="{ 'is-open': isMenuOpen }">
      <div class="centered-nav-group">
        <nav class="main-nav">

          <div class="nav-dropdown-container">
            <router-link to="/market" class="nav-link" @click="toggleMarket">
              Маркет
            </router-link>

            <ul class="dropdown-menu" :class="{ 'is-expanded': isMarketExpanded }">
              <li v-for="cat in categoriesList" :key="cat.category_id">
                <router-link
                    :to="{ path: '/market', query: { category: cat.category_name } }"
                    @click="closeMenu"
                >
                  {{ cat.category_name }}
                </router-link>
              </li>
            </ul>
          </div>

          <router-link to="/news" class="nav-link">Новини</router-link>
          <router-link to="/contacts" class="nav-link">Контакти</router-link>
          <router-link to="/ai" class="nav-link">AI</router-link>
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

      </div>

      <div class="user-menu">
        <router-link to="/cart" class="cart-icon">
          <img src="/src/public/buy-icon.png" alt="Кошик">
          <span v-if="cartStore.itemsCount > 0" class="badge">
            {{ cartStore.itemsCount }}
          </span>
        </router-link>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCartStore } from '../stores/cart';
import axios from 'axios'; // Не забудь імпортувати axios

const API_URL = import.meta.env.VITE_API_URL  || 'http://localhost:8080';
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
    const response = await axios.get(`${API_URL}/api/categories`);
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