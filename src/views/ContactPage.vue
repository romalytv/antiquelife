<template>
  <div class="contact-container">
    <div class="contact-card">

      <div class="info-section">
        <h2 class="section-cursive-title">{{ $t('contact.title') }}</h2>
        <div class="decorative-line-small"></div>
        <p class="subtitle">{{ $t('contact.subtitle') }}</p>

        <div class="info-content">
          <div class="info-item">
            <span class="label">{{ $t('contact.addressLabel') }}</span>
            <p>France, ...</p>
          </div>

          <div class="info-item">
            <span class="label">{{ $t('contact.phoneLabel') }}</span>
            <p>+33 7 45 70 89 19</p>
          </div>

          <div class="info-item">
            <span class="label">{{ $t('contact.emailLabel') }}</span>
            <p>info@antiquelife.com</p>
          </div>

          <div class="info-item">
            <span class="label">{{ $t('contact.hoursLabel') }}</span>
            <p>{{ $t('contact.hoursValue') }}</p>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>{{ $t('contact.formTitle') }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="name">{{ $t('contact.nameLabel') }}</label>
            <input
                type="text"
                id="name"
                v-model="form.name"
                :placeholder="$t('contact.namePlaceholder')"
                required
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                v-model="form.email"
                :placeholder="$t('contact.emailPlaceholder')"
                required
            >
          </div>

          <div class="form-group">
            <label for="message">{{ $t('contact.messageLabel') }}</label>
            <textarea
                id="message"
                v-model="form.message"
                :placeholder="$t('contact.messagePlaceholder')"
                rows="4"
                required
            ></textarea>
          </div>

          <button type="submit" :disabled="isSubmitting" class="btn-main submit-btn">
            {{ isSubmitting ? $t('contact.btnSending') : $t('contact.btnSend') }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n'; // ДОДАНО
import axios from 'axios';
import { useRouter } from 'vue-router'; // Використовуємо хук замість прямого імпорту

const { t } = useI18n(); // ДОДАНО
const router = useRouter(); // ДОДАНО

const form = reactive({
  name: '',
  email: '',
  message: ''
});

const isSubmitting = ref(false);

const submitForm = async () => {
  if (!form.name || !form.email || !form.message) {
    alert(t('contact.alertFill'));
    return;
  }

  isSubmitting.value = true;

  try {
    await axios.post('/api/contact', {
      name: form.name,
      email: form.email,
      message: form.message
    });

    // Використовуємо локалізований шлях, якщо у тебе є $localPath,
    // але оскільки це функція в скрипті, краще передати параметр або використати поточну мову
    // Припускаємо, що роутер налаштований правильно
    await router.push({
      name: 'ContactSuccess',
      query: { name: form.name }
    });

    // Очищаємо форму після успішної відправки (якщо не перекидає на іншу сторінку)
    form.name = '';
    form.email = '';
    form.message = '';

  } catch (error) {
    console.error("Помилка відправки:", error);
    alert(t('contact.alertError'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");

/* Загальний контейнер */
.contact-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: var(--color-bg-main); /* Використовуємо змінну з main.css */
}

.contact-card {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  width: 100%;
  max-width: 1100px; /* Трохи розширив для повітря */
  border: 1px solid #eaeaea;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border-radius: 4px;
}

/* --- ЛІВА ЧАСТИНА (Інфо) --- */
.info-section {
  flex: 1;
  background-color: var(--color-primary-green, #061c0b); /* Зв'язок з main.css */
  color: #fff;
  padding: 60px 50px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
}

.section-cursive-title {
  font-family: var(--font-hand, 'Great Vibes', cursive); /* Зв'язок з main.css */
  font-style: normal;
  font-size: 3.5rem;
  font-weight: 400;
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
  font-weight: 300;
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: 0.05em;
  opacity: 0.9;
  margin-bottom: 50px;
}

.info-content { margin-top: auto; }
.info-item { margin-bottom: 30px; }

.info-item .label {
  display: block;
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif; /* Люксовий шрифт */
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
  letter-spacing: 0.05em;
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
  font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
  color: var(--color-text-dark, #111);
  font-size: 1.8rem;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 400;
}

.form-group { margin-bottom: 25px; }

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: #555;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 15px;
  background: transparent;
  border: 1px solid #dcdcdc; /* Тонша рамка */
  border-radius: 0; /* Строгі кути */
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
  border-color: var(--color-primary-green, #061c0b);
  background-color: #fafafa;
}

/* --- КНОПКА ВІДПРАВКИ --- */
.btn-main {
  width: 100%;
  padding: 18px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  border: none;
  border-radius: 0; /* Строгі кути */
  background: var(--color-primary-green, #061c0b);
  color: white;
  transition: background 0.3s, opacity 0.3s;
  margin-top: 15px;
  font-weight: 500;
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
    padding: 0;
    background: transparent;
  }

  .contact-card {
    flex-direction: column;
    border: none;
    box-shadow: none;
    background: transparent;
    border-radius: 0;
    max-width: none;
  }

  .info-section, .form-section {
    width: 100%;
    min-width: auto;
    padding: 50px 20px;
    box-sizing: border-box;
    border-radius: 0;
  }

  .info-section {
    order: 1;
  }

  .form-section {
    order: 2;
    border: none;
    margin-bottom: 0;
    padding-top: 40px;
  }

  .info-section .section-cursive-title,
  .info-section .subtitle,
  .decorative-line-small {
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  }

  .section-cursive-title { font-size: 2.8rem; }
  .form-section h3 { font-size: 1.4rem; text-align: center; margin-bottom: 30px; }
}
</style>