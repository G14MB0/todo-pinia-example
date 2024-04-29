<!-- 
  Main update on this file:
  - add a logout button to handle logout, conditionally rendered only when isLoggedIn is true
  - add Logout funcion to update the logged state (global state) when logout button is pressed
  - add css to header layout to place logout apart from header menu
 -->



<template>
  <Layout>
    <LayoutHeader class="header">
      <div>
      <RouterLink class="link" to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </div>
    <template v-if="isLoggedIn">
    <div>
      <Button
        @click="handleLogOut"
      >
        Log Out
      </Button>
    </div>
  </template>
    </LayoutHeader>
    <LayoutContent class="content">
      <slot></slot>
    </LayoutContent>
  </Layout>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  TypographyTitle,
  Menu,
  MenuItem,
  Button,
} from 'ant-design-vue';

import { removeItem, storageState } from '@/stores/token';
import { computed } from 'vue';


const isLoggedIn = computed(() => storageState.token !== null);

function handleLogOut() {
  removeItem("token")
}
</script>

<style scoped>
.content {
  padding: 0 20px;
  max-width: 800px;
  min-height: calc(100vh - 64px);
  width: 95%;
  margin: 0 auto;
}
.link {
  margin-right: 15px;
}

.header {
  display: flex;
  justify-content: space-between;
}
</style>
