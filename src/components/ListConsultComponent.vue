<template>
  <h1>{{ type }}</h1>
</template>

<script>
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
export default {
  data() {
    return {
      type: "",
    };
  },
  methods: {
    getType() {
      return this.$route.params.type;
    },
    async getEntries() {
      const req = await axios.get(apiUrl + "/" + this.type + "/all");
      const res = await req.data;
      console.log(res);
    },
  },
  async mounted() {
    this.type = this.getType();
    this.getEntries();
  },
};
</script>
<style></style>
