<template>
    <div class="container">
        <div class="stats-section mb-5">
            <h2>Key Statistics</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>{{ totalArticles }}</h3>
                            <p>Total articles</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>{{ articlesOutOfStock.length + articlesNoStock.length }}</h3>
                            <p>Products out of stock/No stock</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>{{ articlesNearNoStock.length }}</h3>
                            <p>Products soon to be sold out</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="filter-section mb-4">
            <label for="filter">Article's stock state :</label>
            <select id="filter" v-model="selectedFilter" class="form-select">
                <option value="outOfStock">Out of stock</option>
                <option value="noStock">Without stock</option>
                <option value="nearNoStock">Soon to be out of stock</option>
            </select>
        </div>

        <div class="articles-section">
            <h3>Articles list</h3>
            <label v-if="selectedFilter != 'noStock'" for="warehouseFilter">Select a warehouse :</label>
            <select class="form-select" id="warehouseFilter" v-model="selectedWarehouseId"
                v-if="selectedFilter != 'noStock'">
                <option disabled value=""></option>
                <option v-for="warehouse in distinctWarehouses" :key="warehouse.warehouseId"
                    :value="warehouse.warehouseId">
                    {{ warehouse.warehouseTitle }}
                </option>
            </select>

            <!-- Liste stylée des articles -->
            <ul class="list-group mt-3">
                <li class="list-group-item d-flex justify-content-between align-items-center"
                    v-for="article in filteredArticles" :key="article.articleId">
                    <div>
                        <p class="mb-1 fw-bold">{{ article.articleTitle }}</p>
                        <p class="text-muted">{{ article.stockQuantity }} in stock</p>
                        <span v-if="selectedFilter !== 'noStock'">
                            In <strong>{{ article.warehouseTitle }}</strong> warehouse
                        </span>
                        <span v-else>
                            This article has never been in stock in a warehouse
                        </span>
                    </div>
                    <span v-if="article.stockQuantity === 0" class="badge bg-danger">Out of stock</span>
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

            if (this.selectedFilter === 'outOfStock') {
                articles = this.articlesOutOfStock;
            } else if (this.selectedFilter === 'noStock') {
                articles = this.articlesNoStock;
            } else if (this.selectedFilter === 'nearNoStock') {
                articles = this.articlesNearNoStock;
            }
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

                this.updateDistinctWarehouses();
            } catch (error) {
                console.error('Failed to fetch allowed endpoints', error);
            }
        },
        updateDistinctWarehouses() {
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

.articles-section ul {
    list-style-type: none;
    padding: 0;
}

.articles-section li {
    padding: 15px;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.articles-section .badge {
    font-size: 0.9rem;
}
</style>
