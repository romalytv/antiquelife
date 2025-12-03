<template>
  <footer class="antique-footer">
    <div class="footer-content">

      <div class="column left-column">
        <div class="brand">
          <span class="logo-icon">
            <img src="/src/public/key_logo.png">  ️
          </span>
          <span class="logo-text">ANTIQUE <span class="highlight">LIFE</span></span>
        </div>

        <div class="contact-info">
          <p>+33745708919</p>
          <br>
          <p>France</p>
          <br>
        </div>
      </div>

      <div class="column right-column">

        <div class="subscribe-section">
          <h3>Stay Connected with us</h3>
          <form @submit.prevent="submitForm" class="subscribe-form">
            <div class="input-group">
              <label for="email">Enter Your Email *</label>
              <input type="email" id="email" v-model="email" required placeholder="">
            </div>

            <div class="checkbox-group">
              <input type="checkbox" id="newsletter" v-model="isSubscribed">
              <label for="newsletter">Yes, subscribe me to your newsletter.</label>
            </div>

            <button type="submit" class="submit-btn">Submit</button>
          </form>
        </div>

        <div class="links-row">
          <div class="links-col">
            <a href="#">Privacy Policy</a>
            <a href="#">Accessibility Statement</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Refund Policy</a>
          </div>
          <div class="links-col">
            <a href="https://www.instagram.com/france_antique_centre/">Instagram</a>
            <a href="https://www.tiktok.com/@france_antique_centre">TikTok</a>
            <a href="https://t.me/franceantique">Telegram</a>
          </div>
        </div>

        <div class="copyright">
          <p>© 2025 by Antique Life.</p>
        </div>

      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const isSubscribed = ref(false);

const submitForm = () => {
  console.log('Submitting:', email.value, isSubscribed.value);
  // Тут ваша логіка відправки форми
  alert("Дякуємо за підписку!");
};
</script>

<style scoped src="/src/assets/footer.css">

</style>