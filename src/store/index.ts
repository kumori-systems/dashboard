import Vue from 'vue';
import Vuex from 'vuex';

import manifesteditor from './manifesteditor';
import pagestate from './pagestate';
import stampstate from './stampstate';

Vue.use(Vuex);

export default new Vuex.Store({
  /*
    The strict mode is an important feature which ensures one of the basis of
    the flux pattern implemented in vuex. https://vuex.vuejs.org/en/strict.html
  */
  // 'strict': process.env.NODE_ENV !== 'production',
  strict: true,
  'modules': {
    pagestate,
    stampstate,
    manifesteditor
  }
});