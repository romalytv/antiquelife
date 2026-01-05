<template>
  <div class="success-page-container">
    <div class="success-card">

      <div class="card-border"></div>

      <div class="wax-seal-wrapper">
        <div class="wax-seal">
          <svg viewBox="0 0 100 100" class="seal-svg">
            <circle cx="50" cy="50" r="45" fill="#8d2d2d" /> <circle cx="50" cy="50" r="35" fill="none" stroke="#681e1e" stroke-width="2" />
            <path d="M30 50 L45 65 L75 35" fill="none" stroke="#e0c097" stroke-width="5" stroke-linecap="round" /> </svg>
        </div>
      </div>

      <div class="content-text fade-in">
        <h1 class="title">Лист отримано</h1>
        <div class="decorative-separator">✻</div>

        <p class="message">
          Дякуємо, <span class="client-name">{{ clientName }}</span>.
        </p>
        <p class="sub-message">
          Ваш запит дбайливо доставлено до нашої скриньки.<br>
          Ми зв'яжемося з вами найближчим часом.
        </p>

        <div class="actions">
          <router-link to="/market" class="btn-primary-outline">
            Продовжити перегляд
          </router-link>

          <router-link to="/" class="btn-simple">
            На головну
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// Беремо ім'я з параметрів URL, або пишемо "Гість"
const clientName = computed(() => route.query.name || 'Шановний гість');
</script>

<style scoped>
.success-page-container {
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-light);
  padding: 20px;
}

.success-card {
  background: #fff;
  width: 100%;
  max-width: 600px;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 50px rgba(74, 63, 53, 0.15);
  background-image: url("https://www.transparenttextures.com/patterns/cream-paper.png");
  box-sizing: border-box;
}

/* Рамка */
.card-border {
  position: absolute;
  top: 15px; left: 15px; right: 15px; bottom: 15px;
  border: 1px solid var(--color-highlight);
  pointer-events: none;
}
.card-border::after {
  content: '';
  position: absolute;
  top: 4px; left: 4px; right: 4px; bottom: 4px;
  border: 1px solid rgba(141, 110, 99, 0.3);
}

.wax-seal-wrapper {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  animation: stampIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  opacity: 0;
  transform: scale(2);
}

.seal-svg {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
}

@keyframes stampIn {
  to { opacity: 1; transform: scale(1); }
}

.title {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  color: var(--color-text-dark);
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 2px;
}

.decorative-separator {
  font-size: 2rem;
  color: var(--color-highlight);
  margin: 10px 0 20px;
}

.message {
  font-size: 1.2rem;
  font-family: var(--font-sans);
  color: var(--color-text-dark);
  margin-bottom: 10px;
}

.client-name {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: bold;
  color: var(--color-primary-brown);
}

.sub-message {
  font-size: 1rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: 40px;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.4s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; transform: translateY(0); }
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 2;
  width: 100%;
}

.btn-primary-outline {
  display: inline-block;
  padding: 12px 30px;
  border: 1px solid var(--color-text-dark);
  color: var(--color-text-dark);
  font-family: var(--font-serif);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: transparent;
  white-space: nowrap; /* Забороняємо перенос тексту */
}

.btn-primary-outline:hover {
  background-color: var(--color-text-dark);
  color: #fff;
}

.btn-simple {
  font-size: 0.9rem;
  color: var(--color-text-light);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
}
.btn-simple:hover { color: var(--color-highlight); }

@media (max-width: 600px) {
  .title { font-size: 1.8rem; }
  .success-card { padding: 40px 20px; }

  /* Адаптація кнопки */
  .btn-primary-outline {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 10px; /* Менші бокові відступи */
    font-size: 0.8rem;  /* Трохи менший шрифт */
    white-space: normal; /* Дозволяємо перенос, якщо вже зовсім не лізе */
  }
}
</style>