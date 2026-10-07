import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { installInput } from './composables/useInput';
import './styles/global.css';

installInput();
createApp(App).use(router).mount('#app');
