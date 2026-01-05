<template>
  <div class="antique-page-container">

    <section class="video-showcase" ref="videoSection">
      <div class="video-header">
        <h2>Відкрийте для себе цікавий світ антикваріату</h2>
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

    <section class="instagram-showcase">
      <div class="instagram-header">
        <h2>Ми в Instagram</h2>
        <span class="decorative-line"></span>
      </div>

      <div class="instagram-widget-wrapper">
        <InstagramFeed />
      </div>
    </section>

    <section class="tiktok-showcase">
      <div class="tiktok-header"> <h2>Ми в TikTok</h2>
        <span class="decorative-line"></span>
      </div>

      <div class="tiktok-widget-wrapper">
        <TikTokFeed />
      </div>
    </section>

    <LatestProducts />

  </div>
</template>

<script>
import InstagramFeed from "@/components/InstagramFeed.vue";
import TikTokFeed from '@/components/TikTokFeed.vue';
import LatestProducts from '@/components/LatestProducts.vue';

export default {
  name: "MainPage",
  components: {TikTokFeed, InstagramFeed, LatestProducts},
  data() {
    return {
      videoId: "NC4XTu3Ap98",
      isPlaying: false
    };
  },
  computed: {
    finalVideoUrl() {
      const base = `https://www.youtube.com/embed/${this.videoId}`;
      const params = "?mute=1&rel=0&controls=1";

      if (this.isPlaying) {
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
    }, { threshold: 0.4 });

    if (this.$refs.videoSection) {
      observer.observe(this.$refs.videoSection);
    }
  }
}
</script>

<style scoped src="/src/assets/main.css"></style>