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

const app = createApp(App);

app.use(router); // <--- 2. "Підключіть" роутер до додатка
app.use(createPinia())
app.mount('#app');