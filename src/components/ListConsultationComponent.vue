<template>
    <h1>{{type}}</h1>
    {{ structure }}
    <div class="create">
        <input v-for="field in structure" type="text":key="field.name" :placeholder="field.name">
    </div>
</template>

<script>
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const contextApiUrl = apiUrl + "/fournisseurs";
const apiStructUrl = import.meta.env.VITE_API_STRUCT_URL

export default {
    data() {
        return {
            type: "",
            structure : null,
        }
    },
    methods: {
        getType() {
            return this.$route.params.type;
        },
        async getObjectStruct() {
            try {
                const req = await axios.get(apiStructUrl + "/" + this.type);
                const res = req.data;
                this.structure = res
            } catch (error) {
                if(error.response.status==404)this.$router.push("/")
            }
        }
    },
    async mounted() {
        this.type = this.getType();
        console.log(this.type);
        await this.getObjectStruct();  // Appel de la fonction pour obtenir l'objet struct
    },
};
</script>

<style>
/* Ajoutez votre style ici */
</style>
