<template>
  <div class="fournisseursHeader">
    <div class="">
      <h2>Liste des fournisseurs</h2>
      <button v-on:click="redirectCreateFournisseur()">Créer un fournisseur</button>
    </div>
    <input type="text" placeholder="Search">
  </div>
  <ul class="list-group">
    <li class="list-group-item active">Fournisseurs</li>
    <li v-for="fournisseur in fournisseurs" class="list-group-item">
      <div class="fournisseur-list">
        {{ fournisseur.titre }}
        {{ fournisseur.description }}
        <button class="btn btn-danger" v-on:click="deleteFourniseur(fournisseur.id)">X</button>
      </div>
    
    </li>
  </ul>
    <div class="createFournisseur">
      <form @submit.prevent="registerNewFournisseur">
        <input type="text" placeholder="titre" v-model="titre" required>
        <input type="text" placeholder="adresse" v-model="adresse" required>
        <input type="text" placeholder="code postal" v-model="postCode" required>
        <input type="text" placeholder="description" v-model="description" required>
        <input type="text" placeholder="mail" v-model="mail" required>
        <input type="text" placeholder="country" v-model="country" required>
        <input type="text" placeholder="tel" v-model="tel" required>
        <button type="submit" v-on:click="registerNewFournisseur()">Create</button>
      </form>
    </div>
</template>
  
<script>
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL
const contextApiUrl = apiUrl + "/fournisseurs"
export default {
  data() {
    return {
      fournisseurs : [],
      titre : null,
      adresse : null,
      postCode : null,
      description : null,
      mail : null,
      country : null,
      tel : null,
    };
  },
  methods: {
      async getAllFournisseurs(){
          const req = await axios.get(contextApiUrl)
          const res = await req.data
          this.fournisseurs = res._embedded.fournisseurs
      },
      async registerNewFournisseur(){
        const data = {
          "titre" : this.titre,
          "adresse" : this.adresse,
          "code_postal	" : this.postCode,
          "description" : this.description,
          "mail" : this.mail,
          "pays" : this.country,
          "tel" : this.tel,
        }
        const req = await axios.post(contextApiUrl,data)
        const res = await req.data
        this.getAllFournisseurs()
      },
      async deleteFourniseur(id){
        const req = await axios.delete(contextApiUrl + "/" + id)
        const res = await req.data
        this.getAllFournisseurs()
      },
      async redirectCreateFournisseur(){
        this.$router.push('/createFournisseur')
      }
  },
  async mounted(){
      this.getAllFournisseurs()
  }
};
</script>
<style>
.fournisseursHeader{
  background-color: grey;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
  flex-direction: row;
}
</style>