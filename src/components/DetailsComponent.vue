<template>
  <div class="container mt-5">
    <header class="page-header mb-4 text-center">
      <h1>{{ type }}</h1>
    </header>
    <div v-if="entity" class="row justify-content-center">
      <div class="card shadow-sm">
        <div class="card-body">
          <h1 class="card-title">{{ entity.title || `${formatKey(this.type.slice(0, -1))}` }}</h1>

          <button v-if="!isEditing" class="btn btn-secondary mt-3" @click="isEditing = true">Edit</button>
          <button v-if="isEditing" class="btn btn-primary mt-3" @click="saveChanges">Save</button>

          <ul class="list-group list-group-flush">
            <div v-for="(value, key) in entity" :key="key">
              <li class="list-group-item" v-if="key != 'links' && key != 'password'">
                <strong>{{ formatKey(key) }}</strong>
                <span v-if="!isEditing">{{ value }}</span>
                <input v-if="isEditing && formatKey(key) !== 'Id'" v-model="entity[key]" class="form-control" />
              </li>
            </div>
            <li v-if="entity.links && hasOtherKeys(entity.links)" class="list-group-item">
              <button v-for="(link, key) in entity.links" :key="key" class="btn btn-link" type="button"
                data-bs-toggle="collapse" :data-bs-target="`#collapseLinks${key}`" aria-expanded="false"
                aria-controls="collapseLinks">
                <i class="bi bi-chevron-down">{{ key }}</i>
              </button>
              <div v-for="(value, key) in getLinksInfo(entity.links)" :key="key">
                <div class="collapse" :id="`collapseLinks${key}`">
                  <ul class="list-group mt-2">
                    <li v-if="filterLinks(key)" class="list-group-item">
                      <p @click="goToEntity(key, value)">{{ value }}</p>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>

          <div v-if="type == 'articles'">
            <p class="h4 text-secondary">{{ formattedPrice }}</p>
            <button class="btn btn-primary mt-3" @click="addToCart">Add to cart</button>
          </div>
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
      isEditing: false,
    };
  },
  methods: {
    getType() {
      return this.$route.params.type;
    },
    getEntityID() {
      return this.$route.params.entityID;
    },
    getLinksInfo(links) {
      const returnObject = {}
      for (const [key, value] of Object.entries(links)) {
        const hrefSplit = value.href.split("/")
        returnObject[key] = hrefSplit[hrefSplit.length - 2]
      }
      return returnObject
    },
    async getEntry() {
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        const req = await axios.get(`${apiUrl}/${this.type}/${this.entityID}`, { headers: headers });
        this.entity = await req.data;
        this.entity.links = this.entity._links;
        delete this.entity._links;
        delete this.entity.links.self;
        delete this.entity.links[this.type.slice(0, -1)];
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          this.$router.push("/");
        }
      }
    },
    filterLinks(key) {
      return !(key == "self" || key == this.type.slice(0, -1));
    },
    hasOtherKeys() {
      const keys = Object.keys(this.entity.links);
      return keys.some(key => key != "self" && key != this.type.slice(0, -1));
    },
    async goToEntity(entity, id) {
      await this.$router.push(`/${entity}${entity.slice(-1) != "s" ? "s" : ""}/details/${id}`);
      console.log("GO TO ENTITY FUNC " + entity);
    },
    async saveChanges() {
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        await axios.put(`${apiUrl}/${this.type}/${this.entityID}`, this.entity, { headers: headers });
        this.isEditing = false;
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    },
    addToCart() {
      console.log(`${this.entity.title || 'Entité'} ajouté au panier`);
    },
    formatKey(key) {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    },
    async reloadEntity() {
      this.type = this.getType();
      this.entityID = this.getEntityID();
      await this.getEntry();
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
    console.log("mounted");
    if (Cookies.get("token") === undefined) this.$router.push("/login");
    await this.reloadEntity();
  },
  watch: {
    '$route'() {
      console.log("Route changed");
      this.reloadEntity();
    }
  }
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

.form-control {
  width: 100%;
}
</style>
