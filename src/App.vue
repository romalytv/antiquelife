<template>
  <div id="app-wrapper">
    <TheHeader />

    <main>
      <router-view />
    </main>

    <TheFooter />
  </div>
</template>

<script>
// Не забудьте імпортувати ваші загальні компоненти
import TheHeader from './components/Header.vue';
import TheFooter from './components/Footer.vue';

export default {
  components: {
    TheHeader,
    TheFooter,
  }
}
</script>

<style>
/* Тут ваші глобальні стилі */
</style>