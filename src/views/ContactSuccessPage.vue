<template>
  <div class="success-page-container">
    <div class="success-card">

      <div class="card-border"></div>

      <div class="wax-seal-wrapper">
        <div class="wax-seal">
          <svg viewBox="0 0 100 100" class="seal-svg">
            <circle cx="50" cy="50" r="45" fill="var(--color-primary-green, #0a2e1c)" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="var(--color-highlight, #b08d57)" stroke-width="1.5" />
            <path d="M30 50 L45 65 L75 35" fill="none" stroke="var(--color-highlight, #b08d57)" stroke-width="4" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <div class="content-text fade-in">
        <h1 class="section-cursive-title">{{ $t('contactSuccess.title') }}</h1>
        <div class="decorative-separator">✻</div>

        <p class="message">
          {{ $t('contactSuccess.thankYou') }} <span class="client-name">{{ clientName }}</span>.
        </p>
        <p class="sub-message">
          {{ $t('contactSuccess.messageLine1') }}<br>
          {{ $t('contactSuccess.messageLine2') }}
        </p>

        <div class="actions">
          <router-link :to="$localPath('/market')" class="btn-main">
            {{ $t('contactSuccess.btnMarket') }}
          </router-link>

          <router-link :to="$localPath('/')" class="btn-simple">
            {{ $t('contactSuccess.btnHome') }}
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n'; // ДОДАНО

const route = useRoute();
const { t } = useI18n(); // ДОДАНО

// Беремо ім'я з параметрів URL, або пишемо локалізоване "Гість"
const clientName = computed(() => route.query.name || t('contactSuccess.guest'));
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");

.success-page-container {
  min-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-main); /* Чистий білий фон */
  padding: 20px;
}

.success-card {
  background: transparent;
  width: 100%;
  max-width: 600px;
  padding: 60px 40px;
  text-align: center;
  position: relative;
  box-shadow: none; /* Прибрали тінь для люкс-мінімалізму */
  box-sizing: border-box;
  border: 1px solid #eaeaea; /* Тонка строга рамка */
}

/* Рамка-декор всередині картки */
.card-border {
  position: absolute;
  top: 10px; left: 10px; right: 10px; bottom: 10px;
  border: 1px solid #f5f5f5;
  pointer-events: none;
}
.card-border::after {
  content: '';
  position: absolute;
  top: 4px; left: 4px; right: 4px; bottom: 4px;
  border: 1px solid rgba(6, 28, 11, 0.03);
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
  /* Легка тінь лише на самій печатці для реалістичності */
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

@keyframes stampIn {
  to { opacity: 1; transform: scale(1); }
}

/* --- ТЕКСТИ --- */
.section-cursive-title {
  font-family: var(--font-hand, 'Great Vibes', cursive);
  font-style: normal;
  font-size: 3.5rem;
  font-weight: 400;
  color: var(--color-text-dark, #111);
  margin: 0;
  line-height: 1.2;
}

.decorative-separator {
  font-size: 1.5rem;
  color: var(--color-highlight, #b08d57); /* Золотистий колір */
  margin: 15px 0 25px;
}

.message {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-dark, #333);
  margin-bottom: 10px;
  letter-spacing: 0.05em;
}

.client-name {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; /* Елегантний шрифт для імені */
  font-style: italic;
  font-size: 1.1em;
  color: var(--color-highlight, #b08d57); /* Золотистий акцент */
}

.sub-message {
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  font-size: 14px;
  line-height: 1.8;
  letter-spacing: 0.05em;
  color: var(--color-text-light, #666);
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
  gap: 20px;
  position: relative;
  z-index: 2;
  width: 100%;
}

.btn-main {
  display: inline-block;
  padding: 16px 35px;
  border: none;
  border-radius: 0; /* Строгі кути */
  background-color: var(--color-primary-green, #061c0b);
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.3s ease;
  text-decoration: none;
  box-sizing: border-box;
}

.btn-main:hover {
  background-color: #0a2e12;
}

.btn-simple {
  font-family: 'Montserrat', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-dark, #333);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-decoration: none;
  border: none;
  border-bottom: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding-bottom: 3px;
}

.btn-simple:hover {
  color: var(--color-highlight, #b08d57);
  border-bottom-color: var(--color-highlight, #b08d57);
}

/* --- МОБІЛЬНА АДАПТАЦІЯ --- */
@media (max-width: 600px) {
  .section-cursive-title { font-size: 2.8rem; }
  .success-card { padding: 40px 15px; border: none; }
  .card-border { display: none; }

  .btn-main {
    width: 100%;
    text-align: center;
    padding: 16px 10px;
  }
}
</style>