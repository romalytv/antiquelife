<template>
  <div class="construction-wrapper">
    <div class="content">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="construction-icon">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M12 18v-6"></path>
          <path d="M8 15h8"></path>
          <path d="M16 12l-2-2"></path>
          <path d="M8 12l2-2"></path>
        </svg>
      </div>

      <h1>Ця сторінка в розробці</h1>
      <p>Ми старанно працюємо над цим функціоналом.<br>Скоро тут з'явиться щось круте!</p>

      <button @click="goBack" class="back-btn">
        ⬅️ Повернутися назад
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  // Якщо є історія переходів - йдемо назад, якщо ні - на головну сторінку адмінки
  if (window.history.length > 1) {
    router.back();
  } else {
    // Тут можеш змінити на свій дефолтний таб, наприклад currentTab = 'products'
    // Але оскільки це окремий компонент, краще просто нічого не робити або емітити подію
    console.log("Go back clicked");
  }
};
</script>

<style scoped>
.construction-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh; /* Центруємо по вертикалі */
  padding: 20px;
  text-align: center;
  font-family: 'Inter', sans-serif;
}

.content {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 100%;
  border: 1px solid #f3f4f6;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: #fef3c7; /* Світло-жовтий */
  border-radius: 50%;
  margin-bottom: 25px;
}

.construction-icon {
  width: 40px;
  height: 40px;
  color: #d97706; /* Темно-жовтий */
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 10px 0;
}

p {
  color: #6b7280;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.back-btn {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background-color: #374151;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.back-btn:active {
  transform: translateY(0);
}

/* Мобільна адаптація */
@media (max-width: 600px) {
  .content {
    padding: 25px;
  }

  h1 {
    font-size: 20px;
  }

  p {
    font-size: 14px;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>