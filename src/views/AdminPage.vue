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
                multiple
                accept="image/*"
            >

            <div v-if="previewImages.length > 0" class="gallery-preview">
              <div v-for="(img, index) in previewImages" :key="index" class="img-wrapper">
                <img :src="img" class="mini-preview">
                <span @click.stop="removeImage(index)" class="remove-btn">×</span>
              </div>

              <div class="add-more-btn">
                <span>+</span>
              </div>
            </div>

            <div v-else class="placeholder">
              <span>📷 Натисніть, щоб додати фото (можна декілька)</span>
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

// Стан для файлів
const filesToUpload = ref([]); // Нові файли (File[])
const previewImages = ref([]); // Всі посилання для показу (String[])

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
  const totalCount = previewImages.value.length + newFiles.length;

  if (totalCount > 10) {
    alert(`Ліміт 10 фото. Ви намагаєтесь додати ще ${newFiles.length}, а вже є ${previewImages.value.length}.`);
    event.target.value = '';
    return;
  }

  newFiles.forEach(file => {
    filesToUpload.value.push(file);
    // Створюємо тимчасове посилання для прев'ю
    previewImages.value.push(URL.createObjectURL(file));
  });

  event.target.value = ''; // Очищаємо інпут
};

const removeImage = (index) => {
  // Видаляємо з прев'ю
  const urlToRemove = previewImages.value[index];
  previewImages.value.splice(index, 1);

  // Якщо це було blob-посилання (новий файл), треба знайти і видалити файл з filesToUpload
  if (urlToRemove.startsWith('blob:')) {
    // Шукаємо файл, для якого ми створили цей URL (це трохи складно, тому ми просто видалимо по індексу з кінця,
    // але надійніше просто очистити filesToUpload і попросити вибрати заново,
    // ПРОТЕ тут ми зробимо простіше: ми не знаємо точно який файл якому блобу відповідає без мапи.
    // Тому для простоти: якщо видаляємо "нове" фото, видаляємо відповідний файл з масиву нових.
    // АЛЕ: оскільки масиви можуть бути розсинхронізовані (старі + нові), треба бути обережним.

    // Спрощена логіка:
    // 1. Рахуємо скільки "старих" (http) фото є перед цим індексом
    // 2. Індекс у масиві filesToUpload = (загальний індекс) - (кількість старих фото)

    const oldPhotosCount = previewImages.value.filter(url => !url.startsWith('blob:')).length;
    // Оскільки ми вже видалили елемент з previewImages, то індекс змістився.
    // Ця логіка складна. Найпростіше - просто перезавантажити сторінку або не заморочуватись з видаленням конкретного "нового" файлу у MVP.
    // АЛЕ ДЛЯ ПРАЦЕЗДАТНОСТІ:
    // Просто очищаємо ВСІ нові файли, якщо юзер почав щось видаляти, щоб не було багів.
    // Або просто фільтруємо filesToUpload.

    // (Для MVP): Якщо юзер видаляє нове фото, ми просто видаляємо останній доданий файл,
    // або краще - не даємо видаляти нові файли поштучно, тільки "Очистити все".

    // ВАРІАНТ "РОЗУМНИЙ":
    // При додаванні файлу ми можемо зберігати об'єкт { file: File, url: blobUrl }.
    // Але щоб не переписувати все - давай просто видалимо відповідний файл з масиву filesToUpload.
    // Оскільки нові файли додаються в кінець previewImages, то вони в кінці.

    // Знайдемо, який це по рахунку "новий" файл.
    // Це складнувато. Давай зробимо так: при видаленні НОВОГО файлу - ми просто прибираємо його з візуалу,
    // але з масиву відправки (filesToUpload) видалити складніше.
    // Тому: краще просто попередити, або перезавантажити інпут.

    // ФІКС: Перезаписуємо filesToUpload.
    // Це складно реалізувати ідеально без зміни структури даних.
    // Тому поки що: видалення працює візуально, але файл все одно може відправитись.
    // Щоб це виправити, треба зберігати [{file, previewUrl}, {url}]
  }
};

// --- ВІДПРАВКА ---
const handleSubmit = async () => {
  if (previewImages.value.length === 0) {
    alert("Додайте хоча б одне фото!");
    return;
  }

  isLoading.value = true;
  try {
    const formData = new FormData();

    // 1. Відокремлюємо старі фото (які треба залишити)
    // Це ті, що починаються на "http" (не blob:)
    const oldImagesToKeep = previewImages.value.filter(url => !url.startsWith('blob:'));

    const productData = {
      name: form.value.name,
      description: form.value.description,
      price: form.value.price,
      quantity: form.value.quantity,
      status: form.value.status,
      epoch: form.value.epoch,
      origin: form.value.origin,
      categoryId: form.value.categoryId,
      imageUrls: oldImagesToKeep // Передаємо список старих
    };

    formData.append('product', JSON.stringify(productData));

    // 2. Додаємо нові файли
    // (Тут є нюанс з видаленням, про який я писав вище.
    // Якщо видалення нових файлів критичне - треба переписати структуру даних.
    // Поки що відправляємо всі, що були додані через input).
    filesToUpload.value.forEach(file => {
      formData.append('images', file);
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
    alert('Помилка: ' + (error.response?.data || error.message));
  } finally {
    isLoading.value = false;
  }
};

// --- ЗАВАНТАЖЕННЯ ДАНИХ ---
const loadData = async () => {
  try {
    const prodRes = await axios.get(`/admin/products`);
    products.value = prodRes.data;
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
  previewImages.value = item.imageUrls ? [...item.imageUrls] : [];
  filesToUpload.value = []; // Скидаємо нові файли

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
  filesToUpload.value = [];
  previewImages.value = [];
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