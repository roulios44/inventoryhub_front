<template>
  <div class="container mt-5">
    <header class="page-header mb-4 text-center">
      <h1>{{ type }}</h1>
    </header>
    <div v-if="entity" class="row justify-content-center">
        <div class="card shadow-sm">
          <div class="card-body">
            <h1 class="card-title">{{ entity.title || 'Détails de l\'entité' }}</h1>
            <ul class="list-group list-group-flush">
              <div v-for="(value, key) in entity" :key="key">
                <li  class="list-group-item" v-if="key != 'links'">
                  <strong>{{ formatKey(key) }}</strong> {{ value }}
                </li>
              </div>
              <li v-if="entity.links" class="list-group-item">
                <strong>Liens:</strong>
                <ul>
                  <div v-for="(link, key) in entity.links" :key="key">
                    <li v-if="key != 'self'">
                      <a :href="link.href" target="_blank">{{ formatKey(key) }}</a>
                    </li>
                  </div>
                </ul>
              </li>
            </ul>
            <p class="h4 text-danger" v-if="entity.price">{{ formattedPrice }}</p>
            <button class="btn btn-primary mt-3" @click="addToCart">Ajouter au panier</button>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from 'js-cookie';
const apiUrl = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      type: null,
      entityID: null,
      entity: null,
    };
  },
  methods: {
    getType() {
      return this.$route.params.type;
    },
    getEntityID() {
      return this.$route.params.entityID;
    },
    async getEntry() {
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        const req = await axios.get(`${apiUrl}/${this.type}/${this.entityID}`, { headers: headers });
        this.entity = req.data;
        this.entity.links = this.entity._links
        delete this.entity._links
        console.log(this.entity);
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          this.$router.push("/");
        }
      }
    },
    addToCart() {
      // Logique pour ajouter le produit au panier
      console.log(`${this.entity.title || 'Entité'} ajouté au panier`);
    },
    formatKey(key) {
      // Formate la clé pour une meilleure lisibilité
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  },
  computed: {
    formattedPrice() {
      if (this.entity && this.entity.price) {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(this.entity.price);
      }
      return '';
    }
  },
  async mounted() {
    if (Cookies.get("token") === undefined) this.$router.push("/login")
    this.type = this.getType();
    this.entityID = this.getEntityID();
    await this.getEntry();
  },
};
</script>


<style scoped>
.card-body {
  width: fit-content;
}
.card-title {
  margin-bottom: 20px;
}
.list-group-item {
  display: flex;
  justify-content: space-between;
}
.h4.text-danger {
  margin-top: 20px;
}
button {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #e91e63;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #d81b60;
}
a {
  color: #007bff;
}
a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>