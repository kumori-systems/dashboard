import { ProxyConnection } from './proxy/index';
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
        connection.login(username, password).catch((error) => {
            console.error('Error authenticating the user');
            commit('authError', true);
        });
        connection.onLogin((user: string | Error) => {
            commit('login', user);
            createNotification('LOGIN', 'sucessfully loged in', notificationType.SUCCESS);
            createNotification('Retrieving info', 'In this preview you should wait till all info is loaded or you can face unconsistent state', notificationType.WARNING);
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
            createNotification('New deployment', 'A new deployment has been created', notificationType.SUCCESS);
        });

        connection.onModifyDeployment((value) => {
            console.log('Nos ha llegado un evento para modificar un deployment. Los valores son:', value);
        });

        connection.onRemoveDeploymemt((deploymentId) => {
            commit('removeDeploymentMenuItem', '/deployment/' + urlencode(deploymentId));
            commit('removeDeployment', deploymentId);
            createNotification('Undeployed', 'A deployment has been removed', notificationType.DANGER
            );
        });

        connection.onAddService((serviceId: string, service: Service) => {
            let val: { [id: string]: Service } = {};
            val[serviceId] = service;
            commit('addService', val);
            createNotification('New service', 'A service has been created', notificationType.SUCCESS);
        });

        connection.onAddComponent((componentId: string, component: Component) => {
            let val: { [id: string]: Component } = {};
            val[componentId] = component;
            commit('addComponent', val);
            createNotification(
                'New component',
                'A component has been created',
                notificationType.SUCCESS
            );
        });

        connection.onAddRuntime((runtimeId: string, runtime: Runtime) => {
            let val: { [id: string]: Runtime } = {};
            val[runtimeId] = runtime;
            commit('addRuntime', val);
            createNotification(
                'New runtime',
                'A runtime has been created',
                notificationType.SUCCESS
            );
        });

        connection.onAddResource((resourceId: string, resource: Resource) => {
            let val: { [id: string]: Resource } = {};
            val[resourceId] = resource;
            commit('addResource', val);
            createNotification(
                'New resource',
                'A resource has been created',
                notificationType.SUCCESS
            );
        });
        connection.onRemoveResource((resourceId: string) => {
            commit('removeResource', resourceId);
            createNotification(
                'Remove resource',
                'A resource has been removed',
                notificationType.SUCCESS
            );
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
        connection.getDeploymentList().then(() => {
            dispatch('getElementList');
        }).catch((error) => {
            console.error('Error getting deployment list', error);
            createNotification(
                'Error obtaining info',
                'The page may not be in a consistent state',
                notificationType.DANGER
            );
        });
    },
    getElementList({ dispatch, getters }) {
        connection.getRegisteredElements().then(() => {
            createNotification('Retrieving info FINISHED', 'Thank you for waiting', notificationType.WARNING);
        }).catch((error) => {
            console.error('Error getting registered elements', error);
            createNotification('Error retrieving initial information', 'You can face an unconsistent state. Please reload the page', notificationType.DANGER);
        });
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
        connection.undeployDeployment(deploymentId).then(() => {
            createNotification('Undeploying..', 'A instance of a service is under undeploy', notificationType.PRIMARY);
        }).catch((error) => {
            console.error('The deployment ' + deploymentId + ' could not be undeployed: ' + error);
            createNotification('Deployed!', 'The instance has been deployed', notificationType.DANGER);
        });

    },
    aplyingChangesToDeployment({ commit }, { deploymentId, rolNumInstances, killInstances }) {
        connection.aplyChangesToDeployment(deploymentId, rolNumInstances, killInstances);
    },
    createNewHTTPEntrypoint(context, params) {
        connection.createNewHTTPEntrypoint(params);
        createNotification('Create New HTTP Entrypoint', 'Function not available in the dashboard. Please use the option \'upload bundle\' in elements view', notificationType.DANGER);
    },
    createNewDeployment(context, deployment) {
        connection.addDeployment(deployment).then(() => {
            createNotification('Deployed!', 'The instance has been deployed', notificationType.SUCCESS);
        }).catch((error) => {
            console.error('Error deploying a service', error);
            createNotification('Deploying error', 'The instance couldn\'t be deployed', notificationType.DANGER);
        });
        createNotification('Deploying..', 'A new instance of the service is under creation', notificationType.PRIMARY);
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