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
        'linkList': [],
        'serviceList': {},
        'componentList': {},
        'resourcesList': {},
        'runtimesList': {},
        'webDomainList': [
            { 'url': 'monitor-ticket740.slap53.iti.es', 'state': 0 },
            { 'url': 'admission-ticket740.slap53.iti.es', 'state': 0 },
            { 'url': 'acs-ticket740.slap53.iti.es', 'state': 0 },
            { 'url': 'another-webdomain.slap53.iti.es', 'state': 0 },
            { 'url': 'another2-webdomain.slap53.iti.es', 'state': 1 },
            { 'url': 'another3-webdomain.slap53.iti.es', 'state': 2 }
        ],
        'certList': ['cert1', 'cert2', 'cert3'],
        'temporaryState': {},
        'fabElements': {},
        'selectedService': null,
        'username': 'eslap.cloud'
    },
    'getters': getters,
    'mutations': mutations,
    'actions': actions
});