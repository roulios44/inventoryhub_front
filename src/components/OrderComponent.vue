<template>
    <div class="container mt-5">
        <h1>Créer une commande</h1>
        <form @submit.prevent="submitOrder">
            <!-- Type de commande -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <label for="orderType" class="form-label">Type de commande</label>
                    <select id="orderType" v-model="orderType" @change="resetPrices" class="form-select">
                        <option value="client">Commande Client</option>
                        <option value="fournisseur">Commande Fournisseur</option>
                    </select>
                </div>
            </div>

            <!-- Liste des articles -->
            <div v-for="(orderItem, index) in orderItems" :key="index" class="row mb-3">
                <div class="col-md-4">
                    <select v-model="orderItem.article" @change="updatePrice(index)" class="form-select">
                        <option :value="null">Sélectionnez un article</option>
                        <option v-for="article in articles" :key="article.id" :value="article">
                            {{ article.title }} - {{ getPriceLabel(article) }}
                        </option>
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="number" min="1" v-model.number="orderItem.quantity" @input="updatePrice(index)"
                        class="form-control" placeholder="Quantité">
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control" :value="orderItem.unitPrice.toFixed(2)" readonly>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control" :value="orderItem.linePrice.toFixed(2)" readonly>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger" @click="removeOrderItem(index)">Supprimer</button>
                </div>
            </div>

            <!-- Ajouter un article -->
            <div class="row mb-3">
                <div class="col-md-12">
                    <button type="button" class="btn btn-primary" @click="addOrderItem">Ajouter un article</button>
                </div>
            </div>

            <!-- Total -->
            <div class="row">
                <div class="col-md-12 text-end">
                    <h3>Total: {{ total.toFixed(2) }}€</h3>
                </div>
            </div>

            <!-- Sélection de l'entrepôt -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <label for="warehouse" class="form-label">Sélectionnez un entrepôt</label>
                    <select id="warehouse" v-model="selectedWarehouse" class="form-select">
                        <option :value="null">Sélectionnez un entrepôt</option>
                        <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse">
                            {{ warehouse.title }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Bouton de soumission -->
            <div class="row">
                <div class="col-md-12 text-end">
                    <button type="submit" class="btn btn-success">Passer la commande</button>
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
            warehouses: [], // Liste des entrepôts
            orderItems: [{
                article: null,
                quantity: 1,
                unitPrice: 0,
                linePrice: 0
            }],
            orderType: 'client', // Par défaut, la commande est pour un client
            selectedWarehouse: null // Entrepôt sélectionné
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
                const req = await axios.get(`${apiUrl}/articles/all`, { headers: headers });
                this.articles = await req.data;
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
                const req = await axios.get(`${apiUrl}/warehouses/all`, { headers: headers });
                this.warehouses = await req.data;
            } catch (error) {
                console.error("Erreur lors de la récupération des entrepôts :", error);
                if (error.response && error.response.status === 404) {
                    this.$router.push("/");
                }
            }
        },
        addOrderItem() {
            this.orderItems.push({
                article: null,
                quantity: 1,
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
                if (this.orderType === 'client') {
                    item.unitPrice = item.article.price;
                } else {
                    item.unitPrice = item.article.supplierPrice;
                }
                item.linePrice = item.unitPrice * item.quantity;
            } else {
                item.unitPrice = 0;
                item.linePrice = 0;
            }
        },
        resetPrices() {
            this.orderItems.forEach((item, index) => {
                this.updatePrice(index);
            });
        },
        getPriceLabel(article) {
            if (this.orderType === 'client') {
                return `${article.price}€ (Client)`;
            } else {
                return `${article.supplierPrice}€ (Fournisseur)`;
            }
        },
        submitOrder() {
            if (!this.selectedWarehouse) {
                alert('Veuillez sélectionner un entrepôt.');
                return;
            }

            alert(`Commande soumise avec un total de ${this.total.toFixed(2)}€ pour l'entrepôt ${this.selectedWarehouse.name}.`);
            // Logique pour soumettre la commande (par exemple, envoyer à une API)
        }
    },
    async mounted() {
        if (Cookies.get("token") === undefined) this.$router.push("/login");
        await this.getArticles();
        await this.getWarehouses(); // Récupérer la liste des entrepôts lors du montage du composant
    }
};
</script>


<style scoped>
.container {
    max-width: 800px;
}
</style>