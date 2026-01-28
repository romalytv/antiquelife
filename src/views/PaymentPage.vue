<template>
  <div class="payment-page-container">
    <div class="payment-card">
      <h2>Оплата замовлення #{{ orderId }}</h2>

      <div v-if="loading" class="status-msg">
        Завантаження даних для оплати...
      </div>

      <div v-else-if="error" class="error-msg">
        {{ error }}
        <br>
        <button @click="loadPaymentData" class="btn-retry">Спробувати знову</button>
      </div>

      <div v-else class="payment-details">
        <p class="amount-label">Сума до сплати:</p>
        <p class="amount-value">{{ amount }} UAH</p>
        <p class="description">{{ description }}</p>

        <button @click="submitToLiqPay" class="btn-pay-liqpay">
          Оплатити через LiqPay
        </button>

        <div class="secure-note">
          🔒 Ви будете перенаправлені на захищену сторінку банку.
        </div>
      </div>

      <form ref="liqpayForm" method="POST" action="https://www.liqpay.ua/api/3/checkout" v-show="false">
        <input type="hidden" name="data" :value="liqpayData.data" />
        <input type="hidden" name="signature" :value="liqpayData.signature" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const orderId = route.params.id; // Отримуємо ID з URL

const loading = ref(true);
const error = ref(null);
const amount = ref(0);
const description = ref('');
const liqpayData = ref({ data: '', signature: '' });
const liqpayForm = ref(null);

// Завантаження даних з твого бекенду
const loadPaymentData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // 1. Звертаємось до PaymentController
    const response = await axios.get(`http://localhost:8080/api/payments/checkout/${orderId}`);

    // 2. Зберігаємо дані для форми LiqPay
    liqpayData.value.data = response.data.data;
    liqpayData.value.signature = response.data.signature;

    // 3. Декодуємо data для відображення суми та опису (з підтримкою UTF-8)
    try {
      // Крок А: Декодуємо Base64 в рядок (де кирилиця ще "поламана")
      const binaryString = atob(response.data.data);

      // Крок Б: Перетворюємо цей рядок у масив байтів
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Крок В: Декодуємо байти як UTF-8 (тепер кирилиця стане читабельною)
      const decodedString = new TextDecoder('utf-8').decode(bytes);

      const jsonParams = JSON.parse(decodedString);
      amount.value = jsonParams.amount;
      description.value = jsonParams.description; // Тепер тут буде нормальний текст
    } catch (e) {
      console.warn("Не вдалося розпарсити дані для відображення, але кнопка працюватиме.", e);
    }

  } catch (err) {
    console.error(err);
    error.value = "Не вдалося отримати дані для оплати. Перевірте з'єднання.";
  } finally {
    loading.value = false;
  }
};

const submitToLiqPay = () => {
  if (liqpayForm.value) {
    liqpayForm.value.submit();
  }
};

onMounted(() => {
  loadPaymentData();
});
</script>

<style scoped>
.payment-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background-color: #f9f9f9;
  padding: 20px;
}

.payment-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
  border: 1px solid #e0e0e0;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.amount-label {
  font-size: 1.1rem;
  color: #666;
}

.amount-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 10px 0 20px 0;
}

.description {
  color: #888;
  margin-bottom: 30px;
  font-style: italic;
}

.btn-pay-liqpay {
  background-color: #76b900; /* LiqPay green */
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
}

.btn-pay-liqpay:hover {
  background-color: #5da000;
}

.secure-note {
  margin-top: 15px;
  font-size: 0.9rem;
  color: #777;
}

.error-msg {
  color: #d9534f;
  margin-bottom: 20px;
}

.btn-retry {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
}
</style>