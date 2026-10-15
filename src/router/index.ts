import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';

const routes: RouteRecordRaw[] = [
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
      {
        path: 'courses/:courseId',
        name: 'course-labs',
        component: () => import('@/views/CourseLabsViewingPage.vue'),
        props: (route) => ({ courseId: Number(route.params.courseId) }),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
