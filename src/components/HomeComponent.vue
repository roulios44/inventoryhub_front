<template>
    <div class="home-page container">
        <!-- Section de bienvenue -->
        <div class="welcome-section mb-5">
            <h1 class="display-4">Bienvenue, {{ user.name }} {{ user.surname }} !</h1>
            <p class="lead">Email : {{ user.email }}</p>
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
                        <a href="/statistics" class="btn btn-primary">Voir</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="card text-center">
                    <div class="card-body">
                        <h5 class="card-title">Paramètres</h5>
                        <p class="card-text">Personnalisez les paramètres de votre application.</p>
                        <a href="/settings" class="btn btn-primary">Paramètres</a>
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
                            <h3>150</h3>
                            <p>Produits au total</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>5</h3>
                            <p>Produits en rupture de stock</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>20</h3>
                            <p>Produits bientôt en rupture</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section des notifications -->
        <div class="notifications-section">
            <h2>Notifications</h2>
            <div class="alert alert-warning" role="alert">
                Attention : 5 produits sont en rupture de stock!
            </div>
            <div class="alert alert-info" role="alert">
                Nouveau : Consultez les nouvelles fonctionnalités dans les paramètres.
            </div>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';

export default {
    name: 'HomePage',
    data() {
        return {
            user: {
                name: '',
                surname: '',
                email: ''
            }
        };
    },
    mounted() {
        // Récupérer le cookie et le parser
        const userCookie = Cookies.get('user');
        if (userCookie) {
            this.user = JSON.parse(userCookie);
        }
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
