<template>
  <div class="orders-manager">

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-val">{{ orders.length }}</span>
        <span class="stat-label">Всього</span>
      </div>
      <div class="stat-item">
        <span class="stat-val warning">{{ newOrdersCount }}</span>
        <span class="stat-label">Нових</span>
      </div>
      <div class="stat-item">
        <span class="stat-val success">{{ totalRevenue }} ₴</span>
        <span class="stat-label">Виручка</span>
      </div>
      <button @click="loadOrders" class="refresh-btn">🔄 Оновити</button>
    </div>

    <div class="card list-card">
      <div v-if="orders.length === 0" class="empty-state">
        Замовлень поки немає.
      </div>

      <table v-else class="order-table">
        <thead>
        <tr>
          <th>№ / Дата</th>
          <th>Клієнт</th>
          <th>Сума</th>
          <th>Доставка</th>
          <th>Статус</th>
          <th>Дії</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="order in orders" :key="order.order_id" @click="openOrder(order)" class="order-row">
          <td class="td-date">
            <div class="short-id">#{{ order.order_id.slice(0, 8) }}</div>
            <div class="date">{{ formatDate(order.createdAt || order.orderDate) }}</div>
          </td>
          <td class="td-client">
            <div class="client-name">{{ order.firstName }} {{ order.lastName }}</div>
            <div class="client-phone">{{ order.phone }}</div>
          </td>
          <td class="td-amount">
            {{ formatPrice(order.totalAmount) }} ₴
          </td>
          <td class="td-delivery">
            <div class="delivery-type">{{ translateDelivery(order.deliveryType) }}</div>
            <div class="city">{{ order.city }}</div>
          </td>
          <td class="td-status">
            <span :class="['badge', order.status]">{{ translateStatus(order.status) }}</span>
          </td>
          <td class="td-actions">
            <button class="btn-view">👁️</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedOrder" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-modal" @click="closeModal">×</button>

        <div class="modal-header">
          <h2>Замовлення #{{ selectedOrder.order_id.slice(0, 8) }}</h2>
          <span :class="['badge', selectedOrder.status, 'large']">
            {{ translateStatus(selectedOrder.status) }}
          </span>
        </div>

        <div class="modal-grid">

          <div class="info-section">
            <h3>👤 Клієнт</h3>
            <p><strong>Ім'я:</strong> {{ selectedOrder.firstName }} {{ selectedOrder.lastName }}</p>
            <p><strong>Телефон:</strong> {{ selectedOrder.phone }}</p>
            <p><strong>Email:</strong> {{ selectedOrder.email }}</p>

            <h3 class="mt-20">🚚 Доставка</h3>
            <p><strong>Тип:</strong> {{ translateDelivery(selectedOrder.deliveryType) }}</p>
            <p><strong>Місто:</strong> {{ selectedOrder.city }}</p>
            <p v-if="selectedOrder.deliveryType === 'NOVA_POSHTA'">
              <strong>Відділення:</strong> {{ selectedOrder.postOfficeBranch }}
            </p>
            <p v-if="selectedOrder.deliveryType === 'POST_OFFICE'">
              <strong>Деталі:</strong> {{ selectedOrder.postOfficeBranch }}
            </p>

            <h3 class="mt-20">💬 Коментар</h3>
            <p class="comment-box">{{ selectedOrder.comment || 'Без коментаря' }}</p>
          </div>

          <div class="items-section">
            <h3>🛒 Товари ({{ selectedOrder.items ? selectedOrder.items.length : 0 }})</h3>
            <div class="items-list">
              <div v-for="item in selectedOrder.items" :key="item.id" class="order-item">
                <img
                    :src="(item.product.imageUrls && item.product.imageUrls[0]) || '/placeholder.png'"
                    class="item-thumb"
                >
                <div class="item-details">
                  <div class="item-name">{{ item.product.name }}</div>
                  <div class="item-meta">
                    {{ item.quantity }} шт. х {{ formatPrice(item.priceAtPurchase) }} ₴
                  </div>
                </div>
                <div class="item-total">
                  {{ formatPrice(item.priceAtPurchase * item.quantity) }} ₴
                </div>
              </div>
            </div>

            <div class="total-row">
              <span>Всього до сплати:</span>
              <span class="total-big">{{ formatPrice(selectedOrder.totalAmount) }} ₴</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <label>Змінити статус:</label>
          <div class="status-buttons">
            <button
                v-for="st in availableStatuses"
                :key="st.val"
                @click="updateStatus(st.val)"
                :class="['status-btn', st.val, { active: selectedOrder.status === st.val }]"
                :disabled="loading"
            >
              {{ st.label }}
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const orders = ref([]);
const selectedOrder = ref(null);
const loading = ref(false);

const availableStatuses = [
  { val: 'NEW', label: 'Нове' },
  { val: 'CONFIRMED', label: 'Підтверджено' },
  { val: 'SHIPPED', label: 'Відправлено' },
  { val: 'COMPLETED', label: 'Виконано' },
  { val: 'CANCELLED', label: 'Скасовано' }
];

// --- STATISTICS ---
const newOrdersCount = computed(() => orders.value.filter(o => o.status === 'NEW').length);
const totalRevenue = computed(() =>
    orders.value
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.totalAmount, 0)
        .toLocaleString('uk-UA')
);

// --- API METHODS ---
const loadOrders = async () => {
  try {
    // 1. Дістаємо токен (перевір, чи він у тебе 'jwt_token' або 'token')
    // У ProductsManager ти використовував 'jwt_token', тому тут пишу так само
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      alert("Немає токена. Авторизуйтесь.");
      return;
    }

    // 2. Додаємо заголовок авторизації
    const res = await axios.get('/admin/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Для налагодження виводимо в консоль те, що прийшло
    console.log("Замовлення з сервера:", res.data);

    orders.value = res.data;
  } catch (e) {
    console.error("Failed to load orders", e);
    // Якщо токен протух або немає прав
    if (e.response && (e.response.status === 401 || e.response.status === 403)) {
      alert("Сесія закінчилась. Увійдіть знову.");
      // Тут можна зробити редірект на логін
    }
  }
};

const updateStatus = async (newStatus) => {
  if (!selectedOrder.value) return;
  loading.value = true;
  try {
    const token = localStorage.getItem('jwt_token'); // <--- ДОДАЛИ

    await axios.put(
        `/admin/orders/${selectedOrder.value.order_id}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } } // <--- ДОДАЛИ ЗАГОЛОВОК
    );

    // Оновлюємо локально
    selectedOrder.value.status = newStatus;
    const idx = orders.value.findIndex(o => o.order_id === selectedOrder.value.order_id);
    if (idx !== -1) orders.value[idx].status = newStatus;

    alert(`Статус змінено на "${translateStatus(newStatus)}"`);
  } catch (e) {
    console.error(e);
    alert("Помилка оновлення статусу");
  } finally {
    loading.value = false;
  }
};

// --- HELPERS ---
const openOrder = (order) => { selectedOrder.value = { ...order }; }; // Копія об'єкта
const closeModal = () => { selectedOrder.value = null; };

const formatPrice = (p) => p?.toLocaleString('uk-UA');
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
  });
};

const translateStatus = (status) => {
  const map = {
    'NEW': 'Нове', 'CONFIRMED': 'Підтверджено',
    'SHIPPED': 'Відправлено', 'COMPLETED': 'Виконано', 'CANCELLED': 'Скасовано'
  };
  return map[status] || status;
};

const translateDelivery = (type) => {
  const map = {
    'NOVA_POSHTA': 'Нова Пошта', 'POST_OFFICE': 'Інша пошта', 'SELF_PICKUP': 'Самовивіз'
  };
  return map[type] || type;
};

onMounted(loadOrders);
</script>

<style scoped>
.orders-manager { padding-top: 10px; }

/* --- STATS BAR --- */
.stats-bar {
  display: flex; gap: 20px; margin-bottom: 25px; flex-wrap: wrap;
}
.stat-item {
  background: white; padding: 15px 25px; border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; align-items: center; min-width: 120px;
}
.stat-val { font-size: 24px; font-weight: bold; color: #1f2937; }
.stat-val.warning { color: #d97706; } /* Жовтий */
.stat-val.success { color: #10b981; } /* Зелений */
.stat-label { font-size: 13px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }

.refresh-btn {
  margin-left: auto; background: #f3f4f6; border: none; padding: 0 20px;
  border-radius: 8px; cursor: pointer; font-weight: 600; color: #4b5563; transition: 0.2s;
}
.refresh-btn:hover { background: #e5e7eb; }

/* --- TABLE --- */
.list-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.order-table { width: 100%; border-collapse: collapse; }
.order-table th { text-align: left; padding: 15px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
.order-row { cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #f3f4f6; }
.order-row:hover { background: #fdfdfd; }
.order-table td { padding: 15px; vertical-align: middle; font-size: 14px; color: #374151; }

.short-id { font-family: monospace; font-weight: bold; color: #4b5563; }
.date { font-size: 12px; color: #9ca3af; }
.client-name { font-weight: 600; }
.client-phone { font-size: 12px; color: #6b7280; }
.delivery-type { font-size: 12px; background: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; display: inline-block; }
.city { font-size: 13px; margin-top: 2px; }

/* BADGES */
.badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
.badge.NEW { background: #dbeafe; color: #1e40af; }
.badge.CONFIRMED { background: #fff7ed; color: #c2410c; }
.badge.SHIPPED { background: #e0e7ff; color: #4338ca; }
.badge.COMPLETED { background: #d1fae5; color: #065f46; }
.badge.CANCELLED { background: #fee2e2; color: #991b1b; }

.btn-view { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.6; }
.order-row:hover .btn-view { opacity: 1; transform: scale(1.1); }

/* --- MODAL --- */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 1000;
  display: flex; justify-content: center; align-items: center; padding: 20px;
}
.modal-content {
  background: white; width: 100%; max-width: 800px; max-height: 90vh;
  border-radius: 12px; overflow-y: auto; padding: 30px; position: relative;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.close-modal {
  position: absolute; top: 20px; right: 20px; background: none; border: none;
  font-size: 28px; cursor: pointer; color: #9ca3af;
}

.modal-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.modal-header h2 { margin: 0; font-size: 22px; }
.badge.large { font-size: 13px; padding: 6px 12px; }

.modal-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px; }
@media (max-width: 768px) { .modal-grid { grid-template-columns: 1fr; } }

.info-section h3 { font-size: 16px; margin: 0 0 10px 0; color: #1f2937; border-left: 3px solid #d4af37; padding-left: 10px; }
.mt-20 { margin-top: 25px; }
.info-section p { margin: 5px 0; font-size: 14px; color: #4b5563; }
.comment-box { background: #fffbeb; padding: 10px; border-radius: 6px; border: 1px solid #fcd34d; font-style: italic; }

.items-list { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-top: 10px; }
.order-item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #f3f4f6; gap: 15px; }
.order-item:last-child { border-bottom: none; }
.item-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; }
.item-details { flex: 1; }
.item-name { font-weight: 600; font-size: 14px; }
.item-meta { font-size: 12px; color: #6b7280; }
.item-total { font-weight: bold; }

.total-row { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; font-size: 18px; font-weight: bold; border-top: 2px solid #eee; padding-top: 15px; }
.total-big { color: #d4af37; }

.modal-footer { margin-top: 30px; background: #f9fafb; padding: 20px; border-radius: 8px; }
.status-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.status-btn {
  padding: 8px 16px; border: 1px solid #e5e7eb; background: white;
  border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;
  transition: all 0.2s;
}
.status-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.status-btn.active { border-color: transparent; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }

/* Кольори кнопок при активному стані */
.status-btn.NEW.active { background: #3b82f6; }
.status-btn.CONFIRMED.active { background: #f97316; }
.status-btn.SHIPPED.active { background: #4f46e5; }
.status-btn.COMPLETED.active { background: #10b981; }
.status-btn.CANCELLED.active { background: #ef4444; }

/* Мобільна адаптація таблиці */
@media (max-width: 900px) {
  .order-table thead { display: none; }
  .order-table, tbody, tr, td { display: block; width: 100%; box-sizing: border-box; }
  .order-row { margin-bottom: 15px; border: 1px solid #eee; border-radius: 8px; padding: 15px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
  .order-table td { padding: 5px 0; text-align: right; display: flex; justify-content: space-between; align-items: center; }
  .order-table td::before { content: attr(class); display: none; } /* Тут можна додати лейбли через CSS content якщо треба */

  .td-date { font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px !important; margin-bottom: 5px; }
  .td-actions { justify-content: flex-end; margin-top: 10px; padding-top: 10px !important; border-top: 1px solid #f3f4f6; }
  .btn-view { background: #f3f4f6; padding: 8px 20px; border-radius: 6px; width: 100%; opacity: 1; }
}
</style>