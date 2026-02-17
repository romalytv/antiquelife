<template>
  <div class="cart-page-wrapper">
    <div class="cart-container">
      <h1 class="section-cursive-title text-center">Ваш Кошик</h1>

      <div v-if="cartStore.items.length > 0" class="cart-layout">

        <div class="left-column">

          <div class="cart-panel">
            <h3 class="panel-subtitle">Ваші товари</h3>
            <div class="cart-list">
              <div v-for="(item, index) in cartStore.items" :key="item.product_id">
                <div class="cart-item">
                  <div class="item-image">
                    <img :src="item.image_url || '/placeholder.png'" :alt="item.name" />
                  </div>

                  <div class="item-info">
                    <h3>{{ item.name }}</h3>
                    <p class="category">{{ item.category ? item.category.categoryName : 'Антикваріат' }}</p>

                    <div class="qty-and-price">
                      <div class="quantity-controls">
                        <div v-if="item.maxStock > 1" class="qty-selector">
                          <button class="qty-btn" @click="cartStore.updateQuantity(item.product_id, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
                          <span class="qty-number">{{ item.quantity }}</span>
                          <button class="qty-btn" @click="cartStore.updateQuantity(item.product_id, item.quantity + 1)" :disabled="item.quantity >= item.maxStock">+</button>
                        </div>
                        <div v-else class="qty-single"><small>Кількість: {{ item.quantity }}</small></div>
                        <div v-if="item.quantity >= item.maxStock && item.maxStock > 1" class="stock-warning">Макс. на складі</div>
                      </div>
                      <p class="price-single">{{ formatPrice(item.price) }} ₴</p>
                    </div>
                  </div>

                  <button @click="cartStore.removeFromCart(item.product_id)" class="btn-remove" title="Видалити">✕</button>
                </div>
                <div v-if="index < cartStore.items.length - 1" class="item-divider"></div>
              </div>
            </div>
          </div>

          <div class="cart-panel">
            <h3 class="panel-subtitle">Оформлення замовлення</h3>

            <form id="checkout-form" @submit.prevent="handleCheckout">
              <div class="form-row">
                <div class="form-group half">
                  <label>Ім'я</label>
                  <input v-model="form.firstName" required placeholder="ІВАН" class="classic-input"/>
                </div>
                <div class="form-group half">
                  <label>Прізвище</label>
                  <input v-model="form.lastName" required placeholder="ФРАНКО" class="classic-input"/>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group half">
                  <label>Телефон</label>
                  <input v-model="form.phone" required type="tel" placeholder="+380..." class="classic-input"/>
                </div>
                <div class="form-group half">
                  <label>Email</label>
                  <input v-model="form.email" required type="email" placeholder="IVAN@EXAMPLE.COM" class="classic-input"/>
                </div>
              </div>

              <div class="form-section-label">Спосіб доставки:</div>

              <div class="delivery-switch">
                <label :class="{ active: form.deliveryType === 'NOVA_POSHTA' }">
                  <input type="radio" value="NOVA_POSHTA" v-model="form.deliveryType">
                  <span>Нова Пошта</span>
                </label>

                <label :class="{ active: form.deliveryType === 'COURIER' }">
                  <input type="radio" value="COURIER" v-model="form.deliveryType">
                  <span>Кур'єр</span>
                </label>

                <label :class="{ active: form.deliveryType === 'POST_OFFICE' }">
                  <input type="radio" value="POST_OFFICE" v-model="form.deliveryType">
                  <span>Інша пошта</span>
                </label>

                <label :class="{ active: form.deliveryType === 'SELF_PICKUP' }">
                  <input type="radio" value="SELF_PICKUP" v-model="form.deliveryType">
                  <span>Самовивіз</span>
                </label>
              </div>

              <div v-if="form.deliveryType === 'NOVA_POSHTA'" class="address-block slide-down">
                <div class="form-row">
                  <div class="form-group half relative">
                    <label>Місто (НП)</label>
                    <input type="text" v-model="citySearchQuery" @input="onCitySearchInput" placeholder="ВВЕДІТЬ НАЗВУ..." class="classic-input search-icon" />
                    <transition name="fade">
                      <ul v-if="cities.length > 0" class="custom-dropdown">
                        <li v-for="city in cities" :key="city.Ref" @click="selectCity(city)">
                          <span class="main-text">{{ city.Description }}</span>
                          <span class="sub-text">{{ city.AreaDescription }} обл.</span>
                        </li>
                      </ul>
                    </transition>
                  </div>
                  <div class="form-group half">
                    <label>Відділення / Поштомат</label>
                    <input type="text" v-model="warehouseSearchQuery" placeholder="№ ВІДДІЛЕННЯ..." class="classic-input search-icon" :disabled="warehouses.length === 0"/>
                  </div>
                </div>
                <transition name="fade">
                  <div class="form-group" v-if="form.city && warehouses.length > 0">
                    <div class="custom-list-container">
                      <div v-if="filteredWarehouses.length === 0" class="empty-list-msg">Нічого не знайдено</div>
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
                  <input v-model="form.city" required placeholder="КИЇВ" class="classic-input"/>
                </div>
                <div class="form-row">
                  <div class="form-group" style="flex: 2;">
                    <label>Вулиця</label>
                    <input v-model="form.street" required placeholder="ХРЕЩАТИК" class="classic-input"/>
                  </div>
                  <div class="form-group" style="flex: 1;">
                    <label>Буд.</label>
                    <input v-model="form.building" required placeholder="1" class="classic-input"/>
                  </div>
                  <div class="form-group" style="flex: 1;">
                    <label>Кв.</label>
                    <input v-model="form.apartment" placeholder="5" class="classic-input"/>
                  </div>
                </div>
              </div>

              <div v-if="form.deliveryType === 'POST_OFFICE'" class="address-block slide-down">
                <div class="form-group">
                  <label>Місто</label>
                  <input v-model="form.city" required placeholder="ЛЬВІВ" class="classic-input"/>
                </div>
                <div class="form-group">
                  <label>Служба та відділення</label>
                  <textarea v-model="form.postOfficeBranch" required rows="2" placeholder="УКРПОШТА, ІНДЕКС 01001, ВІДДІЛЕННЯ 5" class="classic-input"></textarea>
                </div>
              </div>

              <div v-if="form.deliveryType === 'SELF_PICKUP'" class="info-block slide-down">
                <p><strong>Адреса салону:</strong> м. Київ, вул. Антикварна, 1.</p>
              </div>

              <div class="form-group margin-top">
                <label>Коментар</label>
                <textarea v-model="form.comment" rows="2" class="classic-input" placeholder="ДОДАТКОВА ІНФОРМАЦІЯ..."></textarea>
              </div>
            </form>
          </div>
        </div>

        <div class="right-column">
          <div class="cart-panel payment-summary-box">
            <h3 class="panel-subtitle">Оплата</h3>

            <div class="form-group payment-select-group">
              <label>Спосіб оплати</label>
              <select v-model="form.paymentMethod" class="classic-input classic-select">
                <option value="LIQPAY">Карткою на сайті</option>
                <option value="CASH_ON_DELIVERY">Оплата при отриманні</option>
                <option value="IBAN">Переказ на IBAN</option>
              </select>
            </div>

            <div class="summary-details">
              <div class="summary-row">
                <span>Сума товарів:</span>
                <span class="fw-bold">{{ formatPrice(cartStore.totalPrice) }} ₴</span>
              </div>
              <div class="summary-row">
                <span>Доставка:</span>
                <span class="delivery-cost">За тарифами перевізника</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total-row">
                <span>До сплати:</span>
                <span class="total-sum">{{ formatPrice(cartStore.totalPrice) }} ₴</span>
              </div>
            </div>

            <button type="submit" form="checkout-form" class="btn-main" :disabled="isSubmitting">
              <span class="btn-text">{{ isSubmitting ? 'ОБРОБКА...' : 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ' }}</span>
            </button>
            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
          </div>
        </div>

      </div>

      <div v-else class="empty-cart">
        <p>Ваш кошик наразі порожній.</p>
        <router-link to="/market" class="btn-main btn-inline">Перейти до каталогу</router-link>
      </div>
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
  street: '', building: '', apartment: '',
  postOfficeBranch: '',
  paymentMethod: 'LIQPAY', comment: ''
});

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

const formatPrice = (p) => p?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const handleCheckout = async () => {
  if (form.deliveryType === 'NOVA_POSHTA' && !form.postOfficeBranch) {
    errorMessage.value = "Будь ласка, оберіть відділення пошти."; return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const response = await cartStore.submitOrder(form);
    const orderId = response.orderId;

    cartStore.clearCart();

    if (form.paymentMethod === 'LIQPAY' || form.paymentMethod === 'CARD_ONLINE') {
      await router.push({ name: 'PaymentPage', params: { id: orderId } });
    } else {
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
/* --- СВІТЛА, ЧИСТА ТЕМА ІЗ ЗБІЛЬШЕНИМ КОНТРАСТОМ --- */
.cart-page-wrapper {
  width: 100%;
  min-height: 85vh;
  background-color: #fdfdfd;
  font-family: 'Montserrat', sans-serif;
  color: #111; /* Змінено з #333 для кращої читабельності */
}

.cart-container {
  max-width: 1250px;
  margin: 0 auto;
  padding: 50px 20px 80px;
}

.text-center { text-align: center; }

.section-cursive-title {
  font-family: 'Snell Roundhand', 'Bickham Script Pro', 'Brush Script MT', 'Great Vibes', cursive, serif;
  font-style: italic;
  font-size: 3.5rem;
  font-weight: normal;
  color: #061c0b;
  margin-top: 0;
  margin-bottom: 40px;
}

/* --- МАКЕТ (LAYOUT) --- */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.cart-panel {
  background: #fff;
  padding: 0;
}

/* Підзаголовки стали жирнішими і чорними */
.panel-subtitle {
  font-family: 'Georgia', serif;
  font-size: 1.35rem;
  color: #000;
  margin-top: 0;
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #dcdcdc; /* Темніша лінія */
  padding-bottom: 15px;
  font-weight: 600; /* Додано вагу */
}

/* --- СПИСОК ТОВАРІВ --- */
.cart-list { margin-top: 10px; }

.cart-item {
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 20px 0;
  position: relative;
}

.item-divider {
  height: 1px;
  background-color: #dcdcdc; /* Темніший роздільник */
  margin: 0;
}

.item-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}
.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Назва товару стала жирнішою */
.item-info h3 {
  width: 80%;
  margin: 0 0 0px;
  font-family: 'Georgia', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #000;
  line-height: 1.3;
}

.category {
  font-family: 'Montserrat', sans-serif;
  color: #555; /* Зроблено темнішим (було #888) */
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.qty-and-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.price-single {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #000;
  margin: 0;
  padding-right: 30px;
}

/* Контролери кількості */
.quantity-controls { display: flex; flex-direction: column; align-items: flex-start; }

.qty-selector {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ccc; /* Темніша рамка */
  height: 40px;
  width: 110px;
  background-color: #fff;
}

.qty-btn {
  background: transparent; border: none; width: 35px; height: 100%;
  font-size: 1.2rem; color: #444; /* Темніші кнопки */
  cursor: pointer; transition: background 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.qty-btn:hover:not(:disabled) { background: #f0f0f0; color: #000; }
.qty-btn:disabled { color: #aaa; cursor: not-allowed; }

.qty-number {
  flex: 1; text-align: center; font-size: 1rem;
  font-family: 'Montserrat', sans-serif; color: #000; font-weight: 600;
}

.qty-single small { color: #444; font-size: 0.95rem; font-weight: 500;} /* Зроблено виразнішим */
.stock-warning { color: #c0392b; font-size: 0.8rem; margin-top: 5px; font-weight: 600;}

.btn-remove {
  position: absolute;
  top: 25px; right: 0;
  border: none; background: none; color: #888; /* Був #ccc, тепер помітний */
  cursor: pointer; font-size: 1.2rem; transition: color 0.3s; padding: 5px;
}
.btn-remove:hover { color: #d32f2f; }

/* --- ФОРМА ОФОРМЛЕННЯ --- */
.form-section-label {
  font-family: 'Montserrat', sans-serif; font-size: 0.9rem; color: #333; /* Був #888 */
  font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; margin-top: 10px;
}
.margin-top { margin-top: 30px; }

.form-row { display: flex; gap: 20px; }
.form-group { margin-bottom: 20px; width: 100%; position: relative; }
.half { width: 50%; }

/* Лейбли над полями вводу */
.form-group label {
  display: block; margin-bottom: 8px; color: #111; /* Зроблено майже чорним */
  font-family: 'Montserrat', sans-serif; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;
  font-weight: 600; /* Додано товщину */
}

/* Інпути */
.classic-input {
  width: 100%; padding: 14px 15px;
  background: transparent;
  border: 1px solid #ccc; /* Темніша рамка, була #eaeaea */
  border-radius: 0;
  font-family: 'Montserrat', sans-serif; font-size: 1rem; color: #111; /* Темніший текст вводу */
  font-weight: 500;
  transition: all 0.3s ease; box-sizing: border-box;
}
.classic-input::placeholder { color: #777; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 400;} /* Плейсхолдери тепер добре видно */
.classic-input:focus {
  outline: none;
  border-color: #061c0b;
}

/* Таби доставки */
.delivery-switch {
  display: flex; gap: 10px; margin-bottom: 30px; flex-wrap: wrap;
}
.delivery-switch label {
  flex: 1; text-align: center; padding: 14px 5px; cursor: pointer;
  font-family: 'Montserrat', sans-serif; font-size: 0.85rem; color: #222; /* Темніший текст неактивних табів */
  font-weight: 500;
  transition: all 0.3s; min-width: 80px; background: transparent;
  border: 1px solid #ccc; text-transform: uppercase; letter-spacing: 0.5px;
}
.delivery-switch label.active {
  background: #061c0b; color: #fff; border-color: #061c0b; font-weight: 600;
}
.delivery-switch input { display: none; }

/* Блоки адрес */
.address-block, .info-block {
  margin-bottom: 20px;
}
.info-block p { color: #222; padding: 20px; background: #f9f9f9; border: 1px solid #ccc; font-size: 0.95rem; font-weight: 500;}

/* Дропдауни НП */
.custom-dropdown {
  position: absolute; top: 100%; left: 0; right: 0; background: #fff;
  border: 1px solid #061c0b; border-top: none; max-height: 200px; overflow-y: auto; margin: 0; padding: 0; list-style: none; z-index: 100;
}
.custom-dropdown li {
  padding: 12px 15px; border-bottom: 1px solid #dcdcdc; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #111; font-weight: 500;
}
.custom-dropdown li:hover { background-color: #f0f0f0; }
.custom-dropdown li .sub-text { font-size: 0.75rem; color: #666; font-weight: 400;}

.custom-list-container { margin-top: 5px; border: 1px solid #ccc; max-height: 200px; overflow-y: auto; background: #fff; }
.list-item { padding: 12px 15px; border-bottom: 1px solid #eaeaea; cursor: pointer; transition: background 0.2s; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #111; font-weight: 500;}
.list-item:hover { background: #f0f0f0; }
.list-item.selected { background: #061c0b; color: #fff; border-color: #061c0b;}
.empty-list-msg { padding: 15px; text-align: center; color: #555; font-style: italic; font-size: 0.9rem;}

/* --- ПРАВА КОЛОНКА (ОПЛАТА / СУМА) --- */
.right-column {
  position: sticky;
  top: 40px;
}

/* Блок оплати має сірий фон для виділення */
.payment-summary-box {
  background: #fdfdfd;
  padding: 35px 30px;
  border: 1px solid #dcdcdc; /* Темніша рамка блоку оплати */
}

.payment-select-group { margin-bottom: 30px; }
.classic-select { cursor: pointer; }

.summary-details {
  margin-bottom: 25px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: #222; /* Був #555 */
  font-size: 1rem;
  font-weight: 500;
}
.fw-bold { font-weight: 700; color: #000; }

.delivery-cost { font-style: italic; font-size: 0.9rem; color: #555; font-weight: 400;}

.summary-divider {
  height: 1px;
  background-color: #dcdcdc;
  margin: 20px 0;
}

.total-row {
  font-size: 1.25rem;
  font-weight: 800;
  color: #000;
  text-transform: uppercase;
  margin-bottom: 0;
}
.total-row .total-sum { color: #000; }

.secure-badge {
  text-align: center;
  margin-top: 20px;
  font-size: 0.8rem;
  color: #444; /* Був #888 */
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Головна кнопка */
.btn-main {
  width: 100%; padding: 18px;
  font-family: 'Montserrat', sans-serif; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
  cursor: pointer; border: none; border-radius: 0;
  color: #fff;
  background: #061c0b;
  transition: background 0.3s;
}
.btn-main:hover:not(:disabled) {
  background: #0a2e12;
}
.btn-main:disabled { background: #dcdcdc; color: #777; cursor: not-allowed; }

.btn-inline { display: inline-block; width: auto; padding: 16px 40px; text-decoration: none;}
.error-msg { color: #c0392b; text-align: center; margin-top: 15px; font-size: 0.9rem; font-weight: 600;}
.empty-cart { text-align: center; margin-top: 60px; color: #333; font-size: 1.2rem; font-weight: 500;}
.empty-cart p { margin-bottom: 30px;}

/* Анімації */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down { animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

/* --- МОБІЛЬНА АДАПТАЦІЯ --- */
@media (max-width: 1024px) {
  .cart-layout { grid-template-columns: 1fr; }
  .right-column { position: static; }
  .payment-summary-box { padding: 30px 20px; }
}

@media (max-width: 768px) {
  .cart-container { padding: 20px 15px; }
  .section-cursive-title { font-size: 2.5rem; }

  .cart-item { align-items: flex-start; gap: 15px; padding: 25px 0;}
  .item-image { width: 90px; height: 90px; }

  .qty-and-price { flex-direction: column; align-items: flex-start; gap: 15px; margin-top: 10px;}
  .price-single { padding-right: 0; font-size: 1.1rem;}

  .form-row { flex-direction: column; gap: 0; }
  .half { width: 100%; }
  .delivery-switch label { min-width: 45%; }
}
</style>