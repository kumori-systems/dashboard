import Vue from 'vue';
import Vuex from 'vuex';

import mutations from './mutations';
import getters from './getters';
import actions from './actions';

Vue.use(Vuex);

export default new Vuex.Store({
    'strict': true, // Cuando se intenta mutar de una forma inadecuada lanza un error
    'state': {
        'menuItemList': [],
        'deploymentList': {},
        'linkList': [],
        'serviceList': {},
        'componentList': {},
        'runtimeList': {},
        'resourceList': {},
        'fabElements': {},
        'selectedService': null,
        'user': null,
        'authError': false,
        'notifications': []
    },
    'getters': getters,
    'mutations': mutations,
    'actions': actions
});