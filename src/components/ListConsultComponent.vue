<template>
  <div class="container mt-5">
    <header class="page-header mb-4 text-center">
      <h1>{{ type }}</h1>
      <!-- Barre de recherche -->
      <div class="mb-4">
        <input type="text" class="form-control d-inline-block" v-model="searchQuery" @input="filterEntries"
          :placeholder="`Search ${type}`" />
      </div>
    </header>
    <div class="row">
      <!-- Contenu principal -->
      <div class="col-12">
        <div v-if="serverResponse">
          <div v-if="filterEntries.length <= 0">
            <p>Aucune donnée de créée</p>
          </div>
          <div v-for="entity in filteredEntities" :key="entity.id" @click="toDetails(entity.id)" class="mb-3">
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
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';

const apiUrl = import.meta.env.VITE_API_URL;

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const type = ref(route.params.type);
    const entities = ref([]);
    const filteredEntities = ref([]);
    const searchQuery = ref("");
    const serverResponse = ref(false)

    // Fonction pour récupérer les entrées
    const getEntries = async () => {
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        const req = await axios.get(`${apiUrl}/${type.value}`, { headers });
        const res = req.data;
        entities.value = res._embedded[type.value];
        filteredEntities.value = entities.value;
        serverResponse.value = true
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          router.push("/");
        }
      }
    };

    // Fonction de filtrage des entrées
    const filterEntries = () => {
      const query = searchQuery.value.toLowerCase();
      filteredEntities.value = entities.value.filter(entity => {
        return entity.name.toLowerCase().includes(query) ||
          (entity.description && entity.description.toLowerCase().includes(query));
      });
    };

    // Fonction pour naviguer vers les détails
    const toDetails = (idEntity) => {
      router.push(`/${type.value}/details/${idEntity}`);
    };

    // Watch pour les changements dans les paramètres de la route
    watch(() => route.params.type, (newType) => {
      type.value = newType;
      getEntries();
    });

    // Appel initial lors du montage
    onMounted(() => {
      if (!Cookies.get("token")) router.push("/login");
      getEntries();
    });

    return {
      type,
      filteredEntities,
      searchQuery,
      filterEntries,
      toDetails,
      serverResponse,
    };
  }
};
</script>

<style scoped></style>
