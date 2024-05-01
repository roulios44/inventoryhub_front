<template>
<div class="card" style="width: 18rem;">
  <div class="card-body">
    <h5 class="card-title">Login</h5>
    <div class="tab-content">
      <div class="tab-pane fade show active" id="pills-login" role="tabpanel" aria-labelledby="tab-login">
          <div data-mdb-input-init class="form-outline mb-4">
            <input type="email" id="loginName" class="form-control" v-model="email" />
            <label class="form-label" for="loginName">Email</label>
          </div>

          <div data-mdb-input-init class="form-outline mb-4">
            <input type="password" id="loginPassword" class="form-control" v-model="password"/>
            <label class="form-label" for="loginPassword">Password</label>
          </div>

          <div class="row mb-4">
            <div class="col-md-6 d-flex justify-content-center">
              <a href="#!">Forgot password?</a>
            </div>
          </div>

          <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block mb-4" v-on:click="login()">Sign in</button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios'

  export default {
    data() {
      return {
        email : null,
        password : null,
      };
    },
    methods: {
      async login(){
        const req = await axios.post(import.meta.env.VITE_API_URL + "/login",{
          "email" : this.email,
          "password" : this.password
        })

        const res = await req.data
        console.log(res)
      }
    },
    async mounted(){

    }
  };
</script>

<style>
.card{
  margin-top: 25px;
}
</style>