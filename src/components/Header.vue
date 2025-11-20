<template>
  <header class="main-header">
    <div class="logo">
      <span class="logo-icon">
        <img src="/src/public/key_logo.png"/>
      </span>
      <span class="logo-text">ANTIQUE <span class="logo-text-lite">LIFE</span></span>
    </div>

    <button class="hamburger-button" @click="toggleMenu">
      ☰
    </button>

    <div class="header-collapsible-content" :class="{ 'is-open': isMenuOpen }">

      <nav class="main-nav">
        <router-link to="/market">Market</router-link>
        <router-link to="#">Blog</router-link>
        <router-link to="#">Contact</router-link>
        <router-link to="#">AI</router-link>
        <router-link to="#">News</router-link>
      </nav>

      <div class="user-menu">
        <router-link to="#" class="cart-icon">
          <img src="/src/public/buy-icon.png" alt="Кошик">
        </router-link>
      </div>
    </div>

  </header>
</template>

<script setup lang="ts">
// 4. НОВА ЛОГІКА для меню
import { ref } from 'vue';

// Стан для відстеження, чи відкрите мобільне меню
const isMenuOpen = ref(false);

// Функція для перемикання стану (відкрити/закрити)
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<style scoped src="/src/assets/header.css"></style>