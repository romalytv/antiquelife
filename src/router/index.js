import { createRouter, createWebHistory, RouterView } from 'vue-router';
import { i18n } from '../i18n'; // <-- Переконайся, що шлях до твого i18n.js правильний

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
import JournalPost from "@/views/JournalPost.vue";
import JournalPage from "@/views/JournalPage.vue";
import PaymentPage from "@/views/PaymentPage.vue";
import PaymentSuccess from "@/views/PaymentSuccess.vue";
import AboutUs from "@/components/footerpages/AboutUs.vue";
import PrivacyPolicy from "@/components/footerpages/PrivacyPolicy.vue";
import PublicOffer from "@/components/footerpages/PublicOffer.vue";
import ShippingPolicy from "@/components/footerpages/ShippingPolicy.vue";
import Refund from "@/components/footerpages/Refund.vue";
import FAQ from "@/components/footerpages/FAQ.vue";
import HowWeWork from "@/components/footerpages/HowWeWork.vue";
import Services from "@/components/footerpages/Services.vue";

const routes = [
    {
        // Головний обгортковий маршрут, який ловить мову
        path: '/:lang(uk|en|ru)',
        component: RouterView, // Вбудований компонент для рендерингу сторінок
        children: [
            // Шляхи без сліша (/) спереду!
            { path: '', name: 'Home', component: MainPage },
            { path: 'market', name: 'Market', component: MarketPage },
            { path: 'product/:id', name: 'Item', component: ItemPage },
            { path: 'cart', name: 'Cart', component: CartPage },
            { path: 'login', component: Login },
            { path: 'admin', component: AdminPage, meta: { requiresAuth: true } },
            { path: 'order-success/:id', name: 'OrderSuccess', component: OrderSuccessPage, props: true },
            { path: 'contacts', name: 'contacts', component: ContactPage },
            { path: 'contact/success', name: 'ContactSuccess', component: ContactSuccessPage },
            { path: 'ai', name: 'AIPage', component: AIPage },
            { path: 'news', name: 'NewsPage', component: NewsPage },
            { path: 'journal', name: 'JournalList', component: JournalPage },
            { path: 'journal/:id', name: 'JournalPost', component: JournalPost, props: true },
            { path: 'payment/:id', name: 'PaymentPage', component: PaymentPage, props: true },
            { path: 'success', name: 'Success', component: PaymentSuccess },
            { path: 'about-us', name: 'AboutUs', component: AboutUs },
            { path: 'privacy-policy', name: 'Privacy Policy', component: PrivacyPolicy },
            { path: 'public-offer', name: 'PublicOffer', component: PublicOffer },
            { path: 'shipping-policy', name: 'Shipping Policy', component: ShippingPolicy },
            { path: 'refund', name: 'RefundPolicy', component: Refund },
            { path: 'faq', name: 'FAQ', component: FAQ },
            { path: 'how-we-work', name: 'HowWeWork', component: HowWeWork },
            { path: 'our-services', name: 'OurServices', component: Services }
        ]
    },
    // Редирект з "голого" кореня на дефолтну мову
    {
        path: '/',
        redirect: '/uk'
    },
    // Редирект для будь-яких старих посилань, де забули вказати мову
    {
        path: '/:pathMatch(.*)*',
        redirect: to => {
            return { path: '/uk' + to.path };
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// ОХОРОНЕЦЬ РОУТЕРА (Синхронізація мови + Авторизація)
router.beforeEach((to, from, next) => {
    // 1. Беремо мову з URL (якщо немає - ставимо 'uk')
    const lang = to.params.lang || 'uk';

    // 2. Синхронізуємо Vue i18n з URL
    if (i18n.global.locale.value !== lang) {
        i18n.global.locale.value = lang;
    }

    // 3. Перевірка авторизації
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('jwt_token');

        if (token) {
            next();
        } else {
            // Редирект на логін зі збереженням поточної мови
            next(`/${lang}/login`);
        }
    } else {
        next();
    }
});

export default router;