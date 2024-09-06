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
                    <input type="number" :max="orderItem.maxQuantity ? orderItem.maxQuantity : 0" :min="orderItem.maxQuantity ? 1 : 0" v-model.number="orderItem.quantity" @input="updatePrice(index)"
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
            {{ orderItems }}

            <!--Customer Select-->
            <div class="row" v-if="orderType == 'client'">
                <div class="col-md-4">
                    <label for="customer" class="form-label">Customer :</label>
                    <select id="customer" v-model="orderCustomer" class="form-select" required>
                        <option :value="null">Select a customer</option>
                        <option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.title }}</option>
                    </select>
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
            stockData: [],
            orderItems: [{
                article: null,
                warehouse: null,
                quantity: 1,
                maxQuantity: 0,
                unitPrice: 0,
                linePrice: 0
            }],
            orderType: 'client', 
            selectedWarehouse: null, 
            orderCustomer : null,
            customers : [],
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
        async getCustomers(){
            try{
                const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                const req = await axios.get(`${apiUrl}/customers/all`,{headers : headers})
                this.customers = await req.data
                console.log(this.customers)
            }catch(error){
                console.error("error while getting customers", error)
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
            if (this.orderType === 'client' && !this.orderCustomer) {
            alert("Please select a customer before placing the order.");
            return; // Empêche la soumission du formulaire
        }
            try{
                const customer = this.customers.filter((customer) => customer.id == this.orderCustomer)[0]
                const order = {
                    "orderNumber": "12345",
                    "totalPrice": this.total,
                    "delivery_adress": customer.adresse,
                    "delivery_postcode": customer.codePostal,
                    "delivery_country": customer.pays,
                    "customerId": this.orderCustomer,
                    "stateId": 1,
                    "typeId": 1,
                    "userId": JSON.parse(Cookies.get("user")).id,
                    "articles": this.orderItems.map((article)=> {
                        return {
                            "articleId" : article.article.id,
                            "quantity" : article.quantity,
                            "warehouseId" : article.warehouse.id
                        }
                    })
                }
                console.log(order)



            } catch (error) {
                console.error("Erreur lors de la récupération des articles :", error);
                if (error.response && error.response.status === 404) {
                    this.$router.push("/");
                }
            }
            const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
        },
        generateCustomerOrderData(){
            return {
                idCustomer: this.customers.filter((customer) => customer.id == this.orderCustomer)[0],        
                userId: JSON.parse(Cookies.get("user")).id,            
                typeId: 1,            
                articles: this.orderItems.map((article)=> {
                        return {
                            "articleId" : article.article.id,
                            "quantity" : article.quantity,
                            "warehouseId" : article.warehouse.id
                        }
                    })
            };
        },
        generateSupplierOrderData(){
            const supplierOrderData = {
                userId: JSON.parse(Cookies.get("user")).id,           
                warehouseId: 3,        
                typeId: 1,            
                articles: this.orderItems.map((article)=> {
                    return {
                        "articleId" : article.article.id,
                        "quantity" : article.quantity,
                    }
                })
            };
        }
    },
    async mounted() {
        if (Cookies.get("token") === undefined) this.$router.push("/login");
        await this.getCustomers()
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
