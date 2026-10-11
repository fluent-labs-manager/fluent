import { describe, expect, it } from 'vitest';

import type {
  RouteLocationNormalized,
  RouteRecordNormalized,
} from 'vue-router';
import { canAccess } from '@/router/access.ts';
import type { UserRole } from '@/types/UserRole.ts';

function routeWith(
  ...roles: (UserRole[] | undefined)[]
): Pick<RouteLocationNormalized, 'matched'> {
  return {
    matched: roles.map(
      (allowed) =>
        ({
          meta: allowed === undefined ? {} : { roles: allowed },
        }) as RouteRecordNormalized,
    ),
  };
}

describe('canAccess', () => {
  it('пускает всех на страницу без ограничений', () => {
    expect(canAccess(routeWith(undefined), 'student')).toBe(true);
    expect(canAccess(routeWith(undefined), 'teacher')).toBe(true);
  });

  it('пускает только перечисленные роли', () => {
    expect(canAccess(routeWith(['student']), 'student')).toBe(true);
    expect(canAccess(routeWith(['student']), 'teacher')).toBe(false);
  });

  it('учитывает ограничение родительского маршрута', () => {
    expect(canAccess(routeWith(['student'], undefined), 'teacher')).toBe(false);
  });
});
