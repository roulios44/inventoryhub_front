<template>
  <div class="login-page">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">ACCOUNT LOGIN</h5>
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

            <button type="submit" class="btn btn-primary" @click="login">LOGIN</button>

            <div class="row mt-3">
              <div class="col text-center">
                <a href="#!">Forgot password?</a>
              </div>
            </div>
          </div>

          <div class="alert alert-warning" role="alert" v-if="errorMessage">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

export default {
  data() {
    return {
      email: "",
      password: "",
      errorMessage: null,
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
          email: this.email,
          password: this.password,
        });
        if (response.status === 200) {
          const token = response.data.token;
          const expiresIn = response.data.expiresIn;
          const expirationDate = new Date(new Date().getTime() + expiresIn);
          console.log(response.data);
          Cookies.set("token", token, {
            expires: expirationDate,
            secure: false,
            sameSite: "Strict",
          });
          Cookies.set(
            "user",
            JSON.stringify({
              name: response.data.name,
              surname: response.data.surname,
              email: response.data.email,
              id: response.data.id,
            }),
            { expires: expirationDate, secure: false, sameSite: "Strict" }
          );
          this.errorMessage = null;
          this.$router.push("/");
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
    },
  },
};
</script>

<style scoped>
/* Styles spécifiques au composant */
.card {
  margin: 0 auto;
  padding: 20px;
  width: 400px;
  /* Largeur du formulaire */
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
  text-align: center;
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.form-outline {
  margin-bottom: 16px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

.btn-primary {
  width: 100%;
  background-color: #0056b3;
  color: white;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #003d80;
}

.alert {
  margin-top: 10px;
}

a {
  color: #0056b3;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>

<style>
/* Style global */
body {
  background: linear-gradient(90deg, #b3e5fc, #e1f5fe);
  /* Couleur de fond dégradée */
  height: 100vh;
  /* Assurez-vous que le corps prend toute la hauteur */
  margin: 0;
}

.login-page {
  margin-top: 100px;
}
</style>
