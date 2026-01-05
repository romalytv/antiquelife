<template>
  <div class="messages-wrapper">

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-val">{{ messages.length }}</span>
        <span class="stat-label">Всього повідомлень</span>
      </div>
      <button @click="loadMessages" class="refresh-btn">🔄 Оновити</button>
    </div>

    <div v-if="loading" class="loading-state">Завантаження...</div>
    <div v-else-if="messages.length === 0" class="empty-state">
      📭 Повідомлень немає
    </div>

    <div v-else class="messages-list">
      <div v-for="msg in messages" :key="msg.id" class="message-card">

        <div class="msg-header">
          <div class="sender-info">
            <span class="sender-name">{{ msg.name }}</span>
            <span class="sender-email">&lt;{{ msg.email }}&gt;</span>
          </div>
          <div class="msg-date">{{ formatDate(msg.createdAt) }}</div>
        </div>

        <div class="msg-body">
          {{ msg.message }}
        </div>

        <div class="msg-actions">
          <a :href="`mailto:${msg.email}?subject=Відповідь Antique Life`" class="action-btn reply">
            ↩️ Відповісти
          </a>

          <button @click="deleteMessage(msg.id)" class="action-btn delete">
            🗑️ Видалити
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const messages = ref([]);
const loading = ref(false);

// Допоміжна функція для авторизації
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const loadMessages = async () => {
  loading.value = true;
  try {
    // Звертаємось до нового методу GET /api/contact/admin
    const response = await axios.get('/api/contact/admin', {
      headers: getAuthHeaders()
    });
    messages.value = response.data;
  } catch (error) {
    console.error("Помилка завантаження повідомлень:", error);
    if (error.response?.status === 403) alert("Немає доступу (спробуйте перелогінитись)");
  } finally {
    loading.value = false;
  }
};

const deleteMessage = async (id) => {
  if (!confirm("Видалити це повідомлення назавжди?")) return;

  try {
    await axios.delete(`/api/contact/admin/${id}`, {
      headers: getAuthHeaders()
    });
    // Видаляємо локально зі списку
    messages.value = messages.value.filter(m => m.id !== id);
  } catch (error) {
    alert("Помилка видалення");
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('uk-UA', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
 .messages-wrapper {
   max-width: 900px;
   margin: 0 auto;
   padding: 20px;
   font-family: 'Helvetica Neue', Arial, sans-serif;
 }

/* --- СТАТИСТИКА --- */
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
}
.stat-val { font-size: 1.4rem; font-weight: bold; color: #1f2937; }
.stat-label { font-size: 0.85rem; color: #6b7280; }

.refresh-btn {
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.refresh-btn:hover { background: #f3f4f6; }

/* --- СПИСОК ПОВІДОМЛЕНЬ --- */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #1f2937; /* Темний акцент */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
  transition: transform 0.2s;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Вирівнювання по верху */
  margin-bottom: 15px;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 12px;
}

.sender-info {
  display: flex;
  flex-direction: column; /* Ім'я зверху, пошта знизу */
  gap: 2px;
}

.sender-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: #111;
}

.sender-email {
  color: #6b7280;
  font-size: 0.9rem;
  word-break: break-all; /* Щоб довгі email не ламали верстку */
}

.msg-date {
  font-size: 0.8rem;
  color: #9ca3af;
  white-space: nowrap; /* Дата в один рядок */
  margin-left: 10px;
}

.msg-body {
  white-space: pre-wrap;
  color: #374151;
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 20px;
}

/* --- КНОПКИ --- */
.msg-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: 0.2s;
  border: 1px solid transparent;
}

.reply {
  background-color: #eff6ff;
  color: #2563eb;
  border-color: #dbeafe;
}
.reply:active { background-color: #dbeafe; }

.delete {
  background-color: #fef2f2;
  color: #dc2626;
  border-color: #fee2e2;
}
.delete:active { background-color: #fee2e2; }

.loading-state, .empty-state { text-align: center; padding: 40px; color: #9ca3af; }

/* =========================================
   МОБІЛЬНА АДАПТАЦІЯ
   ========================================= */
@media (max-width: 600px) {
  .messages-wrapper {
    padding: 10px;
  }

  .message-card {
    padding: 15px;
  }

  /* Перебудовуємо шапку: все стовпчиком */
  .msg-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .sender-info {
    width: 100%;
  }

  .sender-name {
    font-size: 1.1rem;
  }

  .msg-date {
    margin-left: 0;
    font-size: 0.8rem;
    color: #9ca3af;
  }

  /* Робимо кнопки великими на весь рядок */
  .msg-actions {
    width: 100%;
    gap: 10px;
  }

  .action-btn {
    flex: 1; /* Кнопки ділять ширину порівну */
    padding: 12px; /* Більша зона кліку */
    font-size: 14px;
  }
}
</style>