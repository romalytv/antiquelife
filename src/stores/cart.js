import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import axios from 'axios';

export const useCartStore = defineStore('cart', () => {
    // Стан: завантажуємо з localStorage або створюємо пустий масив
    const items = ref(JSON.parse(localStorage.getItem('cart_items')) || []);

    // Гетери
    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const totalItems = computed(() => {
        return items.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    // Дії
    const addToCart = (product) => {
        const existingItem = items.value.find(item => item.product_id === product.product_id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            items.value.push({
                product_id: product.product_id || product.id, // Підстраховка ID
                name: product.name,
                price: product.price,
                image_url: product.imageUrls ? product.imageUrls[0] : null,
                category: product.category,
                quantity: 1
            });
        }
    };

    const removeFromCart = (productId) => {
        items.value = items.value.filter(item => item.product_id !== productId);
    };

    const clearCart = () => {
        items.value = [];
    };

    // Метод відправки на сервер
    const submitOrder = async (customerData) => {
        // Формуємо JSON згідно з Java DTO
        const payload = {
            customer: customerData,
            items: items.value.map(item => ({
                productId: item.product_id,
                quantity: item.quantity
            }))
        };

        // Відправка
        await axios.post('http://localhost:8080/api/orders', payload);
        clearCart(); // Очищаємо кошик після успіху
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
        removeFromCart,
        clearCart,
        submitOrder
    };
});