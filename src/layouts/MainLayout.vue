<script setup lang="ts">
import { RouterView } from 'vue-router';

import AppSidebar from '@/components/AppSidebar.vue';
import { currentUser } from '@/mocks/user.ts';
</script>

<template>
  <div class="main-layout">
    <AppSidebar :user="currentUser" />

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
