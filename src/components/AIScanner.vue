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

    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 👇 Приймаємо масив файлів
const props = defineProps({
  files: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['ai-data-loaded']);
const loading = ref(false);
const error = ref('');

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
  error.value = '';

  try {
    // 1. Конвертуємо всі фото в Base64
    const promises = props.files.map(file => fileToBase64(file));
    const base64Images = await Promise.all(promises);

    // 2. Відправляємо масив на сервер
    // (Шлях axios вже налаштований у main.js, тому просто /admin/ai/scan)
    const response = await axios.post('/admin/ai/scan', {
      images: base64Images
    });

    // 3. Парсимо відповідь
    const rawContent = response.data.output?.[0]?.content?.[0]?.text;
    if (!rawContent) throw new Error("Пуста відповідь від AI");

    const cleanJson = rawContent.replace(/```json|```/g, '').trim();
    console.log("AI RAW RESPONSE:", response.data);
    const parsedData = JSON.parse(cleanJson);

    emit('ai-data-loaded', parsedData);

  } catch (err) {
    console.error(err);
    error.value = 'Помилка аналізу. Перевірте консоль.';
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