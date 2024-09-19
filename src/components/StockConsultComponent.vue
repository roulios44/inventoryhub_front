<template>
    <div class="container-fluid d-flex flex-column min-vh-100">
        <main class="flex-grow-1">
            <!-- Liste des articles de l'entrepôt -->
            <div class="container py-3">
                <h2>Stock Consultation</h2>
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center"
                        v-for="stock in stocks" :key="stock.id.articleId" @click="toDetails(stock.id.articleId)">
                        <span>{{ stock.artTitle }}</span>
                        <span>{{ stock.quantity }} units</span>
                    </li>
                </ul>

                <!-- Message si aucun stock n'est trouvé -->
                <div v-if="stocks.length === 0" class="text-center mt-4">
                    <p>No articles found</p>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

const apiUrl = import.meta.env.VITE_API_URL;

export default {
    name: "StockConsultComponent",
    data() {
        return {
            warehouseId: null,
            stocks: [], // Liste des stocks récupérés
        };
    },
    methods: {
        // Obtenir les stocks pour l'entrepôt sélectionné
        async getStocks() {
            const headers = {
                Authorization: "Bearer " + Cookies.get("token"),
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            };
            try {
                const req = await axios.get(`${apiUrl}/stocks/all`, { headers });
                const res = req.data;

                // Filtrer les stocks en fonction de l'entrepôt
                this.stocks = res.filter((stock) => stock.id.warehouseId == this.warehouseId);

                // Récupérer les détails des articles associés
                await Promise.all(
                    this.stocks.map(async (stock) => {
                        const reqArt = await axios.get(`${apiUrl}/articles/${stock.id.articleId}`);
                        const resArt = reqArt.data;
                        stock.artTitle = resArt.title;
                    })
                );
            } catch (error) {
                console.error("Failed to fetch stocks", error);
            }
        },
        // Récupérer l'ID de l'entrepôt à partir de l'URL
        getWareHouseId() {
            this.warehouseId = this.$route.params.entityID;
        },
        // Redirection vers les détails de l'article
        toDetails(articleId) {
            this.$router.push(`/articles/details/${articleId}`);
        },
    },
    async mounted() {
        if (!Cookies.get("token")) {
            this.$router.push("/login");
        }
        this.getWareHouseId();
        await this.getStocks();
    },
};
</script>

<style scoped>
h2 {
    margin-bottom: 20px;
}

.list-group-item {
    cursor: pointer;
}

.list-group-item:hover {
    background-color: #f1f1f1;
}

.footer {
    background-color: #007bff;
}
</style>