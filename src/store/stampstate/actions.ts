import Vuex from 'vuex';
import State from './state';

import { connection } from '../../api';
import * as utils from '../../api/utils';
import { Deployment } from './classes';

/**
 * Actions to handle the representation of the stamp state easier.
 */
export default class Actions implements Vuex.ActionTree<State, any> {
  [name: string]: Vuex.Action<State, any>;

  /**
   * Sets if the navigation pannel should be shown.
   * @requires payload <boolean>
   */
  getElementInfo = (injectee: Vuex.ActionContext<State, any>,
    elementURI: string): void => {

    let res: any = undefined;
    let type: utils.ElementType = utils.getElementType(elementURI);
    switch (type) {
      case utils.ElementType.runtime:
        res = injectee.state.runtimes[elementURI];
        break;
      case utils.ElementType.service:
        res = injectee.state.services[elementURI];
        break;
      case utils.ElementType.component:
        res = injectee.state.components[elementURI];
        break;
      case utils.ElementType.resource:
        let resourceType: utils.ResourceType =
          utils.getResourceType(elementURI);
        switch (resourceType) {
          case utils.ResourceType.certificate:
            res = injectee.state.certificates[elementURI];
            break;
          case utils.ResourceType.domain:
            res = injectee.state.domains[elementURI];
            break;
          case utils.ResourceType.volume:
            res = injectee.state.volumes[elementURI];
            break;
          default:
            console.error('ResourceType not covered %s', resourceType);
        }
        break;
      default:
        console.error('Element type not covered %s', type);
    }
    if (!res)
      connection.getElementInfo(elementURI);
  }

  addDeployment = (injectee: Vuex.ActionContext<State, any>,
    deployment: Deployment): void => {
    connection.addDeployment(deployment).catch((error) => {
      console.error('Error deploying a service', error);
    });
  }

  addNewDomain = (injectee: Vuex.ActionContext<State, any>,
    domain: string): void => {
    connection.addDomain(domain);
  }

  /*
  deleteElement(context, elementId) {
    connection.deleteElement(elementId);
  },

  downloadManifest(context, elementId) {
    connection.downloadManifest(elementId);
  },

  undeployDeployment({ commit }, { deploymentId }) {
    connection.undeployDeployment(deploymentId).catch((error) => {
    console.error('The deployment ' + deploymentId +
    ' could not be undeployed: ' + error);
        });
    },

  aplyingChangesToDeployment({ commit }, { deploymentId, rolNumInstances,
    killInstances }) {
      connection.aplyChangesToDeployment(deploymentId, rolNumInstances,
         killInstances);
  },

  selectedService({ commit }, serviceId) {
    commit('selectedService', serviceId);
  },
  */

};