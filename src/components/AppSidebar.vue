<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  Award,
  BookOpen,
  Calculator,
  ChevronDown,
  ClipboardCheck,
  House,
  LayoutGrid,
  Menu,
  Shuffle,
  Sparkles,
  Users,
} from '@lucide/vue';

import type { User } from '@/api/users/User.dto.ts';
import type { NavItem } from '@/types/NavItem.ts';
import { UserRole } from '@/types/UserRole.ts';

const props = defineProps<{
  //null, пока пользователь загружается
  user: User | null;
}>();

const route = useRoute();
const menuOpen = ref(false);
const menuToggle = ref<HTMLButtonElement | null>(null);
const mobileHeader = ref<HTMLElement | null>(null);

const studentNavItems: NavItem[] = [
  { label: 'Главная', icon: House, to: { name: 'home' } },
  { label: 'Дисциплины', icon: BookOpen, to: { name: 'courses' } },
  { label: 'События', icon: Award },
];

// у преподавателя свои разделы и нет страницы «Дисциплины».
// Страниц разделов ещё нет — пункты неактивны, как «События» у студента
const teacherNavItems: NavItem[] = [
  { label: 'Главная', icon: LayoutGrid, to: { name: 'home' } },
  { label: 'Варианты', icon: Shuffle },
  { label: 'ИИ-предфильтр', icon: Sparkles },
  { label: 'Очереди', icon: Users },
  { label: 'Конструктор баллов', icon: Calculator },
  { label: 'Оценивание', icon: ClipboardCheck },
];

// пока роль неизвестна, показываем только общий для обеих ролей пункт,
// чтобы у преподавателя не мелькало меню студента
const loadingNavItems: NavItem[] = [
  { label: 'Главная', icon: House, to: { name: 'home' } },
];

const navItems = computed<NavItem[]>(() => {
  if (props.user === null) {
    return loadingNavItems;
  }
  return props.user.role === UserRole.Teacher
    ? teacherNavItems
    : studentNavItems;
});

function closeMenu(): void {
  menuOpen.value = false;
}

function isMobileHeaderVisible(): boolean {
  return (
    mobileHeader.value !== null &&
    mobileHeader.value.getClientRects().length > 0
  );
}

function closeMenuOnDesktop(): void {
  if (!isMobileHeaderVisible()) {
    closeMenu();
  }
}

function handleKeydown(event: KeyboardEvent): void {
  if (!menuOpen.value) {
    return;
  }

  if (event.key === 'Escape') {
    closeMenu();
    return;
  }

  if (event.key !== 'Tab') {
    return;
  }

  const drawer = document.querySelector<HTMLElement>(
    '.mobile-navigation__drawer',
  );
  const focusableItems = drawer?.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  if (focusableItems === undefined || focusableItems.length === 0) {
    return;
  }

  const firstItem = focusableItems[0];
  const lastItem = focusableItems[focusableItems.length - 1];

  if (event.shiftKey && document.activeElement === firstItem) {
    event.preventDefault();
    lastItem?.focus();
  } else if (!event.shiftKey && document.activeElement === lastItem) {
    event.preventDefault();
    firstItem?.focus();
  }
}

watch(menuOpen, async (isOpen) => {
  if (!isOpen) {
    if (isMobileHeaderVisible()) {
      menuToggle.value?.focus();
    }
    return;
  }

  await nextTick();
  document
    .querySelector<HTMLElement>('.mobile-navigation__drawer a[href]')
    ?.focus();
});

watch(() => route.fullPath, closeMenu);

window.addEventListener('resize', closeMenuOnDesktop);
window.addEventListener('keydown', handleKeydown);
onUnmounted(() => {
  window.removeEventListener('resize', closeMenuOnDesktop);
  window.removeEventListener('keydown', handleKeydown);
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
          <component
            :is="item.icon"
            :size="20"
            class="app-sidebar__icon"
            aria-hidden="true"
          />
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          class="app-sidebar__link"
          aria-disabled="true"
        >
          <component
            :is="item.icon"
            :size="20"
            class="app-sidebar__icon"
            aria-hidden="true"
          />
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
          user.role === UserRole.Teacher ? 'Преподаватель' : user.group
        }}</span>
      </span>
      <ChevronDown
        :size="18"
        class="app-sidebar__icon"
        aria-hidden="true"
      />
    </RouterLink>
  </aside>

  <header
    ref="mobileHeader"
    class="mobile-header"
  >
    <span class="mobile-header__logo">Fluent</span>
    <button
      ref="menuToggle"
      class="mobile-header__toggle"
      type="button"
      aria-label="Основная навигация"
      aria-controls="mobile-navigation-drawer"
      :aria-expanded="menuOpen"
      @click="menuOpen = !menuOpen"
    >
      <Menu
        :size="20"
        class="app-sidebar__icon"
        aria-hidden="true"
      />
    </button>
  </header>

  <div
    v-show="menuOpen"
    class="mobile-navigation__backdrop"
    @click.self="closeMenu"
  >
    <aside
      id="mobile-navigation-drawer"
      class="mobile-navigation__drawer"
    >
      <span class="mobile-navigation__drawer-logo">Fluent</span>

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
            @click="closeMenu"
          >
            <component
              :is="item.icon"
              :size="20"
              class="app-sidebar__icon"
            />
            {{ item.label }}
          </RouterLink>
          <span
            v-else
            class="app-sidebar__link"
          >
            <component
              :is="item.icon"
              :size="20"
              class="app-sidebar__icon"
            />
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
        @click="closeMenu"
      >
        <span class="app-sidebar__avatar"></span>
        <span class="app-sidebar__user-info">
          <span class="app-sidebar__user-name">{{ user.name }}</span>
          <span class="app-sidebar__user-group">{{
            user.role === UserRole.Teacher ? 'Преподаватель' : user.group
          }}</span>
        </span>
        <ChevronDown
          :size="18"
          class="app-sidebar__icon"
        />
      </RouterLink>
    </aside>
  </div>
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

.app-sidebar__icon {
  flex-shrink: 0;
}

.app-sidebar__link--active .app-sidebar__icon {
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

.mobile-header {
  display: none;
}

.mobile-navigation__backdrop {
  position: fixed;
  z-index: 3;
  inset: 0;
  display: flex;
  background-color: var(--color-backdrop);
}

.mobile-navigation__drawer {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: min(18.5rem, 85vw);
  height: 100%;
  padding: 1.25rem;
  background-color: var(--color-sidebar);
  box-shadow: var(--shadow-card);
  animation: mobile-navigation-enter 0.2s ease-out;
}

.mobile-navigation__drawer-logo {
  padding-left: 0.25rem;
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: var(--page-title-line-height);
  text-transform: uppercase;
}

@keyframes mobile-navigation-enter {
  from {
    opacity: 0;
    transform: translateX(-1rem);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (width <= 768px) {
  .app-sidebar {
    display: none;
  }

  .mobile-header {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 4rem;
    padding: 0.5rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-sidebar);
  }

  .mobile-header__logo {
    font-size: var(--font-size-4xl);
    font-weight: 700;
    text-transform: uppercase;
  }

  .mobile-header__toggle {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 0.7rem;
    background-color: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
  }
}
</style>
