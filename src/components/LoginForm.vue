<!-- 
    NEW FILE:
    - Login form: username and password required to login
    - handleLogin function to handle the login after form submission
    - global reactive state is updated with "token" key. logic detailed in "tokens.ts" file
    - just for this purpose, the signUp logic is handled automatically if the server responds with "this user does not exists"
        so this form has a double usage. (logic described inline in handleLogin function)
        In a common situation I won't use (backend side) a different response for invalid credential and user not found to make 
        things more private
 -->


<template>
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
    </form>
  </template>
  
  <script setup lang="ts">
    import { ref } from 'vue';
    import { Input, Button } from 'ant-design-vue';
    import axios from 'axios';
    import { API_URL } from '@/main';
    import { setItem } from '@/stores/token';
    
    const username = ref('');
    const password = ref('');

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
            }
            else { // This is usually never called since the server response with an error status but is generally needed in case of other non-error status
                console.log("NOT LOGGED")
            }
        }).catch((error) => {
            // in case of error, the server respond with 404 if the email is not present in the database -> create a new user
            console.log(error)
            if (error.response.status === 404) {
                // create a variable with body of the request
                const new_user = {
                    email: username.value,
                    password: password.value,
                    name: "default"
                }
                axios.post(`${API_URL}/users/`, new_user).then((response) => {
                    // If the user creation request is ok (201) procede again with login of the new user using same credential
                    if (response.status === 201) {
                        console.log("NEW USER CREATED")
                        axios.post(`${API_URL}/login/`, form_data).then((response) => {
                            if (response.status === 200) {
                                console.log("LOGGED")
                                setItem("token", response.data.access_token)
                            }})
                    }
                    else { // this path is never reached in this case since all the case are handled with other paths.
                        console.log("USER CREATION FAIL")
                    }
                })
            }
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

.input {
    margin: 4px 0;
    border-radius: 5px;
}

</style>