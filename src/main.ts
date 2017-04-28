// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';

import router from './router';
import store from './store';

// store keeps routes
import { sync } from 'vuex-router-sync'; 
sync(store, router) ;


// Con compilador
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
});

/* sin compilador <-Este es el recomendado
// Sin compilador. Este es el recomendado
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
*/
