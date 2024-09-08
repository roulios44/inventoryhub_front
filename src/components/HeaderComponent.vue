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
      class="header"
      tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" ref="offcanvas">
      <div class="offcanvas-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
        </svg>       
        <h5 v-on:click="redirectHome" class="offcanvas-title mf-5" id="offcanvasExampleLabel">Inventory Hub </h5>
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
          <li class="nav-item">
            <a class="nav-link" @click="redirectToService('profile')">Profile</a>
          </li>
        </ul>
        <div class="mt-auto">
          <button @click="logout" class="btn btn-danger w-100">Logout</button>
        </div>
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
    const isSidebarVisible = ref(window.innerWidth >= 1750);
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
      return title !== "";
    };

    const handleResize = () => {
      isSidebarVisible.value = window.innerWidth >= 1750;
    };
    const logout = () => {
      const allCookies = Cookies.get();
      for (let cookie in allCookies) {
        Cookies.remove(cookie);
      }
      router.push("/login")
    }

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
      logout,
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

@media (max-width: 1750px) {
  .sidebar {
    display: none;
  }

  .offcanvas {
    display: block;
  }
}

@media (min-width: 1750px) {
  .btn.btn-primary {
    display: none;
  }
}

.header{
  background-color : #244E88; 
}
.header a{
  color: #FFFFFF;
}
a{
  cursor: pointer;
}

.btn-primary{
  background-color: #244E88;
  border-color: #244E88;
}
</style>
