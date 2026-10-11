import type { RouteLocationNormalized } from 'vue-router';

import type { UserRole } from '@/types/UserRole.ts';

declare module 'vue-router' {
  interface RouteMeta {
    // кому доступна страница; без поля — всем
    roles?: UserRole[];
  }
}

// доступна ли страница пользователю с этой ролью. Учитываются и родительские
// маршруты: ограничение на разделе действует на все его страницы
export function canAccess(
  route: Pick<RouteLocationNormalized, 'matched'>,
  role: UserRole,
): boolean {
  return route.matched.every(
    (record) => record.meta.roles?.includes(role) ?? true,
  );
}
