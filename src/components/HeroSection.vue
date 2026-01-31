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
      <router-link to="/catalog" class="hero-button">до КАТАЛОГУ</router-link>
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
  gap: 14px;
}

.hero-subtitle {
  font-family: "Snell Roundhand", "SnellRoundhand", "Great Vibes", cursive;
  font-size: 7.79rem;
  font-weight: 300;
  line-height: 120%;
  letter-spacing: normal;
  color: #FFFFFF;
  text-align: justify;
  text-align-last: justify;
  width: 825px; 
  margin: 0 auto;
  white-space: nowrap;
}

.hero-title {
  font-family: "Palatino Linotype", "Palatino", "Book Antiqua", "Georgia", serif;
  font-size: 4.215rem;
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 0.09em;
  color: #FFFFFF;
  text-transform: uppercase;
  text-align: justify;
  text-align-last: justify;
  width: 825px;
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
  margin-top: 10px;
  text-transform: uppercase;
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
    font-size: 3rem;
    width: 100%;
    max-width: 90%;
    height: auto;
    padding: 0 20px;
  }
  .hero-title {
    font-size: 1.8rem;
    width: 100%;
    max-width: 90%;
    height: auto;
    padding: 0 20px;
  }
}
</style>
