import { describe, expect, it } from 'vitest';

import type {
  RouteLocationNormalized,
  RouteRecordNormalized,
} from 'vue-router';
import { canAccess } from '@/router/access.ts';
import { UserRole } from '@/types/UserRole.ts';

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
    expect(canAccess(routeWith(undefined), UserRole.Student)).toBe(true);
    expect(canAccess(routeWith(undefined), UserRole.Teacher)).toBe(true);
  });

  it('пускает только перечисленные роли', () => {
    expect(canAccess(routeWith([UserRole.Student]), UserRole.Student)).toBe(
      true,
    );
    expect(canAccess(routeWith([UserRole.Student]), UserRole.Teacher)).toBe(
      false,
    );
  });

  it('учитывает ограничение родительского маршрута', () => {
    expect(
      canAccess(routeWith([UserRole.Student], undefined), UserRole.Teacher),
    ).toBe(false);
  });
});
