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
        const prodId = product.product_id || product.id;
        const existingItem = items.value.find(item => item.product_id === prodId);

        if (existingItem) {
            existingItem.quantity++;
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

    const submitOrder = async (orderForm) => {
        const payload = {
            ...orderForm,
            items: items.value.map(item => ({
                productId: item.product_id,
                quantity: item.quantity
            }))
        };

        // Використовуємо чистий axios без заголовків авторизації
        const publicAxios = axios.create();
        const response = await publicAxios.post('http://localhost:8080/api/orders', payload);

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
        removeFromCart,
        clearCart,
        submitOrder
    };
});