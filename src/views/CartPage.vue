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
            <input
                v-model="form.email"
                required
                type="email"
                placeholder="ivan@example.com"
                class="gold-input"
            />
          </div>

          <div class="delivery-label">Спосіб доставки:</div>
          <div class="delivery-switch">
            <label :class="{ active: form.deliveryType === 'NOVA_POSHTA' }">
              <input type="radio" value="NOVA_POSHTA" v-model="form.deliveryType">
              <span>📮 Нова Пошта</span>
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
                <input
                    type="text"
                    v-model="warehouseSearchQuery"
                    placeholder="№ відділення, адреса або 'поштомат'"
                    class="gold-input search-icon"
                    :disabled="warehouses.length === 0"
                />

                <div class="custom-list-container">
                  <div v-if="warehouses.length === 0" class="empty-list-msg">Спочатку оберіть місто</div>
                  <div v-else-if="filteredWarehouses.length === 0" class="empty-list-msg">Нічого не знайдено</div>
                  <div
                      v-else
                      v-for="w in filteredWarehouses"
                      :key="w.Ref"
                      class="list-item"
                      :class="{ 'selected': form.postOfficeBranch === w.Description }"
                      @click="selectWarehouse(w)"
                  >
                    <div class="list-item-content">
                      <span class="warehouse-name">{{ w.Description }}</span>
                    </div>
                    <span v-if="form.postOfficeBranch === w.Description" class="check-icon">✔</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <div v-if="form.deliveryType === 'POST_OFFICE'" class="address-block slide-down">
            <div class="info-block" style="margin-bottom: 15px;">
              <p>✍️ Вкажіть дані для відправки будь-якою іншою службою (Укрпошта, Meest тощо).</p>
            </div>

            <div class="form-group">
              <label>Місто</label>
              <input v-model="form.city" required placeholder="Наприклад: Львів" class="gold-input"/>
            </div>

            <div class="form-group">
              <label>Служба доставки та адреса/відділення</label>
              <textarea
                  v-model="form.postOfficeBranch"
                  required
                  rows="3"
                  placeholder="Наприклад: Укрпошта, індекс 79000, вул. Дорошенка, 5 (або відділення №15)"
                  class="gold-input"
              ></textarea>
            </div>
          </div>

          <div v-if="form.deliveryType === 'SELF_PICKUP'" class="info-block slide-down">
            <p>📍 <strong>Адреса салону:</strong> м. Київ, вул. Антикварна, 1.</p>
            <p>🕒 Чекаємо на вас щодня з 10:00 до 19:00.</p>
          </div>

          <div class="form-group">
            <label>Коментар до замовлення</label>
            <textarea v-model="form.comment" rows="2" placeholder="Додаткові побажання..." class="gold-input"></textarea>
          </div>

          <div class="form-group">
            <label>Спосіб оплати</label>
            <select v-model="form.paymentMethod" class="gold-input">
              <option value="CASH_ON_DELIVERY">Оплата при отриманні</option>
              <option value="CARD_ONLINE">Карткою на сайті</option>
              <option value="IBAN">Переказ на рахунок (IBAN)</option>
            </select>
          </div>

          <button type="submit" class="btn-checkout" :disabled="isSubmitting">
            {{ isSubmitting ? 'Обробка...' : 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ' }}
          </button>

          <transition name="fade">
            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
          </transition>
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
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  deliveryType: 'NOVA_POSHTA',
  city: '',
  street: '',     // Не використовується, але залишаємо для сумісності з DTO
  building: '',
  apartment: '',
  postOfficeBranch: '', // Тут буде назва відділення НП АБО адреса "Іншої пошти"
  paymentMethod: 'CARD_ONLINE',
  comment: ''
});

// Очищення полів при перемиканні
watch(() => form.deliveryType, (newVal) => {
  if (newVal === 'NOVA_POSHTA') {
    form.city = '';
    form.postOfficeBranch = '';
    citySearchQuery.value = '';
    warehouses.value = [];
  } else if (newVal === 'POST_OFFICE') {
    form.city = '';
    form.postOfficeBranch = ''; // Очищаємо, щоб людина ввела вручну
  }
});

// --- ЛОГІКА НОВОЇ ПОШТИ ---
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
      const response = await publicAxios.get(`http://localhost:8080/api/delivery/nova-poshta/cities?query=${citySearchQuery.value}`);
      cities.value = response.data;
    } catch (e) { console.error(e); }
  }, 500);
};

const selectCity = (cityObj) => {
  form.city = cityObj.Description;
  citySearchQuery.value = cityObj.Description;
  cities.value = [];
  warehouses.value = [];
  warehouseSearchQuery.value = '';
  form.postOfficeBranch = '';
  if (cityObj.Ref) loadWarehouses(cityObj.Ref);
};

const loadWarehouses = async (cityRef) => {
  try {
    const response = await publicAxios.get(`http://localhost:8080/api/delivery/nova-poshta/warehouses?cityRef=${cityRef}`);
    warehouses.value = response.data;
  } catch (e) { console.error(e); }
};

const selectWarehouse = (w) => { form.postOfficeBranch = w.Description; };

const filteredWarehouses = computed(() => {
  if (!warehouseSearchQuery.value) return warehouses.value;
  return warehouses.value.filter(w => w.Description.toLowerCase().includes(warehouseSearchQuery.value.toLowerCase()));
});

// --- ЗАГАЛЬНЕ ---
const formatPrice = (price) => price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const handleCheckout = async () => {
  // Валідація
  if (form.deliveryType === 'NOVA_POSHTA' && !form.postOfficeBranch) {
    errorMessage.value = "Будь ласка, оберіть відділення пошти.";
    return;
  }
  if (form.deliveryType === 'POST_OFFICE' && (!form.city || !form.postOfficeBranch)) {
    errorMessage.value = "Будь ласка, вкажіть місто та деталі доставки.";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
// В POST_OFFICE ми використовуємо поле postOfficeBranch як "Адреса/Відділення"
    const response = await cartStore.submitOrder(form); // <-- Зберігаємо відповідь у змінну

    // ПРИБИРАЄМО ALERT
    // alert("Дякуємо! Ваше замовлення успішно прийнято.");
    // router.push('/profile');

    // ДОДАЄМО ПЕРЕХІД НА СТОРІНКУ УСПІХУ
    // response.orderId - це те, що повертає твій бекенд (Map.of("orderId", orderId))
    router.push({ name: 'OrderSuccess', params: { id: response.orderId } });
  } catch (error) {
    console.error(error);
    errorMessage.value = "Сталася помилка при замовленні.";
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
    display: flex;
    flex-wrap: wrap; /* Дозволяємо перенос елементів */
    align-items: flex-start;
    gap: 15px;
    padding: 20px 0;
  }

  /* Картинка зліва */
  .item-image img {
    width: 100px;
    height: 100px;
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
</style>