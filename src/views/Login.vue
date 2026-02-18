<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="brand-header">
        <h2>Адмін-панель</h2>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Логін</label>
          <input
              id="username"
              v-model="username"
              type="text"
              required
              autocomplete="username"
              :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              :disabled="isLoading"
          />
        </div>

        <div v-if="error" class="error-alert">
          {{ error }}
        </div>

        <button type="submit" class="btn-submit" :disabled="isLoading">
          <span v-if="isLoading" class="loader-spinner"></span>
          <span v-else>Увійти</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  error.value = '';
  isLoading.value = true;

  try {
    // Замінив URL на твій реальний бекенд
    const response = await axios.post('/api/auth/login', {
      username: username.value,
      password: password.value
    });

    const token = response.data;
    localStorage.setItem('jwt_token', token);

    // ВАЖЛИВО: Переконайся, що у тебе є такий роут '/admin'
    router.push('/admin');

  } catch (err) {
    console.error(err);
    // Більш загальна помилка для безпеки
    error.value = 'Помилка входу. Перевірте дані.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 20px;
  color: #2c2d30;
}

.login-card {
  background: #ffffff;
  width: 100%;
  max-width: 380px;
  padding: 40px;
  /* Чітка рамка */
  border: 2px solid #dce0e5;
  border-radius: 4px;
}

.brand-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f2f5;
}

.brand-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Форма */
.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  /* Чітка рамка одразу */
  border: 2px solid #dce0e5;
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
  color: #2c2d30;
  background-color: #fff;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  /* При фокусі рамка стає темною і жирною */
  border-color: #2c2d30;
}

input:disabled {
  background-color: #f7f7f7;
  color: #999;
  cursor: not-allowed;
}

/* Помилка - строгий блок */
.error-alert {
  background-color: #fff0f0;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  border-left: 4px solid #d32f2f;
}

/* Кнопка - "важка" і механічна */
.btn-submit {
  width: 100%;
  padding: 14px;
  background-color: #2c2d30;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.1s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1a1b1e;
}

/* Ефект фізичного натискання */
.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  background-color: #9ea0a5;
  cursor: not-allowed;
}

/* Спінер */
.loader-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>