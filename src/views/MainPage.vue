<template>
  <div class="antique-page-container">
    <main class="hero-section">
      <div class="hero-text-content">
        <h1>The World Where Timeless Beauty <span class="highlight-text">Lives</span></h1>
        <p>
          Відкрийте для себе унікальні античні меблі та предмети мистецтва...
        </p>
      </div>
    </main>

    <section class="video-showcase" ref="videoSection">
      <div class="video-header">
        <h2>Discover Our Story</h2>
        <span class="decorative-line"></span>
      </div>

      <div class="video-wrapper">
        <iframe
            :key="isPlaying"
            :src="finalVideoUrl"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
        </iframe>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "MainPage",
  data() {
    return {
      // Вставте сюди ТІЛЬКИ ID відео (те, що після v= або в посиланні share)
      videoId: "dQw4w9WgXcQ",
      isPlaying: false
    };
  },
  computed: {
    // Ця функція сама збирає правильне посилання
    finalVideoUrl() {
      const base = `https://www.youtube.com/embed/${this.videoId}`;
      const params = "?mute=1&rel=0&controls=1"; // mute=1 обов'язково для автоплею

      if (this.isPlaying) {
        // Додаємо autoplay тільки коли треба
        return `${base}${params}&autoplay=1`;
      } else {
        return `${base}${params}`;
      }
    }
  },
  mounted() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isPlaying) {
          console.log("Video section visible - starting autoplay");
          this.isPlaying = true;
        }
      });
    }, { threshold: 0.4 }); // Спрацює, коли видно 40% блоку

    if (this.$refs.videoSection) {
      observer.observe(this.$refs.videoSection);
    }
  }
}
</script>

<style scoped src="/src/assets/main.css"></style>