<template>
  <div class="container mt-5">
    <header class="page-header mb-4 text-center">
      <h1 class="mb-4">{{ type }}</h1>

      <!-- Barre de recherche et bouton -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="w-50 h-50 mx-auto">
          <input type="text" class="form-control" v-model="searchQuery" @input="searchEntity"
            :placeholder="`Search ${type}`" aria-label="Search {{ type }}" />
        </div>
        <button class="btn btn-primary ms-3" type="button" @click="redirectCreate">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-plus"
            viewBox="0 0 16 16">
            <path
              d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
          </svg>
        </button>
      </div>
    </header>

    <div class="row">
      <!-- Contenu principal -->
      <div class="col-12">
        <div v-if="serverResponse">
          <div v-if="filteredEntities.length <= 0">
            <p>Aucune donnée trouvée</p>
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
    const serverResponse = ref(false);
    const searchEndpoints = ref({});

    // Fonction pour récupérer les entrées initiales
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
        serverResponse.value = true;
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          router.push("/");
        }
      }
    };

    const redirectCreate = () => {
      router.push(`/create/${type.value.slice(0, -1)}`)
    }

    const searchEntity = async () => {
      const query = searchQuery.value.trim();
      if (!query) {
        filteredEntities.value = entities.value;
        return;
      }

      for (const key in searchEndpoints.value) {
        try {
          const hrefTemplate = searchEndpoints.value[key].href;
          const paramMatch = hrefTemplate.match(/{\?(.*)}/);

          if (paramMatch) {
            const paramName = paramMatch[1]; // Extrait le nom du paramètre (par ex. 'title')
            const searchUrl = hrefTemplate.replace(paramMatch[0], `?${paramName}=${encodeURIComponent(query)}`);

            // Construct the correct URL
            const fullUrl = `${searchUrl}`;

            const headers = {
              "Authorization": "Bearer " + Cookies.get("token"),
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            };
            const req = await axios.get(fullUrl, { headers });
            const res = req.data;
            filteredEntities.value = res._embedded[type.value];
            return;
          }
        } catch (error) {
          console.error(`Error searching with ${key}:`, error);
          // Continue to the next search endpoint if the current one fails
        }
      }

      filteredEntities.value = [];
    };


    const getSearchEndpoints = async () => {
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        const req = await axios.get(`${apiUrl}/${type.value}/search`, { headers });

        const res = req.data._links;
        if (typeof (res.self) === typeof (undefined)) delete res.self; // Supprime le lien "self"
        searchEndpoints.value = res;
      } catch (error) {
        console.error("Error fetching search endpoints:", error);
      }
    };

    const toDetails = (idEntity) => {
      router.push(`/${type.value}/details/${idEntity}`);
    };

    // Watch pour les changements dans les paramètres de la route
    watch(() => route.params.type, (newType) => {
      type.value = newType;
      getEntries();
      getSearchEndpoints();
    });

    // Appel initial lors du montage
    onMounted(() => {
      if (!Cookies.get("token")) router.push("/login");
      getEntries();
      getSearchEndpoints();
    });

    return {
      type,
      filteredEntities,
      searchQuery,
      searchEntity,
      toDetails,
      serverResponse,
      redirectCreate,
    };
  }
};
</script>

<style scoped></style>
