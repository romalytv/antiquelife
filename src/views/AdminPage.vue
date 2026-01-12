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
          <button
              :class="['nav-btn', { active: currentTab === 'messages' }]"
              @click="currentTab = 'messages'"
          >
            📩 Повідомлення
          </button>
          <button
              :class="['nav-btn', { active: currentTab === 'journal' }]"
              @click="currentTab = 'journal'"
          >
            Журнал
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
      <ContactManager
          v-if="currentTab === 'messages'"
      />
      <JournalManager
          v-if="currentTab === 'journal'"
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
import ContactManager from '../components/ContactManager.vue';
import JournalManager from "../components/JournalManager.vue";

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
  white-space: nowrap; /* Щоб заголовок не ламався дивно */
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
  white-space: nowrap; /* Текст кнопок в один рядок */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.nav-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-btn.active {
  background: #e0e7ff;
  color: #4338ca;
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

/* --- АДАПТИВ ДЛЯ ТЕЛЕФОНУ --- */
@media (max-width: 600px) {
  .admin-panel {
    padding: 10px; /* Менші відступи від країв екрану */
  }

  .admin-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px; /* Менше внутрішніх відступів */
  }

  .header-left {
    flex-direction: column;
    align-items: center; /* Центруємо заголовок і меню */
    gap: 15px;
    width: 100%;
  }

  .admin-nav {
    width: 100%;
    flex-wrap: wrap; /* Дозволяємо кнопкам переноситися */
    justify-content: center;
  }

  .nav-btn {
    flex: 1 1 auto; /* Кнопки займають доступне місце, але не менше контенту */
    min-width: 120px; /* Мінімальна ширина, щоб зручно натискати */
    padding: 10px; /* Трохи більше поле для пальця */
  }

  .user-info {
    width: 100%;
    display: flex;
    justify-content: center;
    border-top: 1px solid #f3f4f6; /* Лінія-розділювач для краси */
    padding-top: 15px;
  }

  .logout-btn {
    width: 100%; /* Кнопка виходу на всю ширину */
    text-align: center;
  }
}
</style>