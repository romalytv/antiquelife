<template>
  <div class="expertise-page">
    <main class="main-content container">
      <div class="grid-layout">

        <div class="upload-area-wrapper">

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
            <p class="upload-hint">Натисніть, щоб додати фото</p>
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

        <div class="info-area">

          <div v-if="!resultData">
            <h1 class="main-title">Проаналізуйте вашу річ</h1>

            <div class="limit-badge" :class="{ 'limit-reached': attempts >= 3 }">
              <span v-if="attempts < 3">Залишилось спроб сьогодні: {{ 3 - attempts }}</span>
              <span v-else>Ліміт вичерпано</span>
            </div>

            <p class="description-text">
              Завантажте фото предмета — і штучний інтелект допоможе визначити, що це за
              антикваріат, оцінити його приблизну вартість та розповісти історію походження.
            </p>

            <button
                class="analyze-btn"
                @click="analyzeImage"
                :disabled="isLoading || galleryItems.length === 0 || attempts >= 3"
                :class="{ 'btn-ready': galleryItems.length > 0 && !isLoading && attempts < 3 }"
            >
              <span v-if="isLoading">Аналізуємо...</span>
              <span v-else-if="galleryItems.length === 0">Додайте фото</span>
              <span v-else>Запустити аналіз</span>
            </button>

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
const galleryItems = ref([]); // Тут зберігаємо { file, url }
const resultData = ref(null);
const isLoading = ref(false);
const errorMsg = ref('');
const attempts = ref(0);

// --- LocalStorage (Ліміти) ---
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

// --- Робота з файлами (Як у тебе в Адмінці) ---
const triggerUpload = () => fileInput.value.click();

const handleFileSelect = (event) => {
  const newFiles = Array.from(event.target.files);
  if (!newFiles.length) return;

  if (galleryItems.value.length + newFiles.length > 5) {
    alert('Максимум 5 фото!');
    return;
  }

  // Додаємо файли у форматі об'єктів
  newFiles.forEach(file => {
    galleryItems.value.push({
      file: file,
      url: URL.createObjectURL(file)
    });
  });

  event.target.value = ''; // Скидаємо інпут
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

// --- Основна логіка запиту до AI ---
const analyzeImage = async () => {
  if (galleryItems.value.length === 0) return;
  if (attempts.value >= 3) { alert("Ліміт вичерпано."); return; }

  isLoading.value = true;
  errorMsg.value = '';

  try {
    // 1. Конвертуємо файли в Base64
    const promises = galleryItems.value.map(item => fileToBase64(item.file));
    const base64Images = await Promise.all(promises);

    // 2. Відправляємо на ПУБЛІЧНИЙ ендпоінт
    const response = await axios.post('/api/public/ai/analyze', {
      images: base64Images
    });

    console.log("🔥 AI Response:", response.data);

    let content = null;

    // 3. Розбираємо відповідь (підтримуємо обидва формати)
    if (response.data.choices?.[0]?.message?.content) {
      content = response.data.choices[0].message.content; // Стандартний GPT
    } else if (response.data.output?.[0]) {
      // Новий формат (якщо backend юзає Responses API)
      const outItem = response.data.output[0];
      content = Array.isArray(outItem.content)
          ? (outItem.content.find(c => c.type === 'text')?.text || outItem.content[0]?.text)
          : outItem.content;
    }

    if (!content) throw new Error("EMPTY_RESPONSE");

    const cleanJson = content.replace(/```json|```/g, '').trim();
    resultData.value = JSON.parse(cleanJson);

    incrementAttempts(); // +1 спроба

  } catch (err) {
    console.error("AI Error:", err);
    if (err.response && err.response.status === 429) {
      errorMsg.value = "⏳ Забагато запитів. Ліміт вичерпано.";
      attempts.value = 3;
    } else {
      errorMsg.value = "❌ Щось пішло не так. Спробуйте ще раз.";
    }
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

/* ЗАГАЛЬНІ СТИЛІ */
.expertise-page { font-family: 'Montserrat', sans-serif; background: #fff; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

/* HEADER */
.header { background-color: #051805; color: #fff; padding: 20px 0; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.logo { font-family: 'Playfair Display', serif; font-style: italic; font-size: 28px; }
.nav-links a { color: #ccc; margin-left: 20px; text-decoration: none; text-transform: uppercase; font-size: 14px; }
.nav-links a.active { color: #fff; }

.main-content { padding: 60px 0; }
.grid-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 50px; align-items: start; }

/* === ЛІВА КОЛОНКА: ЗАВАНТАЖЕННЯ === */
.upload-area-wrapper { width: 100%; }

/* Стан 1: Немає фото (Квадрат) */
.empty-state-box {
  width: 100%; aspect-ratio: 1; max-height: 500px;
  background-color: #030f03; /* Темний фон */
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  cursor: pointer; transition: opacity 0.3s;
}
.empty-state-box:hover { opacity: 0.95; }
.upload-hint { color: #fff; margin-top: 15px; font-size: 14px; }

/* Стан 2: Є фото (Flex сітка) */
.populated-state { display: flex; flex-direction: column; gap: 20px; }
.photos-flex-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; width: 100%; }

.photo-card {
  position: relative;
  width: calc((100% - 30px) / 3); /* 3 в ряд */
  height: 360px; /* Фіксована висота */
  background: #f4f4f4; border: 1px solid #ddd;
  display: flex; align-items: center; justify-content: center;
}
.uploaded-img { width: 100%; height: 100%; object-fit: cover; }
.delete-btn {
  position: absolute; top: 5px; right: 5px; background: white; border: none;
  width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.photo-number {
  position: absolute; bottom: 5px; left: 10px; font-size: 40px; color: rgba(0,0,0,0.1);
  font-family: 'Playfair Display', serif; pointer-events: none;
}

/* Широка кнопка "Додати ще" */
.wide-add-btn {
  width: 100%; padding: 15px; background: #fff; border: 1px solid #333;
  color: #333; font-family: 'Playfair Display', serif; font-size: 16px;
  cursor: pointer; text-transform: uppercase; transition: all 0.2s;
}
.wide-add-btn:hover:not(:disabled) { background: #f9f9f9; border-color: #000; }
.wide-add-btn:disabled { color: #ccc; border-color: #ccc; cursor: not-allowed; }

/* === ПРАВА КОЛОНКА === */
.info-area { padding-top: 0; }
.main-title { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 20px; }
.description-text { font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 30px; }

/* КНОПКА АНАЛІЗУ */
.analyze-btn {
  width: 100%; background-color: #e0e0e0; color: #999; padding: 16px;
  font-size: 18px; border: none; font-family: 'Playfair Display', serif;
  cursor: not-allowed; transition: all 0.3s; letter-spacing: 1px;
}
.analyze-btn.btn-ready {
  background-color: #333; color: #fff; cursor: pointer;
}
.analyze-btn.btn-ready:hover { background-color: #051805; }

.limit-badge { display: inline-block; padding: 5px 10px; background: #eee; font-size: 12px; margin-bottom: 15px; border-radius: 4px; }
.limit-badge.limit-reached { color: red; background: #ffebeb; }
.error-msg { color: #d32f2f; margin-top: 15px; font-size: 14px; }

/* РЕЗУЛЬТАТ */
.result-content { margin-top: 10px; }
.price-tag { font-weight: 600; color: #051805; margin-bottom: 20px; font-size: 18px; }
.analysis-section h3 { font-family: 'Playfair Display', serif; font-size: 16px; margin-bottom: 8px; color: #333; margin-top: 20px; }
.analysis-section p { font-size: 13px; line-height: 1.6; color: #555; text-align: justify; }
.reset-btn { margin-top: 30px; background: none; border: 1px solid #ccc; padding: 10px 20px; cursor: pointer; text-transform: uppercase; font-size: 12px; }

/* Mobile Adaptability */
@media (max-width: 768px) {
  /* 1. Відступи від країв екрану (10px) */
  .container {
    padding: 0 10px;
  }

  .main-content {
    padding-top: 30px;
  }

  /* 2. Зміна порядку: Текст зверху, Фото знизу */
  .grid-layout {
    display: flex;
    flex-direction: column-reverse;
    gap: 40px;
  }

  /* Центрування тексту */
  .info-area {
    text-align: center;
    padding: 0;
  }

  /* 3. Налаштування Чорного Квадрата (Empty State) */
  .empty-state-box {
    width: 295px;       /* Як просили */
    height: 360px;      /* Як просили */
    margin: 0 auto;     /* Центрування */
    max-width: 100%;    /* Щоб не вилазив на дуже вузьких екранах */
  }

  /* 4. Налаштування Списку фото (Populated State) */
  .photos-flex-container {
    flex-direction: column; /* Фото йдуть одне за одним вниз */
    align-items: center;    /* Центрування стовпчика */
    gap: 20px;              /* Відступ між фотографіями */
  }

  .photo-card {
    width: 295px;  /* Фіксована ширина */
    height: 360px; /* Фіксована висота */
    /* margin вже не треба, бо є gap у батьківського контейнера */
  }

  /* Кнопка "Додати ще" теж має бути такої ж ширини */
  .wide-add-btn {
    width: 295px;
    margin: 0 auto; /* Центруємо кнопку */
    display: block;
  }
}
</style>