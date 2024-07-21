<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-primary">{{ capitalizeFirstLetter(type) }}</h1>
    <form @submit.prevent="createEntity">
      <div class="mb-3" v-for="field in structure" :key="field.name">
        <div>
          <label :for="field.name" class="form-label text-secondary">{{ field.name }}</label>
          <input v-if="field.type != 'Role'" type="text" :id="field.name" class="form-control" v-model="field.value"
            :placeholder="field.name" :required="field.type != 'image'" />
        </div>
      </div>
      <div v-for="entity in relatedEntities">
        <!-- <label :for="field.name" class="form-label text-secondary">{{ field.name }}</label> -->
        <select class="form-control" required>
          <option v-for="key in entity">{{ key }}</option>
        </select>
      </div>
      <button type="submit" class="btn btn-custom">Submit</button>
    </form>
    <div class="toast align-items-center text-white bg-success" role="alert" aria-live="assertive" aria-atomic="true"
      v-if="showSuccess">
      <div class="d-flex">
        <div class="toast-body">
          L'enregistrement a réussi !
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
    <div class="toast align-items-center text-white bg-danger" role="alert" aria-live="assertive" aria-atomic="true"
      v-if="showError">
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
import Cookies from "js-cookie";
const apiUrl = import.meta.env.VITE_API_URL;
const apiStructUrl = import.meta.env.VITE_API_STRUCT_URL;

export default {
  data() {
    return {
      type: "",
      structure: null,
      showSuccess: false,
      showError: false,
      relatedEntities: []
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
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
        const req = await axios.get(`${apiUrl}/api/dtos/${this.type}`, {
          headers: headers
        });
        const res = req.data;
        console.log(res)
        this.structure = req.data
          .filter((field) => field.name !== "id")
          .map((field) => ({ ...field, value: "" }));

      } catch (error) {
        console.error("Erreur lors de la récupération de la structure de l'objet :", error);
        if (error.response && error.response.status === 404) {
          this.$router.push("/");
        }
      }
    },
    async createEntity() {
      const data = {};
      this.structure.forEach((field) => (data[field.name] = field.value));
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
        const url = apiUrl + (this.type == 'user' ? "/auth/signup" : `/${this.type}s`)
        console.log(data)
        await axios.post(url, data, {
          headers: headers
        });
        this.showSuccess = true;
        this.showError = false;
      } catch (error) {
        console.error("Erreur lors de l'enregistrement :", error);
        this.showSuccess = false;
        this.showError = true;
      }
    },
    async getEntityRelation(key) {
      //TODO Faire un tri des nom de clé qui ne serrait pas a display ( sur les relations 1 to many généralement a voir sur le diagramme de MERISE)
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
        const res = await axios.get(`${apiUrl}/${key}s/all`, {
          headers: headers
        });
        res.data.type = key
        console.log(res.data)
        this.relatedEntities.push(res.data)
        console.log(key)
      } catch (error) {
        console.error("Erreur lors de la récupération des rôles :", error);
      }
    },
    detectedNonNative(type) {
      const nativeTypes = ["long", "string", "integer", "boolean", "double", "float", "character", "byte", "short"]
      return (nativeTypes.includes(type.toLowerCase()));
    }
  },
  async mounted() {
    if (Cookies.get("token") === undefined) this.$router.push("/login")
    this.type = this.getType();
    await this.getObjectStruct();
    await this.structure.map(async (field) => { if (field.type == "Long") await this.getEntityRelation(field.name) })
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
