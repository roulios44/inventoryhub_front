<template>
  <div class="card" style="width: 18rem;">
    <div class="card-body">
      <h5 class="card-title">Login</h5>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="pills-login" role="tabpanel" aria-labelledby="tab-login">
          <div class="form-outline mb-4">
            <input type="email" id="loginName" class="form-control" v-model="email" />
            <label class="form-label" for="loginName">Email</label>
          </div>

          <div class="form-outline mb-4">
            <input type="password" id="loginPassword" class="form-control" v-model="password" />
            <label class="form-label" for="loginPassword">Password</label>
          </div>

          <div class="row mb-4">
            <div class="col-md-6 d-flex justify-content-center">
              <a href="#!">Forgot password?</a>
            </div>
          </div>

          <button type="submit" class="btn btn-primary mb-4" @click="login">
            Sign in
          </button>
        </div>

        <div class="alert alert-warning" role="alert" v-if="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: null
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
          email: this.email,
          password: this.password
        });

        if (response.status === 200) {
          const token = response.data.token;
          const expiresIn = response.data.expiresIn;
          const expirationDate = new Date(new Date().getTime() + expiresIn);
          console.log(response.data)
          Cookies.set('token', token, { expires: expirationDate, secure: true, sameSite: 'Strict' });
          Cookies.set('user', JSON.stringify({
            "name": response.data.name,
            "surname": response.data.surname,
            "email": response.data.email
          }), { expires: expirationDate, secure: true, sameSite: 'Strict' })
          this.errorMessage = null;
          // this.$emit('login-success');
          this.$router.push('/');
        } else {
          this.errorMessage = "Erreur inattendue, veuillez réessayer.";
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          this.errorMessage = "Identifiant ou mot de passe incorrects";
        } else {
          this.errorMessage = "Erreur avec le serveur, veuillez réessayer plus tard.";
        }
      }
    }
  }
};
</script>

<style>
.card {
  margin-top: 25px;
}

.btn-primary {
  display: block;
}
</style>
