<template>
  <div class="cart-container">
    <h1>Ваш Кошик</h1>

    <div v-if="cartStore.items.length > 0" class="cart-layout">

      <div class="cart-list">
        <div v-for="item in cartStore.items" :key="item.product_id" class="cart-item">
          <div class="item-image">
            <img :src="item.image_url || '/placeholder.png'" :alt="item.name" />
          </div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="category">{{ item.category ? item.category.categoryName : 'Антикваріат' }}</p>
            <div class="quantity-controls">
              <small>Кількість: {{ item.quantity }}</small>
            </div>
          </div>
          <div class="item-price">
            {{ formatPrice(item.price * item.quantity) }} ₴
          </div>
          <button @click="cartStore.removeFromCart(item.product_id)" class="btn-remove">✕</button>
        </div>

        <div class="cart-total-line">
          <span>Разом:</span>
          <span class="total-sum">{{ formatPrice(cartStore.totalPrice) }} ₴</span>
        </div>
      </div>

      <div class="checkout-form">
        <h3>Оформлення замовлення</h3>
        <form @submit.prevent="handleCheckout">

          <div class="form-row">
            <div class="form-group half">
              <label>Ім'я</label>
              <input v-model="form.firstName" required placeholder="Іван" />
            </div>
            <div class="form-group half">
              <label>Прізвище</label>
              <input v-model="form.lastName" required placeholder="Франко" />
            </div>
          </div>

          <div class="form-group">
            <label>Телефон</label>
            <input v-model="form.phone" required type="tel" placeholder="380991234567" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" required type="email" placeholder="mail@example.com" />
          </div>

          <div class="delivery-switch">
            <label :class="{ active: deliveryType === 'postal' }">
              <input type="radio" value="postal" v-model="deliveryType">
              <span>📮 На відділення</span>
            </label>
            <label :class="{ active: deliveryType === 'courier' }">
              <input type="radio" value="courier" v-model="deliveryType">
              <span>🚚 Адресна доставка</span>
            </label>
          </div>

          <div class="address-block">
            <div class="form-group">
              <label>Місто / Населений пункт</label>
              <input v-model="addressParts.city" required placeholder="напр. Київ" />
            </div>

            <div v-if="deliveryType === 'postal'" class="form-group">
              <label>Номер відділення або поштомат</label>
              <input v-model="addressParts.office" required placeholder="Відділення №1" />
            </div>

            <div v-if="deliveryType === 'courier'" class="form-row">
              <div class="form-group">
                <label>Вулиця</label>
                <input v-model="addressParts.street" required placeholder="вул. Хрещатик" />
              </div>
              <div class="form-group small">
                <label>Буд.</label>
                <input v-model="addressParts.house" required placeholder="1" />
              </div>
              <div class="form-group small">
                <label>Кв.</label>
                <input v-model="addressParts.apt" placeholder="5" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Країна</label>
            <input v-model="form.country" required placeholder="Україна" />
          </div>

          <button type="submit" class="btn-checkout" :disabled="isSubmitting">
            {{ isSubmitting ? 'Обробка...' : 'Підтвердити замовлення' }}
          </button>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </form>
      </div>

    </div>

    <div v-else class="empty-cart">
      <div class="empty-icon">🛒</div>
      <p>Ваш кошик порожній.</p>
      <router-link to="/market" class="btn-back">Перейти до каталогу</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();
const isSubmitting = ref(false);
const errorMessage = ref('');

// Тип доставки: 'postal' або 'courier'
const deliveryType = ref('postal');

// Окремі частини адреси (не відправляються на бек напряму)
const addressParts = reactive({
  city: '',
  office: '',
  street: '',
  house: '',
  apt: ''
});

// Основна форма (структура як вимагає Backend DTO)
const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '', // Сюди ми запишемо склеєну адресу
  country: 'Україна'
});

const formatPrice = (price) => {
  return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const handleCheckout = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  // 1. Формуємо повний рядок адреси залежно від типу
  if (deliveryType.value === 'postal') {
    form.address = `${addressParts.city}, ${addressParts.office}`;
  } else {
    const aptStr = addressParts.apt ? `, кв. ${addressParts.apt}` : '';
    form.address = `${addressParts.city}, вул. ${addressParts.street}, буд. ${addressParts.house}${aptStr}`;
  }

  try {
    // 2. Відправляємо на бекенд вже готовий об'єкт form
    await cartStore.submitOrder(form);

    alert("Дякуємо! Ваше замовлення успішно прийнято.");
    router.push('/market');
  } catch (error) {
    console.error(error);
    errorMessage.value = "Сталася помилка при замовленні.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Основні стилі (ті ж самі, що були, плюс нові) */
.cart-container { max-width: 1100px; margin: 40px auto; padding: 20px; font-family: 'Georgia', serif; color: #2c3e50; }
h1 { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #d4af37; display: inline-block; padding-bottom: 10px; position: relative; left: 50%; transform: translateX(-50%); }

.cart-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 50px; }

/* Список */
.cart-item { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #eee; padding: 20px 0; }
.item-image img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.item-info { flex-grow: 1; }
.item-price { font-weight: bold; font-size: 18px; white-space: nowrap; }
.cart-total-line { display: flex; justify-content: space-between; margin-top: 20px; font-size: 22px; font-weight: bold; border-top: 2px solid #eee; padding-top: 20px; }
.total-sum { color: #d4af37; }
.btn-remove { border: none; background: none; color: #aaa; cursor: pointer; font-size: 20px; }

/* ФОРМА */
.checkout-form { background: #f8f9fa; padding: 30px; border-radius: 8px; border: 1px solid #eee; }
.checkout-form h3 { margin-top: 0; margin-bottom: 20px; text-align: center; }

/* Стилі для рядків форми */
.form-row { display: flex; gap: 15px; }
.form-group { margin-bottom: 15px; width: 100%; }
.half { width: 50%; }
.small { width: 25%; }

.form-group label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: bold; color: #555; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 15px; box-sizing: border-box; }
.form-group input:focus { border-color: #d4af37; outline: none; }

/* Перемикач доставки */
.delivery-switch {
  display: flex;
  background: #e9ecef;
  border-radius: 4px;
  padding: 4px;
  margin-bottom: 15px;
}
.delivery-switch label {
  flex: 1;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
  color: #666;
}
.delivery-switch label.active {
  background: white;
  color: #2c3e50;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.delivery-switch input { display: none; } /* Ховаємо стандартні радіо-кнопки */

/* Блок адреси з легким фоном */
.address-block {
  background: #fff;
  border: 1px dashed #ccc;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.btn-checkout { width: 100%; padding: 15px; background: #2c3e50; color: white; border: none; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: background 0.3s; }
.btn-checkout:hover { background: #d4af37; }
.btn-checkout:disabled { background: #95a5a6; cursor: wait; }

.error-msg { color: red; text-align: center; margin-top: 10px; }
.empty-cart { text-align: center; margin-top: 60px; }

@media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } }
</style>