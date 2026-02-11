<template>
  <section class="hero">
    <div class="video-container">
      <video autoplay muted loop playsinline class="hero-video">
        <source src="@/assets/videos/hero-bg.mp4" type="video/mp4" />
      </video>
      <div class="overlay"></div>
    </div>

    <div class="hero-content">
      <p class="hero-subtitle">Відкрийте для себе</p>
      <h1 class="hero-title">СВІТ АНТИКВАРІАТУ</h1>
      <router-link to="/market" class="hero-button">до КАТАЛОГУ</router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  mounted() {
    // видимий log для перевірки, що компонент завантажився
    // відкрийте консоль браузера коли сторінка завантажена
    // щоб переконатись, що компонент працює
    // (корисно при налагодженні підключення компонентів)
    // eslint-disable-next-line no-console
    console.log("HeroSection mounted");
  },
};
</script>

<style scoped>
.hero {
  position: relative;
  /* Використовуємо dvh для мобільних браузерів (Safari), щоб панель адреси не стрибала */
  height: 100vh;
  height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
}

.video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  /* Додаємо паддінг, щоб на малих екранах текст не лип до країв */
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}

.hero-subtitle {
  font-family: "Snell Roundhand", "SnellRoundhand", "Great Vibes", cursive;
  /* Використовуємо clamp для плавного зменшення шрифту, база 7.79rem */
  font-size: clamp(3rem, 8vw, 7.79rem);
  font-weight: 300;
  line-height: 1.2;
  color: #ffffff;

  /* Логіка ширини для десктопу */
  width: 100%;
  max-width: 825px; /* Обмежуємо ширину, але не фіксуємо її */

  text-align: justify;
  text-align-last: justify;
  margin: 0 auto;
  white-space: nowrap; /* На десктопі в один рядок */
}

.hero-title {
  font-family: "Palatino Linotype", "Palatino", "Book Antiqua", "Georgia", serif;
  /* Те саме - адаптивний шрифт */
  font-size: clamp(1.8rem, 5vw, 4.215rem);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.09em;
  color: #ffffff;
  text-transform: uppercase;

  /* Логіка ширини */
  width: 100%;
  max-width: 825px;

  text-align: justify;
  text-align-last: justify;
  margin: 0 auto;
  white-space: nowrap;
}

.hero-button {
  background-color: white;
  color: black;
  padding: 12px 30px;
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: none;
  border-radius: 4px;
  margin-top: 20px;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-block;
}

.hero-button:hover {
  background-color: rgba(255, 255, 255, 0.8);
  color: black;
}

/* --- МОБІЛЬНА ВЕРСІЯ --- */
@media (max-width: 768px) {
  .hero-content {
    gap: 10px;
  }

  .hero-subtitle {
    /* Скидаємо вирівнювання по ширині, на телефоні це виглядає погано */
    text-align: center;
    text-align-last: center;

    /* Дозволяємо перенос слів */
    white-space: normal;

    /* Розмір шрифту для мобільного */
    font-size: 50px;
    line-height: 1.1;
    width: auto;
    max-width: 100%;
  }

  .hero-title {
    text-align: center;
    text-align-last: center;

    /* ВАЖЛИВО: дозволяємо перенос, якщо слово не влазить */
    white-space: normal;
    word-wrap: break-word;

    font-size: 28px; /* Твій розмір */
    line-height: 1.3;
    width: auto;
    max-width: 100%;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
  }

  .hero-button {
    font-size: 16px;
    padding: 14px 40px;
  }
}

/* Для дуже маленьких екранів (iPhone SE, старі моделі) */
@media (max-width: 380px) {
  .hero-subtitle {
    font-size: 40px;
  }
  .hero-title {
    font-size: 24px;
  }
}
</style>
