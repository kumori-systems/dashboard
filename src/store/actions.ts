import { ProxyConnection } from './proxy/index';
import { getElementType, ElementType } from './proxy/utils';
import { DeploymentItem } from './../components';
import { Deployment, Component, Service, Runtime, Resource } from './classes';
import urlencode from 'urlencode';
import { Notification, createNotification, notificationType } from '../components/views/innerComponents/notification';

const connection: ProxyConnection = new ProxyConnection();
export default {
    setMenu({ commit }, menu) {
        commit('setMenu', menu);
    },
    login({ commit, dispatch, getters }, { username, password }) {
        connection.login(username, password).then((user) => {
            commit('loginstate', 'authenticated');
            return  user;
        }).then((user) => {
            // Obtenemos la lista de deployments
            connection.getDeploymentList();
            // Obtenemos la lista de elementos registrados en el stamp
            connection.getRegisteredElements();
            return user;
        }).then((user) => {
            commit('login', user);
        }).catch((error) => {
            console.error('Error authenticating the user', error);
            commit('loginstate', 'error');
        });

        connection.onAddDeployment((deploymentId: string, deployment: Deployment) => {
            let val: { [id: string]: Deployment } = {};
            val[deploymentId] = deployment;
            commit('addDeployment', val);
            commit('addDeploymentMenuItem', {
                'name': deployment.name,
                'path': '/deployment/' + urlencode(deploymentId)
            });
        });

        connection.onModifyDeployment((value) => {
            console.warn('Received event onModifyDeployment, which is still under development');
        });

        connection.onRemoveDeploymemt((deploymentId) => {
            commit('removeDeploymentMenuItem', '/deployment/' + urlencode(deploymentId));
            commit('removeDeployment', deploymentId);
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
        connection.onRemoveResource((resourceId: string) => {
            commit('removeResource', resourceId);
        });

        connection.onAddMetrics((metrics) => {
            commit('addMetrics', metrics);
        });

    },
    /**
     * Si no tenemos información a cerca del elemento en el estado, la pedimos
     * @param context 
     * @param param1 
     */
    getElementInfo(context, { uri }) {
        let res: any = undefined;
        let type = getElementType(uri);
        switch (type) {
            case ElementType.runtime:
                res = context.state.runtimeList[uri];
                break;
            case ElementType.service:
                res = context.state.serviceList[uri];
                break;
            case ElementType.component:
                res = context.state.componentList[uri];
                break;
            case ElementType.resource:
                res = context.state.resourceList[uri];
                break;
            default:
                console.error('Element type not covered %s', type);
        }
        if (!res)
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
        connection.undeployDeployment(deploymentId).catch((error) => {
            console.error('The deployment ' + deploymentId + ' could not be undeployed: ' + error);
        });
    },
    aplyingChangesToDeployment({ commit }, { deploymentId, rolNumInstances, killInstances }) {
        connection.aplyChangesToDeployment(deploymentId, rolNumInstances, killInstances);
    },
    createNewHTTPEntrypoint(context, params) {
        connection.createNewHTTPEntrypoint(params).catch((error) => {
            console.error('The entrypoint couldn\'t be deployed: ' + error);
        });
    },
    createNewDeployment(context, deployment) {
        connection.addDeployment(deployment).catch((error) => {
            console.error('Error deploying a service', error);
        });
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
    addWebDomain({ getters }, webdomain) {
        connection.addWebdomain(webdomain);
    },
    addDataVolume(context, params) {
        connection.addDataVolume(params);
    },
    addNewElement(context, params) {
        connection.addNewElement(params);
    }
};