<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HeaderComponent from './components/HeaderComponent.vue';


</script>

<template>
  <HeaderComponent />
  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
}

* {
  font-family: 'Roboto', sans-serif;
}

body {
  background: linear-gradient(90deg, #b3e5fc, #e1f5fe) !;
  color: #333333;
}

.header-container {
  background-color: #244E88;
  color: #F5F5F5;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: #244E88;
}

a {
  color: #4D97D2;
  text-decoration: none;
}

a:hover {
  color: #244E88;
}

/* Boutons principaux */
.btn-primary {
  background-color: #244E88;
  color: #F5F5F5;
  border: none;
}

.btn-primary:hover {
  background-color: #4D97D2;
  color: #F5F5F5;
}

/* Boutons secondaires */
.btn-secondary {
  background-color: #007B46;
  color: #F5F5F5;
  border: none;
}

.btn-secondary:hover {
  background-color: #4D97D2;
  color: #F5F5F5;
}

/* Boutons d'alerte ou importants */
.btn-warning {
  background-color: #FFA500;
  color: #333333;
  border: none;
}

.btn-warning:hover {
  background-color: #FF8C00;
  color: #333333;
}

/* Sidebar (Vertical Menu) */
.offcanvas-body {
  background-color: #244E88;
  color: #F5F5F5;
}

.offcanvas-body a {
  color: #F5F5F5;
}

.offcanvas-body a:hover {
  color: #4D97D2;
}

/* Footer */
footer {
  background-color: #333333;
  color: #CCCCCC;
  padding: 20px;
  text-align: center;
}
</style>
