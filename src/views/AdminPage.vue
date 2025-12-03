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

          <div
              class="image-upload-container"
              @click="$refs.fileInput.click()"
              :class="{ 'has-image': previewImage }"
          >
            <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                hidden
                accept="image/*"
            >

            <div v-if="previewImage" class="preview-wrapper">
              <img :src="previewImage" alt="Preview" class="preview-img">
              <div class="overlay">Змінити фото</div>
            </div>

            <div v-else class="placeholder">
              <span>📷 Натисніть для фото</span>
            </div>
          </div>

          <AiScanner
              v-if="fileToUpload"
              :file="fileToUpload"
              @ai-data-loaded="handleAiData"
          />

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
            <textarea v-model="form.description" rows="5"></textarea>
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
              <img :src="p.image_path || '/placeholder.png'" class="thumb">
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import AiScanner from '../components/AIScanner.vue';

const router = useRouter();

// --- СТАН ---
const products = ref([]);
const categories = ref([]);
const isLoading = ref(false);
const isEditing = ref(false);

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

const handleAiData = (aiData) => {
  // Заповнюємо прості поля
  form.value.name = aiData.name;
  form.value.description = aiData.description;
  form.value.epoch = aiData.epoch;
  form.value.origin = aiData.origin;

  // Якщо ціна прийшла, ставимо її, інакше лишаємо як є
  if (aiData.price) form.value.price = aiData.price;

  // Спроба вгадати категорію (шукаємо схожу назву в списку categories)
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

// Робота з файлами
const fileToUpload = ref(null); // Сам файл (бінарний)
const previewImage = ref(null); // URL для показу картинки прямо зараз

// --- ЗАВАНТАЖЕННЯ ДАНИХ ---
const loadData = async () => {
  try {
    // 1. Отримуємо товари
    const prodRes = await axios.get(`/admin/products`);
    products.value = prodRes.data;

    // 2. Отримуємо категорії (для випадаючого списку)
    const catRes = await axios.get(`/api/categories`);
    categories.value = catRes.data;
  } catch (error) {
    console.error("Помилка завантаження даних:", error);
    if (error.response && error.response.status === 403) logout();
  }
};

// --- ОБРОБКА ФАЙЛУ ---
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    fileToUpload.value = file;
    // Створюємо тимчасове посилання, щоб показати прев'ю до відправки на сервер
    previewImage.value = URL.createObjectURL(file);
  }
};

// --- ВІДПРАВКА ФОРМИ (САМЕ ЦЕ ТОБІ ТРЕБА) ---
const handleSubmit = async () => {
  isLoading.value = true;
  try {
    const formData = new FormData();

    // 1. Формуємо JSON-об'єкт з даними
    const productData = {
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      quantity: form.value.quantity,
      status: form.value.status,
      epoch: form.value.epoch,
      origin: form.value.origin,
      categoryId: form.value.categoryId
    };

    // 2. Додаємо JSON як рядок (Java @RequestPart("product") чекає рядок)
    formData.append('product', JSON.stringify(productData));

    // 3. Додаємо файл, якщо він є (Java @RequestPart("image"))
    if (fileToUpload.value) {
      formData.append('image', fileToUpload.value);
    }

    // 4. Відправляємо
    if (isEditing.value) {
      // PUT: Оновлення
      await axios.put(`/admin/products/${form.value.product_id}`, formData);
    } else {
      // POST: Створення
      await axios.post('/admin/products', formData);
    }

    // 5. Успіх
    await loadData();
    resetForm();
    alert('Успішно збережено!');

  } catch (error) {
    console.error(error);
    alert('Помилка при збереженні. Перевірте консоль.');
  } finally {
    isLoading.value = false;
  }
};

// --- РЕДАГУВАННЯ ---
const editProduct = (item) => {
  // Заповнюємо форму даними з таблиці
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

  // Показуємо існуюче фото з сервера
  previewImage.value = item.image_path;
  fileToUpload.value = null; // Скидаємо новий файл, бо поки юзер його не міняв

  isEditing.value = true;

  // Скрол вгору
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- ВИДАЛЕННЯ ---
const deleteProduct = async (id) => {
  if (!confirm('Видалити цей товар?')) return;
  try {
    await axios.delete(`/admin/products/${id}`);
    products.value = products.value.filter(p => p.product_id !== id);
  } catch (error) {
    alert('Помилка видалення');
  }
};

// --- СКИДАННЯ ФОРМИ ---
const resetForm = () => {
  form.value = {
    product_id: null, name: '', description: '', price: 0,
    status: 'AVAILABLE', epoch: '', origin: '', categoryId: ''
  };
  fileToUpload.value = null;
  previewImage.value = null;
  isEditing.value = false;
  // Очистити input file
  // (не критично, але бажано, якщо юзер захоче вибрати той самий файл знову)
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

/* --- ЗАВАНТАЖЕННЯ ФОТО --- */
.image-upload-container {
  width: 100%;
  height: 200px;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 20px;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}
.preview-img { width: 100%; height: 100%; object-fit: contain; }
.overlay {
  position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6);
  color: white; text-align: center; padding: 5px; font-size: 12px;
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

  .content-wrapper {
    flex-direction: column; /* Форма зверху, список знизу */
  }

  /* 1. Форма більше не Sticky, бо на телефоні це заважає */
  .form-card {
    width: 100%;
    min-width: auto;
    position: static;
  }

  /* 2. Поля форми в одну колонку */
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width { grid-column: span 1; }

  /* 3. МАГІЯ ТАБЛИЦІ: Перетворюємо рядки на "Картки" */
  .product-table thead {
    display: none; /* Ховаємо шапку таблиці */
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
    margin-bottom: 15px; /* Відступ між "картками" */
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

  /* Робимо фото великим зліва */
  .product-table td.td-photo {
    justify-content: center;
    margin-bottom: 10px;
  }
  .thumb { width: 80px; height: 80px; }

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

  /* Кнопки дій на всю ширину */
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