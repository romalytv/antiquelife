<template>
  <div class="success-page">
    <div class="card">
      <div class="icon-container">
        <div class="check-icon">
          <span class="icon-line line-tip"></span>
          <span class="icon-line line-long"></span>
          <div class="icon-circle"></div>
          <div class="icon-fix"></div>
        </div>
      </div>

      <h1 class="title">Оплата успішна!</h1>

      <p class="message">
        Дякуємо за ваше замовлення. Ми вже почали його обробку.
      </p>

      <div v-if="orderId" class="order-info">
        <span>Номер замовлення:</span>
        <strong>#{{ orderId }}</strong>
      </div>

      <p class="sub-message">
        📩 Електронний чек та деталі замовлення відправлено на вашу пошту.
      </p>

      <div class="actions">
        <button @click="goToHome" class="btn btn-primary">
          На головну
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const orderId = ref('');

onMounted(() => {
  // Якщо ви передаєте order_id через URL (наприклад ?order_id=...)
  // LiqPay при redirect може додавати свої параметри, але ваш бекенд
  // може сформувати result_url типу /success?id=123
  if (route.query.order_id || route.query.id) {
    orderId.value = route.query.order_id || route.query.id;
  }

  // Додатково: тут можна очистити кошик (Pinia/Vuex store), якщо він ще не пустий
  // cartStore.clearCart();
});

const goToHome = () => {
  router.push('/');
};

const goToProfile = () => {
  router.push('/profile'); // або '/orders'
};
</script>

<style scoped>
/* Основний контейнер на весь екран */
.success-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background-color: #f8f9fa;
  padding: 20px;
}

/* Картка */
.card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.5s ease-out;
}

/* Тексти */
.title {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 10px;
  margin-top: 20px;
}

.message {
  color: #555;
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.sub-message {
  font-size: 14px;
  color: #888;
  margin-bottom: 30px;
  background: #f0fdf4;
  padding: 10px;
  border-radius: 8px;
  color: #166534;
}

.order-info {
  margin: 20px 0;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  color: #666;
}

/* Кнопки */
.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 600;
}

.btn-primary {
  background-color: #10b981; /* Зелений LiqPay */
  color: white;
}

.btn-primary:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

/* --- Анімація галочки (Pure CSS) --- */
.icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4CAF50;
}

.check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.icon-line {
  height: 5px;
  background-color: #4CAF50;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(76, 175, 80, .5);
}

.icon-fix {
  top: 8px;
  width: 5px;
  height: 85px;
  position: absolute;
  left: 28px;
  transform: rotate(-45deg);
  z-index: 1;
}

@keyframes icon-line-tip {
  0% { width: 0; left: 1px; top: 19px; }
  54% { width: 0; left: 1px; top: 19px; }
  70% { width: 50px; left: -8px; top: 37px; }
  84% { width: 17px; left: 21px; top: 48px; }
  100% { width: 25px; left: 14px; top: 46px; }
}

@keyframes icon-line-long {
  0% { width: 0; right: 46px; top: 54px; }
  65% { width: 0; right: 46px; top: 54px; }
  84% { width: 55px; right: 0px; top: 35px; }
  100% { width: 47px; right: 8px; top: 38px; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>