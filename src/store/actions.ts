import * as connection from './proxy';
import { DeploymentItem } from './../components';
import { Deployment } from './classes';

export default {
    getStampState({ dispatch, commit }, { vueInstanceReference }) {
        connection.getStampState().then(function ({ deploymentList, serviceList }) {
            // Guardamos los deployments en el estado
            commit('setStampState', { deploymentList, serviceList });
            // añadimos cada deployment como un deploymentMenuItem
            let res = [];
            let path: string;
            for (let key in deploymentList) {
                path = key;
                let index = path.indexOf('/');
                while (index !== -1) {
                    path = path.replace('/', '\\');
                    index = path.indexOf('/');
                }
                res.push({
                    'name': deploymentList[key].name,
                    'path': 'deployments\\' + path,
                    'meta': {
                        'id': key
                    }
                });
            }
            commit('addDeploymentMenuItem', { 'deploymentList': res });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error manejando los deployments: ' + error);
        });
    },
    setFabElements({ commit }, { fabElementsList }) {
        commit('setFabElements', { fabElementsList });
    },

    toggleMenuItemExpanded({ commit }, { menuItem }) {
        commit('toggleMenuItemExpanded', menuItem);
    },

    hideEntrypoints({ commit }, { }) {
        commit('hideEntrypoints', {});
    },
    undeployDeployment({ commit }, { deploymentId }) {
        connection.undeployDeployment(deploymentId);
    },
    changeTemporaryState({ commit }, { deploymentId, rolId, numInstances }) {
        commit('changeTemporaryState', { deploymentId, rolId, numInstances });
    }
};