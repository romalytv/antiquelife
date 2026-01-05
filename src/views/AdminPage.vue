<template>
  <div class="admin-panel">
    <header class="admin-header">
      <div class="header-left">
        <h1>Адмін-панель</h1>
        <nav class="admin-nav">
          <button
              :class="['nav-btn', { active: currentTab === 'products' }]"
              @click="currentTab = 'products'"
          >
            📦 Товари
          </button>
          <button
              :class="['nav-btn', { active: currentTab === 'orders' }]"
              @click="currentTab = 'orders'"
          >
            🛒 Замовлення
          </button>
        </nav>
      </div>

      <div class="user-info">
        <button @click="logout" class="logout-btn">Вийти</button>
      </div>
    </header>

    <div class="tab-content">
      <ProductsManager
          v-if="currentTab === 'products'"
          @auth-error="logout"
      />
      <OrdersManager
          v-if="currentTab === 'orders'"
      />
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Імпортуємо наш новий компонент
import ProductsManager from '../components/ProductManager.vue';
import OrdersManager from '../components/OrderManager.vue';

const router = useRouter();
const currentTab = ref('products'); // 'products' або 'orders'

const logout = () => {
  localStorage.removeItem('jwt_token');
  router.push('/login');
};
</script>

<style scoped>
.admin-panel {
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  background: white;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

h1 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

/* Навігація вкладок */
.admin-nav {
  display: flex;
  gap: 10px;
}

.nav-btn {
  background: transparent;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-btn.active {
  background: #e0e7ff; /* Світло-синій */
  color: #4338ca;     /* Темно-синій */
}

.logout-btn {
  background: white;
  border: 1px solid #fee2e2;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #dc2626;
  font-weight: 600;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: #fee2e2;
}

/* Placeholder для замовлень */
.placeholder-orders {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 12px;
  color: #6b7280;
}

@media (max-width: 600px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    width: 100%;
  }
  .admin-nav {
    width: 100%;
    justify-content: space-between;
  }
  .nav-btn { flex: 1; }
  .user-info { width: 100%; text-align: right; }
}
</style>