import type { RouteLocationNormalized } from 'vue-router';

import type { UserRole } from '@/types/UserRole.ts';

declare module 'vue-router' {
  interface RouteMeta {
    // кому доступна страница
    roles?: UserRole[];
  }
}

// это интерфейс — бэк тоже должен проверять роль и отвечать 403
export function canAccess(
  route: Pick<RouteLocationNormalized, 'matched'>,
  role: UserRole,
): boolean {
  return route.matched.every(
    (record) => record.meta.roles?.includes(role) ?? true,
  );
}
