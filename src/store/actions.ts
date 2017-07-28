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
        let myUser;
        connection.login(username, password).then((user) => {
            commit('loginstate', 'authenticated');
            myUser = user;
            return connection.getDeploymentList();
        }).then(() => {
            return connection.getRegisteredElements();
        }).then(() => {
            commit('login', myUser);
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
            // ¿Tenemos el servicio asociado?
            if (getters.getServiceInfo(deployment.serviceId) === undefined) {
                connection.getElementInfo(deployment.serviceId);
            }
        });

        connection.onModifyDeployment((value) => {
            console.error('Received event onModifyDeployment, which is still under development');
        });

        connection.onRemoveDeploymemt((deploymentId) => {
            commit('removeDeploymentMenuItem', '/deployment/' + urlencode(deploymentId));
            commit('removeDeployment', deploymentId);
            createNotification('Undeployed', 'A deployment has been removed', notificationType.SUCCESS
            );
        });

        connection.onAddService((serviceId: string, service: Service) => {
            let val: { [id: string]: Service } = {};
            val[serviceId] = service;
            commit('addService', val);
            if (getters.getUser)
                createNotification('New service', 'A service has been created', notificationType.SUCCESS);
        });

        connection.onAddComponent((componentId: string, component: Component) => {
            let val: { [id: string]: Component } = {};
            val[componentId] = component;
            commit('addComponent', val);
            if (getters.getUser)
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
            if (getters.getUser)
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
            if (getters.getUser)
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
        createNotification('Apply changes', 'This functionality is under development', notificationType.DANGER);
    },
    createNewHTTPEntrypoint(context, params) {
        connection.createNewHTTPEntrypoint(params);
        createNotification('Add Entripoint', 'This functionality is under development', notificationType.DANGER);
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
        createNotification('Delete element', 'This functionality is under development', notificationType.DANGER);
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