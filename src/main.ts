// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';

// Router for Vue
import router from './router';

// Store for Vue
import store from './store';

// Sync store with router
import { sync } from 'vuex-router-sync';
sync(store, router);

// Material Component Framework for Vue.js 2
import Vuetify from 'vuetify';
Vue.use(Vuetify);

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});