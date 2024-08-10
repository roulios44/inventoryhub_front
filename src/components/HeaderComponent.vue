<template v-if="!isHiddenRoute()">
  <div>
    <!-- Burger Menu Button -->
    <button class="btn btn-primary position-fixed top-0 start-0 m-2 d-flex align-items-center justify-content-center"
      type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample"
      style="width: 50px; height: 50px;">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Sidebar (Vertical Menu) -->
    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel"
      ref="offcanvas">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasExampleLabel">LOGO</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="nav flex-column">
          <li v-for="service in allowedEndpoints" :key="service" class="nav-item">
            <a class="nav-link" v-on:click="redirectToService(service.toLowerCase())">{{ service }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';
import { Offcanvas } from 'bootstrap';

const apiUrl = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      allowedEndpoints: [],
      offcanvasInstance: null
    };
  },
  methods: {
    async getAllowedEndpoints() {
      const headers = {
        "Authorization": "Bearer " + Cookies.get("token"),
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };
      try {
        const req = await axios.get(apiUrl + "/secured-endpoints", {
          headers: headers
        });
        this.allowedEndpoints = req.data;
      } catch (error) {
        console.error('Failed to fetch allowed endpoints', error);
      }
    },
    redirectToService(service) {
      this.$router.push(`/${service}`);
      this.offcanvasInstance.hide(); // Close the offcanvas menu

      // Check and remove backdrop only if it exists (Bootstrap should handle this)
      const backdrop = document.querySelector('.offcanvas-backdrop');
      if (backdrop && backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    },
    isHiddenRoute() {
      return this.$route.path === '/login';
    }

  },
  mounted() {
    this.isHiddenRoute()
    if (!Cookies.get("token")) {
      this.$router.push("/login");
    } else {
      this.getAllowedEndpoints();
    }
    // Initialize Bootstrap Offcanvas
    this.offcanvasInstance = new Offcanvas(this.$refs.offcanvas);
  },
};
</script>

<style>
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
</style>
