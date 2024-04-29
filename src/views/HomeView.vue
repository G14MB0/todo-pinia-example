<!-- 
  Main update on this file:
  - Add a login form, conditinally rendered based on "isLoggedIn" status in place of <TodoApp />.
  - Add checkLogin() logic to verify at mount if the use is already logged (based on Bearer token presence in localStorage && token freshness)
  - use a reactive storage to handle live modification in the state.
 -->


<template>
  <div>
    <!-- Display the login/sign-in component if not logged in -->
    <template v-if="!isLoggedIn">
      <LogInSignInComponent @login-success="checkLogin" />
    </template>
    <!-- Display the Todo application if logged in -->
    <TodoApp v-else />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import TodoApp from '@/components/TodoApp.vue';
import LogInSignInComponent from '@/components/LoginForm.vue'; // Ensure this is the correct import path
import axios from 'axios';
import { API_URL } from '@/main';
import { storageState, setItem, getItem } from '@/stores/token';
import { useTodoStore } from '@/stores/todo';


// State variable for login status, updated when storageState.token change (globally)
const isLoggedIn = computed(() => storageState.token !== null);
const store = useTodoStore();

// Function to check for a valid token and user identity
// - check if key "token" exists
// - if exists, check on server if token is expired -> clear the "token" key in localStorage
function checkLogin() {
  const token = getItem('token'); 
  if (!token) {
    storageState.token = null; 
    return;
  }
  
  axios.get(`${API_URL}/users/identity`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(response => {
    if (response.status !== 200) {
      storageState.token = null; // Clear token on authentication failure. if previous token was present, is expired!
    } else {
      store.fetchTodos()
    }
  }).catch(error => {
    console.error('Authentication error:', error);
    storageState.token = null; // Clear token on error
  });
}

// Call checkLogin on component mount to handle page refreshes or initial load
onMounted(() => {
  checkLogin();
});
</script>

