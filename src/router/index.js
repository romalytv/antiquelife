import { createRouter, createWebHistory } from 'vue-router';
import MainPage from "@/views/MainPage.vue";
import MarketPage from "@/views/MarketPage.vue";
import ItemPage from "@/views/ItemPage.vue";
import CartPage from "@/views/CartPage.vue";
import Login from "@/views/Login.vue";
import AdminPage from "@/views/AdminPage.vue";
import OrderSuccessPage from "@/views/OrderSuccessPage.vue";
import ContactPage from "@/views/ContactPage.vue";
import ContactSuccessPage from "@/views/ContactSuccessPage.vue";
import AIPage from "@/views/AIPage.vue";
import NewsPage from "@/views/NewsPage.vue";

// 1. Визначте ваші маршрути (routes)
const routes = [
    {
        path: '/', // URL-адреса
        name: 'Home', // Назва маршруту
        component: MainPage // Компонент-сторінка, який буде показаний
    },
    {
        path: '/market',
        name: 'Market',
        component: MarketPage
    },
    {
        // :id означає, що сюди прилетить UUID
        path: '/product/:id',
        name: 'Item',
        component: ItemPage
    },
    {
        path: '/cart',
        name: 'Cart',
        component: CartPage
    },
    {
        path: '/login',
        component: Login
    }, // Вхід
    {
        path: '/admin',
        component: AdminPage,
        meta: { requiresAuth: true } // <--- МІТКА: "Тільки для своїх"
    },
    {
        path: '/order-success/:id',
        name: 'OrderSuccess',
        component: OrderSuccessPage,
        props: true // Дозволяє передавати id як prop, хоча ми беремо через route.params
    },
    {
        path: '/contacts',       // Це буде в адресному рядку: your-site.com/contacts
        name: 'contacts',
        component: ContactPage
    },
    {
        path: '/contact/success', // URL сторінки успіху
        name: 'ContactSuccess',
        component: ContactSuccessPage
    },
    {
        path: '/ai', // URL сторінки успіху
        name: 'AIPage',
        component: AIPage
    },
    {
        path: '/news', // URL сторінки успіху
        name: 'NewsPage',
        component: NewsPage
    }
];

// 2. Створіть екземпляр роутера
const router = createRouter({
    history: createWebHistory(), // Використовує "чисті" URL без #
    routes, // Ваш список маршрутів
});

// ОХОРОНЕЦЬ РОУТЕРА
router.beforeEach((to, from, next) => {
    // Перевіряємо, чи маршрут вимагає авторизації
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('jwt_token');

        if (token) {
            // Якщо токен є — пропускаємо
            next();
        } else {
            // Якщо немає — відправляємо на логін
            next('/login');
        }
    } else {
        // Якщо сторінка публічна — пропускаємо всіх
        next();
    }
});

// 3. Експортуйте роутер
export default router;