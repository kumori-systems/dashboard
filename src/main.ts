import Vue from 'vue';
import App from './App.vue';

import router from './router';
import store from './store';

// store keeps routes
import { sync } from 'vuex-router-sync';
sync(store, router);

require('./assets/config.json');

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});

