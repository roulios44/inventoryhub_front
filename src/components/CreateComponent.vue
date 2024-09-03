<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-primary">{{ capitalizeFirstLetter(type) }}</h1>
    <form @submit.prevent="createEntity">
      <div class="mb-3" v-for="field in structure" :key="field.name">
        <div>
          <label :for="field.name" class="form-label text-secondary" v-if="field.type != 'Long'">
            {{ field.name }}
          </label>
          <input
            v-if="detectedNonNative(field.type)"
            type="text"
            :id="field.name"
            class="form-control"
            v-model="field.value"
            :placeholder="field.name"
            :required="field.type != 'image'"
          />
        </div>
      </div>

      <div v-for="(entity, index) in relatedEntities" :key="index">
        <label :for="'select-' + entity.type" class="form-label text-secondary">
          {{ capitalizeFirstLetter(entity.type) }}
        </label>
        <select
          :id="'select-' + entity.type"
          class="form-control"
          v-model="selectedEntities[entity.type]"
          required
        >
          <option v-for="key in entity.data" :key="key.id" :value="key.id">
            {{ key.title }}
          </option>
        </select>
      </div>

      <button type="submit" class="btn btn-success">Submit</button>
    </form>

    <div
      class="toast align-items-center text-white bg-success"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-if="showSuccess"
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

    <div
      class="toast align-items-center text-white bg-danger"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      v-if="showError"
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
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

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
        data[key + "Id"] = value;
      }

      try {
        const headers = {
          Authorization: "Bearer " + Cookies.get("token"),
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const url =
          apiUrl +
          (this.type === "user"
            ? "/auth/signup"
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
</style>
