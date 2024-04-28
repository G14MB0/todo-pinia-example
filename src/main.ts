import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import './assets/main.css';
import 'ant-design-vue/dist/antd.css';

export const API_URL = 'http://127.0.0.1:5174/api/v1'

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
