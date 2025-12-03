// import './assets/HomePage.css'
//
// import { createApp } from 'vue'
// import App from './App.vue'
//
// createApp(App).mount('#app')
//

import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router/index.js'; // <--- 1. Імпортуйте ваш роутер

import './assets/main.css';
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// МАГІЯ ТУТ:
// Перехоплюємо кожен запит перед тим, як він полетить на сервер
axios.interceptors.request.use(config => {
    // 1. Дивимось, чи є токен у "кишені" (localStorage)
    const token = localStorage.getItem('jwt_token');

    // 2. Якщо є — чіпляємо його до заголовка
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const app = createApp(App);

app.use(router); // <--- 2. "Підключіть" роутер до додатка
app.use(createPinia())
app.mount('#app');