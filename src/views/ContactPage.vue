<template>
  <div class="contact-container">
    <div class="contact-card">

      <div class="info-section">
        <h2>Контакти</h2>
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

          <button type="submit" :disabled="isSubmitting" class="submit-btn">
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

    // 3. Замість alert робимо редірект
    // Передаємо ім'я користувача в параметрах, щоб красиво привітати на новій сторінці
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
  background-color: var(--color-bg-light);
  padding: 40px 20px;
  font-family: var(--font-sans);
}

.contact-card {
  display: flex;
  flex-wrap: wrap;
  background: white;
  width: 100%;
  max-width: 1000px;
  border: 1px solid #e0dcd3;
  box-shadow: 0 10px 40px rgba(74, 63, 53, 0.1);
  overflow: hidden; /* Щоб нічого не вилазило */
}

/* --- ЛІВА ЧАСТИНА (Інфо) --- */
.info-section {
  flex: 1;
  background-color: var(--color-bg-dark);
  color: #fff;
  padding: 50px;
  /* Прибираємо жорсткий min-width, щоб не ламало мобілку */
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.info-section h2 {
  margin-top: 0;
  font-family: var(--font-serif);
  font-size: 2.2rem;
  color: var(--color-highlight);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.decorative-line-small {
  width: 40px;
  height: 2px;
  background-color: var(--color-highlight);
  margin-bottom: 30px;
}

.subtitle {
  opacity: 0.9;
  margin-bottom: 40px;
  font-weight: 300;
  line-height: 1.6;
  font-size: 1.05rem;
}

.info-content { margin-top: auto; }
.info-item { margin-bottom: 30px; }

.info-item .label {
  display: block;
  font-family: var(--font-serif);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--color-highlight);
  margin-bottom: 8px;
}

.info-item p { margin: 0; font-size: 1.1rem; font-weight: 300; letter-spacing: 0.5px; }

/* --- ПРАВА ЧАСТИНА (Форма) --- */
.form-section {
  flex: 1.5;
  padding: 50px;
  min-width: 300px;
  background-color: #fff;
}

.form-section h3 {
  margin-top: 0;
  font-family: var(--font-serif);
  color: var(--color-text-dark);
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group { margin-bottom: 25px; }

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: var(--color-text-dark);
  font-family: var(--font-serif);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 15px;
  background: transparent;
  border: 1px solid #dcdcdc;
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--color-text-dark);
  transition: all 0.3s ease;
  box-sizing: border-box; /* Важливо для відступів */
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #aaa; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none; border-color: var(--color-highlight); background-color: #fdfaf3;
}

.submit-btn {
  display: inline-block;
  padding: 15px 40px;
  border: 1px solid var(--color-text-dark);
  color: var(--color-text-dark);
  background: transparent;
  font-family: var(--font-serif);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: auto; /* На пк кнопка по розміру тексту */
  margin-top: 10px;
}

.submit-btn:hover { background-color: var(--color-text-dark); color: #fff; }
.submit-btn:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; background: transparent; }

/* --- МОБІЛЬНА АДАПТАЦІЯ --- */
@media (max-width: 850px) {
  .contact-container {
    padding: 10px; /* Менші відступи від країв екрану */
  }

  .contact-card {
    flex-direction: column;
    box-shadow: none; /* Можна прибрати тінь на мобілці для чистоти */
  }

  .info-section, .form-section {
    width: 100%;
    min-width: auto; /* Дозволяємо стискатися */
    padding: 30px 20px; /* Зменшуємо внутрішні відступи */
    box-sizing: border-box;
  }

  .info-section { order: 2; }
  .form-section { order: 1; }

  /* Робимо заголовок трохи меншим, щоб не переносився криво */
  .form-section h3 {
    font-size: 1.5rem;
  }

  /* Кнопка на всю ширину */
  .submit-btn {
    width: 100%;
    text-align: center;
  }
}
</style>