<template>
  <header class="main-header">
    <div class="logo">
      <span class="logo-icon">
        <img src="/src/public/key_logo.png"/>
      </span>
      <router-link to="/" class="logo-text">ANTIQUE <span class="logo-text-lite">LIFE</span></router-link>
    </div>

    <button class="hamburger-button" @click="toggleMenu">
      ☰
    </button>

    <div class="header-collapsible-content" :class="{ 'is-open': isMenuOpen }">

      <nav class="main-nav">

        <div class="nav-dropdown-container">
          <router-link to="/market" class="nav-link" @click="toggleMarket">
            Маркет
          </router-link>

          <ul class="dropdown-menu" :class="{ 'is-expanded': isMarketExpanded }">
            <li v-for="category in categories" :key="category.link">
              <router-link :to="category.link">{{ category.name }}</router-link>
            </li>
          </ul>
        </div>

        <router-link to="/news" class="nav-link">Новини</router-link>
        <router-link to="/contacts" class="nav-link">Контакти</router-link>
        <router-link to="/ai" class="nav-link">AI</router-link>
      </nav>

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
// 4. НОВА ЛОГІКА для меню
import { ref } from 'vue';

import { useCartStore } from '../stores/cart';
const cartStore = useCartStore();

// Стан для відстеження, чи відкрите мобільне меню
const isMenuOpen = ref(false);

// Функція для перемикання стану (відкрити/закрити)
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// --- НОВЕ: Стан для підменю "Маркет" ---
const isMarketExpanded = ref(false);

const toggleMarket = (event: Event) => {
  // Ця перевірка важлива: на мобільному ми хочемо відкривати меню,
  // а не переходити за посиланням одразу
  if (window.innerWidth <= 768) {
    event.preventDefault(); // Скасовуємо перехід за посиланням
    isMarketExpanded.value = !isMarketExpanded.value;
  }
};

const categories = [
  { name: 'Антикварні меблі', link: '/market/furniture' },
  { name: 'Декор та аксесуари', link: '/market/decor' },
  { name: 'Люстри та світло', link: '/market/lighting' },
  { name: 'Дзеркала та рами', link: '/market/mirrors' },
  { name: 'Живописні полотна', link: '/market/painting' },
  { name: 'Гравюри та графіка', link: '/market/graphics' },
  { name: 'Старовинні годинники', link: '/market/clocks' },
  { name: 'Художнє скло', link: '/market/glass' },
  { name: 'Кераміка та порцеляна', link: '/market/ceramics' },
  { name: 'Художній метал', link: '/market/metal' },
  { name: 'Вінтажні прикраси', link: '/market/jewelry' },
  { name: 'Старовинна оптика', link: '/market/optics' },
  { name: 'Сакральне мистецтво', link: '/market/sacred' },
  { name: 'Колекційні цікавинки', link: '/market/other' },
];

</script>

<style scoped src="/src/assets/header.css"></style>