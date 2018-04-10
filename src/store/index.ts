import Vue from 'vue';
import Vuex from 'vuex';

import manifesteditor from './manifesteditor';
import pagestate from './pagestate';
import stampstate from './stampstate';

Vue.use(Vuex);

export default new Vuex.Store({
  'strict': true, // Strict way of making changes to the store
  'modules': {
    pagestate,
    stampstate,
    manifesteditor
  }
});