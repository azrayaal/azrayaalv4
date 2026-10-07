import { createRouter, createWebHashHistory } from 'vue-router';
import HomeScreen from './screens/HomeScreen.vue';

/**
 * Hash history keeps every screen deep-linkable on any static host — no
 * rewrite rules needed.
 */
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeScreen },
    { path: '/whats-new', component: () => import('./screens/WhatsNewScreen.vue') },
    { path: '/project/:slug', component: () => import('./screens/ProjectScreen.vue') },
    { path: '/library', component: () => import('./screens/LibraryScreen.vue') },
    { path: '/trophies', component: () => import('./screens/TrophiesScreen.vue') },
    { path: '/profile', component: () => import('./screens/ProfileScreen.vue') },
    { path: '/friends', component: () => import('./screens/FriendsScreen.vue') },
    { path: '/messages', component: () => import('./screens/MessagesScreen.vue') },
    { path: '/notifications', component: () => import('./screens/NotificationsScreen.vue') },
    { path: '/settings', component: () => import('./screens/SettingsScreen.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
