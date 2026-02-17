import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { i18n } from './i18n';
import App from './App.vue';
import router from './router/index.js';
import { createHead } from '@unhead/vue/client'; // <--- 1. Імпортуємо менеджер SEO-тегів

import './assets/main.css';
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Перехоплюємо кожен запит перед тим, як він полетить на сервер
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

console.log("Мій API URL:", import.meta.env.VITE_API_URL);

const app = createApp(App);
const head = createHead(); // <--- 2. Створюємо екземпляр

app.use(router);
app.use(createPinia());
app.use(i18n);
app.use(head); // <--- 3. Підключаємо до додатка

app.config.globalProperties.$localPath = (path) => {
    const currentLang = i18n.global.locale.value;
    // Якщо шлях вже починається зі слеша, просто склеюємо
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${currentLang}${cleanPath}`;
};

app.mount('#app');