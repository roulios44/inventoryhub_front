<template>
    <div class="container mt-5">
      <h1 class="mb-4 text-primary">{{ capitalizeFirstLetter(type) }}</h1>
      <form @submit.prevent="handleSubmit">
        <div class="mb-3" v-for="field in structure" :key="field.name">
          <label :for="field.name" class="form-label text-secondary">{{ field.name }}</label>
          <input
            type="text"
            :id="field.name"
            class="form-control"
            v-model="field.value"
            :placeholder="field.name"
          />
        </div>
        <button type="submit" class="btn btn-custom">Submit</button>
      </form>
    </div>
  </template>
  
  <script> 
  import axios from 'axios';
  const apiUrl = import.meta.env.VITE_API_URL;
  const contextApiUrl = apiUrl + "/fournisseurs";
  const apiStructUrl = import.meta.env.VITE_API_STRUCT_URL;
  
  export default {
    data() {
      return {
        type: "",
        structure: null,
      };
    },
    methods: {
      getType() {
        return this.$route.params.type;
      },
      capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }, 
      async getObjectStruct() {
        try {
          const req = await axios.get(`${apiStructUrl}/${this.type}`);
          const res = req.data;
          this.structure = res
            .filter(field => field.name !== 'id' && field.type !== 'Set')
            .map(field => ({ ...field, value: "" }));
        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.$router.push("/");
          }
        }
      },
      handleSubmit() {
        console.log("Form submitted with data:", this.structure);
      },
    },
    async mounted() {
      this.type = this.getType();
      console.log(this.type);
      await this.getObjectStruct();
    },
  };
  </script>
  
  <style>
  .text-primary {
    color: #244E88;
  }
  
  .text-secondary {
    color: #4D97D2;
  }
  
  .btn-custom {
    background-color: #007B46;
    color: white;
    border: none;
  }
  
  .btn-custom:hover {
    background-color: #005B34;
    color: white;
  }
  
  .form-control {
    border-color: #CCCCCC;
  }
  
  .form-control:focus {
    border-color: #4D97D2;
    box-shadow: 0 0 0 0.2rem rgba(77, 151, 210, 0.25);
  }
  
  .container {
    background-color: #F5F5F5;
    padding: 2rem;
    border-radius: 8px;
  }
  
  h1 {
    color: #244E88;
  }
  
  .secondary-color {
    color: #333333;
  }
  
  .secondary-bg {
    background-color: #FFA500;
  }
  </style>
  