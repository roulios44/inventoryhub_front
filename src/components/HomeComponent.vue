<template>
    <div class="home-page container">
        <!-- Section de bienvenue -->
        <div class="welcome-section mb-5">
            <h1 class="display-4">Bonjour {{ user.name }} {{ user.surname }} !</h1>
            <!-- <p class="lead">Email : {{ user.email }}</p> -->
        </div>

        <!-- Section de navigation rapide -->
        <div class="quick-nav-section row">
            <div class="col-md-4 mb-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Gérer les produits</h5>
                        <p class="card-text">Ajoutez, modifiez ou supprimez des produits.</p>
                        <a href="/articles" class="btn btn-primary">Gérer</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Voir les statistiques</h5>
                        <p class="card-text">Consultez les statistiques de votre inventaire.</p>
                        <a href="/outstock" class="btn btn-primary">Voir</a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section des statistiques clés -->
        <div class="stats-section mb-5">
            <h2>Statistiques Clés</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>{{ this.totalArticles }}</h3>
                            <p>Produits au total</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>{{ articlesOutOfStock.length + articlesNoStock.length }}</h3>
                            <p>Produits en rupture de stock/Sans stocks</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>{{ articlesNearNoStock.length }}</h3>
                            <p>Produits bientôt en rupture</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section des notifications -->
        <!-- <div class="notifications-section">
            <h2>Notifications</h2>
            <div class="alert alert-warning" role="alert">
                Attention : 5 produits sont en rupture de stock!
            </div>
            <div class="alert alert-info" role="alert">
                Nouveau : Consultez les nouvelles fonctionnalités dans les paramètres.
            </div>
        </div> -->
    </div>
</template>

<script>
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Cookies from 'js-cookie';

const apiUrl = import.meta.env.VITE_API_URL;

export default {
    name: 'HomePage',
    data() {
        return {
            user: {
                name: '',
                surname: '',
                email: ''
            },
            articlesOutOfStock : [],
            articlesNoStock : [],
            totalArticles : 0,
            articlesNearNoStock : []
        };
    },
    methods : {
        async getHomePageInfo(){
            const headers = {
            Authorization: 'Bearer ' + Cookies.get('token'),
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
      };
      try {
        const req = await axios.get(apiUrl + '/articles/homePage', { headers });
        const res = await req.data
        this.articlesOutOfStock = res.articlesOutOfStock.filter((article) => article.warehouseId != null && article.stockQuantity == 0)
        this.articlesNoStock = await res.articlesOutOfStock.filter((article) => article.warehouseId == null)
        this.totalArticles = res.totalArticles
        this.articlesNearNoStock = res.articleNearOut

        console.log(this.articlesOutOfStock)
        console.log(this.articlesNoStock)
        console.log(this.totalArticles)
        console.log(this.articlesNearNoStock)

      } catch (error) {
        console.error('Failed to fetch allowed endpoints', error);
      }
        }
    },
    async mounted() {
        if (Cookies.get("token") === undefined) this.$router.push("/login");
        const userCookie = Cookies.get('user');
        if (userCookie) {
            this.user = JSON.parse(userCookie);
        }
        await this.getHomePageInfo()
    }
};
</script>

<style scoped>
.container {
    max-width: 1200px;
}

.card {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.welcome-section {
    text-align: center;
}

.stats-section .card {
    margin-bottom: 20px;
}
</style>
