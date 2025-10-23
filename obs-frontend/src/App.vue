<template>
  

  <div class="app-container">

    <main :class="['main-content', { 'full-width': route.name === 'login' }]">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

/* Estilos globais padronizados para logos */
.div2 {
  grid-column: span 5 / span 5;
  grid-row: span 2 / span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.div2 img {
  max-width: 35%;
  height: auto;
  object-fit: contain;
}

/* Responsividade padronizada para logos */
@media (max-width: 1024px) {
  .div2 {
    padding: 60px 0;
  }

  .div2 img {
    max-width: 45%;
  }
}

@media (max-width: 768px) {
  .div2 {
    grid-column: 1;
    grid-row: 2;
    padding: 20px 0;
  }

  .div2 img {
    max-width: 55%;
  }
}

@media (max-width: 480px) {
  .div2 {
    padding: 15px 0;
  }

  .div2 img {
    max-width: 65%;
  }
}
</style>