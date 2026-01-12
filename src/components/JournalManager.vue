<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h3>Журнал новин</h3>
      <div style="display: flex; gap: 10px;">
        <button @click="createNew" class="btn-upload" style="background: #10b981;">+ Створити нову</button>
      </div>
    </div>

    <div class="content-wrapper">

      <div class="card list-card sidebar-panel">
        <h3 style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Всі новини</h3>
        <div class="posts-list">
          <div
              v-for="post in posts"
              :key="post.id"
              class="post-item"
              :class="{ active: currentPost?.id === post.id }"
              @click="selectPost(post)"
          >
            <img :src="post.mainImageUrl || '/placeholder.png'" class="post-thumb" />
            <div class="post-info">
              <div class="post-title">{{ post.title || 'Без назви' }}</div>
              <div class="post-date">{{ formatDate(post.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card form-card">
        <div v-if="!currentPost" class="empty-state">
          <p>⬅️ Оберіть новину зі списку або натисніть "Створити"</p>
        </div>

        <div v-else>
          <div class="form-header" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h3>{{ isEditing ? 'Редагування' : 'Новий запис' }}</h3>
            <button v-if="isEditing" @click="deletePost" class="logout-btn" style="color: #dc3545; border-color: #dc3545;">Видалити</button>
          </div>

          <div class="form-grid">

            <div class="full-width form-group">
              <label>Категорії (можна декілька)</label>
              <div class="multi-select-box">
                <div
                    v-for="cat in categories"
                    :key="cat.categoryId"
                    class="select-item"
                    :class="{ active: form.categoryIds.includes(cat.categoryId) }"
                    @click="toggleCategory(cat.categoryId)"
                >
                  <input type="checkbox" :checked="form.categoryIds.includes(cat.categoryId)" readonly>
                  <span>{{ cat.category_name }}</span>
                </div>
              </div>
            </div>

            <div class="full-width form-group">
              <label>Підкатегорії</label>
              <div class="multi-select-box">
                <div
                    v-for="sub in filteredSubCategories"
                    :key="sub.sub_categoryId"
                    class="select-item"
                    :class="{ active: form.subCategoryIds.includes(sub.sub_categoryId) }"
                    @click="toggleSubCategory(sub.sub_categoryId)"
                >
                  <input type="checkbox" :checked="form.subCategoryIds.includes(sub.sub_categoryId)" readonly>
                  <span>{{ sub.displayName }}</span>
                </div>
              </div>
            </div>

            <div class="full-width form-group">
              <label>Заголовок новини</label>
              <input v-model="form.title" type="text" placeholder="Наприклад: Антикварне скло..." />
            </div>

            <div class="full-width form-group">
              <label>Обкладинка (Main Image)</label>
              <div class="upload-section">
                <div class="upload-controls">
                  <input type="file" ref="mainInput" @change="handleMainFile" accept="image/*" hidden />
                  <button class="btn-upload" @click="$refs.mainInput.click()">Обрати файл</button>
                  <span class="counter" v-if="!previewMainImage && !currentPost.mainImageUrl">Файл не обрано</span>
                </div>

                <div v-if="previewMainImage || currentPost.mainImageUrl" class="img-card main-thumb">
                  <img :src="previewMainImage || currentPost.mainImageUrl" class="preview-img" />
                  <button class="del-btn" @click="removeMainImage">×</button>
                </div>
              </div>
            </div>

            <div class="full-width form-group">
              <label>Галерея</label>
              <div class="upload-section">
                <div class="upload-controls">
                  <input type="file" ref="galleryInput" multiple @change="handleGalleryFiles" accept="image/*" hidden />
                  <button class="btn-upload" @click="$refs.galleryInput.click()">+ Додати фото</button>
                  <span class="counter">{{ form.existingGalleryUrls.length + galleryFiles.length }} фото в сумі</span>
                </div>

                <div class="gallery-grid">
                  <div v-for="(url, idx) in form.existingGalleryUrls" :key="'old-'+idx" class="img-card">
                    <img :src="url" class="preview-img" />
                    <button class="del-btn" @click="removeExistingImage(idx)">×</button>
                    <div class="new-tag" style="background: #6b7280;">Saved</div>
                  </div>

                  <div v-for="(fileObj, idx) in newGalleryPreviews" :key="'new-'+idx" class="img-card">
                    <img :src="fileObj.url" class="preview-img" />
                    <button class="del-btn" @click="removeNewGalleryImage(idx)">×</button>
                    <div class="new-tag">New</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="full-width form-group">
              <label>Текст (Markdown)</label>
              <textarea
                  v-model="form.content"
                  class="auto-expand-textarea"
                  placeholder="Пишіть тут... **жирний**, *курсив*..."
              ></textarea>
            </div>

            <div class="full-width form-group">
              <label>Теги (Enter щоб додати)</label>
              <input
                  v-model="tagInput"
                  @keydown.enter.prevent="addTag"
                  placeholder="Введіть тег та натисніть Enter"
              />
              <div class="tags-container">
                <span v-for="(t, i) in form.customTags" :key="i" class="tag-badge">
                  #{{ t }} <span @click="removeTag(i)" class="tag-remove">×</span>
                </span>
              </div>
            </div>

          </div>

          <div class="form-actions">
            <button @click="savePost" class="save-btn" :disabled="isLoading">
              {{ isLoading ? 'Збереження...' : 'Зберегти зміни' }}
            </button>
            <button @click="resetForm" class="cancel-btn">Скасувати зміни</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';

// --- DATA ---
const posts = ref([]);
const categories = ref([]);
const currentPost = ref(null);
const isEditing = ref(false);
const isLoading = ref(false);

// Form Data
const form = reactive({
  title: '',
  content: '',
  categoryIds: [],
  subCategoryIds: [],
  customTags: [],
  existingGalleryUrls: []
});

// Files & Previews
const mainFile = ref(null);
const previewMainImage = ref(null);

const galleryFiles = ref([]);
const newGalleryPreviews = ref([]); // { url: string, file: File }

const tagInput = ref('');

// --- COMPUTED ---
const filteredSubCategories = computed(() => {
  // 1. Знаходимо категорії, які зараз обрані (або беремо всі, якщо нічого не обрано)
  let visibleCategories = [];

  if (form.categoryIds.length > 0) {
    visibleCategories = categories.value.filter(cat =>
        form.categoryIds.includes(cat.categoryId)
    );
  } else {
    // Якщо категорія не обрана — показуємо підкатегорії ВСІХ категорій
    visibleCategories = categories.value;
  }

  // 2. Проходимось по кожній категорії і дістаємо її підкатегорії,
  // додаючи до них префікс "Категорія / "
  return visibleCategories.flatMap(cat => {
    if (!cat.subCategories) return [];

    return cat.subCategories.map(sub => ({
      ...sub, // копіюємо всі поля підкатегорії (id, name тощо)
      // Створюємо нову назву для відображення
      displayName: `${cat.category_name} / ${sub.name}`
    }));
  });
});

// --- INIT ---
onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  try {
    const [postsRes, catsRes] = await Promise.all([
      axios.get('/admin/journal'), // Заміни на свій ендпоінт
      axios.get('/api/categories')
    ]);
    posts.value = postsRes.data;
    categories.value = catsRes.data;
  } catch (e) {
    console.error("Помилка завантаження:", e);
  }
};

// --- ACTIONS ---
const createNew = () => {
  currentPost.value = { id: null };
  isEditing.value = false;
  resetForm();
  // Щоб форма з'явилась, нам потрібен "порожній" об'єкт, але з ID null
  currentPost.value = { id: null, mainImageUrl: null };
};

const selectPost = (post) => {
  currentPost.value = post;
  isEditing.value = true;

  // Заповнюємо форму
  form.title = post.title;
  form.content = post.content;
  form.customTags = post.customTags ? [...post.customTags] : [];

  // Мапимо категорії (перевіряємо структуру JSON з бекенду)
  form.categoryIds = post.categories ? post.categories.map(c => c.categoryId || c.id) : [];
  form.subCategoryIds = post.subCategories ? post.subCategories.map(s => s.sub_categoryId || s.id) : [];

  form.existingGalleryUrls = post.galleryImages ? [...post.galleryImages] : [];

  // Скидаємо нові файли
  mainFile.value = null;
  previewMainImage.value = null;
  galleryFiles.value = [];
  newGalleryPreviews.value = [];
};

// --- CHECKBOX TOGGLES ---
const toggleCategory = (id) => {
  const index = form.categoryIds.indexOf(id);
  if (index === -1) form.categoryIds.push(id);
  else form.categoryIds.splice(index, 1);
};

const toggleSubCategory = (id) => {
  const index = form.subCategoryIds.indexOf(id);
  if (index === -1) form.subCategoryIds.push(id);
  else form.subCategoryIds.splice(index, 1);
};

// --- FILE HANDLING ---
const handleMainFile = (e) => {
  const file = e.target.files[0];
  if(file) {
    mainFile.value = file;
    previewMainImage.value = URL.createObjectURL(file);
  }
};

const handleGalleryFiles = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    galleryFiles.value.push(file);
    newGalleryPreviews.value.push({
      url: URL.createObjectURL(file),
      file: file
    });
  });
  // Очистити інпут, щоб можна було додати ті самі файли знову
  e.target.value = '';
};

const removeExistingImage = (index) => {
  form.existingGalleryUrls.splice(index, 1);
};

const removeNewGalleryImage = (index) => {
  // Видаляємо з масиву прев'ю і з масиву файлів
  newGalleryPreviews.value.splice(index, 1);
  galleryFiles.value.splice(index, 1);
};

const removeMainImage = () => {
  mainFile.value = null;
  previewMainImage.value = null;
  // Якщо ми редагуємо, можна також очистити посилання на стару картинку,
  // якщо логіка бекенду дозволяє видаляти обкладинку:
  if (currentPost.value) {
    currentPost.value.mainImageUrl = null;
  }
};

// --- TAGS ---
const addTag = () => {
  const val = tagInput.value.trim();
  if (val && !form.customTags.includes(val)) {
    form.customTags.push(val);
  }
  tagInput.value = '';
};
const removeTag = (i) => form.customTags.splice(i, 1);

// --- SAVE ---
const savePost = async () => {
  isLoading.value = true;
  try {
    const formData = new FormData();

    const dto = {
      title: form.title,
      content: form.content,
      categoryIds: form.categoryIds,
      subCategoryIds: form.subCategoryIds,
      customTags: form.customTags,
      existingGalleryUrls: form.existingGalleryUrls
    };

    // 1. JSON Data
    formData.append('data', new Blob([JSON.stringify(dto)], { type: 'application/json' }));

    // 2. Main Image
    if (mainFile.value) {
      formData.append('mainImage', mainFile.value);
    }

    // 3. Gallery (тільки нові файли)
    galleryFiles.value.forEach(f => {
      formData.append('gallery', f);
    });

    const url = isEditing.value
        ? `/admin/journal/${currentPost.value.id}`
        : '/admin/journal';

    // Axios сам вибере PUT або POST, якщо налаштовано, або робимо явно:
    if (isEditing.value) {
      await axios.put(url, formData);
    } else {
      await axios.post(url, formData);
    }

    await loadData();
    alert('Збережено успішно!');
    if (!isEditing.value) createNew(); // Очистити форму після створення

  } catch (e) {
    console.error(e);
    alert('Помилка: ' + (e.response?.data || e.message));
  } finally {
    isLoading.value = false;
  }
};

const deletePost = async () => {
  if(!confirm('Видалити цей запис?')) return;
  try {
    await axios.delete(`/admin/journal/${currentPost.value.id}`);
    await loadData();
    createNew(); // скинути на створення
  } catch(e) { alert(e.message); }
};

const resetForm = () => {
  form.title = '';
  form.content = '';
  form.categoryIds = [];
  form.subCategoryIds = [];
  form.customTags = [];
  form.existingGalleryUrls = [];
  mainFile.value = null;
  previewMainImage.value = null;
  galleryFiles.value = [];
  newGalleryPreviews.value = [];
  tagInput.value = '';
};

const formatDate = (d) => {
  if(!d) return '';
  return new Date(d).toLocaleDateString('uk-UA', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};
</script>

<style scoped>

.main-thumb {
  width: 150px;       /* Розмір як ти просив */
  height: 150px;
  margin-top: 15px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  position: relative; /* Щоб хрестик позиціонувався */
}
/* ВСТАВЛЯЄМО ТВОЇ СТИЛІ */
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
  height: calc(100vh - 100px); /* Щоб скролилось */
}

/* --- КАРТКИ --- */
.card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

/* Адаптація sidebar */
.sidebar-panel {
  flex: 0 0 350px; /* Фіксована ширина списку */
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.form-card {
  flex: 1;
  height: 100%;
  overflow-y: auto; /* Скрол всередині форми */
}

/* --- LIST ITEMS (SIDEBAR) --- */
.post-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  margin-bottom: 5px;
}
.post-item:hover { background-color: #f9fafb; }
.post-item.active { background-color: #eef2ff; border: 1px solid #c7d2fe; }
.post-thumb { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; background: #e5e7eb; margin-right: 12px;}
.post-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.post-title { font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 2px;}
.post-date { font-size: 11px; color: #6b7280; }

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
  resize: vertical;
  overflow-y: auto;
  min-height: 200px;
  transition: border-color 0.2s;
}

.auto-expand-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
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
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  border: none;
  transition: opacity 0.2s;
}
.btn-upload:active { opacity: 0.8; }

.counter {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

/* --- ГАЛЕРЕЯ --- */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.img-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
  /* aspect-ratio тут можна прибрати для .main-thumb, якщо задано жорстку ширину/висоту */
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.del-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
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
  grid-template-columns: 1fr;
  gap: 15px;
  margin-top: 15px;
}

.form-group { margin-bottom: 15px; }
label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #4a5568; }
input, select, textarea {
  width: 100%; padding: 10px;
  border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 14px; box-sizing: border-box;
}

/* --- МУЛЬТИ-СЕЛЕКТ (ЧЕКБОКСИ) --- */
/* Стиль для списку категорій, щоб не використовувати select */
.multi-select-box {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  max-height: 150px;
  overflow-y: auto;
  background: white;
  padding: 5px;
}
.select-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.1s;
  font-size: 14px;
}
.select-item:hover { background: #f3f4f6; }
.select-item.active { background: #eff6ff; color: #1d4ed8; font-weight: 500; }
.select-item input { width: auto; margin: 0; cursor: pointer; }

/* --- COVER PREVIEW --- */
.cover-preview-container {
  margin-top: 15px;
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.cover-big-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* --- TAGS --- */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.tag-badge {
  background: #eef2ff;
  color: #4338ca;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
}
.tag-remove {
  margin-left: 6px;
  cursor: pointer;
  color: #6366f1;
  font-size: 14px;
}
.tag-remove:hover { color: #dc2626; }

/* --- КНОПКИ --- */
.form-actions { margin-top: 30px; display: flex; gap: 10px; border-top: 1px solid #eee; padding-top: 20px;}
.save-btn { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.save-btn:disabled { background: #a7f3d0; cursor: not-allowed; }
.cancel-btn { background: #e5e7eb; color: #374151; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; }

/* АДАПТАЦІЯ */
@media (max-width: 900px) {
  .content-wrapper { flex-direction: column; height: auto; }
  .sidebar-panel { flex: none; width: 100%; height: 300px; margin-bottom: 20px; }
  .form-card { flex: none; width: 100%; height: auto; }
}
</style>