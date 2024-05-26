<template>
    hello
    <p v-for="fournisseur in fournisseurs">{{ fournisseur }}</p>
</template>
  
  <script>
  import axios from 'axios';
  export default {
    data() {
      return {
        fournisseurs : []
      };
    },
    methods: {
        async getAllFournisseurs(){
          console.log("hello")
            // const req = await axios.get("http://localhost:8080/fournisseurs",{
            //   headers : {
            //     'Access-Control-Allow-Origin': '*'
            //   }
            // })
            // const res = await req.data
            // this.fournisseurs = res
            const req = await fetch("http://localhost:8080/fournisseurs")
            const res = req.body
            console.log(res)

        },
        async registerNewFournisseur(){

        },
    },
    async mounted(){
        this.getAllFournisseurs()
    }
  };
  </script>
  
  <style>
  </style>