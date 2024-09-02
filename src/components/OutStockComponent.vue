<template>
    <div class="container">
        <!-- Section des statistiques clés -->
        <div class="stats-section mb-5">
            <h2>Statistiques Clés</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>{{ totalArticles }}</h3>
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

        <!-- Section du filtre et de l'affichage des articles -->
        <div class="filter-section mb-4">
            <label for="filter">Afficher les articles :</label>
            <select id="filter" v-model="selectedFilter" class="form-select">
                <option value="outOfStock">En rupture de stock</option>
                <option value="noStock">Sans stock</option>
                <option value="nearNoStock">Bientôt en rupture</option>
            </select>
        </div>

        <!-- Liste des articles filtrés -->
        <div class="articles-section">
            <h3>Liste des articles</h3>
            <label v-if="selectedFilter != 'noStock'" for="warehouseFilter">Sélectionnez un entrepôt :</label>
            <select id="warehouseFilter" v-model="selectedWarehouseId" v-if="selectedFilter != 'noStock'">
                <option disabled value="">Choisissez un entrepôt</option>
                <option 
                    v-for="warehouse in distinctWarehouses" 
                    :key="warehouse.warehouseId" 
                    :value="warehouse.warehouseId">
                    {{ warehouse.warehouseTitle }}
                </option>
            </select>
            <ul>
                <li v-for="article in filteredArticles" :key="article.articleId">
                    <p>{{ article.articleTitle }} - {{ article.stockQuantity }} en stock</p><br>
                    <span v-if="selectedFilter !== 'noStock'">
                        In <strong>{{ article.warehouseTitle }}</strong> warehouse
                    </span>
                    <span v-else>
                        Cet article n'a jamais eu de stock dans un entrepôt
                    </span>
                </li>
            </ul>
        </div>
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
            articlesOutOfStock: [],
            articlesNoStock: [],
            articlesNearNoStock: [],
            totalArticles: 0,
            selectedFilter: 'outOfStock',
            selectedWarehouseId: null,
            distinctWarehouses: []
        };
    },
    watch: {
        articlesOutOfStock: 'updateDistinctWarehouses',
        articlesNoStock: 'updateDistinctWarehouses',
        articlesNearNoStock: 'updateDistinctWarehouses',
    },
    computed: {
        filteredArticles() {
            let articles = [];
            this.selectedWarehouseId = null
            if (this.selectedFilter === 'outOfStock') {
                articles = this.articlesOutOfStock;
            } else if (this.selectedFilter === 'noStock') {
                articles = this.articlesNoStock;
            } else if (this.selectedFilter === 'nearNoStock') {
                articles = this.articlesNearNoStock;
            }

            // Filtrage supplémentaire en fonction de l'entrepôt sélectionné
            if (this.selectedWarehouseId) {
                articles = articles.filter(article => article.warehouseId === this.selectedWarehouseId);
            }

            return articles;
        }
    },
    methods: {
        async getHomePageInfo() {
            const headers = {
                Authorization: 'Bearer ' + Cookies.get('token'),
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            };
            try {
                const req = await axios.get(apiUrl + '/articles/homePage', { headers });
                const res = req.data;
                this.articlesOutOfStock = res.articlesOutOfStock.filter(article => article.warehouseId != null && article.stockQuantity === 0);
                this.articlesNoStock = res.articlesOutOfStock.filter(article => article.warehouseId == null);
                this.totalArticles = res.totalArticles;
                this.articlesNearNoStock = res.articleNearOut;
                
                // Mettre à jour les entrepôts distincts après avoir reçu les données
                this.updateDistinctWarehouses();
            } catch (error) {
                console.error('Failed to fetch allowed endpoints', error);
            }
        },
        updateDistinctWarehouses() {
            // Utiliser tous les articles pour déterminer les entrepôts disponibles
            const allArticles = [
                ...this.articlesOutOfStock,
                ...this.articlesNoStock,
                ...this.articlesNearNoStock
            ];

            this.distinctWarehouses = allArticles
                .filter(article => article.warehouseId !== null && article.warehouseTitle !== null)
                .map(article => ({
                    warehouseId: article.warehouseId,
                    warehouseTitle: article.warehouseTitle
                }))
                .filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.warehouseId === value.warehouseId && t.warehouseTitle === value.warehouseTitle
                    ))
                );
        }
    },
    async mounted() {
        if (Cookies.get("token") === undefined) this.$router.push("/login");
        const userCookie = Cookies.get('user');
        if (userCookie) {
            this.user = JSON.parse(userCookie);
        }
        await this.getHomePageInfo();
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

.filter-section {
    margin-bottom: 20px;
}

.articles-section ul {
    list-style-type: none;
    padding: 0;
}

.articles-section li {
    padding: 10px;
    border: 1px solid #ddd;
    margin-bottom: 5px;
    border-radius: 4px;
}
</style>