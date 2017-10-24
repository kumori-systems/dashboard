import { ProxyConnection } from './proxy/index';
import { getElementType, ElementType, getResourceType, ResourceType, transformEcloudEventDataToMetrics } from './proxy/utils';
import { DeploymentItem } from './../components';
import { Deployment, Component, Service, Runtime, Resource } from './classes';
import urlencode from 'urlencode';
import { Notification, createNotification, notificationType } from '../components/views/innerComponents/notification';

const connection: ProxyConnection = new ProxyConnection();
export default {
    /* MENU */
    setMenu({ commit }, menu) {
        commit('setMenu', menu);
    },

    /* FAB BUTTON */
    setFabElements({ commit }, { fabElementsList }) {
        commit('setFabElements', { fabElementsList });
    },

    /* GENERIC */
    login({ commit, dispatch, getters }, { username, password }) {

        connection.login(username, password).then((user) => {
            commit('loginstate', 'authenticated');
            return user;
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
        });

        connection.onAddInstance((deploymentId: string, roleId: string, instanceId: string, instance: Deployment.Rol.Instance) => {
            commit('addInstance', {
                'deploymentId': deploymentId,
                'roleId': roleId,
                'instanceId': instanceId,
                'instance': instance
            });
        });

        connection.onModifyDeployment((value) => {
            console.warn('Received event onModifyDeployment, which is still under development');
        });

        connection.onRemoveDeploymemt((deploymentId) => {
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
            // Obtenemos el tipo de resource del que estamos hablando
            let type: ResourceType = getResourceType(resourceId);
            let commitString: string;
            switch (type) {
                case ResourceType.cert:
                    commitString = 'addCert';
                    break;
                case ResourceType.domain:
                    commitString = 'addDomain';
                    break;
                case ResourceType.volume:
                    commitString = 'addVolume';
                    break;
                default:
                    console.error('Not expected resource type %s', type);
            }
            let val: { [id: string]: Resource } = {};
            val[resourceId] = resource;
            commit(commitString, val);
        });

        connection.onRemoveResource((resourceId: string) => {
            commit('removeResource', resourceId);
        });

        connection.onAddMetrics((metrics) => {
            commit('addMetrics', metrics);
        });

    },

    addNewDomain(context, params) {
        connection.addDomain(params);
    },
    
    addNewBundle(context, params) {
        connection.addNewBundle(params);
    },

    deleteElement(context, elementId) {
        connection.deleteElement(elementId);
    },

    downloadManifest(context, elementId) {
        connection.downloadManifest(elementId);
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
                let resourceType = getResourceType(uri);
                switch (resourceType) {
                    case ResourceType.cert:
                        res = context.state.certList[uri];
                        break;
                    case ResourceType.domain:
                        res = context.state.domainList[uri];
                        break;
                    case ResourceType.volume:
                        res = context.state.volumeList[uri];
                        break;
                    default:
                        console.error('ResourceType not covered %s', resourceType);
                }
                break;
            default:
                console.error('Element type not covered %s', type);
        }
        if (!res)
            connection.getElementInfo(uri);
    },

    /* DEPLOYMENT */
    undeployDeployment({ commit }, { deploymentId }) {
        connection.undeployDeployment(deploymentId).catch((error) => {
            console.error('The deployment ' + deploymentId + ' could not be undeployed: ' + error);
        });
    },

    aplyingChangesToDeployment({ commit }, { deploymentId, rolNumInstances, killInstances }) {
        connection.aplyChangesToDeployment(deploymentId, rolNumInstances, killInstances);
    },

    createNewDeployment({ commit }, deployment) {
        connection.addDeployment(deployment).catch((error) => {
            console.error('Error deploying a service', error);
        });
    },

    /* ELEMENTS TO NEW SERVICE */
    selectedService({ commit }, serviceId) {
        commit('selectedService', serviceId);
    },

    /* DEBERÍA DESAPARECER: addNewElement */
    addDataVolume(context, params) {
        connection.addDataVolume(params);
    }
};