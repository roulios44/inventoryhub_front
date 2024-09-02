import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ListConsultView from "@/views/ListConsultView.vue";
import DetailsView from "@/views/DetailsView.vue";
import OrderView from "@/views/OrderView.vue";
import OutStockView from "@/views/OutStockView.vue"

import CreateComponent from "@/components/CreateComponent.vue";
import ProfileView from "@/views/ProfileView.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/create/:type",
      name: "create",
      component: CreateComponent,
    },
    {
      path: "/:type",
      name: "consultList",
      component: ListConsultView,
    },
    {
      path: "/:type/details/:entityID",
      name: "details",
      component: DetailsView,
    },
    {
      path : "/profile",
      name : "profile",
      component: ProfileView,
    },
    {
      path : "/order",
      name : "order",
      component : OrderView,
    },
    {
      path : "/outstock",
      name : "outstock",
      component : OutStockView
    }
  ],
});

export default router;
