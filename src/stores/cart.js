import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import axios from 'axios';

export const useCartStore = defineStore('cart', () => {
    // Стан: завантажуємо з localStorage
    const items = ref(JSON.parse(localStorage.getItem('cart_items')) || []);

    // Гетери
    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const totalItems = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    // Дії

    // 1. Оновлено: тепер приймає count (за замовчуванням 1)
    const addToCart = (product, count = 1) => {
        const prodId = product.product_id || product.id;
        const existingItem = items.value.find(item => item.product_id === prodId);

        // Беремо реальний залишок зі складу. Якщо бекенд не прислав, вважаємо що 1.
        const maxLimit = product.quantity !== undefined ? product.quantity : 1;

        if (existingItem) {
            // Перевіряємо, чи не перевищимо ліміт
            if (existingItem.quantity + count <= existingItem.maxStock) {
                existingItem.quantity += count;
            } else {
                // Якщо хоче більше ніж є - ставимо максимум
                existingItem.quantity = existingItem.maxStock;
                // Тут можна додати return false або кинути повідомлення, якщо треба
            }
        } else {
            let imageUrl = null;
            if (product.imageUrls && product.imageUrls.length > 0) {
                imageUrl = product.imageUrls[0];
            } else if (product.image_url) {
                imageUrl = product.image_url;
            }

            items.value.push({
                product_id: prodId,
                name: product.name,
                price: product.price,
                image_url: imageUrl,
                category: product.category,
                quantity: count,         // Скільки хоче клієнт
                maxStock: maxLimit       // <-- ВАЖЛИВО: Запам'ятовуємо ліміт складу
            });
        }
    };

    // 2. Нова дія: Зміна кількості (+/-) в самому кошику
    const updateQuantity = (productId, newQty) => {
        const item = items.value.find(item => item.product_id === productId);
        if (item) {
            // Перевіряємо межі: не менше 1 і не більше maxStock
            if (newQty >= 1 && newQty <= item.maxStock) {
                item.quantity = newQty;
            }
        }
    };

    const removeFromCart = (productId) => {
        items.value = items.value.filter(item => item.product_id !== productId);
    };

    const clearCart = () => {
        items.value = [];
    };

    const submitOrder = async (orderForm) => {
        const payload = {
            ...orderForm,
            items: items.value.map(item => ({
                productId: item.product_id,
                quantity: item.quantity
            }))
        };

        const publicAxios = axios.create();
        const response = await publicAxios.post('/api/orders', payload);

        clearCart();
        return response.data;
    };

    // Слідкуємо за змінами і зберігаємо в localStorage
    watch(items, (newItems) => {
        localStorage.setItem('cart_items', JSON.stringify(newItems));
    }, { deep: true });

    return {
        items,
        totalPrice,
        totalItems,
        addToCart,
        updateQuantity, // <-- Експортуємо нову функцію
        removeFromCart,
        clearCart,
        submitOrder
    };
});