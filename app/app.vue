<template>
  <div class="layout">
    <!-- HEADER -->
    <header class="header">
      <div class="container header-content">
        <h1 class="logo">PatchWork</h1>

        <nav class="nav">
          <NuxtLink to="/" class="more-link">Herramientas</NuxtLink>
          <a href="/about">Sobre</a>
        </nav>
      </div>
    </header>

    <!-- BODY -->
    <main class="main container">
      <NuxtPage />
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <p>© 2026 PatchWork — Herramientas simples para archivos</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 60px;
}

/* HEADER */
.header {
  background-color: var(--primary);
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
}

.nav a {
  margin-left: 20px;
  font-size: 14px;
  opacity: 0.9;
}

.nav a:hover {
  opacity: 1;
}

/* MAIN */
.main {
  flex: 1;
  padding: 48px 0;
}

/* FOOTER */
.footer {
  background-color: #E9EEF3;
  padding: 20px 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}
</style>
