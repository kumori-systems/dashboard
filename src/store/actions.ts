import { ProxyConnection } from './proxy/index';
import { DeploymentItem } from './../components';
import { Deployment, Component, Service, Runtime, Resource } from './classes';
import urlencode from 'urlencode';

const connection: ProxyConnection = new ProxyConnection();
export default {
    setMenu({ commit }, menu) {
        commit('setMenu', menu);
    },
    login({ commit, dispatch, getters }, { username, password }) {
        connection.login(username, password);
        connection.onLogin((user: string | Error) => {
            if (typeof user === Error.name) {
                console.error('Error authenticating the user', user);
                commit('authError', true);
            };
            commit('login', user);
        });

        connection.onAddDeployment((deploymentId: string, deployment: Deployment) => {
            let val: { [id: string]: Deployment } = {};
            val[deploymentId] = deployment;
            commit('addDeployment', val);
            commit('addDeploymentMenuItem', {
                'name': deployment.name,
                'path': '/deployment/' + urlencode(deploymentId)
            });
            // ¿Tenemos el servicio asociado?
            if (getters.getServiceInfo(deployment.serviceId) === undefined) {
                connection.getElementInfo(deployment.serviceId);
            }
        });

        connection.onAddService((serviceId: string, service: Service) => {
            let val: { [id: string]: Service } = {};
            val[serviceId] = service;
            commit('addService', val);
        });

        connection.onAddComponent((componentId: string, component: Component) => {
            let val: { [id: string]: Component } = {};
            val[componentId] = component;
            commit('addComponent', val);
        });

        connection.onAddRuntime((runtimeId: string, runtime: Runtime) => {
            let val: { [id: string]: Runtime } = {};
            val[runtimeId] = runtime;
            commit('addRuntime', val);
        });

        connection.onAddResource((resourceId: string, resource: Resource) => {
            let val: { [id: string]: Resource } = {};
            val[resourceId] = resource;
            commit('addResource', val);
        });

        connection.onAddMetrics((metrics) => {
            commit('addMetrics', metrics);
        });
        // connection.on

    },
    getDeploymentList({ getters, dispatch }) {
        let deploymentList = getters.getDeploymentList;
        for (let deploymentId in deploymentList) {
            return; // Si ya tenemos algo en la lista, no hace falta que volvamos a hacer la llamada
        }
        connection.getDeploymentList();
        dispatch('getElementList');
    },
    getElementList({ dispatch, getters }) {
        connection.getRegisteredElements();
    },
    getManifest(context, { uri }) {
        connection.getElementInfo(uri);
    },
    setFabElements({ commit }, { fabElementsList }) {
        commit('setFabElements', { fabElementsList });
    },
    toggleMenuItemExpanded({ commit }, { menuItem }) {
        if (menuItem.children)
            commit('toggleMenuItemExpanded', menuItem);
    },
    undeployDeployment({ commit }, { deploymentId }) {
        connection.undeployDeployment(deploymentId);
    },
    aplyingChangesToDeployment({ commit }, changes) {
        connection.aplyChangesToDeployment(changes);
    },
    createNewHTTPENtrypoint(context, params) {
        connection.createNewHTTPENtrypoint(params);
    },
    createNewDeployment(context, deployment) {
        connection.addDeployment(deployment);
    },
    deleteElement(context, elementId) {
        connection.deleteElement(elementId);
    },
    selectedService({ commit }, serviceId) {
        commit('selectedService', serviceId);
    },
    downloadManifest(context, elementId) {
        connection.downloadManifest(elementId);
    },
    addWebDomain(context, webdomain) {
        connection.addWebdomain(webdomain);
    },
    deleteWebdomain(context, webdomain) {
        connection.deleteWebdomain(webdomain);
    },
    addDataVolume(context, params) {
        connection.addDataVolume(params);
    },
    addNewElement(context, params) {
        connection.addNewElement(params);
    }
};