import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import FournisseursView from '@/views/FournisseursView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path : "/login",
      name : "login",
      component : LoginView
    },
    {
      path : "/register",
      name : "register",
      component : RegisterView
    },
    {
      path : "/fournisseurs",
      name : "fournisseurs",
      component : FournisseursView
    }
  ]
})

export default router
