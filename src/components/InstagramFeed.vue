<template>
  <div class="instagram-wrapper">
  <behold-widget feed-id="yOXbbyLtknNSiOAzy2Pu"></behold-widget>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Перевіряємо, чи скрипт вже був доданий раніше, щоб не дублювати
  const scriptId = 'behold-widget-script';

  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'module'; // Важливо! Behold використовує модулі
    script.src = 'https://w.behold.so/widget.js';
    document.body.appendChild(script);
  }
});
</script>

<style>

</style>