<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HeadComponent from './components/HeadComponent.vue';

</script>

<template>
  <HeadComponent />
  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped>
</style>
