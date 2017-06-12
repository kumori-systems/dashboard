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
        'componentList': {
            'eslap://eslap.cloud/components/monitor/0_0_1': {
                'proChannels': {
                    'sedpest': {
                        'connectedTo': [
                            {
                                'channelName': 'http-monitor',
                                'rolName': undefined
                            }
                        ],
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0'
                    }
                },
                'reqChannels': {},
                'resourcesConfig': {},
                'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1'
            },
            'eslap://eslap.cloud/components/monitor/0_0_2': {
                'proChannels': {
                    'sedpest': {
                        'connectedTo': [
                            {
                                'channelName': 'http-monitor',
                                'rolName': undefined
                            }
                        ],
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0'
                    }
                },
                'reqChannels': {},
                'resourcesConfig': {},
                'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1'
            },
            'eslap://eslap.cloud/components/monitor/0_1_0': {
                'proChannels': {
                    'sedpest': {
                        'connectedTo': [
                            {
                                'channelName': 'http-monitor',
                                'rolName': undefined
                            }
                        ],
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0'
                    }
                },
                'reqChannels': {},
                'resourcesConfig': {},
                'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1'
            },
            'eslap://eslap.cloud/components/monitor/0_1_1': {
                'proChannels': {
                    'sedpest': {
                        'connectedTo': [
                            {
                                'channelName': 'http-monitor',
                                'rolName': undefined
                            }
                        ],
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0'
                    }
                },
                'reqChannels': {},
                'resourcesConfig': {},
                'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1'
            }
        },
        'resourceList': {},
        'runtimeList': {},
        'webDomainList': [
            { 'url': 'monitor-ticket740.slap53.iti.es', 'state': 0 },
            { 'url': 'admission-ticket740.slap53.iti.es', 'state': 0 },
            { 'url': 'acs-ticket740.slap53.iti.es', 'state': 0 },
            { 'url': 'another-webdomain.slap53.iti.es', 'state': 0 },
            { 'url': 'another2-webdomain.slap53.iti.es', 'state': 1 },
            { 'url': 'another3-webdomain.slap53.iti.es', 'state': 2 }
        ],
        'certList': ['cert1', 'cert2', 'cert3'],
        'fabElements': {},
        'selectedService': null,
        'username': 'eslap.cloud'
    },
    'getters': getters,
    'mutations': mutations,
    'actions': actions
});