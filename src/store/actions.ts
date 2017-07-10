import * as connection from './proxy';
import { DeploymentItem } from './../components';
import { Deployment } from './classes';
import urlencode from 'urlencode';
export default {
    init({ commit, dispatch }, { username, password }) {
        connection.login(username, password).then(() => {
            commit('login', username);
        }).catch((error) => {
            commit('authError', true);
            console.error('Error authenticating the user', error);
        });
    },
    getDeploymentList({ commit, dispatch }) {
        connection.getDeploymentList().then((deploymentList) => {
            commit('setDeploymentList', deploymentList);
            // añadimos cada deployment como un deploymentMenuItem
            let res = [];
            for (let key in deploymentList) {
                res.push({
                    'name': deploymentList[key].name,
                    'path': '/deployment/' + urlencode(key)
                });
            }
            commit('addDeploymentMenuItem', res);
            dispatch('getMetrics');
        }).catch(function (error) {
            console.error('Error managing deployments: ' + error);
        });
    },
    getRegisteredElements({ commit }) {
        connection.getRegisteredElements().then(function ({ registeredElements }) {
            // Guardamos los elementos
            commit('setRegisteredElements', { registeredElements });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error obtaining registered elements: ' + error);
        });
    },
    getManifest({ commit }, { uri }) {
        connection.getManifest(uri).then(function (element) {
            // Guardamos los elementos
            commit('setElementData', { element });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error obtaining registered elements: ' + error);
        });
    },
    getMetrics({ commit }) {
        connection.getMetrics().then(function (metrics) {
            commit('addMetrics', metrics);
        }).catch(function (error) {
            console.error('Error obtaining metrics: ' + error);
        });
    },
    setFabElements({ commit }, { fabElementsList }) {
        commit('setFabElements', { fabElementsList });
    },

    toggleMenuItemExpanded({ commit }, { menuItem }) {
        commit('toggleMenuItemExpanded', menuItem);
    },
    undeployDeployment({ commit }, { deploymentId }) {
        connection.undeployDeployment(deploymentId);
    },
    aplyingChangesToDeployment({ commit }, changes) {
        connection.aplyChangesToDeployment(changes);
    },
    createNewHTTPENtrypoint({ }, params) {
        connection.createNewHTTPENtrypoint(params);
    },
    createNewDeployment({ }, params) {
        connection.addDeployment(params);
    },
    deleteElement({ }, elementId) {
        connection.deleteElement(elementId);
    },
    selectedService({ commit }, serviceId) {
        commit('selectedService', serviceId);
    },
    downloadManifest({ }, elementId) {
        connection.downloadManifest(elementId);
    },
    addWebDomain({ }, webdomain) {
        connection.addWebdomain(webdomain);
    },
    deleteWebdomain({ }, webdomain) {
        connection.deleteWebdomain(webdomain);
    },
    addDataVolume({ }, params) {
        connection.addDataVolume(params);
    },
    addNewElement({ }, params) {
        connection.addNewElement(params);
    }
};