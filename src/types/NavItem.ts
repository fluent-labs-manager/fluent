import type { Component } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

// Пункт бокового меню
export interface NavItem {
  label: string;
  // иконка из @lucide/vue
  icon: Component;
  // TODO: добавить маршруты, когда появятся соответствующие страницы
  to?: RouteLocationRaw;
}
