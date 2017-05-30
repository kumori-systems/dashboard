import * as connection from './proxy';
import { DeploymentItem } from './../components';
import { Deployment } from './classes';

export default {
    getStampState({ commit, dispatch }) {
        connection.getStampState().then(function (stampState) {
            // Guardamos los deployments en el estado
            commit('setStampState', stampState);
            // añadimos cada deployment como un deploymentMenuItem
            let res = [];
            let path: string;
            for (let key in stampState.deploymentList) {
                path = key;
                let index = path.indexOf('/');
                while (index !== -1) {
                    path = path.replace('/', '\\');
                    index = path.indexOf('/');
                }
                res.push({
                    'name': stampState.deploymentList[key].name,
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
    getRegisteredElements({ commit }) {
        connection.getRegisteredElements().then(function ({ registeredElements }) {
            // Guardamos los elementos
            commit('setRegisteredElements', { registeredElements });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error Obteniendo elementos registrados: ' + error);
        });
    },
    getManifest({ commit }, { uri }) {
        connection.getManifest(uri).then(function (element) {
            // Guardamos los elementos
            commit('setElementData', { element });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error Obteniendo elementos registrados: ' + error);
        });
    },
    getMetrics({ commit }) {
        connection.getMetrics().then(function (metrics) {
            commit('addMetrics', metrics);
        }).catch(function (error) {
            console.log('Error obteniendo las métricas: ' + error);
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
    setTemporaryState({ commit }, temporaryState) {
        commit('setTemporaryState', temporaryState);
    },
    createNewHTTPENtrypoint({ }, params) {
        connection.createNewHTTPENtrypoint(params);
    }
};