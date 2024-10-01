<template>
    <div class="container mt-5">
        <header class="page-header mb-4 text-center">
            <h1>{{ type }}</h1>
        </header>
        <div v-if="entity" class="row justify-content-center" style="margin-left: 20px;">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="card-title">{{ entity.title || `${formatKey(this.type)}` }}</h1>

                    <ul class="list-group list-group-flush">
                        <div v-for="(value, key) in entity" :key="key">
                            <li class="list-group-item"
                                v-if="key != 'userId' && key != 'warehouseId' && key != 'typeId'">
                                <div v-if="Array.isArray(value)">
                                    <!-- Afficher chaque élément du tableau -->
                                    <div v-for="(item, index) in value" :key="index">
                                        <strong>{{ item.title }}</strong>
                                        <div v-if="typeof item === 'object'">
                                            <!-- Afficher les propriétés de chaque objet dans le tableau -->
                                            <ul>
                                                <div v-for="(subValue, subKey) in item" :key="subKey">
                                                    <li
                                                        v-if="subKey != '_links' && subKey != 'id' && subKey != 'orderNumber' && subKey != 'title'">
                                                        <strong>{{ subKey }}</strong> : {{ subValue }}
                                                    </li>
                                                </div>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div v-else-if="key == 'warehouse'">
                                    <strong>{{ formatKey(key) }} : </strong>
                                    <span> {{ value.title }}</span>
                                </div>
                                <div v-else-if="key == 'user'">
                                    <strong>{{ formatKey(key) }} : </strong>
                                    <span> {{ value.email }}</span>
                                </div>
                                <div v-else-if="key == 'type'">
                                    <strong>{{ formatKey(key) }} : </strong>
                                    <span> {{ value.title }}</span>
                                </div>
                            </li>
                        </div>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Intégration du composant PDF -->
        <PDFGeneratorComponent v-if="entity" :entity="entity" />
        <FooterComponent />
    </div>
</template>


<script>
import axios from "axios";
import Cookies from 'js-cookie';
import FooterComponent from "./FooterComponent.vue";
import PDFGeneratorComponent from './PDFGeneratorComponent.vue'; // Import du composant PDF

const apiUrl = import.meta.env.VITE_API_URL;

export default {
    data() {
        return {
            type: "order",
            orderType: null,
            entityID: null,
            entity: null,
            isEditing: false,
            openCollapses: {},
            relatedEntity: {}
        };
    },
    methods: {
        geOrderType() {
            return this.$route.params.type;
        },
        getEntityID() {
            return this.$route.params.id;
        },
        async getArticleName(index) {
            try {
                const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                const req = await axios.get(`${apiUrl}/articles/${index}`, { headers: headers })
                const res = await req.data
                return res.title
            } catch (e) {
                console.log(e)
            }
        },
        async getEntry() {
            try {
                const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                const req = await axios.get(`${apiUrl}/${this.orderType === "supplier" ? "supplierOrders" : "clientOrders"}/${this.entityID}`, { headers: headers });
                this.entity = req.data;
                this.entity.links = this.entity._links;
                await this.getRelatedInfo()
                this.entity.articles.forEach(async (art) => {
                    art.title = await this.getArticleName(art.articleId)
                });
                delete this.entity._links;
            } catch (error) {
                if (error.response && (error.response.status === 404 || error.response.status === 403)) {
                    this.$router.push("/");
                }
            }
        },
        async reloadEntity() {
            this.orderType = this.geOrderType();
            this.entityID = this.getEntityID();
            await this.getEntry();
        },
        formatKey(key) {
            return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        },
        async getRelatedInfo() {
            try {
                const headers = {
                    "Authorization": "Bearer " + Cookies.get("token"),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                const reqWarehouse = await axios.get(`${apiUrl}/warehouses/${this.entity.warehouseId}`)
                const reqUser = await axios.get(`${apiUrl}/users/${this.entity.userId}`)
                const reqType = await axios.get(`${apiUrl}/types/${this.entity.typeId}`)
                this.entity.warehouse = await reqWarehouse.data
                this.entity.user = await reqUser.data
                this.entity.type = await reqType.data
            } catch (e) {
                console.error(e)
            }
        }
    },
    components: {
        FooterComponent,
        PDFGeneratorComponent // Enregistrement du composant PDF
    },
    async mounted() {
        if (!Cookies.get("token")) this.$router.push("/login");
        await this.reloadEntity();
    },
    watch: {
        '$route'() {
            this.reloadEntity();
        }
    }
};
</script>

<style scoped>
.card-body {
    width: fit-content;
    min-width: 300px;
}

.card-title {
    margin-bottom: 20px;
}

.list-group-item {
    display: flex;
    justify-content: space-between;
}

button {
    margin-top: 20px;
    padding: 10px 20px;
    font-size: 16px;
    color: #fff;
    background-color: #e91e63;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #d81b60;
}

.form-control {
    width: 100%;
}
</style>