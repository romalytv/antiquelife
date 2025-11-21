<template>
  <div class="cart-container">
    <h1>Ваш Кошик</h1>

    <div v-if="cartStore.items.length > 0" class="cart-content">

      <div class="cart-list">
        <div v-for="item in cartStore.items" :key="item.productId || item.product_id" class="cart-item">

          <div class="item-image">
            <img :src="item.imagePath || item.image_path" :alt="item.name" />
          </div>

          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="category">{{ item.category ? item.category.categoryName : 'Антикваріат' }}</p>
          </div>

          <div class="item-price">
            {{ formatPrice(item.price) }} ₴
          </div>

          <button @click="cartStore.removeFromCart(item.productId || item.product_id)" class="btn-remove">
            ✕
          </button>
        </div>
      </div>

      <div class="cart-summary">
        <h3>Разом до сплати:</h3>
        <div class="total-price">{{ formatPrice(cartStore.totalPrice) }} ₴</div>
        <button @click="checkout" class="btn-checkout">Оформити замовлення</button>
      </div>

    </div>

    <div v-else class="empty-cart">
      <p>Ваш кошик порожній.</p>
      <router-link to="/market" class="btn-back">Перейти до каталогу</router-link>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

const formatPrice = (price) => {
  return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const checkout = () => {
  // Тут пізніше буде логіка відправки замовлення на бекенд
  alert(`Замовлення на суму ${cartStore.totalPrice} ₴ прийнято! Менеджер зв'яжеться з вами.`);
  cartStore.clearCart();
};
</script>

<style scoped>
.cart-container { max-width: 1000px; margin: 40px auto; padding: 20px; font-family: 'Georgia', serif; }
h1 { text-align: center; margin-bottom: 40px; color: #2c3e50; }

.cart-content { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; }

/* Список */
.cart-item { display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #eee; padding: 15px 0; }
.item-image img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; }
.item-info { flex-grow: 1; }
.item-info h3 { margin: 0 0 5px; font-size: 18px; }
.category { font-size: 12px; color: #888; text-transform: uppercase; }
.item-price { font-weight: bold; font-size: 18px; color: #2c3e50; }

.btn-remove { border: none; background: none; color: #c0392b; font-size: 20px; cursor: pointer; }
.btn-remove:hover { color: red; }

/* Блок підсумку */
.cart-summary { background: #f9f9f9; padding: 30px; border-radius: 8px; height: fit-content; }
.total-price { font-size: 32px; font-weight: bold; color: #d4af37; margin: 20px 0; }
.btn-checkout { width: 100%; padding: 15px; background: #2c3e50; color: white; border: none; font-size: 16px; cursor: pointer; }
.btn-checkout:hover { background: #d4af37; }

/* Пустий кошик */
.empty-cart { text-align: center; margin-top: 50px; }
.btn-back { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #2c3e50; color: white; text-decoration: none; }

@media (max-width: 768px) { .cart-content { grid-template-columns: 1fr; } }
</style>