import overview from './overview';
import deployments from './deployments';
import storage from './storage';
import webDomains from './webDomains';
import dataVolumes from './dataVolumes';
import alarmsAndLogs from './alarmsAndLogs';
import help from './help';

const state: any = {
    menuitems: [overview, deployments, storage, webDomains, dataVolumes, alarmsAndLogs, help]
};

const getters: any = {
    menuitems: function (state) {
        return state.menuitems;
    }
};

const mutations: any = {

};

export default {
    'state': state,
    'getters': getters,
    'mutations': mutations
};