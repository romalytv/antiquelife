<template>
  <div class="tiktok-widget-container">
    <div
        class="tagembed-widget"
        style="width:100%;height:100%;overflow:auto;"
        data-widget-id="312803"
        data-website="1"
    ></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Логіка для Vue (SPA):
  // Видаляємо старий скрипт (якщо він залишився з попереднього відвідування сторінки)
  // і додаємо новий, щоб змусити віджет завантажитись.

  const scriptId = 'tagembed-script';
  const oldScript = document.getElementById(scriptId);

  if (oldScript) {
    oldScript.remove();
  }

  const script = document.createElement('script');
  script.src = 'https://widget.tagembed.com/embed.min.js';
  script.type = 'text/javascript';
  script.id = scriptId;
  script.async = true;
  document.body.appendChild(script);
});
</script>

<style scoped>
.tiktok-widget-container {
  width: 100%;
  /* Висота для слайдера зазвичай менша, ніж для сітки.
     Якщо буде занадто вузько — збільш до 500px */
  min-height: 400px;
}
</style>