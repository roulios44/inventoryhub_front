<template>
  <div class="container mt-5">
    <!-- Utilisation d'une card pour encadrer le formulaire -->
    <div class="card shadow-sm p-4 mb-5 bg-white rounded">
      <h1 class="card-title mb-4 text-primary">{{ capitalizeFirstLetter(type) }}</h1>
      <form @submit.prevent="createEntity">
        <div class="row">
          <!-- Champs du formulaire organisés en grille -->
          <div class="col-md-6 mb-3" v-for="field in structure" :key="field.name">
            <label :for="field.name" class="form-label text-secondary" v-if="field.type != 'Long'">
              {{ field.name }}
            </label>
            <input
              v-if="detectedNonNative(field.type)"
              :type="field.name === 'password' ? 'password' : 'text'"
              :id="field.name"
              class="form-control"
              v-model="field.value"
              :placeholder="field.name"
              :required="field.type != 'image'"
            />
          </div>
        </div>

        <!-- Sélection des entités liées -->
        <div class="row">
          <div class="col-md-6 mb-3" v-for="(entity, index) in relatedEntities" :key="index">
            <label :for="'select-' + entity.type" class="form-label text-secondary">
              {{ capitalizeFirstLetter(entity.type) }}
            </label>
            <select
              :id="'select-' + entity.type"
              class="form-select"
              v-model="selectedEntities[entity.type]"
              required
            >
              <option v-for="key in entity.data" :key="key.id" :value="key.id">
                {{ key.title }}
              </option>
            </select>
          </div>
        </div>

        <!-- Bouton Submit stylisé avec effet de survol -->
        <button type="submit" class="btn btn-success btn-lg w-100">Submit</button>
      </form>
    </div>

    <!-- Toast de succès -->
    <div
      class="toast align-items-center text-white bg-success position-fixed bottom-0 end-0 m-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-if="showSuccess"
      style="z-index: 1050"
    >
      <div class="d-flex">
        <div class="toast-body">L'enregistrement a réussi !</div>
        <button
          type="button"
          class="btn-close me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>

    <!-- Toast d'erreur -->
    <div
      class="toast align-items-center text-white bg-danger position-fixed bottom-0 end-0 m-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-if="showError"
      style="z-index: 1050"
    >
      <div class="d-flex">
        <div class="toast-body">Échec de l'enregistrement.</div>
        <button
          type="button"
          class="btn-close me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
    </div>
    <FooterComponent />
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import FooterComponent from "./FooterComponent.vue";

const apiUrl = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      type: "",
      structure: null,
      showSuccess: false,
      showError: false,
      relatedEntities: [],
      selectedEntities: {},
    };
  },
  components : {
    FooterComponent
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
          Authorization: "Bearer " + Cookies.get("token"),
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const req = await axios.get(`${apiUrl}/api/dto/${this.type}`, {
          headers: headers,
        });
        const res = req.data;
        this.structure = res.fields
          .filter((field) => field.name !== "id")
          .map((field) => ({ ...field, value: "" }));
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la structure de l'objet :",
          error
        );
        if (error.response && error.response.status === 404) {
          this.$router.push("/");
        }
      }
    },
    async createEntity() {
      console.log(this.structure);
      const filteredStructure = this.structure.filter(
        (field) => field.type !== "Long"
      );
      const data = {};
      filteredStructure.forEach((field) => {
        data[field.name] = field.value;
      });
      for (const [key, value] of Object.entries(this.selectedEntities)) {
        console.log(key)
        console.log(value)
        data[key] = value 
      }
      console.log(data)

      try {
        const headers = {
          Authorization: "Bearer " + Cookies.get("token"),
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const url =
          apiUrl +
          (this.type === "user"
            ? "/auth/register"
            : `/${
                this.type.endsWith("y")
                  ? this.type.slice(0, -1) + "ies"
                  : this.type + "s"
              }`);
        await axios.post(url, data, {
          headers: headers,
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
      try {
        const headers = {
          Authorization: "Bearer " + Cookies.get("token"),
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const url = `${apiUrl}/${
          key.endsWith("y") ? key.slice(0, -1) + "ies" : key + "s"
        }/all`;
        const res = await axios.get(url, {
          headers: headers,
        });
        this.relatedEntities.push({ type: key, data: res.data });
      } catch (error) {
        console.error("Erreur lors de la récupération des rôles :", error);
      }
    },
    detectedNonNative(type) {
      const nativeTypes = [
        "string",
        "integer",
        "boolean",
        "double",
        "float",
        "character",
        "byte",
        "short",
      ];
      return nativeTypes.includes(type.toLowerCase());
    },
  },
  async mounted() {
    if (Cookies.get("token") === undefined) this.$router.push("/login");
    this.type = this.getType();
    await this.getObjectStruct();
    for (const field of this.structure) {
      if (field.type == "Long") {
        await this.getEntityRelation(field.name);
      }
    }
  },
};
</script>

<style>
/* Ajout de marges et d'espacements pour le design */
.toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}
</style>
