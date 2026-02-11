<template>
  <div id="app-wrapper">
    <TheHeader />

    <main>
      <router-view />
    </main>

    <TheFooter />

    <ContactPopup />
  </div>
</template>

<script>
// Не забудьте імпортувати ваші загальні компоненти
import TheHeader from './components/Header.vue';
import TheFooter from './components/Footer.vue';
import ContactPopup from "@/components/ContactPopup.vue";

export default {
  components: {
    ContactPopup,
    TheHeader,
    TheFooter,
  }
}
</script>

<style>
/* Тут ваші глобальні стилі */
</style>