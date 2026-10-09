<script setup lang="ts">
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import type { User } from '@/api/users/User.dto.ts';
import type { NavItem } from '@/types/NavItem.ts';

const props = defineProps<{
  //null, пока пользователь загружается
  user: User | null;
}>();

const studentNavItems: NavItem[] = [
  { label: 'Главная', icon: 'home', to: { name: 'home' } },
  { label: 'Дисциплины', icon: 'book', to: { name: 'courses' } },
  { label: 'Лабораторные', icon: 'flask' },
  { label: 'События', icon: 'award' },
];

// у преподавателя свои разделы и нет страницы «Дисциплины».
// Страниц разделов ещё нет — пункты неактивны, как «Лабораторные» у студента
const teacherNavItems: NavItem[] = [
  { label: 'Главная', icon: 'layout-grid', to: { name: 'home' } },
  { label: 'Варианты', icon: 'shuffle' },
  { label: 'ИИ-предфильтр', icon: 'sparkles' },
  { label: 'Очереди', icon: 'users' },
  { label: 'Конструктор баллов', icon: 'sparkles' },
  { label: 'Оценивание', icon: 'clipboard-check' },
];

// пока роль неизвестна, показываем только общий для обеих ролей пункт,
// чтобы у преподавателя не мелькало меню студента
const loadingNavItems: NavItem[] = [
  { label: 'Главная', icon: 'home', to: { name: 'home' } },
];

const navItems = computed<NavItem[]>(() => {
  if (props.user === null) {
    return loadingNavItems;
  }
  return props.user.role === 'teacher' ? teacherNavItems : studentNavItems;
});
</script>

<template>
  <aside class="app-sidebar">
    <span class="app-sidebar__logo">Fluent</span>

    <nav class="app-sidebar__nav">
      <template
        v-for="item in navItems"
        :key="item.label"
      >
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="app-sidebar__link"
          exact-active-class="app-sidebar__link--active"
        >
          <AppIcon :name="item.icon" />
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          class="app-sidebar__link"
          aria-disabled="true"
        >
          <AppIcon :name="item.icon" />
          {{ item.label }}
        </span>
      </template>
    </nav>

    <RouterLink
      v-if="user"
      class="app-sidebar__user"
      exact-active-class="app-sidebar__user--active"
      :to="{ name: 'account' }"
      title="Личный кабинет"
    >
      <span
        class="app-sidebar__avatar"
        aria-hidden="true"
      ></span>
      <span class="app-sidebar__user-info">
        <span class="app-sidebar__user-name">{{ user.name }}</span>
        <span class="app-sidebar__user-group">{{
          user.role === 'teacher' ? 'Преподаватель' : user.group
        }}</span>
      </span>
      <AppIcon
        name="chevron-down"
        :size="18"
      />
    </RouterLink>
  </aside>
</template>

<style scoped>
.app-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: var(--page-header-gap);
  width: 18.5rem;
  height: 100vh;
  padding: var(--page-offset-top) 1.5rem 1.75rem;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-sidebar);
}

/* высота строки совпадает с заголовком страницы, чтобы логотип стоял с ним на одном уровне */
.app-sidebar__logo {
  padding-left: 0.25rem;
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
  text-transform: uppercase;
}

.app-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.8em;
  height: var(--nav-item-height);
  padding: 0 1em;
  border-radius: 0.7em;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xl);
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.app-sidebar__link:hover {
  background-color: var(--color-muted-surface);
}

.app-sidebar__link--active {
  background-color: var(--color-accent-surface);
  color: var(--color-text);
  font-weight: 700;
}

.app-sidebar__link--active .app-icon {
  color: var(--color-accent);
}

.app-sidebar__user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  padding: 0.75rem 1rem 0.75rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background-color: var(--color-surface);
  color: var(--color-text);
  text-decoration: none;
  transition: border-color 0.2s ease;
}

.app-sidebar__user:hover,
.app-sidebar__user--active {
  border-color: var(--color-accent);
}

.app-sidebar__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: var(--color-accent-surface);
}

.app-sidebar__user-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.125rem;
}

.app-sidebar__user-name {
  font-size: var(--font-size-md);
  font-weight: 700;
}

.app-sidebar__user-group {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}
</style>
