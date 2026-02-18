<template>
  <div class="ai-scanner">
    <button
        v-if="files && files.length > 0"
        @click="analyzeImage"
        class="ai-btn"
        :disabled="loading"
        type="button"
    >
      <span v-if="loading">🤖 Аналізую {{ files.length }} фото...</span>
      <span v-else>✨ Розпізнати {{ files.length }} фото через AI</span>
    </button>

    <div v-if="humanError" class="error-alert">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <strong>Упс! Не вдалося розпізнати:</strong>
        <p>{{ humanError }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  files: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['ai-data-loaded', 'ai-error']);

const loading = ref(false);
const humanError = ref(''); // Тут буде текст для користувача

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const analyzeImage = async () => {
  if (!props.files || props.files.length === 0) return;

  loading.value = true;
  humanError.value = ''; // Очищаємо попередні помилки

  try {
    const promises = props.files.map(file => fileToBase64(file));
    const base64Images = await Promise.all(promises);

    const response = await axios.post('/admin/ai/scan', {
      images: base64Images
    });

    // Отримуємо сирий текст
    const rawContent = response.data.output?.[0]?.content?.[0]?.text || response.data;

    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error("EMPTY_RESPONSE");
    }

    console.log("🤖 Сира відповідь від ШІ:", rawContent); // Залишив для дебагу, щоб ти бачив, що він там пише

    // МАГІЯ ТУТ: Шукаємо суто JSON від першої { до останньої }
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("JSON_PARSE_ERROR"); // Якщо взагалі немає фігурних дужок
    }

    const cleanJson = jsonMatch[0]; // Беремо тільки те, що схоже на об'єкт

    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("❌ Помилка парсингу. Вирізаний JSON виглядає так:", cleanJson);
      throw new Error("JSON_PARSE_ERROR");
    }

    emit('ai-data-loaded', parsedData);

  } catch (err) {
    console.error("AI Error:", err);

    // --- ГОЛОВНА ЛОГІКА РОЗШИФРОВКИ ПОМИЛОК ---
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      switch (status) {
        case 429:
          humanError.value = "⏳ Забагато запитів. Ліміт AI вичерпано. Будь ласка, зачекайте хвилину і спробуйте знову.";
          break;
        case 413:
          humanError.value = "🐘 Фотографії занадто важкі. Спробуйте завантажити менше фото або зменшити їх розмір.";
          break;
        case 500:
        case 502:
        case 503:
          humanError.value = "🔥 Сервер AI зараз перевантажений або не відповідає. Спробуйте ще раз пізніше.";
          break;
        case 401:
        case 403:
          humanError.value = "🔑 Проблема з доступом (API Key). Скажіть розробнику, що ключ не працює.";
          break;
        default:
          humanError.value = `❌ Невідома помилка сервера (Код: ${status}).`;
      }
    } else if (err.code === "ERR_NETWORK") {
      humanError.value = "📡 Немає зв'язку з інтернетом. Перевірте з'єднання.";
    } else if (err.message === "JSON_PARSE_ERROR") {
      humanError.value = "🥴 AI відповів щось незрозуміле. Спробуйте ще раз (іноді він помиляється у форматі).";
    } else if (err.message === "EMPTY_RESPONSE") {
      humanError.value = "📭 AI нічого не відповів. Можливо, фото поганої якості?";
    } else {
      humanError.value = "Щось пішло не так: " + err.message;
    }

    emit('ai-error', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.ai-btn {
  margin-top: 10px;
  width: 100%;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.ai-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(168, 85, 247, 0.5);
}
.ai-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
  text-align: center;
}
</style>