<template>
  <div class="content-wrapper">

    <div class="card form-card">
      <h3>{{ isEditing ? 'Редагувати товар' : 'Додати новий товар' }}</h3>

      <form @submit.prevent="handleSubmit">
        <div class="upload-section">
          <input type="file" ref="fileInput" id="hidden-input" @change="handleFileSelect" hidden multiple accept="image/*">
          <div class="upload-controls">
            <label for="hidden-input" class="btn-upload">📸 Додати фото</label>
            <span v-if="galleryItems.length > 0" class="counter">{{ galleryItems.length }} / 10</span>
          </div>
          <div v-if="galleryItems.length > 0" class="ai-section">
            <button
                v-if="!form.coverImage"
                type="button"
                class="btn-ai-process"
                @click="processImage"
                :disabled="isProcessing"
            >
              {{ isProcessing ? '🎨 Малюємо...' : '✨ Згенерувати студійну обкладинку (AI)' }}
            </button>

            <div v-if="form.coverImage" class="ai-preview-panel">
              <div class="ai-image-wrapper">
                <img :src="form.coverImage" alt="AI Cover" class="ai-img-result">
                <div class="ai-badge">AI Studio</div>
              </div>

              <div class="ai-actions">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="useAiCover">
                  <span class="custom-check"></span>
                  Використовувати як головну
                </label>

                <div class="ai-btn-group">
                  <button type="button" @click="processImage" :disabled="isProcessing" class="icon-btn-text refresh">
                    🔄 {{ isProcessing ? '...' : 'Перегенерувати' }}
                  </button>
                  <button type="button" @click="clearAiImage" class="icon-btn-text danger">
                    🗑 Видалити
                  </button>
                </div>
              </div>
            </div>
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
          <AiScanner :files="itemsForAi" @ai-data-loaded="handleAiData"/>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Назва *</label>
            <div class="lang-group">
              <input v-model="form.name.uk" required placeholder="Українською">
              <input v-model="form.name.en" placeholder="Англійською">
              <input v-model="form.name.ru" placeholder="російською">
            </div>
          </div>

          <div class="form-group">
            <label>Ціна (євро) *</label>
            <input v-model="form.price" type="number" step="0.01" required>
          </div>

          <div class="form-group">
            <label>Кількість *</label>
            <input v-model="form.quantity" type="number" min="0" required>
          </div>

          <div class="form-group">
            <label>Категорія *</label>
            <select v-model="form.categoryId" required>
              <option value="" disabled>Оберіть категорію</option>
              <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
                {{ cat.category_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Підкатегорія (Тип)</label>
            <input
                v-model="form.subCategory"
                list="dynamic-subcats"
                :disabled="filteredSubCategories.length === 0"
                :placeholder="filteredSubCategories.length > 0 ? 'Оберіть зі списку або введіть' : 'Для цієї категорії немає підкатегорій'"
                class="form-control"
            >
            <datalist id="dynamic-subcats">
              <option v-for="sub in filteredSubCategories" :key="sub.subCategoryId" :value="sub.name" />
            </datalist>
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
            <div class="lang-group">
              <input v-model="form.epoch.uk" placeholder="Напр. XIX ст.">
              <input v-model="form.epoch.en" placeholder="Напр. 19th c.">
              <input v-model="form.epoch.ru" placeholder="Напр. XIX в.">
            </div>
          </div>

          <div class="form-group">
            <label>Походження</label>
            <div class="lang-group">
              <input v-model="form.origin.uk" placeholder="Напр. Франція">
              <input v-model="form.origin.en" placeholder="Напр. France">
              <input v-model="form.origin.ru" placeholder="Напр. Франция">
            </div>
          </div>

          <div class="form-group">
            <label>Розміри</label>
            <input v-model="form.dimensions" placeholder="Напр. 20x30 см">
          </div>
        </div>

        <div class="form-grid-row">
          <div class="form-group">
            <label>Бренд (Не перекладається)</label>
            <input v-model="form.brand" placeholder="Limoges">
          </div>

          <div class="form-group">
            <label>Колір</label>
            <div class="lang-group">
              <input v-model="form.color.uk" placeholder="Білий">
              <input v-model="form.color.en" placeholder="White">
              <input v-model="form.color.ru" placeholder="Белый">
            </div>
          </div>

          <div class="form-group">
            <label>Матеріал</label>
            <div class="lang-group">
              <input v-model="form.material.uk" placeholder="Порцеляна">
              <input v-model="form.material.en" placeholder="Porcelain">
              <input v-model="form.material.ru" placeholder="Фарфор">
            </div>
          </div>
        </div>

        <div class="form-group full-width">
          <label>Опис</label>
          <div class="lang-group">
            <textarea
                v-model="form.description.uk"
                @input="autoResize"
                class="auto-expand-textarea"
                placeholder="Введіть опис українською..."
            ></textarea>
            <textarea
                v-model="form.description.en"
                @input="autoResize"
                class="auto-expand-textarea"
                placeholder="Введіть опис англійською..."
            ></textarea>
            <textarea
                v-model="form.description.ru"
                @input="autoResize"
                class="auto-expand-textarea"
                placeholder="Введіть опис російською..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="save-btn" :disabled="isLoading">
            {{ isLoading ? 'Збереження...' : (isEditing ? 'Оновити' : 'Створити') }}
          </button>
          <button v-if="isEditing" type="button" @click="resetForm" class="cancel-btn">Відмінити</button>
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
            <img :src="p.coverImage ? p.coverImage : ((p.imageUrls && p.imageUrls.length > 0) ? p.imageUrls[0] : '/placeholder.png')" class="thumb">
          </td>
          <td class="td-info">
            <div class="p-title">{{ getLocalizedText(p.name) }}</div>
            <div class="p-meta">
              {{ getLocalizedText(p.epoch) }}
              {{ getLocalizedText(p.origin) ? '• ' + getLocalizedText(p.origin) : '' }}
              {{ p.category ? '• ' + p.category.category_name : '' }}
              {{ p.subCategory ? '/ ' + p.subCategory.name : '' }}
            </div>
          </td>
          <td class="td-price">{{ p.price }} €</td>
          <td class="td-status"><span :class="['badge', p.status]">{{ p.status }}</span></td>
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
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import axios from 'axios';
import AiScanner from './AIScanner.vue';

const emit = defineEmits(['auth-error']);

// Дані
const products = ref([]);
const categories = ref([]);
const isLoading = ref(false);
const isEditing = ref(false);
const isProcessing = ref(false);

// Допоміжна функція для ініціалізації об'єкта мов
const initLoc = () => ({ uk: '', en: '', ru: '' });

// Форма (Тепер з об'єктами для мультимовних полів)
const form = ref({
  product_id: null,
  name: initLoc(),
  description: initLoc(),
  price: 0,
  quantity: 1,
  status: 'AVAILABLE',
  epoch: initLoc(),
  origin: initLoc(),
  dimensions: '',
  categoryId: '',
  subCategory: '',
  brand: '',
  color: initLoc(),
  material: initLoc(),
  coverImage: ''
});

const useAiCover = ref(false);
const galleryItems = ref([]);

// --- ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ ЛОКАЛІЗАЦІЇ ---

// 1. Витягування тексту для таблиці (пріоритет: uk -> рядок -> '')
const getLocalizedText = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj.uk || obj.en || obj.ru || '';
};

// 2. Безпечне перетворення даних з бекенду/ШІ в об'єкт
const ensureLocalized = (data) => {
  if (typeof data === 'object' && data !== null) {
    return {
      uk: data.uk || '',
      en: data.en || '',
      ru: data.ru || ''
    };
  }
  // Якщо прийшов звичайний рядок або нічого
  return { uk: data || '', en: '', ru: '' };
};

// --- ОБЧИСЛЮВАНІ ВЛАСТИВОСТІ (COMPUTED) ---
const itemsForAi = computed(() => {
  return galleryItems.value.filter(item => item.type === 'local').map(item => item.file);
});

const filteredSubCategories = computed(() => {
  const selectedId = form.value.categoryId;
  if (!selectedId) return [];
  const currentCat = categories.value.find(c => c.categoryId == selectedId);
  if (currentCat && currentCat.subCategories && currentCat.subCategories.length > 0) {
    return currentCat.subCategories;
  }
  return [];
});

// --- WATCHERS ---
// Авто-висота для ОПИСУ (тепер працює з $event, бо полів 3 штуки)
const autoResize = (event) => {
  const element = event.target;
  if (!element) return;
  element.style.height = 'auto';
  element.style.height = element.scrollHeight + 'px';
};

watch(() => form.value.categoryId, (newVal, oldVal) => {
  if (newVal !== oldVal && !isEditing.value) {
    form.value.subCategory = '';
  }
});

// --- AI LOGIC ---
const handleAiData = (aiData) => {
  if (!aiData) return;

  // 1. Заповнюємо мультимовні поля безпечно
  form.value.name = ensureLocalized(aiData.name);
  form.value.description = ensureLocalized(aiData.description);
  form.value.epoch = ensureLocalized(aiData.epoch);
  form.value.origin = ensureLocalized(aiData.origin);
  form.value.color = ensureLocalized(aiData.color);
  form.value.material = ensureLocalized(aiData.material);

  // Стандартні поля
  if (aiData.price) form.value.price = aiData.price;
  form.value.brand = aiData.brand || '';

  // 2. ЛОГІКА "РОЗУМНОГО" ВИБОРУ КАТЕГОРІЇ
  let foundCategoryId = null;
  const aiSub = aiData.sub_category;
  const aiCatName = aiData.category_guess;

  if (aiSub && categories.value.length > 0) {
    for (const cat of categories.value) {
      if (cat.subCategories && cat.subCategories.some(sub => sub.name === aiSub)) {
        foundCategoryId = cat.categoryId;
        break;
      }
    }
  }

  if (!foundCategoryId && aiCatName) {
    const searchName = aiCatName.trim().toLowerCase();
    const foundCat = categories.value.find(c => {
      const dbName = (c.categoryName || '').toLowerCase();
      return dbName.includes(searchName) || searchName.includes(dbName);
    });
    if (foundCat) foundCategoryId = foundCat.categoryId;
  }

  if (foundCategoryId) {
    form.value.categoryId = foundCategoryId;
    if (aiSub) {
      nextTick(() => { form.value.subCategory = aiSub; });
    }
  }

  // Оновлюємо висоту textarea після ШІ
  nextTick(() => {
    const textareas = document.querySelectorAll('.auto-expand-textarea');
    textareas.forEach(ta => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  });

  alert('✨ Дані заповнено штучним інтелектом!');
};

// --- ФАЙЛИ ---
const handleFileSelect = (event) => {
  const newFiles = Array.from(event.target.files);
  if (!newFiles.length) return;
  if (galleryItems.value.length + newFiles.length > 10) { alert('Максимум 10 фото!'); return; }
  newFiles.forEach(file => {
    galleryItems.value.push({ type: 'local', url: URL.createObjectURL(file), file: file });
  });
  event.target.value = '';
};

const removeImage = (index) => {
  const item = galleryItems.value[index];
  if (item.type === 'local') URL.revokeObjectURL(item.url);
  galleryItems.value.splice(index, 1);
};

// --- CRUD ОПЕРАЦІЇ ---
const loadData = async () => {
  try {
    const prodRes = await axios.get(`/admin/products`);
    products.value = prodRes.data.reverse();

    const catRes = await axios.get(`/api/categories`);
    categories.value = catRes.data;
  } catch (error) {
    if (error.response?.status === 403) emit('auth-error');
  }
};

const handleSubmit = async () => {
  if (galleryItems.value.length === 0) {
    alert("Додайте хоча б одне фото!");
    return;
  }
  isLoading.value = true;
  try {
    const formData = new FormData();
    const oldUrls = galleryItems.value.filter(item => item.type === 'server').map(item => item.url);

    const productPayload = {
      ...form.value,
      imageUrls: oldUrls
    };

    formData.append('product', JSON.stringify(productPayload));

    galleryItems.value.forEach(item => {
      if (item.type === 'local') formData.append('images', item.file);
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
    if (error.response?.status === 403) emit('auth-error');
    else alert('Помилка: ' + (error.response?.data?.message || error.message));
  } finally {
    isLoading.value = false;
  }
};

// --- AI LOGIC (GENERATION) ---
const processImage = async () => {
  if (galleryItems.value.length === 0) { alert('Спочатку додайте фото товару!'); return; }
  const sourceItem = galleryItems.value[0];
  if (sourceItem.type !== 'local') { alert("Для генерації обкладинки додайте нове фото."); return; }

  isProcessing.value = true;
  try {
    const formData = new FormData();
    formData.append('image', sourceItem.file);

    const res = await axios.post('/admin/ai/generate-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    form.value.coverImage = res.data.url;
    useAiCover.value = true;
  } catch (err) {
    console.error(err);
    alert('Помилка генерації: ' + (err.response?.data || err.message));
  } finally {
    isProcessing.value = false;
  }
};

const clearAiImage = () => { form.value.coverImage = ''; useAiCover.value = false; };

const editProduct = (item) => {
  const catId = item.category ? item.category.categoryId : '';

  form.value = {
    product_id: item.product_id,

    // БЕЗПЕЧНО підтягуємо мови
    name: ensureLocalized(item.name),
    description: ensureLocalized(item.description),
    epoch: ensureLocalized(item.epoch),
    origin: ensureLocalized(item.origin),
    color: ensureLocalized(item.color),
    material: ensureLocalized(item.material),

    price: item.price,
    quantity: item.quantity,
    status: item.status,
    dimensions: item.dimensions,
    categoryId: catId,
    subCategory: item.subCategory ? item.subCategory.name : '',
    brand: item.brand || '',
    coverImage: item.coverImage || ''
  };

  useAiCover.value = !!item.coverImage;
  galleryItems.value = (item.imageUrls || []).map(url => ({ type: 'server', url: url }));
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Оновлюємо висоту текстарей
  nextTick(() => {
    const textareas = document.querySelectorAll('.auto-expand-textarea');
    textareas.forEach(ta => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  });
};

const deleteProduct = async (id) => {
  if (!confirm('Видалити?')) return;
  try {
    await axios.delete(`/admin/products/${id}`);
    products.value = products.value.filter(p => p.product_id !== id);
  } catch (error) { if (error.response?.status === 403) emit('auth-error'); }
};

const resetForm = () => {
  form.value = {
    product_id: null, name: initLoc(), description: initLoc(), price: 0, quantity: 1,
    status: 'AVAILABLE', epoch: initLoc(), origin: initLoc(), dimensions: '',
    categoryId: '', subCategory: '', brand: '', color: initLoc(), material: initLoc(), coverImage: ''
  };
  useAiCover.value = false;
  galleryItems.value.forEach(item => { if (item.type === 'local') URL.revokeObjectURL(item.url); });
  galleryItems.value = [];
  isEditing.value = false;
};

onMounted(loadData);
</script>

<style scoped>
/* Додаємо невеличкий відступ для згрупованих інпутів */
.lang-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

<style scoped>
/* --- NEW AI STYLES --- */

.ai-section {
  margin-top: 15px;
  border-top: 1px dashed #e2e8f0;
  padding-top: 15px;
}

.btn-ai-process {
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-ai-process:hover { opacity: 0.9; }
.btn-ai-process:disabled { background: #cbd5e1; cursor: not-allowed; }

.ai-preview-panel {
  display: flex;
  gap: 15px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  align-items: center; /* Вирівнювання по центру вертикально */
}

.ai-image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0; /* Забороняємо картинці стискатись */
}

.ai-img-result {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #6366f1;
  background: white;
}

.ai-badge {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: #6366f1;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.ai-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  overflow: hidden; /* Щоб кнопки не вилазили */
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  color: #374151;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
  margin: 0;
}

.ai-btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap; /* Дозволяємо перенос, якщо дуже вузько */
}

.icon-btn-text {
  background: white;
  border: 1px solid #cbd5e0;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
  font-weight: 500;
  white-space: nowrap;
}

.icon-btn-text.refresh { flex: 2; } /* Кнопка перегенерувати ширша */
.icon-btn-text.danger { flex: 1; }  /* Кнопка видалити вужча */

.icon-btn-text.refresh:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
.icon-btn-text.danger:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

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
   МОБІЛЬНА АДАПТАЦІЯ (ФІНАЛ)
   ========================================= */
@media (max-width: 900px) {
  /* 1. Загальні налаштування контейнера */
  .admin-panel {
    padding: 10px;
    overflow-x: hidden; /* Забороняємо горизонтальний скрол всій сторінці */
  }

  .content-wrapper {
    display: flex;
    flex-direction: column; /* Жорстко ставимо колонку */
    gap: 20px;
    width: 100%; /* Контейнер на всю ширину */
  }

  /* 2. ЛІКУЄМО ФОРМУ (щоб не виїжджала) */
  .form-card {
    position: static !important; /* Вимикаємо sticky */
    width: 100% !important; /* Ширина на весь екран */
    min-width: 0 !important; /* Flex-фікс, щоб не розпирало */
    margin: 0 !important;
    box-sizing: border-box; /* Щоб паддінги не ламали ширину */
  }

  .form-grid {
    grid-template-columns: 1fr; /* Поля в одну колонку */
  }

  .full-width {
    grid-column: span 1;
  }

  /* 3. СПИСОК ТОВАРІВ (Картки з великим фото) */
  .list-card {
    width: 100%;
    min-width: 0;
    padding: 15px; /* Трохи менші відступи всередині */
    box-sizing: border-box;
  }

  .product-table thead {
    display: none;
  }

  .product-table, .product-table tbody {
    display: block;
    width: 100%;
  }

  .product-table tr {
    display: flex;
    flex-direction: column; /* Елементи один під одним */
    align-items: center; /* ЦЕНТРУВАННЯ ВСЬОГО */
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    margin-bottom: 20px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Тінь для краси */
  }

  /* --- ФОТО (150x150 по центру) --- */
  .product-table td.td-photo {
    width: 100%;
    display: flex;
    justify-content: center; /* Центруємо фото горизонтально */
    padding: 0;
    margin-bottom: 15px;
    border: none;
  }

  .thumb {
    width: 150px; /* Як ти просив */
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .more-photos-badge {
    /* Ховаємо або підлаштовуємо бейдж */
    display: none;
  }

  /* --- ІНФО (Назва) --- */
  .product-table td.td-info {
    width: 100%;
    text-align: center; /* Текст по центру */
    padding: 0;
    margin-bottom: 10px;
    border: none;
  }

  .p-title {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 5px;
  }

  .p-meta {
    display: none;
  }

  /* Прибрали сірий текст */
  .p-cat {
    display: inline-block;
    margin-top: 5px;
  }

  /* --- ЦІНА --- */
  .product-table td.td-price {
    width: 100%;
    text-align: center;
    font-size: 20px; /* Велика ціна */
    font-weight: 800;
    color: #1f2937;
    border: none;
    padding: 5px 0;
    display: block;
  }

  /* Додаємо слово "Ціна" маленьким шрифтом */
  .product-table td.td-price::before {
    content: "Ціна: ";
    font-weight: 400;
    font-size: 14px;
    color: #6b7280;
    vertical-align: middle;
  }

  /* --- СТАТУС --- */
  .product-table td.td-status {
    width: 100%;
    text-align: center;
    border: none;
    padding: 5px 0;
    display: block;
  }

  .product-table td.td-status::before {
    content: none;
  }

  /* --- КНОПКИ --- */
  .product-table td.td-actions {
    width: 100%;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dashed #e5e7eb;
    display: block;
  }

  .actions {
    display: flex;
    justify-content: center; /* Кнопки по центру */
    gap: 15px;
    width: 100%;
  }

  .icon-btn {
    flex: 1;
    max-width: 120px; /* Щоб кнопки не були надто довгими на планшетах */
    height: 44px;
    border-radius: 8px;
  }
}

.form-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 10px;
}

/* На мобільному робимо їх в стовпчик */
@media (max-width: 600px) {
  .form-grid-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .ai-preview-panel {
    flex-direction: column; /* Елементи один під одним */
    text-align: center;
    padding: 15px;
  }

  .ai-image-wrapper {
    width: 120px; /* Трохи більше фото */
    height: 120px;
    margin-bottom: 10px; /* Відступ до кнопок */
  }

  .ai-actions {
    width: 100%;
    align-items: center; /* Центруємо чекбокс */
  }

  .checkbox-label {
    width: 100%;
    justify-content: center; /* Чекбокс по центру */
    padding: 5px 0;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #f1f5f9;
    margin-bottom: 5px;
  }

  .ai-btn-group {
    width: 100%;
    gap: 8px;
  }

  .icon-btn-text {
    flex: 1; /* Кнопки розтягуються на всю ширину */
    padding: 10px; /* Більша зона натискання */
    font-size: 14px;
  }
}
</style>