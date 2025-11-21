import { createRouter, createWebHistory } from 'vue-router';
import MainPage from "@/views/MainPage.vue";
import MarketPage from "@/views/MarketPage.vue";
import ItemPage from "@/views/ItemPage.vue";
import CartPage from "@/views/CartPage.vue";

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
    }
];

// 2. Створіть екземпляр роутера
const router = createRouter({
    history: createWebHistory(), // Використовує "чисті" URL без #
    routes, // Ваш список маршрутів
});

// 3. Експортуйте роутер
export default router;