import * as connection from './proxy';
import { DeploymentItem } from './../components';
import { Deployment, Component } from './classes';
import urlencode from 'urlencode';
export default {
    init({ commit, dispatch }, { username, password }) {
        connection.login(username, password).then((user) => {
            console.info('SUCCESSFULLY AUTHENTICATED AS', user);
            commit('login', user);
        }).catch((error) => {
            commit('authError', true);
            console.error('Error authenticating the user', error);
        });
    },
    getDeploymentList({ commit, dispatch }) {
        // TODO: realizar un timmer para que la función no pueda llamarse en x tiempo
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
        }).catch(function (error) {
            console.error('Error managing deployments: ' + error);
        });
    },
    getElementList({ commit }) {
        connection.getRegisteredElements().then((registeredElements) => {
            commit('setRegisteredElements', registeredElements);
        });
    },
    /*
    getElementInfo({ commit }, serviceId) {
        connection.getElementInfo(serviceId);
    },
    */
    loadElementInfo({ commit, getters }, { type, owner, element }) {
        let elementList: Array<string> = getters.getElementBundle(type, owner, element);
        console.log('La lista de elementos por la que preguntamos es: ', elementList);
        for (let i = 0; i < elementList.length; i++)
            connection.getElementInfo(elementList[i]).then((value) => {
                let elem;
                console.log('Cuando cargamos la info de un elemento, la conexion nos devuelve', value);
                switch (type) {
                    case 'service':
                        console.log('Se trata de un servicio');
                        break;
                    case 'component':
                        console.log('Se trata de un component');
                        elem = new Component(
                            elementList[i], // uri
                            value.runtime, // runtime
                            value.configuration.resources, // resourcesConfig: { [resourceName: string]: string }
                            value.configuration.parameters, // parameters: Object
                            {}, // proChannels: { [channelId: string]: Channel }
                            {}, // reqChannels: { [channelId: string]: Channel }
                        );
                        commit('addComponent', { id: elementList[i], elem });
                        break;
                    case 'runtime':
                        console.log('Se trata de un runtime');
                        break;
                    default:
                        console.error('¿De qué tipo hemos pedido el elemento?', type);
                }
            });
    },
    /*
    getRegisteredElements({ commit }) {
        connection.getRegisteredElements().then(function ( registeredElements ) {
            commit('setRegisteredElements', { registeredElements });
        }).catch(function (error) {
            console.error('Error obtaining registered elements: ' + error);
        });
    },*/
    getManifest({ commit }, { uri }) {
        connection.getElementInfo(uri).then(function (element) {
            // Guardamos los elementos
            commit('setElementData', { element });
        }).catch(function (error) { // TODO: mensaje de advertencia al usuario
            console.error('Error obtaining registered elements: ' + error);
        });
    },
    /*
    // TODO: Las métricas no se deberían de obtener mediante una llamada, sino mediante eventos
    getMetrics({ commit }) {
        connection.getMetrics().then(function (metrics) {
            commit('addMetrics', metrics);
        }).catch(function (error) {
            console.error('Error obtaining metrics: ' + error);
        });
    },
    */
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