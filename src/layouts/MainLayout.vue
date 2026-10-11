<script setup lang="ts">
import { watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';

import AppSidebar from '@/components/AppSidebar.vue';
import { canAccess } from '@/router/access.ts';
import { useUserStore } from '@/stores/user.ts';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

// Запускаем в setup, а не в onMounted: дочерняя страница монтируется раньше
// раскладки и должна сразу видеть, что пользователь загружается.
void userStore.loadUser();

// Страницу открыли по прямой ссылке до того, как стала известна роль:
// когда пользователь загрузится, уводим со страницы, которая ему недоступна
watch(
  () => [userStore.user?.role, route.fullPath] as const,
  ([role]) => {
    if (role !== undefined && !canAccess(route, role)) {
      void router.replace({ name: 'home' });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="main-layout">
    <AppSidebar :user="userStore.user" />

    <div class="main-layout__content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
}

.main-layout__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
</style>
