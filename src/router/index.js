// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/',
    name: 'trading',
    component: () => import('@/views/TradingView.vue'),
  },
    {
    path: '/trying',
    name: 'trying',
    component: () => import('@/views/TryTrading.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
