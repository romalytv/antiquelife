<template>
  <section class="telegram-banner">
    <div class="banner-bg">
      <img src="@/assets/telegram-thumbnail.png" alt="French Market" />
      <div class="banner-overlay"></div>
    </div>

    <div class="banner-content">
      <h2 class="desktop-title">{{ $t('telegram.desktopTitle') }}</h2>

      <div class="mobile-title-wrapper">
        <h2 class="mobile-title">{{ $t('telegram.mobileTitle') }}</h2>
      </div>

      <a href="https://t.me/franceantique" target="_blank" class="btn-telegram">
        {{ $t('telegram.button') }}
      </a>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: 'TelegramBanner' });
</script>

<style scoped>
.telegram-banner {
  position: relative;
  width: 100%;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0px 0px;
}

.banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.banner-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55); /* Темний оверлей як на рефі */
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
}

/* --- СТИЛІ ДЕСКТОПА (Скрін 1) --- */
.desktop-title {
  display: block;
  font-family: 'Montserrat', sans-serif;
  font-size: 2.2rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: 4px; /* Великий міжлітерний інтервал як на рефі */
  line-height: 1.4;
  margin-bottom: 30px;
  text-transform: uppercase;
}

.mobile-title-wrapper {
  display: none; /* Ховаємо мобільний заголовок на десктопі */
}

/* Кнопка (Скрін 1 і 2) */
.btn-telegram {
  display: inline-block;
  background-color: #ffffff;
  color: #1a1a1a;
  padding: 12px 45px;
  font-family: var(--font-hand, 'Great Vibes', cursive); /* Курсив на кнопці як на рефі */
  font-size: 1.8rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid #fff;
}

.btn-telegram:hover {
  background-color: transparent;
  color: #fff;
}

/* --- СТИЛІ МОБІЛКИ (Скрін 2) --- */
@media (max-width: 768px) {
  .telegram-banner {
    height: 400px;
  }

  .desktop-title {
    display: none; /* Ховаємо десктопний заголовок */
  }

  .mobile-title-wrapper {
    display: inline-block;
    border: 1px dotted rgba(255, 255, 255, 0.6); /* Точкова рамка як на скріні */
    padding: 20px 40px;
    margin-bottom: 25px;
  }

  .mobile-title {
    display: block;
    font-family: var(--font-hand, 'Great Vibes', cursive);
    font-size: 3.5rem; /* Великий курсив */
    color: #fff;
    font-weight: 400;
    margin: 0;
  }

  .btn-telegram {
    padding: 10px 40px;
    font-size: 1.5rem;
  }
}
</style>