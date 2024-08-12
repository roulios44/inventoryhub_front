<template>
  <HeaderComponent ref="header" />
  <LoginComponent @login-success="refreshHeader" />
</template>

<script>
import LoginComponent from '@/components/LoginComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';

export default {
  methods: {
    refreshHeader() {
      this.$refs.header.getAllowedEndpoints();
    }
  },
  components: {
    HeaderComponent,
    LoginComponent
  }
};
</script>
