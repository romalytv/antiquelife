<template>
  <div class="social-widget-container">
    <div
        class="tagembed-widget"
        style="width:100%;height:100%;overflow:auto;"
        data-widget-id="316838"
        data-website="1"
    ></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const scriptId = 'tagembed-script';
  const oldScript = document.getElementById(scriptId);

  // Видаляємо старий скрипт, якщо користувач перейшов з іншої сторінки
  if (oldScript) {
    oldScript.remove();
  }

  // Створюємо і додаємо новий скрипт для ініціалізації віджета
  const script = document.createElement('script');
  script.src = 'https://widget.tagembed.com/embed.min.js';
  script.type = 'text/javascript';
  script.id = scriptId;
  script.async = true;
  document.body.appendChild(script);
});
</script>

<style scoped>

</style>