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
    <div class="signin-header">
        <div>
            Sign Up
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: small;">
            <div style="margin-right: 10px;">
                Already Have an Account?
            </div>
            <div style="cursor: pointer; color: blue;" @click="$emit('back-to-login')">
                Log In
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
        Create New Account
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
    
    const emit = defineEmits(['signup-success', 'back-to-login']);

    const username = ref('');
    const password = ref('');

    const errorMessage = ref('');



    function handleLogin() {

        // clear error value
        errorMessage.value = '';

        // This form data will be used to auto login after signUp
        const form_data = new FormData()

        form_data.append("username", username.value)
        form_data.append("password", password.value)

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
                        setItem("name", username.value)
                    }})
            }
            else { // this path is never reached in this case since all the case are handled with other paths.
                console.log("USER CREATION FAIL")
                console.log(response.data.detail)
                errorMessage.value = response && response.data.detail ? response.data.detail : "Failed to log in.";
            }
        }).catch((error) => {
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