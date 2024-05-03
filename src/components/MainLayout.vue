<!-- 
  Main update on this file:
  - add a logout button to handle logout, conditionally rendered only when isLoggedIn is true
  - add Logout funcion to update the logged state (global state) when logout button is pressed
  - add css to header layout to place logout apart from header menu
 -->



<template>
  <Layout>
    <LayoutHeader class="header">
      <div style="display: flex; align-items: center;">
        <RouterLink class="link" to="/">Home</RouterLink>
        <RouterLink class="link" to="/about">About</RouterLink>
      </div>
      <template v-if="isLoggedIn">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <Typography style="padding: 0 20px; color: #555555;"> user: {{ storageState.name }} </Typography>
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
  Typography,
  Menu,
  MenuItem,
  Button,
} from 'ant-design-vue';

import { removeItem, storageState } from '@/stores/token';
import { computed } from 'vue';


const isLoggedIn = computed(() => storageState.token !== null);

function handleLogOut() {
  removeItem("token")
  removeItem("name")
}
</script>

<style scoped>
.content {
  padding: 0 20px;
  max-width: 800px;
  min-height: calc(100vh - 44px);
  width: 95%;
  margin: 0 auto;
}
.link {
  margin-right: 15px;
  color: rgb(5, 5, 5);
}

.header {
  display: flex;
  justify-content: space-between;
  background-color: #e4e4e4;
}

.ant-layout-header {
  height: 44px;
}
</style>
