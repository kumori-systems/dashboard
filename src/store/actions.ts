import * as connection from './proxy';
import { DeploymentItem } from './../components';
import { Deployment } from './classes';
import urlencode from 'urlencode';
export default {
    login({ commit }, { email, password }) {
        connection.login(email, password).then(
            function ({ state, user, token }) {
                if (state === connection.CONNECTION_STATE.SUCCESS) {
                    console.info('Sucessfully authenticated as ' + user);
                    commit('login', { 'user': user, 'token': token });
                }
                else if (state === connection.CONNECTION_STATE.FAIL) {
                    console.info('Authentication fail');
                    commit('authError', true);
                }
            }
        ).catch(function (error) {
            console.error('Error in authentication process: ' + error);
        });
    },
    getStampState({ commit, dispatch }) {
        connection.getStampState().then(function (stampState) {
            // Guardamos los deployments en el estado
            commit('setStampState', stampState);
            // añadimos cada deployment como un deploymentMenuItem
            let res = [];
            let path: string;
            for (let key in stampState.deploymentList) {
                res.push({
                    'name': stampState.deploymentList[key].name,
                    'path': '/deployment/' + urlencode(key)
                });
            }
            commit('addDeploymentMenuItem', { 'deploymentList': res });
            dispatch('getMetrics');
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error handling deployments: ' + error);
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