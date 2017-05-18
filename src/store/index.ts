import Vue from 'vue';
import Vuex from 'vuex';

import mutations from './mutations';
import getters from './getters';
import actions from './actions';

/* MENU */
import menuItemList from './../menu';

Vue.use(Vuex);

export default new Vuex.Store({
    'strict': true, // Cuando se intenta mutar de una forma inadecuada lanza un error
    'state': {
        'menuItemList': menuItemList,
        'deploymentList': {},
        'serviceList': {},
        'hideEntrypoints': false,
        'temporaryState': {},
        'fabElements': {}
    },
    'getters': getters,
    'mutations': mutations,
    'actions': actions
});