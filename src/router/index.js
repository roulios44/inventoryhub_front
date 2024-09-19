import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ListConsultView from "@/views/ListConsultView.vue";
import DetailsView from "@/views/DetailsView.vue";
import OrderView from "@/views/OrderView.vue";
import OutStockView from "@/views/OutStockView.vue"
import OrderListView from "@/views/OrderListView.vue";
import CreateComponent from "@/components/CreateComponent.vue";
import ProfileView from "@/views/ProfileView.vue";
import OrderDetailsView from "@/views/OrderDetailsView.vue";
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
      path : "/create/order",
      name : "createOrder",
      component : OrderView,
    },
    {
      path : "/outstock",
      name : "outstock",
      component : OutStockView
    },
    {
      path : "/orders",
      name : "orders",
      component : OrderListView
    },
    {
      path : "/order/details/:type/:id",
      name : "detailsOrder",
      component : OrderDetailsView

    }
  ],
});

export default router;
