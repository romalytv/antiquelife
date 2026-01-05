<template>
  <div class="success-page">
    <div class="success-card fade-in">

      <div class="icon-container">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>

      <h1>Дякуємо за замовлення!</h1>
      <p class="subtitle">Ваш запит успішно прийнято в обробку.</p>

      <div class="order-details">
        <span class="label">Номер замовлення:</span>
        <div class="order-id">#{{ orderId }}</div>
      </div>

      <div class="info-text">
        <p>Ми надіслали деталі на вашу електронну пошту.</p>
        <p>Менеджер зв'яжеться з вами найближчим часом для підтвердження деталей доставки.</p>
      </div>

      <div class="actions">
        <router-link to="/market" class="btn secondary">До каталогу</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
// Отримуємо ID замовлення з URL
const orderId = computed(() => route.params.id || '???');
</script>

<style scoped>
.success-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  font-family: 'Georgia', serif;
  padding: 20px;
}

.success-card {
  background: white;
  padding: 50px 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  text-align: center;
  max-width: 500px;
  width: 100%;
  border-top: 5px solid #d4af37;
}

h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 28px;
}

.subtitle {
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 16px;
}

.order-details {
  background: #fffcf5;
  border: 1px dashed #d4af37;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.label {
  font-size: 12px;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 1px;
}

.order-id {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 5px;
  font-family: monospace;
}

.info-text p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
  font-size: 15px;
}

.actions {
  margin-top: 40px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  text-decoration: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s;
  font-family: 'Helvetica', sans-serif;
}

.btn.primary {
  background-color: #2c3e50;
  color: white;
}
.btn.primary:hover {
  background-color: #d4af37;
  transform: translateY(-2px);
}

.btn.secondary {
  background-color: white;
  color: #2c3e50;
  border: 1px solid #ddd;
}
.btn.secondary:hover {
  border-color: #2c3e50;
}

/* --- АНІМАЦІЯ ГАЛОЧКИ --- */
.icon-container {
  margin-bottom: 25px;
}
.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  box-shadow: inset 0 0 0 #10b981;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}
.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #10b981;
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
@keyframes fill { 100% { box-shadow: inset 0 0 0 50px #10b981; } }

.fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Мобільна версія */
@media (max-width: 600px) {
  .actions { flex-direction: column; }
  .btn { width: 100%; text-align: center; box-sizing: border-box; }
}
</style>