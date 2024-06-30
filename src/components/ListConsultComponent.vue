<template>
  <div class="container mt-5">
    <header class="page-header mb-4 text-center">
      <h1>{{ type }}</h1>
      <!-- Barre de recherche -->
      <div class="mb-4">
        <input 
          type="text" 
          class="form-control d-inline-block" 
          v-model="searchQuery" 
          @input="filterEntries" 
          :placeholder="`Search ${type}`"
        />
      </div>
    </header>
    <div class="row">
      <!-- Contenu principal -->
      <div class="col-12">
        <div v-if="filteredEntities.length > 0">
          <div v-for="entity in filteredEntities" :key="entity.id" class="mb-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ entity.name }}</h5>
                <p class="card-text">
                  {{ entity.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center">
          <p>Loading...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      type: "",
      entities: [],
      filteredEntities: [],
      searchQuery: "",
    };
  },
  methods: {
    getType() {
      return this.$route.params.type;
    },
    async getEntries() {
      try {
        const req = await axios.get(apiUrl + "/" + this.type);
        const res = await req.data;
        this.entities = res._embedded[this.type];
        this.filteredEntities = this.entities;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.$router.push("/");
        }
      }
    },
    filterEntries() {
      const query = this.searchQuery.toLowerCase();
      this.filteredEntities = this.entities.filter(entity => {
        return entity.name.toLowerCase().includes(query) ||
               (entity.description && entity.description.toLowerCase().includes(query));
      });
    },
  },
  async mounted() {
    this.type = this.getType();
    this.getEntries();
  },
};
</script>

<style scoped>
/* Vous pouvez ajouter des styles spécifiques ici si nécessaire */
</style>
