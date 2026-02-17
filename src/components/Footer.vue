<template>
  <footer class="antique-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="logo-text">Antique Life</span>
        <p class="brand-desc" v-html="$t('footer.brand_desc')"></p>
      </div>

      <div class="footer-info">
        <h4>{{ $t('footer.about_company') }}</h4>
        <ul>
          <li><router-link :to="$localPath('/about-us')">{{ $t('footer.about_us') }}</router-link></li>
          <li><router-link :to="$localPath('/how-we-work')">{{ $t('footer.how_we_work') }}</router-link></li>
          <li><router-link :to="$localPath('/our-services')">{{ $t('footer.our_services') }}</router-link></li>
          <li><router-link :to="$localPath('/privacy-policy')">{{ $t('footer.privacy_policy') }}</router-link></li>
          <li><router-link :to="$localPath('/public-offer')">{{ $t('footer.public_offer') }}</router-link></li>
        </ul>
      </div>

      <div class="footer-info">
        <h4>{{ $t('footer.to_buyers') }}</h4>
        <ul>
          <li><router-link :to="$localPath('/shipping-policy')">{{ $t('footer.shipping') }}</router-link></li>
          <li><router-link :to="$localPath('/refund')">{{ $t('footer.refund') }}</router-link></li>
          <li><router-link :to="$localPath('/faq')">{{ $t('footer.faq') }}</router-link></li>
        </ul>
      </div>

      <div class="footer-follow">
        <h4>{{ $t('footer.follow_us') }}</h4>
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
        <h4>{{ $t('footer.contact_us') }}</h4>
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
      <p>{{ $t('footer.rights') }}</p>
    </div>
  </footer>
</template>

<script setup>
// Скріпт порожній, оскільки логіка форми видалена, але він готовий для Composition API
</script>

<style scoped src="/src/assets/footer.css"></style>