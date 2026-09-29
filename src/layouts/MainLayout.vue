<script setup lang="ts">
import { RouterView } from 'vue-router';

import AppSidebar from '@/components/AppSidebar.vue';
import { useUserStore } from '@/stores/user.ts';

const userStore = useUserStore();

// Запускаем в setup, а не в onMounted: дочерняя страница монтируется раньше
// раскладки и должна сразу видеть, что пользователь загружается.
void userStore.loadUser();
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
