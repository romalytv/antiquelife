<template>
  <div class="success-page">
    <div class="success-card fade-in">

      <div class="icon-container">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>

      <h1 class="section-cursive-title">{{ $t('paymentSuccess.title') }}</h1>

      <p class="subtitle">
        {{ $t('paymentSuccess.message') }}
      </p>

      <div v-if="orderId" class="order-details">
        <span class="label">{{ $t('paymentSuccess.orderNumber') }}</span>
        <div class="order-id">#{{ orderId }}</div>
      </div>

      <div class="info-text">
        <p>📩 {{ $t('paymentSuccess.emailNote') }}</p>
      </div>

      <div class="actions">
        <router-link :to="$localPath('/')" class="btn-main">
          {{ $t('paymentSuccess.btnHome') }}
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();
const orderId = ref('');

onMounted(() => {
  if (route.query.order_id || route.query.id) {
    orderId.value = route.query.order_id || route.query.id;
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");

.success-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-main, #fff); /* Чисто білий фон */
  padding: 20px;
}

.success-card {
  background: transparent;
  padding: 60px 40px;
  text-align: center;
  max-width: 550px;
  width: 100%;
  border: 1px solid #eaeaea; /* Тонка строга рамка */
  position: relative;
  box-shadow: none; /* Жодних тіней */
}

/* Декоративна внутрішня рамка для люкс-ефекту */
.success-card::after {
  content: '';
  position: absolute;
  top: 6px; left: 6px; right: 6px; bottom: 6px;
  border: 1px solid rgba(6, 28, 11, 0.04);
  pointer-events: none;
}

/* --- Тексти --- */
.section-cursive-title {
  font-family: var(--font-hand, 'Great Vibes', cursive);
  font-size: 3.5rem;
  color: var(--color-text-dark, #111);
  margin: 0 0 10px 0;
  font-weight: 400;
  line-height: 1.2;
}

.subtitle {
  font-family: 'Montserrat', sans-serif;
  color: var(--color-text-light, #666);
  margin-bottom: 35px;
  font-size: 15px;
  letter-spacing: 0.05em;
  line-height: 1.6;
}

.order-details {
  background: #fdfdfd;
  border: 1px solid #eaeaea;
  padding: 25px;
  margin-bottom: 35px;
}

.label {
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 2px;
}

.order-id {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
  font-size: 28px;
  color: var(--color-primary-green, #061c0b);
  margin-top: 10px;
  letter-spacing: 1px;
}

.info-text p {
  font-family: 'Montserrat', sans-serif;
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
  font-size: 14px;
}

/* --- Кнопка --- */
.actions {
  margin-top: 40px;
  position: relative;
  z-index: 2; /* Поверх внутрішньої рамки */
  display: flex;
  justify-content: center;
}

.btn-main {
  display: inline-block;
  width: 100%;
  padding: 18px 30px;
  border: none;
  border-radius: 0;
  background-color: var(--color-primary-green, #061c0b);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.3s ease;
  text-decoration: none;
  box-sizing: border-box;
}

.btn-main:hover {
  background-color: #0a2e12;
}

/* --- Анімація галочки --- */
.icon-container {
  margin-bottom: 30px;
}
.checkmark {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0 0 0 var(--color-primary-green, #061c0b);
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}
.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: var(--color-primary-green, #061c0b);
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke { 100% { stroke-dashoffset: 0; } }
@keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
@keyframes fill { 100% { box-shadow: inset 0 0 0 50px var(--color-primary-green, #061c0b); } }

/* Поява картки */
.fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Мобільна адаптація */
@media (max-width: 600px) {
  .section-cursive-title { font-size: 2.8rem; }
  .success-card { padding: 40px 20px; border: none; }
  .success-card::after { display: none; }
}
</style>