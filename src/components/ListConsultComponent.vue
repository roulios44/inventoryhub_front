<template>
  <div class="container-fluid d-flex flex-column min-vh-100">
    <main class="flex-grow-1">
      <!-- Barre de recherche -->
      <div class="container py-3">
        <div class="d-flex justify-content-center mb-4">
          <input
            type="text"
            class="form-control w-75"
            v-model="searchQuery"
            @input="searchEntity"
            :placeholder="'Search ' + type"
            :aria-label="'Search ' + type"
          />
          <button
            class="btn btn-primary rounded-circle ms-2"
            type="button"
            @click="redirectCreate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-plus"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
              />
            </svg>
          </button>
        </div>

        <!-- Liste des fournisseurs -->
        <ul class="list-group">
          <li
            class="list-group-item d-flex justify-content-between align-items-center"
            v-for="entity in filteredEntities"
            :key="entity.id"
            @click="toDetails(entity.id)"
          >
            <span>{{ entity.title }}</span>
            <span>{{ entity.description }}</span>
          </li>
        </ul>

        <div v-if="filteredEntities.length === 0" class="text-center mt-4">
          <p>No {{ type }} found</p>
        </div>
      </div>
    </main>

    <!-- Footer fixe en bas de la page -->
    <footer class="footer fixed-bottom bg-primary text-white text-center py-2">
      <small>InventoryHub ©</small>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Cookies from "js-cookie";
import FooterComponent from "./FooterComponent.vue";
const apiUrl = import.meta.env.VITE_API_URL;

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const type = ref(route.params.type);
    const entities = ref([]);
    const filteredEntities = ref([]);
    const searchQuery = ref("");

    const getEntries = async () => {
      try {
        const headers = {
          Authorization: "Bearer " + Cookies.get("token"),
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const req = await axios.get(`${apiUrl}/${type.value}`, { headers });
        const res = req.data;
        entities.value = res._embedded[type.value];
        filteredEntities.value = entities.value;
      } catch (error) {
        if (
          error.response &&
          (error.response.status === 404 || error.response.status === 403)
        ) {
          router.push("/");
        }
      }
    };

    const searchEntity = () => {
      const query = searchQuery.value.trim();
      if (!query) {
        filteredEntities.value = entities.value;
      } else {
        filteredEntities.value = entities.value.filter((entity) =>
          entity.title.toLowerCase().includes(query.toLowerCase())
        );
      }
    };

    const redirectCreate = () => {
      const urlRedirect =
        type.value == "categories"
          ? "/create/category"
          : `/create/${type.value.slice(0, -1)}`;
      router.push(urlRedirect);
    };

    const toDetails = (idEntity) => {
      router.push(`/${type.value}/details/${idEntity}`);
    };

    // Watch pour les changements de route
    watch(
      () => route.params.type,
      (newType) => {
        type.value = newType;
        getEntries();
      }
    );

    // Appel initial pour récupérer les entrées
    onMounted(() => {
      if (!Cookies.get("token")) router.push("/login");
      getEntries();
    });

    return {
      type,
      filteredEntities,
      searchQuery,
      searchEntity,
      toDetails,
      redirectCreate,
    };
  },
};
</script>

<style scoped>
.container-fluid {
  background-color: #f5f5f5;
  color: #333333;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.btn-primary {
  background-color: #244e88;
  border-color: #244e88;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  width: 100%;
}
</style>
