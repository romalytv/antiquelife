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
            <p class="price-single">{{ formatPrice(item.price) }} ₴</p>
            <p class="category">{{ item.category ? item.category.categoryName : 'Антикваріат' }}</p>
          </div>

          <div class="quantity-controls">
            <div v-if="item.maxStock > 1" class="qty-selector">
              <button class="qty-btn" @click="cartStore.updateQuantity(item.product_id, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
              <span class="qty-number">{{ item.quantity }}</span>
              <button class="qty-btn" @click="cartStore.updateQuantity(item.product_id, item.quantity + 1)" :disabled="item.quantity >= item.maxStock">+</button>
            </div>
            <div v-else><small>Кількість: {{ item.quantity }}</small></div>

            <div v-if="item.quantity >= item.maxStock && item.maxStock > 1" class="stock-warning">
              Максимум на складі
            </div>
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
              <input v-model="form.firstName" required placeholder="Іван" class="gold-input"/>
            </div>
            <div class="form-group half">
              <label>Прізвище</label>
              <input v-model="form.lastName" required placeholder="Франко" class="gold-input"/>
            </div>
          </div>
          <div class="form-group">
            <label>Телефон</label>
            <input v-model="form.phone" required type="tel" placeholder="+380..." class="gold-input"/>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" required type="email" placeholder="ivan@example.com" class="gold-input"/>
          </div>

          <div class="delivery-label">Спосіб доставки:</div>
          <div class="delivery-switch">
            <label :class="{ active: form.deliveryType === 'NOVA_POSHTA' }">
              <input type="radio" value="NOVA_POSHTA" v-model="form.deliveryType">
              <span>📮 Нова Пошта</span>
            </label>

            <label :class="{ active: form.deliveryType === 'COURIER' }">
              <input type="radio" value="COURIER" v-model="form.deliveryType">
              <span>🚚 Кур'єр (Адресна)</span>
            </label>

            <label :class="{ active: form.deliveryType === 'POST_OFFICE' }">
              <input type="radio" value="POST_OFFICE" v-model="form.deliveryType">
              <span>📦 Інша пошта</span>
            </label>

            <label :class="{ active: form.deliveryType === 'SELF_PICKUP' }">
              <input type="radio" value="SELF_PICKUP" v-model="form.deliveryType">
              <span>shop Самовивіз</span>
            </label>
          </div>

          <div v-if="form.deliveryType === 'NOVA_POSHTA'" class="address-block slide-down">
            <div class="form-group relative">
              <label>Місто (НП)</label>
              <input
                  type="text"
                  v-model="citySearchQuery"
                  @input="onCitySearchInput"
                  placeholder="Введіть назву..."
                  class="gold-input search-icon"
              />
              <transition name="fade">
                <ul v-if="cities.length > 0" class="custom-dropdown">
                  <li v-for="city in cities" :key="city.Ref" @click="selectCity(city)">
                    <span class="main-text">{{ city.Description }}</span>
                    <span class="sub-text">{{ city.AreaDescription }} обл.</span>
                  </li>
                </ul>
              </transition>
            </div>
            <transition name="fade">
              <div class="form-group" v-if="form.city">
                <label>Відділення або поштомат</label>
                <input type="text" v-model="warehouseSearchQuery" placeholder="№ відділення..." class="gold-input search-icon" :disabled="warehouses.length === 0"/>
                <div class="custom-list-container">
                  <div v-if="warehouses.length === 0" class="empty-list-msg">Спочатку оберіть місто</div>
                  <div v-else-if="filteredWarehouses.length === 0" class="empty-list-msg">Нічого не знайдено</div>
                  <div v-else v-for="w in filteredWarehouses" :key="w.Ref" class="list-item" :class="{ 'selected': form.postOfficeBranch === w.Description }" @click="selectWarehouse(w)">
                    <div class="list-item-content"><span class="warehouse-name">{{ w.Description }}</span></div>
                    <span v-if="form.postOfficeBranch === w.Description" class="check-icon">✔</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div v-if="form.deliveryType === 'COURIER'" class="address-block slide-down">
            <div class="form-group">
              <label>Місто</label>
              <input v-model="form.city" required placeholder="Київ" class="gold-input"/>
            </div>
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label>Вулиця</label>
                <input v-model="form.street" required placeholder="Хрещатик" class="gold-input"/>
              </div>
              <div class="form-group" style="flex: 1;">
                <label>Буд.</label>
                <input v-model="form.building" required placeholder="1" class="gold-input"/>
              </div>
              <div class="form-group" style="flex: 1;">
                <label>Кв.</label>
                <input v-model="form.apartment" placeholder="5" class="gold-input"/>
              </div>
            </div>
          </div>

          <div v-if="form.deliveryType === 'POST_OFFICE'" class="address-block slide-down">
            <div class="form-group">
              <label>Місто</label>
              <input v-model="form.city" required placeholder="Львів" class="gold-input"/>
            </div>
            <div class="form-group">
              <label>Служба та відділення</label>
              <textarea v-model="form.postOfficeBranch" required rows="2" placeholder="Укрпошта, індекс 01001, відділення 5" class="gold-input"></textarea>
            </div>
          </div>

          <div v-if="form.deliveryType === 'SELF_PICKUP'" class="info-block slide-down">
            <p>📍 <strong>Адреса салону:</strong> м. Київ, вул. Антикварна, 1.</p>
          </div>

          <div class="form-group">
            <label>Коментар</label>
            <textarea v-model="form.comment" rows="2" class="gold-input"></textarea>
          </div>
          <div class="form-group">
            <label>Спосіб оплати</label>
            <select v-model="form.paymentMethod" class="gold-input">
              <option value="LIQPAY">Карткою на сайті</option>
              <option value="CASH_ON_DELIVERY">Оплата при отриманні</option>
              <option value="IBAN">Переказ на IBAN</option>
            </select>
          </div>

          <button type="submit" class="btn-checkout" :disabled="isSubmitting">
            {{ isSubmitting ? 'Обробка...' : 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ' }}
          </button>
          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
    <div v-else class="empty-cart">
      <p>Ваш кошик порожній.</p>
      <router-link to="/market" class="btn-back">Перейти до каталогу</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';
import axios from 'axios';

const cartStore = useCartStore();
const router = useRouter();
const isSubmitting = ref(false);
const errorMessage = ref('');
const publicAxios = axios.create();

const form = reactive({
  firstName: '', lastName: '', phone: '', email: '',
  deliveryType: 'NOVA_POSHTA',
  city: '',
  street: '', building: '', apartment: '', // Поля для кур'єра
  postOfficeBranch: '',
  paymentMethod: 'LIQPAY', comment: ''
});

// Очищення полів при зміні типу доставки
watch(() => form.deliveryType, (newVal) => {
  if (newVal === 'NOVA_POSHTA') {
    form.city = ''; form.postOfficeBranch = '';
    citySearchQuery.value = ''; warehouses.value = [];
  } else if (newVal === 'COURIER') {
    form.city = ''; form.street = ''; form.building = ''; form.apartment = '';
  } else if (newVal === 'POST_OFFICE') {
    form.city = ''; form.postOfficeBranch = '';
  }
});

// --- ЛОГІКА НП (без змін) ---
const citySearchQuery = ref('');
const cities = ref([]);
const warehouses = ref([]);
const warehouseSearchQuery = ref('');
let searchTimeout = null;

const onCitySearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  if (citySearchQuery.value.length < 2) { cities.value = []; return; }
  searchTimeout = setTimeout(async () => {
    try {
      const response = await publicAxios.get(`/api/delivery/nova-poshta/cities?query=${citySearchQuery.value}`);
      cities.value = response.data;
    } catch (e) { console.error(e); }
  }, 500);
};

const selectCity = (cityObj) => {
  form.city = cityObj.Description;
  citySearchQuery.value = cityObj.Description;
  cities.value = []; warehouses.value = [];
  if (cityObj.Ref) loadWarehouses(cityObj.Ref);
};

const loadWarehouses = async (cityRef) => {
  try {
    const response = await publicAxios.get(`/api/delivery/nova-poshta/warehouses?cityRef=${cityRef}`);
    warehouses.value = response.data;
  } catch (e) { console.error(e); }
};

const selectWarehouse = (w) => { form.postOfficeBranch = w.Description; };
const filteredWarehouses = computed(() => {
  if (!warehouseSearchQuery.value) return warehouses.value;
  return warehouses.value.filter(w => w.Description.toLowerCase().includes(warehouseSearchQuery.value.toLowerCase()));
});

// --- SUBMIT ---
const formatPrice = (p) => p?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const handleCheckout = async () => {
  // 1. Валідація (залишається як була)
  if (form.deliveryType === 'NOVA_POSHTA' && !form.postOfficeBranch) {
    errorMessage.value = "Будь ласка, оберіть відділення пошти."; return;
  }
  // ... інші перевірки ...

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // 2. Відправляємо замовлення на бекенд
    const response = await cartStore.submitOrder(form);
    const orderId = response.orderId; // Переконайся, що твій бек повертає ID

    // Очищуємо кошик (якщо це не робиться всередині store)
    cartStore.clearCart(); // Якщо є такий метод

    // 3. Логіка перенаправлення
    if (form.paymentMethod === 'LIQPAY' || form.paymentMethod === 'CARD_ONLINE') {
      // Якщо оплата карткою -> йдемо на сторінку оплати
      await router.push({ name: 'PaymentPage', params: { id: orderId } });
    } else {
      // Якщо інше (накладений) -> йдемо на сторінку успіху
      await router.push({ name: 'OrderSuccess', params: { id: orderId } });
    }

  } catch (error) {
    console.error(error);
    errorMessage.value = "Сталася помилка при створенні замовлення.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Встав сюди CSS із попереднього повідомлення */
/* --- ЗАГАЛЬНІ СТИЛІ --- */
.cart-container { max-width: 1100px; margin: 40px auto; padding: 20px; font-family: 'Georgia', serif; color: #2c3e50; }
h1 { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #d4af37; display: inline-block; padding-bottom: 10px; position: relative; left: 50%; transform: translateX(-50%); letter-spacing: 1px;}

.cart-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; }

/* --- ОНОВЛЕНІ КАРТКИ ТОВАРІВ (Desktop Grid) --- */
.cart-item {
  display: grid;
  /* Сітка: Фото (фікс) | Інфо (гума) | Ціна (авто) | Кнопка видалення (авто) */
  grid-template-columns: 120px 1fr auto auto;
  align-items: center; /* Вертикальне центрування */
  gap: 25px;
  border-bottom: 1px solid #eee;
  padding: 25px 0;
  position: relative; /* Для позиціювання на мобілці */
}

/* Збільшені та покращені зображення */
.item-image img {
  width: 100%;
  height: 120px; /* Фіксована висота для однаковості */
  object-fit: cover; /* Обрізаємо зайве, зберігаючи пропорції */
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05); /* Легка тінь для об'єму */
}

/* Покращена типографіка інфо-блоку */
.item-info h3 { margin: 0 0 8px; font-size: 20px; color: #2c3e50; line-height: 1.3; }
.category {
  color: #d4af37; /* Золотий акцент */
  font-weight: 500; font-size: 14px; margin-bottom: 12px; display: block; text-transform: uppercase; letter-spacing: 0.5px;
}
.quantity-controls small {
  font-size: 14px; color: #7f8c8d; background: #f4f4f4; padding: 6px 12px; border-radius: 20px; font-family: 'Helvetica', sans-serif;
}

/* Ціна та кнопка видалення */
.item-price { font-weight: 800; font-size: 22px; color: #2c3e50; white-space: nowrap; }
.btn-remove {
  border: none; background: none; color: #bdc3c7; cursor: pointer; font-size: 28px; transition: all 0.3s;
  padding: 0 0 0 15px; /* Відступ зліва */
  line-height: 1;
}
.btn-remove:hover { color: #c0392b; transform: scale(1.1); }

/* Разом */
.cart-total-line { display: flex; justify-content: space-between; margin-top: 20px; font-size: 24px; font-weight: bold; border-top: 2px solid #eee; padding-top: 25px; }
.total-sum { color: #d4af37; }

/* --- ФОРМА --- */
.checkout-form { background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 5px 20px rgba(0,0,0,0.05); }
.checkout-form h3 { margin-top: 0; margin-bottom: 25px; text-align: center; font-size: 22px; color: #2c3e50; }

.form-row { display: flex; gap: 15px; }
.form-group { margin-bottom: 20px; width: 100%; position: relative; }
.half { width: 50%; }

.form-group label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
.delivery-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: bold; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }

.gold-input {
  width: 100%; padding: 12px 15px;
  border: 1px solid #ccc; border-radius: 4px;
  font-size: 16px; box-sizing: border-box;
  transition: all 0.3s ease;
  background: #fdfdfd;
}
.gold-input:focus {
  border-color: #d4af37; background: #fff; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1); outline: none;
}
.gold-input:disabled { background: #eee; cursor: not-allowed; }

.delivery-switch { display: flex; background: #f0f0f0; border-radius: 6px; padding: 5px; margin-bottom: 25px; }
.delivery-switch label {
  flex: 1; text-align: center; padding: 12px;
  cursor: pointer; border-radius: 4px; font-size: 14px; font-weight: 500; color: #555; transition: all 0.3s; border: 1px solid transparent;
}
.delivery-switch label.active {
  background: #fff; color: #2c3e50; border-color: #d4af37; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.delivery-switch input { display: none; }

.address-block { background: #fffcf5; border: 1px solid #eaddb6; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
.info-block { background: #fff8e1; padding: 20px; border-radius: 6px; margin-bottom: 20px; text-align: center; border: 1px solid #ffe082; color: #5d4037; }

.custom-dropdown {
  position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #d4af37; border-radius: 0 0 6px 6px; max-height: 250px; overflow-y: auto; margin: 0; padding: 0; list-style: none; z-index: 100; box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.custom-dropdown li { padding: 12px 15px; border-bottom: 1px solid #f0f0f0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.custom-dropdown li:hover { background-color: #fff9e6; color: #d4af37; }
.custom-dropdown li .main-text { font-weight: bold; }
.custom-dropdown li .sub-text { font-size: 12px; color: #999; }

.custom-list-container { margin-top: 10px; border: 1px solid #e0e0e0; border-radius: 6px; max-height: 250px; overflow-y: auto; background: #fff; }
.list-item { padding: 12px 15px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; display: flex; justify-content: space-between; align-items: center; font-size: 14px; line-height: 1.4; }
.list-item:hover { background: #fafafa; }
.list-item.selected { background: #d4af37; color: white; border-color: #d4af37; }
.list-item.selected .warehouse-name { font-weight: bold; }
.check-icon { font-size: 16px; }
.empty-list-msg { padding: 20px; text-align: center; color: #999; font-style: italic; }
.hint { color: #888; font-size: 12px; margin-top: 8px; display: block; text-align: right; }

.btn-checkout {
  width: 100%; padding: 18px; background: #2c3e50; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; letter-spacing: 1px; cursor: pointer; margin-top: 15px; transition: all 0.3s; text-transform: uppercase;
}
.btn-checkout:hover { background: #d4af37; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4); transform: translateY(-2px); }
.btn-checkout:disabled { background: #95a5a6; cursor: not-allowed; transform: none; box-shadow: none; }

.error-msg { color: #c0392b; text-align: center; margin-top: 15px; font-weight: bold; }
.empty-cart { text-align: center; margin-top: 60px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down { animation: slideIn 0.4s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* --- МОБІЛЬНА АДАПТАЦІЯ --- */
@media (max-width: 900px) {
  .cart-layout { grid-template-columns: 1fr; gap: 30px; }

  /* Перетворюємо Grid назад у Flex для мобільного вигляду "картки" */
  .cart-item {
    display: grid;
    /* 1 колонка: картинка (фіксована), 2 колонка: контент (гнучка) */
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto; /* Два рядки висоти */
    gap: 12px;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    position: relative; /* Щоб абсолютно позиціонувати кнопку видалення */
  }

  /* Картинка зліва */
  .item-image {
    grid-row: 1 / span 2; /* Картинка займає висоту двох рядків */
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    border-radius: 6px;
    overflow: hidden;
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Щоб фото заповнювало квадрат */
  }

  /* Інформація справа від картинки */
  .item-info {
    flex: 1; /* Займає весь доступний простір */
    padding-right: 30px; /* Місце для кнопки видалення */
  }
  .item-info h3 { font-size: 18px; }

  /* Ціна переноситься під опис і вирівнюється праворуч */
  .item-price {
    width: 100%;
    text-align: right;
    font-size: 20px;
    margin-top: 5px;
  }

  /* Кнопка видалення абсолютно позиціонується у верхньому правому куті */
  .btn-remove {
    position: absolute;
    top: 20px;
    right: 0;
    padding: 5px;
    color: #ccc;
  }

  .form-row { flex-direction: column; gap: 15px; }
  .half { width: 100%; }
  h1 { font-size: 26px; }
}

/* --- АДАПТИВ ДЛЯ КОШИКА (MOBILE) --- */
@media (max-width: 768px) {

  /* Змінюємо контейнер списку */
  .cart-list {
    padding: 0 10px; /* Трохи відступів з боків екрану */
  }

  /* Картка товару стає сіткою */
  .cart-item {
    display: grid;
    /* 1 колонка: картинка (фіксована), 2 колонка: контент (гнучка) */
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto; /* Два рядки висоти */
    gap: 12px;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    position: relative; /* Щоб абсолютно позиціонувати кнопку видалення */
  }

  /* 1. Картинка */
  .item-image {
    grid-row: 1 / span 2; /* Картинка займає висоту двох рядків */
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    border-radius: 6px;
    overflow: hidden;
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Щоб фото заповнювало квадрат */
  }

  /* 2. Інформація (Назва, Категорія, Ціна) */
  .item-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: 30px; /* Місце для хрестика (видалення) справа */
  }

  .item-info h3 {
    font-size: 16px;
    margin: 0 0 4px 0;
    line-height: 1.2;
  }

  .item-info .category {
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
  }

  .item-info .price-single {
    font-weight: bold;
    color: #c5a065; /* Твій золотий колір */
    font-size: 14px;
  }

  /* 3. Контролери кількості */
  .quantity-controls {
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Притискаємо вліво */
  }

  .qty-selector {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    height: 32px; /* Зручна висота для пальця */
  }

  .qty-btn {
    width: 32px;
    height: 100%;
    background: #f5f5f5;
    border: none;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0; /* Прибираємо зайві відступи */
  }

  .qty-number {
    min-width: 30px;
    text-align: center;
    font-weight: 500;
  }

  /* 4. Кнопка видалення (Хрестик) */
  .btn-remove {
    position: absolute;
    top: 15px;
    right: 0;
    background: transparent;
    border: none;
    font-size: 20px;
    color: #999;
    padding: 5px; /* Збільшуємо зону кліку */
    line-height: 1;
  }
}

</style>