import { getDeployments as getDepl } from './../connection';
export default {
    expandMenu({ commit }) {
        commit('expandMenu');
    },
    getDeployments({ commit }) {
        getDepl().then(function ({ deploymentList }) {
            commit('setDeployments', { deploymentList });
        });
    }
};