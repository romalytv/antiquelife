<template>
  <div class="success-page-container">
    <div class="success-card">

      <div class="card-border"></div>

      <div class="wax-seal-wrapper">
        <div class="wax-seal">
          <svg viewBox="0 0 100 100" class="seal-svg">
            <circle cx="50" cy="50" r="45" fill="#8b0000" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="#5c0000" stroke-width="2" />
            <path d="M30 50 L45 65 L75 35" fill="none" stroke="#e0c097" stroke-width="5" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <div class="content-text fade-in">
        <h1 class="section-cursive-title">Лист отримано</h1>
        <div class="decorative-separator">✻</div>

        <p class="message">
          Дякуємо, <span class="client-name">{{ clientName }}</span>.
        </p>
        <p class="sub-message">
          Ваш запит дбайливо доставлено до нашої скриньки.<br>
          Ми зв'яжемося з вами найближчим часом.
        </p>

        <div class="actions">
          <router-link to="/market" class="btn-main">
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
  background-color: #f7f7f7; /* Світло-сірий фон сайту */
  padding: 20px;
}

.success-card {
  background: #fff;
  width: 100%;
  max-width: 600px;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03); /* М'яка тінь */
  box-sizing: border-box;
  border: 1px solid #eaeaea;
}

/* Рамка-декор всередині картки */
.card-border {
  position: absolute;
  top: 15px; left: 15px; right: 15px; bottom: 15px;
  border: 1px solid #eaeaea;
  pointer-events: none;
}
.card-border::after {
  content: '';
  position: absolute;
  top: 4px; left: 4px; right: 4px; bottom: 4px;
  border: 1px solid rgba(6, 28, 11, 0.05); /* Дуже легкий зеленуватий відтінок */
}

/* --- СУРГУЧЕВА ПЕЧАТКА --- */
.wax-seal-wrapper {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  animation: stampIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  opacity: 0;
  transform: scale(2);
}

.seal-svg {
  width: 90px;
  height: 90px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
}

@keyframes stampIn {
  to { opacity: 1; transform: scale(1); }
}

/* --- ТЕКСТИ --- */
.section-cursive-title {
  /* Елегантний рукописний шрифт */
  font-family: 'Snell Roundhand', 'Bickham Script Pro', 'Brush Script MT', 'Great Vibes', cursive, serif;
  font-style: italic;
  font-size: 3rem;
  font-weight: normal;
  color: #111;
  margin: 0;
}

.decorative-separator {
  font-size: 1.5rem;
  color: #061c0b; /* Темно-зелений */
  margin: 15px 0 25px;
  opacity: 0.7;
}

.message {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

.client-name {
  font-family: 'Georgia', serif;
  font-style: italic;
  font-size: 1.1em;
  color: #061c0b; /* Темно-зелений */
}

.sub-message {
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.05em;
  color: #666;
  margin-bottom: 40px;
}

/* --- АНІМАЦІЯ ПОЯВИ --- */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.4s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; transform: translateY(0); }
}

/* --- КНОПКИ --- */
.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 2;
  width: 100%;
}

.btn-main {
  display: inline-block;
  padding: 16px 30px;
  border: none;
  border-radius: 4px;
  background-color: #061c0b; /* Темно-зелений */
  color: #fff;
  font-family: 'Georgia', serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 1rem;
  transition: background 0.3s ease;
  text-decoration: none;
  box-sizing: border-box;
}

.btn-main:hover {
  background-color: #0a2e12;
}

.btn-simple {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  color: #888;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s;
  letter-spacing: 0.05em;
}
.btn-simple:hover {
  color: #061c0b;
  text-decoration: underline;
}

/* --- МОБІЛЬНА АДАПТАЦІЯ --- */
@media (max-width: 600px) {
  .section-cursive-title { font-size: 2.2rem; }
  .success-card { padding: 50px 20px; border: none; box-shadow: none; background: transparent; }
  .card-border { display: none; } /* Прибираємо подвійну рамку на мобільному для чистоти */

  .btn-main {
    width: 100%;
    text-align: center;
    padding: 16px 10px;
    font-size: 0.95rem;
  }
}
</style>