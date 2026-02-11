<template>
  <div class="contact-widget">

    <Transition name="fade">
      <div v-if="isOpen" class="popup-wrapper">
        <div class="popup-header">
          <span class="popup-title">Ми на зв'язку</span>
          <button class="close-btn" @click="closePopup">&times;</button>
        </div>

        <div class="links-list">
          <a href="https://wa.me/380991234567" target="_blank" class="contact-link whatsapp">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </div>
            <span>WhatsApp</span>
          </a>

          <a href="https://t.me/ваш_юзернейм" target="_blank" class="contact-link telegram">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 23.5l-5.3-2.8 5.7-18.3L1.1 12.3l7.9 2.6 2.4 8.1 3.5-3.6 4.6 3.7zM7.2 13.9l12.4-7.9-9.9 8.6-1.5 5-1-4.7z"/></svg>
            </div>
            <span>Telegram</span>
          </a>

          <a href="https://instagram.com/ваш_юзернейм" target="_blank" class="contact-link instagram">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </div>
            <span>Instagram</span>
          </a>

          <div class="divider"></div>

          <a href="tel:+380991234567" class="contact-link phone">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div class="text-group">
              <span class="label">Зателефонувати</span>
              <span class="value">+38 (099) 123-45-67</span>
            </div>
          </a>

          <a href="mailto:info@antiquelife.com" class="contact-link email">
            <div class="icon-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <div class="text-group">
              <span class="label">Написати на пошту</span>
              <span class="value">info@antiquelife.com</span>
            </div>
          </a>
        </div>
      </div>
    </Transition>

    <Transition name="fade-tooltip">
      <div v-if="showTooltip && !isOpen" class="tooltip-bubble" @click="togglePopup">
        зв'яжіться з нами
      </div>
    </Transition>

    <button class="floating-btn" @click="togglePopup" :class="{ 'is-active': isOpen }">
      <div class="icon-circle">
        <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <span v-else class="close-icon">&times;</span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isOpen = ref(false);
const showTooltip = ref(false);

const togglePopup = () => {
  isOpen.value = !isOpen.value;
  // Якщо клікнули, тултіп теж ховаємо назавжди
  if (showTooltip.value) {
    showTooltip.value = false;
  }
};

const closePopup = () => {
  isOpen.value = false;
};

onMounted(() => {
  // Логіка появи напису:
  // 1. Чекаємо 5 секунд після завантаження
  setTimeout(() => {
    // Показуємо тултіп, якщо меню ще не відкрито
    if (!isOpen.value) {
      showTooltip.value = true;

      // 2. Тримаємо 10 секунд
      setTimeout(() => {
        showTooltip.value = false;
      }, 10000);
    }
  }, 500);
});
</script>

<style scoped>
:root {
  --primary-dark: #0f1f15;
  --accent-gold: #c5a059;
}

/* --- ЗАГАЛЬНИЙ КОНТЕЙНЕР --- */
.contact-widget {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 2000;
  font-family: 'Playfair Display', serif;
  display: flex;
  align-items: center; /* Вирівнює кнопку і напис по одній лінії */
  justify-content: flex-end;
  gap: 12px; /* Відстань між написом і кнопкою */
}

/* --- ТУЛТІП (НАПИС) --- */
.tooltip-bubble {
  background-color: #000;
  color: #fff;
  border-radius: 8px;
  font-family: sans-serif;
  position: relative;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;

  /* ЦЕНТРУВАННЯ ТЕКСТУ ВСЕРЕДИНІ */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Дефолт для ПК (авторозмір) */
  padding: 8px 16px;
  height: auto;
  font-size: 14px;
}

/* Стрілочка тултіпа */
.tooltip-bubble::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -6px; /* Висуваємо стрілку в бік кнопки */
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-style: solid;
  border-color: transparent transparent transparent #000;
}

/* --- ПЛАВАЮЧА КНОПКА --- */
.floating-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Щоб кнопка не стискалась */
}

.icon-circle {
  /* Розміри для ПК */
  width: 60px;
  height: 60px;

  background-color: #030e05;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.floating-btn:hover .icon-circle {
  transform: scale(1.1);
  border-color: #fff;
}

.floating-btn.is-active .icon-circle {
  background-color: #333;
  transform: rotate(90deg);
}

.close-icon {
  font-size: 32px;
  line-height: 1;
}

/* --- ПОПАП (МЕНЮ КОНТАКТІВ) --- */
.popup-wrapper {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 300px;
  max-width: 85vw;
  background-color: rgba(15, 31, 21, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(197, 160, 89, 0.3);
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
  z-index: 2001;
}

.popup-header {
  padding: 16px 20px;
  background-color: rgba(0,0,0,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.popup-title {
  font-size: 18px;
  color: #c5a059;
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 24px;
  cursor: pointer;
}

.links-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 5px 10px;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  text-decoration: none;
  color: #fff;
  border-radius: 8px;
  transition: background 0.2s ease;
  font-family: sans-serif;
}

.contact-link:hover {
  background-color: rgba(255,255,255,0.08);
}

.icon-box {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.contact-link:hover .icon-box {
  background: #c5a059;
  color: #000;
}

.text-group {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.value {
  font-size: 14px;
  font-weight: 500;
}

/* --- АНІМАЦІЇ --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.fade-tooltip-enter-active,
.fade-tooltip-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-tooltip-enter-from,
.fade-tooltip-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* =========================================
   МЕДІА-ЗАПИТИ ДЛЯ МОБІЛЬНИХ (до 768px)
   ========================================= */
@media (max-width: 768px) {

  .contact-widget {
    bottom: 20px;
    right: 20px;
    /* Важливо: gap контролює відступ між написом і кнопкою */
    gap: 10px;
  }

  /* 1. КНОПКА 40х40 */
  .icon-circle {
    width: 40px;
    height: 40px;
  }

  .icon-circle svg {
    width: 20px;
    height: 20px;
  }

  .close-icon {
    font-size: 22px;
  }

  /* 2. ТУЛТІП 170х40 */
  .tooltip-bubble {
    /* Жорсткі розміри */
    width: 150px;
    height: 40px;

    /* Прибираємо паддінги, бо вони ламають фіксовану ширину */
    padding: 0;

    /* Розмір шрифту, щоб влізло */
    font-size: 13px;

    /* Гарантуємо центрування тексту */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Посуваємо попап, щоб він не перекривав кнопку знизу */
  .popup-wrapper {
    bottom: 70px;
    right: 20px;
  }
}
</style>