import Vue from 'vue';
import Vuex from 'vuex';

import mutations from './mutations';
import getters from './getters';
import actions from './actions';

import menu from './modules/menu';

Vue.use(Vuex);

export default new Vuex.Store({
    strict: true, // Cuando se intenta mutar de una forma inadecuada lanza un error
    'state': {
        sidebar: {
            opened: true,
            hidden: false
        },
        stampState: {},
        hideEntrypoints: false
    },
    'getters': getters,
    'mutations': mutations,
    'actions': actions,
    'modules': {
        'menu': menu
    }
});