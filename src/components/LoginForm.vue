<!-- 
    NEW FILE:
    - Login form: username and password required to login
    - handleLogin function to handle the login after form submission
    - global reactive state is updated with "token" key. logic detailed in "tokens.ts" file
 -->


<template>
    <div class="signin-header">
        <div>
            Log In
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: small;">
            <div style="margin-right: 10px;">
                New user?
            </div>
            <div style="cursor: pointer; color: blue;" @click="$emit('show-sign-in')">
                Sign Up
            </div>
        </div>
    </div>
    <form class="signin-form" @submit.prevent="handleLogin">
      <Input
        v-model:value="username"
        class="input"
        placeholder="Enter username"
        required
        type="text"
      />
      <Input
        v-model:value="password"
        class="input"
        placeholder="Enter password"
        required
        type="password"
      />
      <Button type="primary" class="input" html-type="submit">
        Log In
      </Button>
      <div v-if="errorMessage" style=" color: rgba(168, 0, 0, 0.575);">
        Error: {{ errorMessage }}
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
    import { ref } from 'vue';
    import { Input, Button } from 'ant-design-vue';
    import axios from 'axios';
    import { API_URL } from '@/main';
    import { setItem } from '@/stores/token';
    
    const emit = defineEmits(['login-success', "show-sign-in"]);
    const username = ref('');
    const password = ref('');

    const errorMessage = ref('');

    function handleLogin() {

        // A new FormData is created with username and password
        const form_data = new FormData()

        form_data.append("username", username.value)
        form_data.append("password", password.value)


        // Login endpoint called with form_data
        axios.post(`${API_URL}/login/`, form_data).then((response) => {

            // if response is ok (200), set the global "token" key
            if (response.status === 200) {
                console.log("LOGGED")
                setItem("token", response.data.access_token)
                setItem("name", username.value)
                emit('login-success')
            }
            else { // This is usually never called since the server response with an error status but is generally needed in case of other non-error status
                console.log("NOT LOGGED")
                console.log(response.data.detail)
                errorMessage.value = response && response.data.detail ? response.data.detail : "Failed to log in.";
            }
        }).catch((error) => {
            // in case of error, the server respond with 404 if the email is not present in the database -> create a new user
            console.log(error)
            console.log("USER CREATION FAIL")
            errorMessage.value = error.response && error.response.data.detail ? error.response.data.detail : "Failed to log in.";
        })
    }

    
</script>
<style scoped>

.signin-form {
    display: flex;
    flex-direction: column;
    max-width: 600px;
    margin: 10px auto;
}

.signin-header {
    display: flex;
    justify-content: space-between;
    max-width: 600px;
    margin: 10px auto;
    font-size: medium;
}

.input {
    margin: 4px 0;
    border-radius: 5px;
}

</style>