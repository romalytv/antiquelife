<template>
  <div class="antique-page-container">
    <HeroSection />

    <section class="social-showcase">
      <div class="social-header">
        <h2>{{ $t('home.socialMedia') }}</h2>
        <span class="decorative-line"></span>
      </div>

      <div class="social-widget-wrapper">
        <SocialFeed />
      </div>
    </section>

    <LatestProducts />

    <TablewareShowcase />

    <DecorShowcase />

    <GlassShowcase />

    <TelegramBanner />

    <NewsShowcase />


  </div>
</template>

<script>
import SocialFeed from "@/components/SocialFeed.vue";
import LatestProducts from "@/components/LatestProducts.vue";
import axios from "axios";
import HeroSection from "@/components/HeroSection.vue";
import TablewareShowcase from "@/components/TablewareShowcase.vue";
import DecorShowcase from "@/components/DecorShowcase.vue";
import GlassShowcase from "@/components/GlassShowcase.vue";
import TelegramBanner from "@/components/TelegramBanner.vue";
import NewsShowcase from "@/components/NewsShowcase.vue";

export default {
  name: "MainPage",
  // Прибрав "TikTokFeed: SocialFeed", залишив просто SocialFeed
  components: {
    NewsShowcase,
    TelegramBanner, GlassShowcase, DecorShowcase, TablewareShowcase, HeroSection, SocialFeed, LatestProducts },
  data() {
    return {
      videoId: "NC4XTu3Ap98",
      isPlaying: false,
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
    },
  },
  methods: {
    async fetchCurrentVideo() {
      try {
        const response = await axios.get("/api/youtube/current");
        if (response.data && response.data.videoId) {
          this.videoId = response.data.videoId;
        }
      } catch (error) {
        console.error(
            "Не вдалося завантажити YouTube відео, показуємо дефолтне",
            error,
        );
      }
    },
  },
  mounted() {
    this.fetchCurrentVideo();

    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.isPlaying) {
              console.log("Video section visible - starting autoplay");
              this.isPlaying = true;
            }
          });
        },
        { threshold: 0.4 },
    );

    if (this.$refs.videoSection) {
      observer.observe(this.$refs.videoSection);
    }
  },
};
</script>
