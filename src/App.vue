<template>
  <div id="app-wrapper">
    <TheHeader />

    <main>
      <router-view />
    </main>

    <TheFooter />

    <ContactPopup />
    <RegionModal />
  </div>
</template>

<script>
import TheHeader from './components/Header.vue';
import TheFooter from './components/Footer.vue';
import ContactPopup from "./components/ContactPopup.vue";
import RegionModal from "@/components/RegionModal.vue";

export default {
  components: {
    RegionModal,
    ContactPopup,
    TheHeader,
    TheFooter,
  }
}
</script>

<style>

</style>