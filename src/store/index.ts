import Vue from 'vue';
import Vuex from 'vuex';

import mutations from './mutations';
import getters from './getters';
import actions from './actions';

Vue.use(Vuex);
import { Overview, DeploymentItem, AlarmsAndLogs, DataVolumes, Elements, Help, Domains } from '../components';
export default new Vuex.Store({
    'strict': true, // Cuando se intenta mutar de una forma inadecuada lanza un error
    'state': {
        'user': {
            'id': undefined,
            'name': undefined,
            'state': undefined
        },
        'alerts': [],
        'deploymentList': {},
        'serviceList': {},
        'componentList': {},
        'runtimeList': {},
        'domainList': {},
        'volumeList': {},
        'certList': {},
        'fabElements': {},
        'selectedService': null // Identifies the selected service from elements to add Service
    },
    'getters': getters,
    'mutations': mutations,
    'actions': actions
});