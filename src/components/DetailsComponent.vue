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
          <button class="btn btn-danger mt-3" data-bs-toggle="modal" data-bs-target="#deleteModal">Supprimer</button> <!-- Bouton Supprimer -->

          <ul class="list-group list-group-flush">
            <div v-for="(value, key) in entity" :key="key">
              <li class="list-group-item" v-if="key != 'links' && key != 'password'">
                <strong>{{ formatKey(key) }}</strong>
                <span v-if="!isEditing">{{ value }}</span>
                <input v-if="isEditing && formatKey(key) !== 'Id'" v-model="entity[key]" class="form-control" />
              </li>
            </div>
            <li v-if="entity.links && hasOtherKeys(entity.links)" class="list-group-item">
              <div v-for="(link, key) in entity.links" :key="key">
                <button @click="toggleCollapse(key), getRelatedEntity(link, key)" class="btn btn-link" type="button"
                  :aria-expanded="isCollapseOpen(key)" :data-bs-target="`#collapseLinks${key}`"
                  aria-controls="collapseLinks">
                  <i :class="isCollapseOpen(key) ? 'bi bi-chevron-up' : 'bi bi-chevron-down'">
                    {{ key }}
                  </i>
                </button>
                <div :id="`collapseLinks${key}`" :class="{ 'collapse': true, 'show': isCollapseOpen(key) }">
                  <ul class="list-group mt-2">
                    <li v-if="filterLinks(key)" class="list-group-item">
                      <p v-for="obj in relatedEntity[`${key}`]" @click="goToEntity(key, obj.id)">{{
                        obj.title }}</p>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <StockConsultComponent v-if="type == 'warehouses'" />
    <FooterComponent />

    <!-- Modal de confirmation de suppression -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Confirmer la suppression</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Êtes-vous sûr de vouloir supprimer cet élément ?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
            <button type="button" class="btn btn-danger" @click="deleteEntity" data-bs-dismiss="modal">Oui, supprimer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from 'js-cookie';
import FooterComponent from "./FooterComponent.vue";
import StockConsultComponent from "./StockConsultComponent.vue";
const apiUrl = import.meta.env.VITE_API_URL;


export default {
  data() {
    return {
      type: null,
      entityID: null,
      entity: null,
      isEditing: false,
      openCollapses: {},
      relatedEntity: {}
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
    toggleCollapse(key) {
      if (this.openCollapses[key]) {
        delete this.openCollapses[key];
      } else {
        this.openCollapses[key] = true;
      }
    },
    isCollapseOpen(key) {
      return this.openCollapses[key];
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
        delete this.entity.links.orderArticles
        delete this.entity.links.stocks

      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          this.$router.push("/");
        }
      }
    },
    filterLinks(key) {
      return !(key == "self" || key == this.type.slice(0, -1) || key == "orderArticles" || key == "stocks")
    },
    async deleteEntity(){
      try{
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        const req = await axios.delete(`${apiUrl}/${this.type}/${this.entityID}`, { headers: headers });
        const res = await req.data
        if(req.status == 200){
          this.$router.push(`/${this.type}`)
        }
      }catch(e){
        console.error(e)
      }
    },
    hasOtherKeys() {
      const keys = Object.keys(this.entity.links)
      return keys.some(key => key != "self" && key != this.type.slice(0, -1))
    },
    async goToEntity(entity, id) {
      const url = `/${entity.endsWith('y') ? entity.slice(0, -1) + 'ies' : entity + (entity.slice(-1) != "s" ? "s" : "")}/details/${id}`
      await this.$router.push(url)
    },
    async getRelatedEntity(url, key) {
      try {
        const headers = {
          "Authorization": "Bearer " + Cookies.get("token"),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        const req = await axios.get(url.href, { headers: headers });
        if (req.data._embedded !== "undefined") this.relatedEntity[`${key}`] = [await req.data]
        else {
          this.relatedEntity[`${key}`] = await req.data._embedded
        }
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          this.$router.push("/");
        }
      }
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
    formatKey(key) {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    },
    async reloadEntity() {
      this.type = this.getType();
      this.entityID = this.getEntityID();
      await this.getEntry();
    }
  },
  components: {
    FooterComponent,
    StockConsultComponent,
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
    if (Cookies.get("token") === undefined) this.$router.push("/login");
    await this.reloadEntity();
  },
  watch: {
    '$route'() {
      this.reloadEntity();
    }
  }
};
</script>

<style scoped>
.card-body {
  width: fit-content;
  min-width: 300px;
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
