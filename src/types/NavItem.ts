import type { RouteLocationRaw } from 'vue-router';

import type { IconName } from '@/types/IconName.ts';

// Пункт бокового меню
export interface NavItem {
  label: string;
  icon: IconName;
  // TODO: добавить маршруты, когда появятся соответствующие страницы
  to?: RouteLocationRaw;
}
