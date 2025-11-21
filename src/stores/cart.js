import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {

    // 1. Стан (State) - завантажуємо з localStorage або створюємо пустий масив
    const items = ref(JSON.parse(localStorage.getItem('cart_items')) || []);

    // 2. Обчислення (Getters)
    const totalPrice = computed(() => {
        return items.value.reduce((sum, item) => sum + item.price, 0);
    });

    const itemsCount = computed(() => items.value.length);

    // 3. Дії (Actions)

    // Додати товар
    const addToCart = (product) => {
        // Перевірка, чи товар вже є в кошику (для антикваріату це важливо, бо він унікальний)
        const exists = items.value.find(item =>
            (item.productId || item.product_id) === (product.productId || product.product_id)
        );

        if (!exists) {
            items.value.push(product);
            saveToLocalStorage();
            alert('Товар додано в кошик!');
        } else {
            alert('Цей предмет вже у кошику.');
        }
    };

    // Видалити товар
    const removeFromCart = (productId) => {
        items.value = items.value.filter(item =>
            (item.productId || item.product_id) !== productId
        );
        saveToLocalStorage();
    };

    // Очистити кошик (після покупки)
    const clearCart = () => {
        items.value = [];
        saveToLocalStorage();
    };

    // Функція збереження
    const saveToLocalStorage = () => {
        localStorage.setItem('cart_items', JSON.stringify(items.value));
    };

    return { items, totalPrice, itemsCount, addToCart, removeFromCart, clearCart };
});