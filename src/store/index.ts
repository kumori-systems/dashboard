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
            'domain': undefined,
            'name': undefined,
            'state': undefined
        },
        'alerts': [],
        'menuItemList': [
            {

                name: 'Overview',
                path: '/',
                meta: { expanded: false },
                component: Overview,
            },
            {
                name: 'Elements',
                path: '/elements',
                meta: { expanded: false },
                component: Elements
            },
            {
                name: 'Domains',
                path: '/domains',
                meta: { expanded: false },
                component: Domains
            },
            {
                name: 'Data volumes',
                path: '/dataVolumes',
                meta: { expanded: false },
                component: DataVolumes
            },
            {
                name: 'Alarms & logs',
                path: '/alarmsAndLogs',
                meta: { expanded: false },
                component: AlarmsAndLogs
            },
            {
                name: 'Help',
                path: '/help',
                meta: { expanded: false },
                component: Help
            }
        ],
        'deploymentList': {},
        'linkList': [],
        'serviceList': {},
        'componentList': {},
        'runtimeList': {},
        'resourceList': {},
        'fabElements': {},
        'selectedService': null // Identifies the selected service from elements to add Service
    },
    'getters': getters,
    'mutations': mutations,
    'actions': actions
});