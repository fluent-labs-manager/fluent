import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { canAccess } from '@/router/access.ts';
import { useUserStore } from '@/stores/user.ts';
import { UserRole } from '@/types/UserRole.ts';

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
        // у преподавателя нет страницы дисциплин
        meta: { roles: [UserRole.Student] },
      },
      {
        path: 'courses/:courseId',
        name: 'course-labs',
        component: () => import('@/views/CourseLabsViewingPage.vue'),
        props: (route) => ({ courseId: Number(route.params.courseId) }),
        meta: { roles: [UserRole.Student] },
      },
      {
        path: 'account',
        name: 'account',
        component: () => import('@/views/AccountPage.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Переходы внутри приложения, когда роль уже известна. Если страницу открыли
// по прямой ссылке, роли ещё нет — навигацию не задерживаем (иначе пустой
// экран на время загрузки), а проверку после загрузки пользователя делает
// MainLayout. Это ограничение интерфейса: доступ к данным проверяет бэкенд.
router.beforeEach((to) => {
  const { user } = useUserStore();
  if (user !== null && !canAccess(to, user.role)) {
    return { name: 'home' };
  }
  return true;
});

export default router;
