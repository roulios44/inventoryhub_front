<template>
    <div class="container mt-5">
        <header class="page-header mb-4 text-center">
            <h1>Mon Profil</h1>
        </header>
        <div v-if="user" class="row justify-content-center">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="card-title">{{ user.name }}</h1>

                    <!-- <button v-if="!isEditing" class="btn btn-secondary mt-3" @click="isEditing = true">Modifier</button>
                    <button v-if="isEditing" class="btn btn-primary mt-3" @click="saveChanges">Enregistrer</button> -->

                    <ul class="list-group list-group-flush">
                        <div v-for="(value, key) in user" :key="key">
                            <li v-if="!isHiddenField(key)" class="list-group-item">
                                <strong>{{ formatKey(key) }}:</strong>
                                <span v-if="!isEditing">{{ value }}</span>
                                <input v-if="isEditing && !isReadonlyField(key)" v-model="user[key]"
                                    :type="getInputType(key)" class="form-control" />
                            </li>
                        </div>

                        <!-- Pour chaque relation récupérée via _links -->
                        <li v-for="(relatedData, key) in relatedDataObjects" :key="key" class="list-group-item">
                            <strong>{{ formatKey(key) }}:</strong>
                            <p v-if="relatedData.title">{{ relatedData.title }}</p>
                            <p v-if="relatedData.dscription">{{ relatedData.description }}</p>
                        </li>
                    </ul>

                    <div class="mt-4">
                        <button v-if="isEditing" class="btn btn-danger" @click="cancelEditing">Annuler</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';

const apiUrl = import.meta.env.VITE_API_URL;

export default {
    data() {
        return {
            user: null,
            isEditing: false,
            errorMessage: null,
            relatedDataObjects: {}, // Stocke les données récupérées des relations
        };
    },
    methods: {
        async fetchUserProfile() {
            try {
                const headers = {
                    Authorization: 'Bearer ' + Cookies.get('token'),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                const userEmail = localStorage.getItem("userEmail");
                const req = await axios.get(`${apiUrl}/users/search/findByEmail?email=${userEmail}`, { headers });
                this.user = req.data;

                // Après avoir récupéré le profil utilisateur, charge les données des relations
                this.fetchRelatedData(this.user._links);

            } catch (error) {
                this.errorMessage = "Impossible de charger les informations du profil.";
                console.error('Failed to fetch user profile:', error);
            }
        },
        async fetchRelatedData(links) {
            const headers = {
                Authorization: 'Bearer ' + Cookies.get('token'),
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            };

            for (const [key, linkObj] of Object.entries(links)) {
                if (linkObj.href && key !== 'user' && key !== 'self') {
                    try {
                        const response = await axios.get(linkObj.href, { headers });
                        this.relatedDataObjects[key] = response.data; // Ajoute les données récupérées à l'objet relatedDataObjects
                    } catch (error) {
                        console.error(`Failed to fetch related data for ${key}:`, error);
                    }
                }
            }
        },
        async saveChanges() {
            try {
                const headers = {
                    Authorization: 'Bearer ' + Cookies.get('token'),
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                };
                await axios.put(`${apiUrl}/profile`, this.user, { headers });
                this.isEditing = false;
            } catch (error) {
                this.errorMessage = "Erreur lors de la sauvegarde des modifications.";
                console.error('Error saving profile changes:', error);
            }
        },
        cancelEditing() {
            this.isEditing = false;
            this.fetchUserProfile(); // Recharger les données pour annuler les modifications non sauvegardées
        },
        formatKey(key) {
            return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        },
        isHiddenField(key) {
            return key === 'password' || key === 'id' || key === '_links' || key == "authorities";
        },
        isReadonlyField(key) {
            return key === 'email';
        },
        getInputType(key) {
            if (key === 'email') return 'email';
            if (key === 'phone') return 'tel';
            if (key === 'password') return 'password';
            return 'text';
        }
    },
    async mounted() {
        if (Cookies.get("token") === undefined) this.$router.push("/login");
        await this.fetchUserProfile();
    },
    watch: {
        '$route'() {
            this.fetchUserProfile();
        }
    }
};
</script>

<style scoped>
.card-body {
    width: fit-content;
}

.card-title {
    margin-bottom: 20px;
}

.list-group-item {
    display: flex;
    justify-content: space-between;
}

.btn {
    margin-top: 20px;
}
</style>
