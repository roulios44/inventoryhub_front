<template>
  <div>
    <!-- Burger Menu Button (visible only on small screens) -->
    <button v-if="showHeader && !isSidebarVisible"
      class="btn btn-primary position-fixed top-0 start-0 m-2 d-flex align-items-center justify-content-center"
      type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample"
      style="width: 50px; height: 50px;">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Sidebar (Vertical Menu) -->
    <div v-if="showHeader"
      :class="{ 'sidebar': isSidebarVisible, 'offcanvas': !isSidebarVisible, 'offcanvas-start': !isSidebarVisible }"
      tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" ref="offcanvas">
      <div class="offcanvas-header">
        <h5 v-on:click="redirectHome" class="offcanvas-title mf-5" id="offcanvasExampleLabel">Inventory Hub</h5>
        <button v-if="!isSidebarVisible" type="button" class="btn-close" data-bs-dismiss="offcanvas"
          aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="nav flex-column">
          <div v-for="service in allowedEndpoints" :key="service">
            <li v-if="tabToExclude(service.toLowerCase())" class="nav-item">
              <a class="nav-link" @click="redirectToService(service.toLowerCase())">{{ service }}</a>
            </li>
          </div>
          <li>
            <a class="nav-link" @click="redirectToService('order')">Order</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" @click="redirectToService('profile')">Profile</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Cookies from 'js-cookie';

const apiUrl = import.meta.env.VITE_API_URL;

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    const allowedEndpoints = ref([]);
    const isSidebarVisible = ref(window.innerWidth >= 992);
    const showHeader = ref(false);
    let offcanvasInstance = null;

    const getAllowedEndpoints = async () => {
      const headers = {
        Authorization: 'Bearer ' + Cookies.get('token'),
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };
      try {
        const response = await axios.get(apiUrl + '/secured-endpoints', { headers });
        allowedEndpoints.value = response.data;
      } catch (error) {
        console.error('Failed to fetch allowed endpoints', error);
      }
    };

    const redirectHome = () => {
      router.push("/")
    }
    const redirectToService = (service) => {
      router.push(`/${service}`);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
      const backdrop = document.querySelector('.offcanvas-backdrop');
      if (backdrop && backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    };

    const tabToExclude = (title) => {
      return title !== "orders";
    };

    const handleResize = () => {
      isSidebarVisible.value = window.innerWidth >= 992;
    };

    onMounted(async () => {
      await nextTick(); // Ensure DOM is updated
      showHeader.value = route.path !== "/login";
      if (showHeader.value) {
        try {
          const offcanvasElement = document.querySelector('#offcanvasExample');
          if (offcanvasElement) {
            offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
          }
        } catch (error) {
          console.error('Failed to initialize Offcanvas', error);
        }
        if (Cookies.get('token')) {
          await getAllowedEndpoints();
        }
      }
      window.addEventListener('resize', handleResize);
    });

    watch(() => route.path, async (newPath) => {
      showHeader.value = newPath !== '/login';
      if (showHeader.value && Cookies.get('token')) {
        await getAllowedEndpoints();
      }
    });

    return {
      allowedEndpoints,
      isSidebarVisible,
      showHeader,
      redirectToService,
      tabToExclude,
      redirectHome,
    };
  }
};
</script>

<style scoped>
body {
  background-color: #F5F5F5 !important;
  color: #333333;
}

/* Stylize the burger button */
.btn.btn-primary {
  padding: 0;
  width: 50px;
  height: 50px;
}

.navbar-toggler-icon {
  width: 24px;
  height: 24px;
  background-image: url('data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
}

.sidebar {
  background-color: #244E88;
  color: #FFFFFF;
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
  display: block;
}

.sidebar a {
  color: #FFFFFF;
}

.offcanvas {
  display: none;
}

@media (max-width: 991px) {
  .sidebar {
    display: none;
  }

  .offcanvas {
    display: block;
  }
}

@media (min-width: 992px) {
  .btn.btn-primary {
    display: none;
  }
}
</style>
