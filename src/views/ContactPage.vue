<template>
  <div class="contact-container">
    <div class="contact-card">

      <div class="info-section">
        <h2 class="section-cursive-title">Контакти</h2>
        <div class="decorative-line-small"></div>
        <p class="subtitle">Ми завжди раді почути вас. Завітайте до нас або напишіть повідомлення.</p>

        <div class="info-content">
          <div class="info-item">
            <span class="label">Адреса</span>
            <p>France, ...</p>
          </div>

          <div class="info-item">
            <span class="label">Телефон</span>
            <p>+33 7 45 70 89 19</p>
          </div>

          <div class="info-item">
            <span class="label">Email</span>
            <p>info@antiquelife.com</p>
          </div>

          <div class="info-item">
            <span class="label">Графік роботи</span>
            <p>Пн-Пт: 9:00 - 18:00</p>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>Напишіть нам</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">Ваше ім'я</label>
            <input
                type="text"
                id="name"
                v-model="form.name"
                placeholder="ІМ'Я"
                required
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                v-model="form.email"
                placeholder="IVAN@EXAMPLE.COM"
                required
            >
          </div>

          <div class="form-group">
            <label for="message">Повідомлення</label>
            <textarea
                id="message"
                v-model="form.message"
                placeholder="ЧИМ МИ МОЖЕМО ДОПОМОГТИ?"
                rows="4"
                required
            ></textarea>
          </div>

          <button type="submit" :disabled="isSubmitting" class="btn-main submit-btn">
            {{ isSubmitting ? 'ВІДПРАВКА...' : 'НАДІСЛАТИ' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import router from "@/router/index.js";

const form = reactive({
  name: '',
  email: '',
  message: ''
});

const isSubmitting = ref(false);

const submitForm = async () => {
  if (!form.name || !form.email || !form.message) {
    alert("Будь ласка, заповніть всі поля");
    return;
  }

  isSubmitting.value = true;

  try {
    await axios.post('/api/contact', {
      name: form.name,
      email: form.email,
      message: form.message
    });

    await router.push({
      name: 'ContactSuccess',
      query: {name: form.name}
    });

  } catch (error) {
    console.error("Помилка відправки:", error);
    alert("Щось пішло не так. Спробуйте пізніше.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Загальний контейнер */
.contact-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.contact-card {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  width: 100%;
  max-width: 1000px;
  border: 1px solid #eaeaea;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border-radius: 4px; /* Легке заокруглення на десктопі */
}

/* --- ЛІВА ЧАСТИНА (Інфо) --- */
.info-section {
  flex: 1;
  background-color: #061c0b; /* Темно-зелений */
  color: #fff;
  padding: 60px 50px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.section-cursive-title {
  font-family: 'Snell Roundhand', 'Bickham Script Pro', 'Brush Script MT', 'Great Vibes', cursive, serif;
  font-style: italic;
  font-size: 3rem;
  font-weight: normal;
  color: #fff;
  margin-top: 0;
  margin-bottom: 20px;
}

.decorative-line-small {
  width: 50px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.3);
  margin-bottom: 30px;
}

.subtitle {
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.09em;
  opacity: 0.8;
  margin-bottom: 50px;
}

.info-content { margin-top: auto; }
.info-item { margin-bottom: 30px; }

.info-item .label {
  display: block;
  font-family: 'Georgia', serif;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #9ea8a0;
  margin-bottom: 8px;
}

.info-item p {
  margin: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.09em;
  color: #fff;
}

/* --- ПРАВА ЧАСТИНА (Форма) --- */
.form-section {
  flex: 1.5;
  padding: 60px 50px;
  min-width: 300px;
  background-color: #fff;
}

.form-section h3 {
  margin-top: 0;
  font-family: 'Georgia', serif;
  color: #111;
  font-size: 1.6rem;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: normal;
}

.form-group { margin-bottom: 25px; }

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #333;
  font-family: 'Georgia', serif;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 15px;
  background: transparent;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  letter-spacing: 0.05em;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #aaa;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #061c0b;
  background-color: #fdfdfd;
}

/* --- КНОПКА ВІДПРАВКИ --- */
.btn-main {
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  font-family: 'Georgia', serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background: #061c0b;
  color: white;
  transition: background 0.3s, opacity 0.3s;
  margin-top: 15px;
}

.btn-main:hover:not(:disabled) {
  background: #0a2e12;
}
.btn-main:disabled {
  background: #bdc3c7;
  color: #fff;
  cursor: not-allowed;
}

/* --- МОБІЛЬНА АДАПТАЦІЯ --- */
@media (max-width: 850px) {
  .contact-container {
    /* Зменшуємо відступи контейнера, щоб секції були ширші */
    padding: 0;
    background: transparent; /* Прибираємо фон контейнера, щоб бачити фон сторінки */
  }

  .contact-card {
    flex-direction: column;
    /* Прибираємо стилі картки */
    border: none;
    box-shadow: none;
    background: transparent;
    border-radius: 0;
    max-width: none;
  }

  .info-section, .form-section {
    width: 100%;
    min-width: auto;
    padding: 50px 20px; /* Стандартні відступи для моб */
    box-sizing: border-box;
    border-radius: 0; /* Ніяких заокруглень */
  }

  /* --- КОНТАКТИ ЙДУТЬ ПЕРШИМИ --- */
  .info-section {
    order: 1;
    /* Залишаємо темний фон, щоб він виглядав як секція на всю ширину */
  }

  /* --- ФОРМА ЙДЕ ДРУГОЮ --- */
  .form-section {
    order: 2;
    border: none;
    margin-bottom: 0;
    padding-top: 40px;
  }

  /* На темному фоні центруємо заголовки */
  .info-section .section-cursive-title,
  .info-section .subtitle,
  .decorative-line-small {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  .section-cursive-title { font-size: 2.5rem; }
  .form-section h3 { font-size: 1.4rem; text-align: center; margin-bottom: 30px; }
}
</style>