<template>
  <div class="ai-scanner">
    <button
        v-if="file"
        @click="analyzeImage"
        class="ai-btn"
        :disabled="loading"
        type="button"
    >
      <span v-if="loading">🤖 Аналізую фото...</span>
      <span v-else>✨ Заповнити через AI</span>
    </button>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  file: { type: File, required: true }
});

const emit = defineEmits(['ai-data-loaded']);
const loading = ref(false);
const error = ref('');

// Тепер нам не треба ключ на фронті!
// const OPENAI_API_KEY = ... (видалити)
// Адреса вашого бекенду
const API_URL = import.meta.env.VITE_API_URL;

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const analyzeImage = async () => {
  loading.value = true;
  error.value = '';

  try {
    const base64Image = await fileToBase64(props.file);

    // 1. Запит на Java
    const response = await axios.post(`${API_URL}/admin/ai/scan`, {
      imageBase64: base64Image
    });

    // 2. ПРАВИЛЬНИЙ ПАРСИНГ
    // OpenAI повертає дані тут: choices -> [0] -> message -> content
    const rawContent = response.data.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error("Повна відповідь:", response.data);
      throw new Error("Отримано пусту відповідь від AI");
    }

    // Чистимо від markdown, якщо він є
    const cleanJson = rawContent.replace(/```json|```/g, '').trim();

    const parsedData = JSON.parse(cleanJson);
    emit('ai-data-loaded', parsedData);

  } catch (err) {
    console.error(err);
    error.value = 'Помилка аналізу. Перевірте консоль (F12).';
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
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);
}
.ai-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(168, 85, 247, 0.4);
}
.ai-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error-msg {
  color: red;
  font-size: 12px;
  margin-top: 5px;
  text-align: center;
}
</style>