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
  undeploy = (injectee: Vuex.ActionContext<State, any>, deploymentId): void => {
    connection.undeployDeployment(deploymentId).catch((error) => {
      console.error('The deployment ' + deploymentId +
        ' could not be undeployed: ' + error);
    });
  }
  addNewDomain = (injectee: Vuex.ActionContext<State, any>,
    domain: string): void => {
    connection.addDomain(domain);
  }

  deleteElement = (injectee: Vuex.ActionContext<State, any>, elementId: string):
    void => {
    connection.deleteElement(elementId).then(() => {
      let action: string;
      switch (utils.getElementType(elementId)) {
        case utils.ElementType.component:
          action = 'removeComponent';
          break;
        case utils.ElementType.service:
          action = 'removeService';
          break;
        case utils.ElementType.runtime:
          action = 'removeRuntime';
          break;
        default:
          console.error('Error deleting element: Unknown type of element');
      }

      injectee.commit(action, elementId);
    }).catch((error) => {
      console.error('Error erasing element %s', elementId, error);
    });
  }

  downloadManifest = (injectee: Vuex.ActionContext<State, any>, elementId):
    void => {
    connection.downloadManifest(elementId);
  }

  aplyingChangesToDeployment = (injectee: Vuex.ActionContext<State, any>, {
    deploymentId, rolNumInstances, killInstances
  }):
    void => {

    console.debug('El deployment que estamos intentando cambiar es ',
      deploymentId);

    console.debug('Num instancias rol: ',
      rolNumInstances);

    console.debug('Kill instances: ',
      killInstances);

    connection.aplyChangesToDeployment(deploymentId, rolNumInstances,
      killInstances).catch((error) => {
        console.error('Error modifying deployment. ',
          deploymentId, rolNumInstances, killInstances, error);
      });
  }

  addNewBundle = (injectee: Vuex.ActionContext<State, any>, params):
    void => {
    connection.addNewBundle(params);
  }


  /*
  selectedService({ commit }, serviceId) {
    commit('selectedService', serviceId);
  },
  */

};