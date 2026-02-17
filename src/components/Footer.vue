<template>
  <footer class="antique-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="logo-text">Antique Life</span>
        <p class="brand-desc">
          Портал антикваріату та вінтажу з <br>
          Франції, Європи та українського <br>
          мистецтва.
        </p>
      </div>

      <div class="footer-info">
        <h4>About company</h4>
        <ul>
          <li><router-link to="/about-us">About Us</router-link></li>
          <li><router-link to="/how-we-work">How we work</router-link></li>
          <li><router-link to="/our-services">Our services</router-link></li>
          <li><router-link to="/privacy-policy">Privacy Policy</router-link></li>
          <li><router-link to="/public-offer">Public Offer & Terms</router-link></li>
        </ul>
      </div>

      <div class="footer-info">
        <h4>To buyers</h4>
        <ul>
          <li><router-link to="/shipping-policy">Shipping and Payment</router-link></li>
          <li><router-link to="/refund">Refund Policy</router-link></li>
          <li><router-link to="/faq">FAQ</router-link></li>
        </ul>
      </div>

      <div class="footer-follow">
        <h4>Follow us</h4>
        <ul>
          <li>
            <a
                href="https://www.instagram.com/france_antique_centre/"
                target="_blank"
                rel="noopener"
            >Instagram</a
            >
          </li>
          <li>
            <a
                href="https://www.tiktok.com/@france_antique_centre"
                target="_blank"
                rel="noopener"
            >TikTok</a
            >
          </li>
          <li>
            <a
                href="https://t.me/antiquelife"
                target="_blank"
                rel="noopener"
            >Telegram</a
            >
          </li>
          <li>
            <a
                href="https://www.threads.com/@france_antique_centre"
                target="_blank"
                rel="noopener"
            >Threads</a
            >
          </li>
        </ul>
      </div>

      <div class="footer-contact">
        <h4>Contact Us</h4>
        <p><a href="mailto:info@antiquelife.com">info@antiquelife.com</a></p>
        <p><a href="tel:+33745708919">+33 7 45 70 89 19</a></p>
        <p>9:00 - 18:00 (CET)</p>
      </div>

      <div class="footer-social">
        <a
            class="social-icon"
            href="https://www.instagram.com/france_antique_centre/"
            target="_blank"
            rel="noopener"
        >
          <img src="@/assets/icons/instagram.svg" alt="Instagram" />
        </a>
        <a
            class="social-icon"
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener"
        >
          <img src="@/assets/icons/youtube.svg" alt="YouTube" />
        </a>
        <a
            class="social-icon"
            href="https://www.tiktok.com/@france_antique_centre"
            target="_blank"
            rel="noopener"
        >
          <img src="@/assets/icons/tiktok.svg" alt="TikTok" />
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 by Antique Life. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script setup>
// Скріпт порожній, оскільки логіка форми видалена
</script>

<style scoped src="/src/assets/footer.css"></style>
