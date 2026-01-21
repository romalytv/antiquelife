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
      <router-link to="/catalog" class="hero-button">ДО КАТАЛОГУ</router-link>
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
  height: 100vh;
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
  background: rgba(0, 0, 0, 0.4); /* Затемнення відео, щоб текст краще читали */
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-subtitle {
  font-family: "Georgia", serif; /* Або інший шрифт з курсивом */
  font-style: italic;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 300;
}

.hero-title {
  font-family: "Arial", sans-serif;
  font-size: 3.5rem;
  letter-spacing: 0.2rem;
  font-weight: 400;
  margin-bottom: 2rem;
  text-transform: uppercase;
}

.hero-button {
  background-color: white;
  color: black;
  padding: 12px 30px;
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: 1px solid white;
}

.hero-button:hover {
  background-color: transparent;
  color: white;
}

.debug-text {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: #c7f3c7;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Адаптація для мобільних пристроїв */
@media (max-width: 768px) {
  .hero-subtitle {
    font-size: 1.8rem;
  }
  .hero-title {
    font-size: 2rem;
  }
}
</style>
