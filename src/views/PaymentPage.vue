<template>
  <div class="payment-page-container">
    <div class="payment-card fade-in">
      <div class="card-border"></div>

      <h1 class="section-cursive-title">{{ $t('payment.title') }} #{{ orderId }}</h1>

      <div v-if="loading" class="status-msg">
        <span class="loader-spinner"></span>
        <p>{{ $t('payment.loading') }}</p>
      </div>

      <div v-else-if="error" class="error-msg">
        <p>{{ error }}</p>
        <button @click="loadPaymentData" class="btn-retry">{{ $t('payment.retry') }}</button>
      </div>

      <div v-else class="payment-details">
        <p class="amount-label">{{ $t('payment.amountLabel') }}</p>
        <p class="amount-value">{{ formatPrice(amount) }} €</p>

        <div class="decorative-separator"></div>
        <p class="description">{{ description }}</p>

        <button @click="submitToLiqPay" class="btn-pay-liqpay">
          {{ $t('payment.payButton') }}
        </button>

        <div class="secure-note">
          <span class="lock-icon">🔒</span> {{ $t('payment.secureNote') }}
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
import { useI18n } from 'vue-i18n'; // ДОДАНО
import axios from 'axios';

const route = useRoute();
const { t } = useI18n(); // ДОДАНО
const orderId = route.params.id;

const loading = ref(true);
const error = ref(null);
const amount = ref(0);
const description = ref('');
const liqpayData = ref({ data: '', signature: '' });
const liqpayForm = ref(null);

const formatPrice = (p) => p?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const loadPaymentData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`/api/payments/checkout/${orderId}`);

    liqpayData.value.data = response.data.data;
    liqpayData.value.signature = response.data.signature;

    try {
      const binaryString = atob(response.data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decodedString = new TextDecoder('utf-8').decode(bytes);
      const jsonParams = JSON.parse(decodedString);

      amount.value = jsonParams.amount;
      description.value = jsonParams.description;
    } catch (e) {
      console.warn("Помилка парсингу даних LiqPay:", e);
    }

  } catch (err) {
    console.error(err);
    error.value = t('payment.errorLoad');
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
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");

.payment-page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: var(--color-bg-main, #fff);
  padding: 40px 20px;
}

.payment-card {
  background: transparent;
  padding: 60px 40px;
  border-radius: 0;
  text-align: center;
  max-width: 500px;
  width: 100%;
  border: 1px solid #eaeaea;
  position: relative;
}

/* Декоративна внутрішня рамка */
.card-border {
  position: absolute;
  top: 8px; left: 8px; right: 8px; bottom: 8px;
  border: 1px solid rgba(6, 28, 11, 0.04);
  pointer-events: none;
}

.section-cursive-title {
  font-family: var(--font-hand, 'Great Vibes', cursive);
  font-size: 3.5rem;
  color: var(--color-text-dark, #111);
  margin: 0 0 40px 0;
  font-weight: 400;
  line-height: 1.1;
  position: relative;
  z-index: 2;
}

/* --- СТАТУСИ --- */
.status-msg, .error-msg {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: var(--color-text-light, #666);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.error-msg { color: #d32f2f; }

.loader-spinner {
  width: 30px; height: 30px;
  border: 2px solid #eaeaea;
  border-top-color: var(--color-primary-green, #061c0b);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* --- ДЕТАЛІ ОПЛАТИ --- */
.payment-details {
  position: relative;
  z-index: 2;
}

.amount-label {
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #888;
  margin-bottom: 5px;
}

.amount-value {
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
  font-size: 3.5rem;
  color: var(--color-primary-green, #061c0b);
  margin: 0;
}

.decorative-separator {
  width: 40px; height: 1px;
  background-color: var(--color-highlight, #b08d57);
  margin: 25px auto;
}

.description {
  font-family: 'Montserrat', sans-serif;
  color: #555;
  font-size: 14px;
  margin-bottom: 40px;
  font-weight: 400;
}

/* --- КНОПКА --- */
.btn-pay-liqpay {
  background-color: #000; /* Строгий чорний замість яскраво-зеленого */
  color: white;
  border: none;
  padding: 18px 30px;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 0;
  cursor: pointer;
  transition: background 0.3s;
  width: 100%;
}
.btn-pay-liqpay:hover { background-color: #333; }

.btn-retry {
  background: transparent; border: 1px solid #d32f2f; color: #d32f2f;
  padding: 10px 20px; cursor: pointer; text-transform: uppercase; font-size: 12px;
}
.btn-retry:hover { background: #d32f2f; color: #fff; }

.secure-note {
  margin-top: 20px;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  color: #888;
  display: flex; justify-content: center; align-items: center; gap: 8px;
}
.lock-icon { font-size: 14px; opacity: 0.7; }

.fade-in { animation: fadeIn 0.6s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 600px) {
  .section-cursive-title { font-size: 2.8rem; }
  .amount-value { font-size: 2.8rem; }
  .payment-card { padding: 40px 20px; border: none; }
  .card-border { display: none; }
}
</style>