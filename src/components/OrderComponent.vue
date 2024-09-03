<template>
    <div class="container mt-5">
        <h1>Create an Order</h1>
        <form @submit.prevent="submitOrder">
            <!-- Type de commande -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <label for="orderType" class="form-label">Order Type</label>
                    <select id="orderType" v-model="orderType" @change="resetOrder" class="form-select">
                        <option value="client">Client Order</option>
                        <option value="supplier">Supplier Order</option>
                    </select>
                </div>
            </div>

            <!-- Liste des articles -->
            <div v-for="(orderItem, index) in orderItems" :key="index" class="row mb-3">
                <div class="col-md-3">
                    <select v-model="orderItem.article" @change="updatePrice(index)" class="form-select">
                        <option :value="null">Choose an Article</option>
                        <option v-for="article in articles" :key="article.id" :value="article">
                            {{ article.title }} - {{ getPriceLabel(article) }}
                        </option>
                    </select>
                </div>

                <!-- Sélection de l'entrepôt si commande client -->
                <div class="col-md-3" v-if="orderType === 'client' && orderItem.article">
                    <select v-model="orderItem.warehouse" @change="updateMaxQuantity(index)" class="form-select">
                        <option :value="null">Select a Warehouse</option>
                        <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse">
                            {{ warehouse.title }} (Stock: {{ getStockForWarehouseAndArticle(warehouse, orderItem.article) }})
                        </option>
                    </select>
                </div>

                <div class="col-md-2">
                    <input type="number" :max="orderItem.maxQuantity" min="1" v-model.number="orderItem.quantity" @input="updatePrice(index)"
                        class="form-control" placeholder="Quantity">
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control" :value="orderItem.unitPrice.toFixed(2)" readonly>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control" :value="orderItem.linePrice.toFixed(2)" readonly>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger" @click="removeOrderItem(index)">Delete</button>
                </div>
            </div>

            <!-- Ajouter un article -->
            <div class="row mb-3">
                <div class="col-md-12">
                    <button type="button" class="btn btn-primary" @click="addOrderItem">Add an Article</button>
                </div>
            </div>

            <!-- Sélection de l'entrepôt de destination pour commande fournisseur -->
            <div class="row mb-3" v-if="orderType === 'supplier'">
                <div class="col-md-4">
                    <label for="warehouse" class="form-label">Destination Warehouse</label>
                    <select id="warehouse" v-model="selectedWarehouse" class="form-select">
                        <option :value="null">Select a Warehouse</option>
                        <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse">
                            {{ warehouse.title }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Total -->
            <div class="row">
                <div class="col-md-12 text-end">
                    <h3>Total: {{ total.toFixed(2) }}€</h3>
                </div>
            </div>

            <!-- Bouton de soumission -->
            <div class="row">
                <div class="col-md-12 text-end">
                    <button type="submit" class="btn btn-success">Place Order</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

export default {
    data() {
        return {
            articles: [],
            warehouses: [],
            stockData: [], // Stock pré-chargé pour chaque combinaison entrepôt/article
            orderItems: [{
                article: null,
                warehouse: null,
                quantity: 1,
                maxQuantity: 0,
                unitPrice: 0,
                linePrice: 0
            }],
            orderType: 'client', // Par défaut, la commande est pour un client
            selectedWarehouse: null // Entrepôt de destination pour commande fournisseur
        };
    },
    computed: {
        total() {
            return this.orderItems.reduce((sum, item) => sum + item.linePrice, 0);
        }
    },
    methods: {
        async getArticles() {
            try {
                const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                const response = await axios.get(`${apiUrl}/articles/all`, { headers: headers });
                this.articles = response.data;
            } catch (error) {
                console.error("Erreur lors de la récupération des articles :", error);
                if (error.response && error.response.status === 404) {
                    this.$router.push("/");
                }
            }
        },
        async getWarehouses() {
            try {
                const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                const response = await axios.get(`${apiUrl}/warehouses/all`, { headers: headers });
                this.warehouses = response.data;
                await this.loadStockData(); // Charger les stocks après avoir récupéré les entrepôts
            } catch (error) {
                console.error("Erreur lors de la récupération des entrepôts :", error);
                if (error.response && error.response.status === 404) {
                    this.$router.push("/");
                }
            }
        },
        async loadStockData() {
            try {
                const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };

                // Charger les stocks pour chaque combinaison article/entrepôt
                const requests = [];
                this.articles.forEach(article => {
                    this.warehouses.forEach(warehouse => {
                        requests.push(
                            axios.get(
                                `${apiUrl}/stocks/findByArticleWarehouse?articleId=${article.id}&warehouseId=${warehouse.id}`, 
                                { headers: headers }
                            ).then(response => ({
                                articleId: article.id,
                                warehouseId: warehouse.id,
                                stock: response.data
                            }))
                        );
                    });
                });

                const results = await Promise.all(requests);
                this.stockData = results;
            } catch (error) {
                console.error("Erreur lors de la récupération des stocks :", error);
            }
        },
        addOrderItem() {
            this.orderItems.push({
                article: null,
                warehouse: null,
                quantity: 1,
                maxQuantity: 0,
                unitPrice: 0,
                linePrice: 0
            });
        },
        removeOrderItem(index) {
            this.orderItems.splice(index, 1);
        },
        updatePrice(index) {
            const item = this.orderItems[index];
            if (item.article) {
                item.unitPrice = this.orderType === 'client' ? item.article.price : item.article.supplierPrice;
                item.linePrice = item.unitPrice * item.quantity;
            } else {
                item.unitPrice = 0;
                item.linePrice = 0;
            }
        },
        updateMaxQuantity(index) {
            const item = this.orderItems[index];
            if (item.warehouse && item.article) {
                const stock = this.getStockForWarehouseAndArticle(item.warehouse, item.article);
                item.maxQuantity = stock;
                if (item.quantity > stock) {
                    item.quantity = stock; // Limite la quantité au stock disponible
                }
            }
        },
        resetOrder() {
            this.orderItems = [{
                article: null,
                warehouse: null,
                quantity: 1,
                maxQuantity: 0,
                unitPrice: 0,
                linePrice: 0
            }];
            this.selectedWarehouse = null;
        },
        getStockForWarehouseAndArticle(warehouse, article) {
            const stockEntry = this.stockData.find(
                entry => entry.articleId === article.id && entry.warehouseId === warehouse.id
            );
            return stockEntry ? stockEntry.stock : 0;
        },
        getPriceLabel(article) {
            return this.orderType === 'client' ? `${article.price}€ (Client)` : `${article.supplierPrice}€ (Fournisseur)`;
        },
        submitOrder() {
            if (this.orderType === 'supplier' && !this.selectedWarehouse) {
                alert('Please select a destination warehouse.');
                return;
            }

            if (this.orderType === 'client') {
                for (const item of this.orderItems) {
                    if (!item.warehouse) {
                        alert('Please select a warehouse for each article.');
                        return;
                    }
                }
            }

            alert(`Order submitted with a total of ${this.total.toFixed(2)}€.`);
            // Logique pour soumettre la commande (par exemple, envoyer à une API)
        }
    },
    async mounted() {
        if (Cookies.get("token") === undefined) this.$router.push("/login");
        await this.getArticles();
        await this.getWarehouses();
    }
};
</script>

<style scoped>
.container {
    max-width: 800px;
}
</style>
