<template>
  <div class="expertise-page">
    <main class="main-content container">

      <div class="layout-wrapper">

        <div class="text-section">
          <div v-if="!resultData">
            <span class="main-title">Проаналізуйте вашу річ</span>
            <p class="description-text">
              Завантажте фото предмета — і штучний інтелект допоможе визначити, що це за
              антикваріат, оцінити його приблизну вартість та розповісти історію походження.
              Швидко, зручно та без потреби звертатися до експертів.
            </p>
          </div>
        </div>

        <div class="upload-section">
          <input
              type="file"
              ref="fileInput"
              hidden
              multiple
              accept="image/*"
              @change="handleFileSelect"
          >

          <div
              v-if="galleryItems.length === 0"
              class="empty-state-box"
              @click="triggerUpload"
          >
            <div class="placeholder-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </div>
          </div>

          <div v-else class="populated-state">
            <div class="photos-flex-container">
              <div
                  v-for="(item, index) in galleryItems"
                  :key="index"
                  class="photo-card"
              >
                <img :src="item.url" class="uploaded-img">
                <button class="delete-btn" @click.stop="removeImage(index)">×</button>
                <span class="photo-number">{{ index + 1 }}</span>
              </div>
            </div>

            <button
                class="wide-add-btn"
                @click="triggerUpload"
                :disabled="galleryItems.length >= 5"
            >
              <span v-if="galleryItems.length < 5">+ Додати ще фото ({{ galleryItems.length }}/5)</span>
              <span v-else>Максимальна кількість (5)</span>
            </button>
          </div>
        </div>

        <div class="action-section">

          <div v-if="!resultData">
            <button
                class="analyze-btn"
                @click="analyzeImage"
                :disabled="isLoading || galleryItems.length === 0 || attempts >= 3"
                :class="{ 'btn-ready': galleryItems.length > 0 && !isLoading && attempts < 3 }"
            >
              <span v-if="isLoading">Аналізуємо...</span>
              <span v-else>Запустити аналіз</span>
            </button>

            <div class="limit-badge-wrapper">
              <span v-if="attempts < 3" class="limit-text">Залишилось спроб сьогодні: {{ 3 - attempts }}</span>
              <span v-else class="limit-text error">Ліміт вичерпано</span>
            </div>

            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          </div>

          <div v-else class="result-content fade-in">
            <h2 class="item-name">{{ resultData.item_name }}</h2>
            <div class="price-tag">Оцінка: {{ resultData.estimated_price_range }}</div>

            <div class="analysis-section">
              <h3>Загальний опис</h3>
              <p>{{ resultData.general_description }}</p>
            </div>
            <div class="analysis-section">
              <h3>Декор</h3>
              <p>{{ resultData.decor }}</p>
            </div>
            <div class="analysis-section">
              <h3>Стилістика та форма</h3>
              <p>{{ resultData.style_and_form }}</p>
            </div>

            <button class="reset-btn" @click="reset">Аналізувати інший предмет</button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Константи для LocalStorage
const LS_KEY_COUNT = 'ai_scan_count';
const LS_KEY_EXPIRY = 'ai_scan_expiry';

// Стан
const fileInput = ref(null);
const galleryItems = ref([]);
const resultData = ref(null);
const isLoading = ref(false);
const errorMsg = ref('');
const attempts = ref(0);

// --- LocalStorage Logic ---
onMounted(() => {
  const now = Date.now();
  const storedExpiry = localStorage.getItem(LS_KEY_EXPIRY);
  const storedCount = localStorage.getItem(LS_KEY_COUNT);

  if (storedExpiry && now > parseInt(storedExpiry)) {
    resetLocalStorage();
  } else if (storedCount) {
    attempts.value = parseInt(storedCount);
  }
});

const resetLocalStorage = () => {
  attempts.value = 0;
  localStorage.removeItem(LS_KEY_COUNT);
  localStorage.removeItem(LS_KEY_EXPIRY);
};

const incrementAttempts = () => {
  attempts.value++;
  localStorage.setItem(LS_KEY_COUNT, attempts.value.toString());
  if (!localStorage.getItem(LS_KEY_EXPIRY)) {
    localStorage.setItem(LS_KEY_EXPIRY, (Date.now() + 86400000).toString());
  }
};

// --- Файли ---
const triggerUpload = () => fileInput.value.click();

const handleFileSelect = (event) => {
  const newFiles = Array.from(event.target.files);
  if (!newFiles.length) return;

  if (galleryItems.value.length + newFiles.length > 5) {
    alert('Максимум 5 фото!');
    return;
  }

  newFiles.forEach(file => {
    galleryItems.value.push({
      file: file,
      url: URL.createObjectURL(file)
    });
  });

  event.target.value = '';
  errorMsg.value = '';
};

const removeImage = (index) => {
  URL.revokeObjectURL(galleryItems.value[index].url);
  galleryItems.value.splice(index, 1);
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// --- API ---
const analyzeImage = async () => {
  if (galleryItems.value.length === 0) return;
  if (attempts.value >= 3) { alert("Ліміт вичерпано."); return; }

  isLoading.value = true;
  errorMsg.value = '';

  try {
    const promises = galleryItems.value.map(item => fileToBase64(item.file));
    const base64Images = await Promise.all(promises);

    const response = await axios.post('/api/public/ai/analyze', {
      images: base64Images
    });

    let content = null;
    if (response.data.choices?.[0]?.message?.content) {
      content = response.data.choices[0].message.content;
    } else if (response.data.output?.[0]) {
      const outItem = response.data.output[0];
      content = Array.isArray(outItem.content)
          ? (outItem.content.find(c => c.type === 'text')?.text || outItem.content[0]?.text)
          : outItem.content;
    }

    if (!content) throw new Error("EMPTY_RESPONSE");

    const cleanJson = content.replace(/```json|```/g, '').trim();
    resultData.value = JSON.parse(cleanJson);
    incrementAttempts();

  } catch (err) {
    console.error("AI Error:", err);
    errorMsg.value = "❌ Помилка. Спробуйте ще раз.";
  } finally {
    isLoading.value = false;
  }
};

const reset = () => {
  galleryItems.value = [];
  resultData.value = null;
  errorMsg.value = '';
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Montserrat:wght@300;400;500&display=swap');

@font-face {
  font-family: 'Palatino Linotype';
  src: url('src/assets/fonts/palatinolinotype_roman.ttf') format('woff2'),
  url('src/assets/fonts/palatinolinotype_roman.ttf') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* --- ЗАГАЛЬНІ --- */
.expertise-page { font-family: 'Montserrat', sans-serif; background: #fff; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.main-content { padding: 40px 0; }

/* === SYSTEM LAYOUT (Grid/Flex) === */
/* На десктопі це Grid, де Текст і Кнопка справа, Фото зліва */
.layout-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: start;
}

.upload-section { grid-column: 1; grid-row: 1 / span 2; } /* Фото зліва займає висоту */
.text-section { grid-column: 2; }
.action-section { grid-column: 2; }

/* === ТИПОГРАФІКА (Вирівнювання по лівому краю) === */
.main-title {
  font-family: 'Palatino Linotype', serif;
  font-size: 32px;
  color: #222;
  margin-bottom: 20px;
  text-align: left; /* Лівий край */
  line-height: 1.2;
}

.description-text {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 20px;
  text-align: left; /* Лівий край */
}

/* === ЗОНА ФОТО === */
.upload-section { width: 100%; }

.empty-state-box {
  width: 100%;
  aspect-ratio: 4/5; /* Трохи витягнутий квадрат, як на скріні */
  background-color: #051805;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s;
}
.empty-state-box:hover { opacity: 0.95; }

/* Список завантажених фото */
.populated-state { display: flex; flex-direction: column; gap: 20px; }
.photos-flex-container { display: flex; flex-wrap: wrap; gap: 10px; width: 100%; }

.photo-card {
  position: relative;
  width: calc(33.33% - 7px);
  aspect-ratio: 1;
  background: #f4f4f4; border: 1px solid #ddd;
}
.uploaded-img { width: 100%; height: 100%; object-fit: cover; }
.delete-btn {
  position: absolute; top: 0; right: 0; background: rgba(255,255,255,0.8);
  border: none; width: 24px; height: 24px; cursor: pointer;
}
.photo-number {
  position: absolute; bottom: 5px; left: 10px; font-size: 20px;
  color: rgba(255,255,255,0.8); pointer-events: none;
}

/* Кнопка додавання ще фото */
.wide-add-btn {
  width: 100%; padding: 15px; background: #fff; border: 1px solid #333;
  color: #333; font-family: 'Playfair Display', serif; text-transform: uppercase;
  cursor: pointer; transition: all 0.2s;
}
.wide-add-btn:hover { background: #f9f9f9; }

/* === КНОПКА ДІЇ === */
.analyze-btn {
  width: 100%;
  background-color: #ccc; /* Сірий, як на скріні */
  color: #fff;
  padding: 18px;
  font-size: 20px;
  border: none;
  font-family: 'Palatino Linotype', serif;
  cursor: not-allowed;
  transition: all 0.3s;
  margin-bottom: 10px;
}
.analyze-btn.btn-ready {
  background-color: #a0a0a0; /* Активний сірий */
  cursor: pointer;
}

.limit-badge-wrapper { text-align: left; margin-top: 5px; }
.limit-text { font-size: 12px; color: #999; }
.limit-text.error { color: #d32f2f; }
.error-msg { color: #d32f2f; margin-top: 10px; font-size: 14px; }

/* === РЕЗУЛЬТАТИ === */
.result-content { margin-top: 20px; text-align: left; margin-bottom: 20px;}
.item-name { font-family: 'Palatino Linotype', serif; font-size: 24px; margin-bottom: 10px; }
.price-tag { font-family: 'Palatino Linotype', serif; font-weight: 400; color: #051805; margin-bottom: 20px; font-size: 18px; }
.analysis-section h3 { font-family: 'Palatino Linotype', serif; font-size: 18px; margin-bottom: 8px; color: #333; margin-top: 20px; }
.analysis-section p { font-size: 14px; line-height: 1.6; color: #555; text-align: left; }
.reset-btn { width: 100%; margin-top: 30px; background: none; border: 1px solid #ccc; padding: 15px; cursor: pointer; text-transform: uppercase; font-size: 12px; }

/* =========================================
   МОБІЛЬНА ВЕРСІЯ (ГОЛОВНІ ЗМІНИ ТУТ)
   ========================================= */
@media (max-width: 768px) {

  .container {
    padding: 0 20px;
  }

  /* 1. Робимо колонку замість грід */
  .layout-wrapper {
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding-top: 10px;
  }

  /* 2. ПОРЯДОК: Текст -> Фото -> Кнопка */
  .text-section {
    order: 1;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 0;
  }

  .upload-section {
    order: 2;
    width: 100%;
    margin-bottom: 0;
    /* Додаємо центрування для самого блоку секції, про всяк випадок */
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .action-section {
    order: 3;
    width: 100%;
  }

  /* 3. Стилізація елементів */
  .main-title {
    font-size: 20px;
    margin-bottom: 15px;
    text-align: left;
  }

  .description-text {
    font-size: 14px;
    color: #888;
    line-height: 1.5;
    text-align: left;
    margin-bottom: 0;
  }

  /* Чорний квадрат теж центруємо, якщо він менший за екран */
  .empty-state-box {
    width: 295px; /* Фіксуємо ширину як у фото */
    height: 360px; /* Фіксуємо висоту як у фото */
    margin: 0 auto; /* Центруємо сам квадрат */
  }

  .analyze-btn {
    padding: 16px;
    font-size: 18px;
  }

  /* --- ГОЛОВНА ЗМІНА ТУТ --- */
  .photos-flex-container {
    display: flex;
    justify-content: center; /* Центруємо фото по горизонталі */
    width: 100%;
  }

  .photo-card {
    width: 295px;  /* Фіксована ширина */
    height: 360px; /* Фіксована висота */
    margin: 0 auto; /* Додаткове страхування для центрування */
  }

  /* Кнопка "Додати ще" теж має бути по ширині фото або на всю ширину */
  .wide-add-btn {
    width: 295px; /* Робимо ширину такою ж, як у фото */
    margin: 10px auto 0; /* Центруємо кнопку */
    display: block;
  }
}
</style>