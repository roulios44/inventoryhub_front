<template>
  <LoginComponent @login-success="refreshHeader" />
</template>

<script>
import LoginComponent from '@/components/LoginComponent.vue';

export default {
  methods: {
    refreshHeader() {
      this.$refs.header.getAllowedEndpoints();
    }
  },
  components: {
    LoginComponent
  }
};
</script>
