import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { canAccess } from '@/router/access.ts';
import { useUserStore } from '@/stores/user.ts';

const routes: RouteRecordRaw[] = [
  {
    // Страницы с боковым меню. Страницы без меню (например, вход)
    // добавляются отдельными маршрутами на верхнем уровне.
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
        meta: { roles: ['student'] },
      },
      {
        path: 'courses/:courseId',
        name: 'course-labs',
        component: () => import('@/views/CourseLabsViewingPage.vue'),
        props: (route) => ({ courseId: Number(route.params.courseId) }),
        meta: { roles: ['student'] },
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
