<template>
  <div class="login-container">
    <h2>Вхід для Адміністратора</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label>Логін:</label>
        <input v-model="username" type="text" required />
      </div>
      <div>
        <label>Пароль:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Увійти</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    // 1. Відправляємо дані на бекенд
    const response = await axios.post('/auth/login', {
      username: username.value,
      password: password.value
    });

    // 2. Отримуємо токен (твоє API повертає його просто текстом)
    const token = response.data;

    // 3. Зберігаємо токен у localStorage
    localStorage.setItem('jwt_token', token);

    // 4. Перекидаємо на сторінку адмінки
    router.push('/admin');

  } catch (err) {
    console.error(err);
    error.value = 'Невірний логін або пароль!';
  }
};
</script>

<style scoped>
.login-container { max-width: 300px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; }
.error { color: red; margin-top: 10px; }
input { display: block; width: 100%; margin-bottom: 10px; }
</style>