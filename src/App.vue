<template>
  <div class="antique-page-container">

    <header class="main-header">
      <div class="logo">
        <span class="logo-icon">🔑</span>
        <span class="logo-text">ANTIQUE <span class="logo-text-lite">LIFE</span></span>
      </div>

      <nav class="main-nav">
        <a href="#">Market</a>
        <a href="#">Blog</a>
        <a href="#">Contact</a>
        <a href="#">AI</a>
        <a href="#">News</a>
      </nav>

      <div class="user-menu">
        <div class="user-profile">
          <span class="notification-badge">Б</span>
          <span>Бон Барбос</span>
        </div>
        <a href="#" class="cart-icon">🛒</a>
        <a href="#" class="dropdown-arrow">▼</a>
      </div>
    </header>

    <main class="hero-section">
      <div class="hero-text-content">
        <h1>The World Where Timeless Beauty <span class="highlight-text">Lives</span></h1>
        <p>
          Відкрийте для себе унікальні античні меблі та предмети мистецтва, які
          надають вашому приміщенню теплоту та затишок. Вибирайте серед
          наших унікальних дизайнів та створюйте затишну та привітну
          атмосферу.
        </p>
      </div>

      <div class="hero-image-container">
        <img src="https://images.unsplash.com/photo-1550330562-b15c1a35c25d?fit=crop&w=800&q=80" alt="Classical Statue">
      </div>
    </main>

  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped src="/src/assets/HomePage.css"></style>