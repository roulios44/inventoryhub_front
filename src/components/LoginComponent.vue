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
            <input type="password" id="loginPassword" class="form-control" v-model="password" />
            <label class="form-label" for="loginPassword">Password</label>
          </div>

          <div class="row mb-4">
            <div class="col-md-6 d-flex justify-content-center">
              <a href="#!">Forgot password?</a>
            </div>
          </div>

          <button type="submit" data-mdb-button-init data-mdb-ripple-init class="btn btn-primary btn-block mb-4" v-on:click="login">Sign in</button>
        </div>
        <div class="alert alert-warning" role="alert" v-if="errorMessage != null">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Cookies from 'js-cookie'

export default {
  data() {
    return {
      email: null,
      password: null,
      errorMessage: null
    };
  },
  methods: {
    async login() {
      try {
        const req = await axios.post(import.meta.env.VITE_API_URL + "/auth/login", {
          "email": this.email,
          "password": this.password
        });
        if (req.status === 200) {
          const token = req.data.token;
          const expiresIn = req.data.expiresIn
          const expirationDate = new Date(new Date().getTime() + expiresIn);
          Cookies.set('token', token, { expires: expirationDate, secure: true, sameSite: 'Strict' });
          console.log(Cookies.get("token"))
          this.errorMessage = null;
        } else if (req.status === 403) {
          this.errorMessage = "Identifiant ou mot de passe incorrects";
        } else {
          this.errorMessage = "Erreur avec le serveur";
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          this.errorMessage = "Identifiant ou mot de passe incorrects";
        } else {
          this.errorMessage = "Erreur avec le serveur";
        }
      }
    }
  },
  mounted() {
    // Actions à effectuer lors du montage du composant
  }
};
</script>

<style>
.card {
  margin-top: 25px;
}
</style>
