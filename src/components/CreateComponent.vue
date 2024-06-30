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
          :required="field.type != 'image'"
          
        />
      </div>
      <button type="submit" class="btn btn-custom">Submit</button>
    </form>
    <div class="toast align-items-center text-white bg-success" role="alert" aria-live="assertive" aria-atomic="true" v-if="showSuccess">
      <div class="d-flex">
        <div class="toast-body">
          L'enregistrement a réussi !
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
    <div class="toast align-items-center text-white bg-danger" role="alert" aria-live="assertive" aria-atomic="true" v-if="showError">
      <div class="d-flex">
        <div class="toast-body">
          Échec de l'enregistrement.
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
const apiStructUrl = import.meta.env.VITE_API_STRUCT_URL;

export default {
  data() {
    return {
      type: "",
      structure: null,
      showSuccess: false,
      showError: false,
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
          .filter((field) => field.name !== "id" && field.type !== "Set")
          .map((field) => ({ ...field, value: "" }));
      } catch (error) {
        console.error("Erreur lors de la récupération de la structure de l'objet :", error);
        if (error.response && error.response.status === 404) {
          this.$router.push("/");
        }
      }
    },
    async handleSubmit() {
      const data = {};
      this.structure.forEach((field) => (data[field.name] = field.value));

      try {
        const response = await axios.post(`${apiUrl}/${this.type}s`, data);
        this.showSuccess = true;
        this.showError = false;
      } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
        this.showSuccess = false;
        this.showError = true;
      }
    },
  },
  async mounted() {
    this.type = this.getType();
    await this.getObjectStruct();
  },
};
</script>

<style>
.text-primary {
  color: #244e88;
}

.text-secondary {
  color: #4d97d2;
}

.btn-custom {
  background-color: #007b46;
  color: white;
  border: none;
}

.btn-custom:hover {
  background-color: #005b34;
  color: white;
}

.form-control {
  border-color: #cccccc;
}

.form-control:focus {
  border-color: #4d97d2;
  box-shadow: 0 0 0 0.2rem rgba(77, 151, 210, 0.25);
}

.container {
  background-color: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
}

h1 {
  color: #244e88;
}

.secondary-color {
  color: #333333;
}

.secondary-bg {
  background-color: #ffa500;
}

.toast {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 300px;
  z-index: 1100;
}
</style>
