import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
// Страницы с боковым меню. Страницы без меню (например, вход)
// добавляются отдельными маршрутами на верхнем уровне.
const routes: RouteRecordRaw[] = [
  // Верхний уровень
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthPage.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegistrationRolePage.vue'),
  },
  {
    path: '/registration-details',
    name: 'registration-details',
    component: () => import('@/views/RegistrationDetailsPage.vue'),
  },

  // внутренние страницы с боковым меню
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomePage.vue'),
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('@/views/YourCoursesPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
