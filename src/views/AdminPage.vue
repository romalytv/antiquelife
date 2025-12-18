<template>
  <div class="admin-panel">
    <header class="admin-header">
      <h1>Адмінка</h1>
      <div class="user-info">
        <button @click="logout" class="logout-btn">Вийти</button>
      </div>
    </header>

    <div class="content-wrapper">

      <div class="card form-card">
        <h3>{{ isEditing ? 'Редагувати товар' : 'Додати новий товар' }}</h3>

        <form @submit.prevent="handleSubmit">

          <div class="upload-section">
            <input
                type="file"
                ref="fileInput"
                id="hidden-input"
                @change="handleFileSelect"
                hidden
                multiple
                accept="image/*"
            >

            <div class="upload-controls">
              <label for="hidden-input" class="btn-upload">
                📸 Додати фото
              </label>
              <span v-if="galleryItems.length > 0" class="counter">
      {{ galleryItems.length }} / 10
    </span>
            </div>

            <div v-if="galleryItems.length > 0" class="gallery-grid">
              <div v-for="(item, index) in galleryItems" :key="index" class="img-card">
                <img :src="item.url" class="preview-img">

                <button type="button" @click.stop="removeImage(index)" class="del-btn">×</button>

                <span v-if="item.type === 'local'" class="new-tag">New</span>
              </div>
            </div>
          </div>

          <div v-if="itemsForAi.length > 0" class="ai-wrapper">
            <AiScanner
                :files="itemsForAi"
                @ai-data-loaded="handleAiData"
            />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Назва</label>
              <input v-model="form.name" required placeholder="Назва товару">
            </div>

            <div class="form-group">
              <label>Ціна (грн)</label>
              <input v-model="form.price" type="number" step="0.01" required>
            </div>

            <div class="form-group">
              <label>Кількість</label>
              <input v-model="form.quantity" type="number" min="0" required>
            </div>

            <div class="form-group">
              <label>Категорія</label>
              <select v-model="form.categoryId" required>
                <option value="" disabled>Оберіть категорію</option>
                <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
                  {{ cat.category_name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Статус</label>
              <select v-model="form.status">
                <option value="AVAILABLE">В наявності</option>
                <option value="SOLD">Продано</option>
                <option value="RESERVED">Резерв</option>
              </select>
            </div>

            <div class="form-group">
              <label>Епоха</label>
              <input v-model="form.epoch" placeholder="Напр. XIX ст.">
            </div>

            <div class="form-group">
              <label>Походження</label>
              <input v-model="form.origin" placeholder="Напр. Франція">
            </div>
          </div>

          <div class="form-group full-width">
            <label>Опис</label>
            <textarea
                ref="textareaRef"
                v-model="form.description"
                @input="autoResize"
                class="auto-expand-textarea"
                placeholder="Введіть опис товару..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="isLoading">
              {{ isLoading ? 'Збереження...' : (isEditing ? 'Оновити' : 'Створити') }}
            </button>
            <button v-if="isEditing" type="button" @click="resetForm" class="cancel-btn">
              Відмінити
            </button>
          </div>
        </form>
      </div>

      <div class="card list-card">
        <h3>Список на складі ({{ products.length }})</h3>

        <div v-if="products.length === 0" class="empty-state">
          Товарів немає.
        </div>

        <table v-else class="product-table">
          <thead>
          <tr>
            <th>Фото</th>
            <th>Інфо</th>
            <th>Ціна</th>
            <th>Статус</th>
            <th>Дії</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="p in products" :key="p.product_id">
            <td class="td-photo">
              <img
                  :src="(p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls[0] : '/placeholder.png'"
                  class="thumb"
              >
              <span v-if="p.imageUrls && p.imageUrls.length > 1" class="more-photos-badge">
                +{{ p.imageUrls.length - 1 }}
              </span>
            </td>
            <td class="td-info">
              <div class="p-title">{{ p.name }}</div>
              <div class="p-meta">{{ p.epoch }} {{ p.origin ? '• ' + p.origin : '' }}</div>
              <div class="p-cat" v-if="p.category">{{ p.category.name }}</div>
            </td>
            <td class="td-price" data-label="Ціна">
              {{ p.price }} ₴
            </td>
            <td class="td-status" data-label="Статус">
              <span :class="['badge', p.status]">{{ p.status }}</span>
            </td>
            <td class="td-actions">
              <div class="actions">
                <button @click="editProduct(p)" class="icon-btn edit">✎</button>
                <button @click="deleteProduct(p.product_id)" class="icon-btn delete">✕</button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed} from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import AiScanner from '../components/AIScanner.vue';

const router = useRouter();

// --- СТАН ---
const products = ref([]);
const categories = ref([]);
const isLoading = ref(false);
const isEditing = ref(false);
const textareaRef = ref(null);

// Дані форми
const form = ref({
  product_id: null, // Важливо для редагування
  name: '',
  description: '',
  price: 0,
  quantity: 1,
  status: 'AVAILABLE',
  epoch: '',
  origin: '',
  categoryId: ''
});

// Єдиний масив для всіх фото (і старих з сервера, і нових з телефону)
const galleryItems = ref([]);

// Обчислюємо тільки нові файли для AI сканера
const itemsForAi = computed(() => {
  return galleryItems.value
      .filter(item => item.type === 'local')
      .map(item => item.file);
});

const autoResize = () => {
  const element = textareaRef.value;
  if (!element) return;

  // 1. Скидаємо висоту, щоб правильно перерахувати зменшення
  element.style.height = 'auto';

  // 2. Ставимо висоту рівну контенту (scrollHeight)
  element.style.height = element.scrollHeight + 'px';
};

// Слідкуємо за зміною опису (це спрацює, коли AI заповнить поле)
watch(() => form.value.description, async () => {
  await nextTick(); // Чекаємо, поки текст з'явиться в DOM
  autoResize();
});

// --- AI ---
const handleAiData = (aiData) => {
  form.value.name = aiData.name;
  form.value.description = aiData.description;
  form.value.epoch = aiData.epoch;
  form.value.origin = aiData.origin;
  if (aiData.price) form.value.price = aiData.price;

  if (aiData.category_guess && categories.value.length > 0) {
    const foundCat = categories.value.find(c =>
        c.category_name.toLowerCase().includes(aiData.category_guess.toLowerCase()) ||
        aiData.category_guess.toLowerCase().includes(c.category_name.toLowerCase())
    );
    if (foundCat) {
      form.value.categoryId = foundCat.category_id;
    }
  }
  alert('✨ Дані заповнено штучним інтелектом! Перевірте їх.');
};

// --- РОБОТА З ФАЙЛАМИ (ГАЛЕРЕЯ) ---
const handleFileSelect = (event) => {
  const newFiles = Array.from(event.target.files);
  if (!newFiles.length) return;

  if (galleryItems.value.length + newFiles.length > 10) {
    alert('Максимум 10 фото!');
    return;
  }

  newFiles.forEach(file => {
    galleryItems.value.push({
      type: 'local',            // Помічаємо як новий
      url: URL.createObjectURL(file), // Робимо прев'ю
      file: file                // Зберігаємо сам файл
    });
  });

  event.target.value = ''; // Скидаємо інпут
};

const removeImage = (index) => {
  const item = galleryItems.value[index];
  // Якщо видаляємо нове фото - чистимо пам'ять
  if (item.type === 'local') URL.revokeObjectURL(item.url);
  galleryItems.value.splice(index, 1);
};

// --- ВІДПРАВКА ---
const handleSubmit = async () => {
  if (galleryItems.value.length === 0) {
    alert("Додайте хоча б одне фото!");
    return;
  }

  isLoading.value = true;
  try {
    const formData = new FormData();

    // 1. Збираємо посилання на старі фото
    const oldUrls = galleryItems.value
        .filter(item => item.type === 'server')
        .map(item => item.url);

    const productData = {
      ...form.value,
      imageUrls: oldUrls
    };

    formData.append('product', JSON.stringify(productData));

    // 2. Додаємо фізичні файли нових фото
    galleryItems.value.forEach(item => {
      if (item.type === 'local') {
        formData.append('images', item.file);
      }
    });

    if (isEditing.value) {
      await axios.put(`/admin/products/${form.value.product_id}`, formData);
    } else {
      await axios.post('/admin/products', formData);
    }

    await loadData();
    resetForm();
    alert('Успішно збережено!');

  } catch (error) {
    console.error(error);
    alert('Помилка: ' + (error.response?.data?.message || error.message));
  } finally {
    isLoading.value = false;
  }
};

// --- ЗАВАНТАЖЕННЯ ДАНИХ ---
const loadData = async () => {
  try {
    const prodRes = await axios.get(`/admin/products`);
    products.value = prodRes.data.reverse();
    const catRes = await axios.get(`/api/categories`);
    categories.value = catRes.data;
  } catch (error) {
    if (error.response && error.response.status === 403) logout();
  }
};

// --- РЕДАГУВАННЯ ---
const editProduct = (item) => {
  form.value = {
    product_id: item.product_id,
    name: item.name,
    description: item.description,
    price: item.price,
    quantity: item.quantity,
    status: item.status,
    epoch: item.epoch,
    origin: item.origin,
    categoryId: item.category ? item.category.id : ''
  };

  // Завантажуємо галерею
  galleryItems.value = (item.imageUrls || []).map(url => ({
    type: 'server', // Це фото з сервера
    url: url
  }));

  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- ІНШЕ ---
const deleteProduct = async (id) => {
  if (!confirm('Видалити?')) return;
  await axios.delete(`/admin/products/${id}`);
  products.value = products.value.filter(p => p.product_id !== id);
};

const resetForm = () => {
  form.value = {
    product_id: null, name: '', description: '', price: 0,
    status: 'AVAILABLE', epoch: '', origin: '', categoryId: ''
  };
  galleryItems.value.forEach(item => {
    if (item.type === 'local') URL.revokeObjectURL(item.url);
  });

  // Очищаємо масив галереї
  galleryItems.value = [];
  isEditing.value = false;
};

const logout = () => {
  localStorage.removeItem('jwt_token');
  router.push('/login');
};

onMounted(loadData);
</script>

<style scoped>
/* --- ОСНОВНА СТРУКТУРА --- */
.admin-panel {
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.logout-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  color: #d32f2f;
  font-weight: 600;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* --- КАРТКИ --- */
.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.form-card {
  flex: 1;
  min-width: 350px;
  /* Sticky тільки для десктопу */
  position: sticky;
  top: 20px;
}

.list-card {
  flex: 2;
  overflow-x: auto; /* На випадок якщо таблиця все ж широка */
}

.auto-expand-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  background-color: #fff;
  color: #1f2937;

  /* 👇 МАГІЯ ТУТ */
  resize: vertical;      /* Дозволяємо юзеру тягнути, якщо хоче */
  overflow-y: auto;      /* Вмикаємо скрол, якщо вперлися в ліміт */

  min-height: 100px;     /* Початкова висота */
  max-height: 400px;     /* 🔥 ЛІМІТ: після цього з'явиться скрол */

  transition: border-color 0.2s;
}

.auto-expand-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.image-upload-container {
  width: 100%; min-height: 160px; /* Трохи менша висота */
  border: 2px dashed #cbd5e0; border-radius: 8px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; margin-bottom: 20px; background: #f8fafc;
  padding: 10px;
}

.gallery-preview {
  display: flex; flex-wrap: wrap; gap: 10px; width: 100%; justify-content: center;
}

.img-wrapper {
  position: relative; width: 70px; height: 70px;
}

.mini-preview {
  width: 100%; height: 100%; object-fit: cover; border-radius: 6px; border: 1px solid #ddd;
}

.remove-btn {
  position: absolute; top: -6px; right: -6px;
  background: #ef4444; color: white; border-radius: 50%;
  width: 20px; height: 20px; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.add-more-btn {
  width: 70px; height: 70px; border: 2px dashed #cbd5e0; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: #cbd5e0; font-size: 24px;
}

.upload-section {
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  padding: 15px;
  border-radius: 8px;
  background: #f9fafb;
}

.upload-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #1f2937;
  color: white;
  padding: 8px 16px; /* Трохи компактніше */
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  -webkit-user-select: none;
  transition: opacity 0.2s;
}

.btn-upload:active {
  opacity: 0.8;
}

.counter {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* --- ВИПРАВЛЕНА ГАЛЕРЕЯ --- */
.gallery-grid {
  display: grid;
  /* Ця магія автоматично розміщує стільки картинок, скільки влізе.
     Мінімальний розмір 80px, а далі вони розтягуються рівномірно. */
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px; /* Відступ між фото */
  margin-top: 15px;
}

.img-card {
  position: relative;
  width: 100%;     /* Ширина на всю комірку сітки */
  aspect-ratio: 1; /* КРИТИЧНО: робить блок завжди квадратним (1:1) */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
}

.preview-img {
  height: 250px;
  object-fit: cover; /* Фото обрізається, заповнюючи квадрат */
  display: block;
}

/* Кнопка видалення */
.del-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Бейдж New */
.new-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
  font-weight: 600;
}

/* --- ФОРМА --- */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 колонки на ПК */
  gap: 15px;
  margin-top: 15px;
}
.full-width { grid-column: span 2; }

.form-group { margin-bottom: 10px; }
label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; color: #4a5568; }
input, select, textarea {
  width: 100%; padding: 10px;
  border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 14px; box-sizing: border-box;
}

/* --- КНОПКИ --- */
.form-actions { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
.save-btn { background: #10b981; color: white; padding: 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.cancel-btn { background: #e5e7eb; color: #374151; padding: 12px; border: none; border-radius: 6px; cursor: pointer; }

/* --- ТАБЛИЦЯ (DESKTOP) --- */
.product-table { width: 100%; border-collapse: collapse; }
.product-table th { text-align: left; padding: 12px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; }
.product-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
.thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; background: #e2e8f0; }

.p-title { font-weight: 600; color: #1f2937; font-size: 14px; }
.p-meta { font-size: 12px; color: #6b7280; margin-top: 2px; }
.p-cat { font-size: 11px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
.p-price { font-weight: bold; font-family: monospace; font-size: 15px; }

.badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; white-space: nowrap; }
.badge.AVAILABLE { background: #d1fae5; color: #065f46; }
.badge.SOLD { background: #fee2e2; color: #991b1b; }
.badge.RESERVED { background: #ffedd5; color: #9a3412; }

.actions { display: flex; gap: 8px; }
.icon-btn { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.edit { background: #dbeafe; color: #1e40af; }
.delete { background: #fee2e2; color: #991b1b; }

/* =========================================
   МОБІЛЬНА АДАПТАЦІЯ (Найважливіше)
   ========================================= */
@media (max-width: 900px) {
  .admin-panel { padding: 10px; }

  .gallery-grid {
    /* На маленьких телефонах гарантовано 3 фото в ряд */
    grid-template-columns: repeat(3, 1fr);
  }

  .content-wrapper {
    flex-direction: column; /* Форма зверху, список знизу */
  }

  /* 1. Форма більше не Sticky, бо на телефоні це заважає */
  .form-card {
    width: 100%;
    min-width: auto;
    position: static;
  }

  .auto-expand-textarea {
    font-size: 16px; /* Щоб айфон не зумив */
    padding: 15px;

    /* На мобільному робимо ліміт трохи меншим,
       щоб клавіатура не перекривала кнопку "Зберегти" */
    max-height: 250px;
  }

  /* 2. Поля форми в одну колонку */
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width { grid-column: span 1; }

  /* 3. МАГІЯ ТАБЛИЦІ: Перетворюємо рядки на "Картки" */
  .product-table thead {
    display: none;
  }

  .product-table, .product-table tbody, .product-table tr, .product-table td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .product-table tr {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 15px;
    padding: 15px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  /* Вирівнювання всередині картки товару */
  .product-table td {
    padding: 5px 0;
    border: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
  }

  .product-table td.td-photo {
    justify-content: center;
    margin-bottom: 10px;
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Забираємо scale тут, щоб не конфліктувало з перемиканням,
       але можна залишити якщо подобається */
    transition: opacity 0.3s ease-in-out;
  }
  .thumb { width: 250px; height: 250px; }

  /* Інформація про товар */
  .product-table td.td-info {
    text-align: center;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
  }
  .p-title { font-size: 16px; margin-bottom: 4px; }

  /* Ціна та статус - додаємо підписи */
  .product-table td.td-price::before { content: "Ціна:"; font-size: 13px; color: #6b7280; }
  .product-table td.td-status::before { content: "Статус:"; font-size: 13px; color: #6b7280; }

  .product-table td.td-actions {
    margin-top: 10px;
    justify-content: center;
    border-top: 1px solid #eee;
    padding-top: 10px;
  }
  .actions { width: 100%; justify-content: space-around; }
  .icon-btn { width: 45%; height: 40px; }
}
</style>