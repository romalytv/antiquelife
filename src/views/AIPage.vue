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
            <p class="upload-hint">{{ $t('expertise.addPhoto') }}</p>
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
              <span v-if="galleryItems.length < 5">{{ $t('expertise.addMore') }} ({{ galleryItems.length }}/5)</span>
              <span v-else>{{ $t('expertise.maxPhotos') }}</span>
            </button>
          </div>
        </div>

        <div class="info-area">

          <div v-if="!resultData">
            <h1 class="main-title">{{ $t('expertise.title') }}</h1>

            <div class="limit-badge" :class="{ 'limit-reached': attempts >= 3 }">
              <span v-if="attempts < 3">{{ $t('expertise.attemptsLeft') }}: {{ 3 - attempts }}</span>
              <span v-else>{{ $t('expertise.limitReached') }}</span>
            </div>

            <p class="description-text">{{ $t('expertise.desc') }}</p>

            <button
                class="analyze-btn"
                @click="analyzeImage"
                :disabled="isLoading || galleryItems.length === 0 || attempts >= 3"
                :class="{ 'btn-ready': galleryItems.length > 0 && !isLoading && attempts < 3 }"
            >
              <span v-if="isLoading">{{ $t('expertise.analyzing') }}</span>
              <span v-else-if="galleryItems.length === 0">{{ $t('expertise.needPhoto') }}</span>
              <span v-else>{{ $t('expertise.run') }}</span>
            </button>

            <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          </div>

          <div v-else class="result-content fade-in">
            <h2 class="item-name">{{ getLocalizedText(resultData.item_name) }}</h2>

            <div class="price-tag">
              {{ $t('expertise.estimatedPrice') }}: {{ resultData.estimated_price_range }}
            </div>

            <div class="analysis-section" v-if="getLocalizedText(resultData.general_description)">
              <h3>{{ $t('expertise.generalDesc') || 'Загальний опис' }}</h3>
              <p>{{ getLocalizedText(resultData.general_description) }}</p>
            </div>

            <div class="analysis-section" v-if="getLocalizedText(resultData.decor)">
              <h3>{{ $t('expertise.decor') || 'Декор' }}</h3>
              <p>{{ getLocalizedText(resultData.decor) }}</p>
            </div>

            <div class="analysis-section" v-if="getLocalizedText(resultData.style_and_form)">
              <h3>{{ $t('expertise.styleAndForm') || 'Стилістика та форма' }}</h3>
              <p>{{ getLocalizedText(resultData.style_and_form) }}</p>
            </div>

            <button class="reset-btn" @click="reset">{{ $t('expertise.analyzeAnother') }}</button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n'; // ДОДАНО
import axios from 'axios';

// Константи для LocalStorage
const LS_KEY_COUNT = 'ai_scan_count';
const LS_KEY_EXPIRY = 'ai_scan_expiry';

const fileInput = ref(null);
const galleryItems = ref([]);
const resultData = ref(null);
const isLoading = ref(false);
const errorMsg = ref('');
const attempts = ref(0);

const { t, locale } = useI18n(); // ДОДАНО

// --- Хелпер для виводу перекладів ШІ ---
const getLocalizedText = (localizedObj) => {
  if (!localizedObj) return '';
  if (typeof localizedObj === 'string') return localizedObj;
  return localizedObj[locale.value] || localizedObj['en'] || localizedObj['uk'] || '';
};

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

const triggerUpload = () => fileInput.value.click();

const handleFileSelect = (event) => {
  const newFiles = Array.from(event.target.files);
  if (!newFiles.length) return;

  if (galleryItems.value.length + newFiles.length > 5) {
    alert(t('expertise.maxPhotos'));
    return;
  }

  newFiles.forEach(file => {
    galleryItems.value.push({ file: file, url: URL.createObjectURL(file) });
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

// --- Основна логіка запиту до AI (ІДЕНТИЧНА АДМІНЦІ) ---
const analyzeImage = async () => {
  if (galleryItems.value.length === 0) return;
  if (attempts.value >= 3) { errorMsg.value = t('expertise.limitReached'); return; }

  isLoading.value = true;
  errorMsg.value = '';

  try {
    const promises = galleryItems.value.map(item => fileToBase64(item.file));
    const base64Images = await Promise.all(promises);

    // Зверни увагу: переконайся, що цей ендпоінт правильний!
    // Якщо ти використовуєш той самий, що в адмінці, можливо це '/admin/ai/scan' або '/api/public/ai/scan'
    const response = await axios.post('/api/public/ai/analyze', {
      images: base64Images
    });

    // Витягуємо сирий текст
    const rawContent = response.data.output?.[0]?.content?.[0]?.text || response.data?.choices?.[0]?.message?.content || response.data;

    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error("EMPTY_RESPONSE");
    }

    console.log("🤖 Сира відповідь від ШІ:", rawContent);

    // МАГІЯ АДМІНКИ: Шукаємо суто JSON
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("JSON_PARSE_ERROR");
    }

    const cleanJson = jsonMatch[0];

    try {
      resultData.value = JSON.parse(cleanJson);
    } catch (e) {
      console.error("❌ Помилка парсингу:", cleanJson);
      throw new Error("JSON_PARSE_ERROR");
    }

    incrementAttempts();

  } catch (err) {
    console.error("AI Error:", err);

    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      switch (status) {
        case 429: errorMsg.value = "⏳ Забагато запитів. Ліміт AI вичерпано."; attempts.value = 3; break;
        case 413: errorMsg.value = "🐘 Фотографії занадто важкі. Зменшіть їх розмір."; break;
        default: errorMsg.value = `❌ Помилка сервера (${status}).`;
      }
    } else if (err.message === "JSON_PARSE_ERROR") {
      errorMsg.value = "🥴 AI відповів щось незрозуміле. Спробуйте ще раз.";
    } else if (err.message === "EMPTY_RESPONSE") {
      errorMsg.value = "📭 AI нічого не відповів.";
    } else {
      errorMsg.value = "Щось пішло не так: " + err.message;
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
/* Стилі залишаються незмінними, лише додано стиль для specs-list */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Montserrat:wght@300;400;500&display=swap');

@font-face {
  font-family: 'Palatino Linotype';
  src: url('@/assets/fonts/PalatinoLinotype/palatinolinotype_roman.ttf') format('woff2'),
  url('@/assets/fonts/PalatinoLinotype/palatinolinotype_roman.ttf') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.expertise-page { font-family: 'Montserrat', sans-serif; background: #fff; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.main-content { padding: 60px 0; }
.grid-layout { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 50px; align-items: start; }

.upload-area-wrapper { width: 100%; }

.empty-state-box {
  width: 100%; aspect-ratio: 1; max-height: 500px;
  background-color: #030f03;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  cursor: pointer; transition: opacity 0.3s;
}
.empty-state-box:hover { opacity: 0.95; }
.upload-hint { color: #fff; margin-top: 15px; font-size: 14px; }

.populated-state { display: flex; flex-direction: column; gap: 20px; margin-bottom: 15px}
.photos-flex-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; width: 100%; }

.photo-card {
  position: relative; width: calc((100% - 30px) / 3); height: 360px;
  background: #f4f4f4; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center;
}
.uploaded-img { width: 100%; height: 100%; object-fit: cover; }
.delete-btn {
  position: absolute; top: 5px; right: 5px; background: white; border: none;
  width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.photo-number {
  position: absolute; bottom: 5px; left: 10px; font-size: 40px; color: rgba(0,0,0,0.1);
  font-family: 'Palatino Linotype', serif; pointer-events: none;
}

.wide-add-btn {
  width: 100%; padding: 15px; background: #fff; border: 1px solid #333;
  color: #333; font-family: 'Palatino Linotype', serif; font-size: 16px;
  cursor: pointer; text-transform: uppercase; transition: all 0.2s;
}
.wide-add-btn:hover:not(:disabled) { background: #f9f9f9; border-color: #000; }
.wide-add-btn:disabled { color: #ccc; border-color: #ccc; cursor: not-allowed; }

.info-area { padding-top: 0; }
.main-title { font-family: 'Palatino Linotype', serif; font-size: 20px; }
.description-text { font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 30px; }

.analyze-btn {
  width: 100%; background-color: #e0e0e0; color: #999; padding: 16px;
  font-size: 18px; border: none; font-family: 'Palatino Linotype', serif;
  cursor: not-allowed; transition: all 0.3s; letter-spacing: 1px;
}
.analyze-btn.btn-ready { background-color: #333; color: #fff; cursor: pointer; }
.analyze-btn.btn-ready:hover { background-color: #051805; }

.limit-badge { display: inline-block; padding: 5px 10px; background: #eee; font-size: 12px; margin-bottom: 10px; border-radius: 4px; }
.limit-badge.limit-reached { color: red; background: #ffebeb; }
.error-msg { color: #d32f2f; margin-top: 15px; font-size: 14px; }

.result-content { margin-top: 10px; }
.item-name { font-family: 'Palatino Linotype', serif; font-size: 24px; margin-bottom: 10px; }
.price-tag { font-family: 'Montserrat'; font-weight: 500; color: #051805; margin-bottom: 20px; font-size: 18px; }
.analysis-section h3 { font-family: 'Playfair Display', serif; font-size: 16px; margin-bottom: 8px; color: #333; margin-top: 20px; }
.analysis-section p { font-size: 13px; line-height: 1.6; color: #555; text-align: justify; }
.specs-list p { margin-bottom: 5px; }
.specs-list strong { font-weight: 600; color: #222; }

.reset-btn { margin-top: 30px; background: none; border: 1px solid #ccc; padding: 10px 20px; cursor: pointer; text-transform: uppercase; font-size: 12px; }

@media (max-width: 768px) {
  .container { padding: 0 10px; }
  .main-content { padding-top: 30px; }
  .grid-layout { display: flex; flex-direction: column-reverse; gap: 40px; }
  .info-area { text-align: left; padding: 0; }
  .empty-state-box { width: 295px; height: 360px; margin: 0 auto; max-width: 100%; }
  .photos-flex-container { flex-direction: column; align-items: center; gap: 20px; }
  .photo-card { width: 295px; height: 360px; }
  .wide-add-btn { width: 295px; margin: 0 auto; display: block; }
}
</style>