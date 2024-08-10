<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HeadComponent from './components/HeadComponent.vue';
import HeaderComponent from './components/HeaderComponent.vue';

</script>

<template>
  <HeadComponent />
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
</style>
