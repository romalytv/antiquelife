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
/* 1. Скидаємо стандартні відступи браузера */
html, body {
  margin: 0;
  padding: 0;
  height: 100%; /* Гарантуємо, що сторінка займає всю висоту */
}

/* 2. Налаштовуємо головну обгортку */
#app-wrapper {
  display: flex;
  flex-direction: column; /* Елементи йдуть стовпчиком */
  min-height: 100vh;      /* Мінімальна висота — 100% висоти екрана */
}

/* 3. Змушуємо main займати весь вільний простір */
main {
  flex: 1; /* Магія: розтягується, заповнюючи порожнє місце */
  display: flex;
  flex-direction: column; /* Щоб всередині теж все було гарно */
}
</style>