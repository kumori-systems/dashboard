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
    // Obtain the element in the state
    let res: any = undefined;
    switch (utils.getElementType(elementURI)) {
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
        console.error('Unkown element type at %s', elementURI);
    }

    // If the element isn't stored in the state, info is requested to the
    // platform
    if (!res && res !== null) {
      connection.getElementInfo(elementURI).catch((error) => {
        if (error.code !== '001')
          console.error('Error getting info from element %s', elementURI,
            error);
      });
    }

  }

  /**
   * Adds a new deployment to the stamp
   * @requires deployment <Deployment> Deployment to add in the stamp
   */
  addDeployment = (injectee: Vuex.ActionContext<State, any>,
    deployment: Deployment): void => {

    connection.addDeployment(deployment).catch((error) => {
      console.error('Error deploying a service', error);
    });
  }

  /**
   * Removes a deployment from the stamp
   * @requires deploymentURN <string> urn of the deployment to remove
   */
  undeploy = (injectee: Vuex.ActionContext<State, any>,
    deploymentURN: string): void => {
    connection.undeployDeployment(deploymentURN).catch((error) => {
      console.error('The deployment ' + deploymentURN +
        ' could not be undeployed: ' + error);
    });
  }

  /**
   * Adds a new domain to the stamp
   */
  addNewDomain = (injectee: Vuex.ActionContext<State, any>,
    domain: string): void => {
    connection.addDomain(domain);
  }

  /**
   * Removes an element from the stamp
   */
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

  downloadManifest = (injectee: Vuex.ActionContext<State, any>,
    elementURN: string):
    void => {
    connection.downloadManifest(elementURN);
  }

  aplyingChangesToDeployment = (injectee: Vuex.ActionContext<State, any>, {
    deploymentURN, roleNumInstances, killInstances
  }):
    void => {

    connection.aplyChangesToDeployment(deploymentURN, roleNumInstances,
      killInstances).catch((error) => {
        console.error('Error modifying deployment. ',
          deploymentURN, roleNumInstances, killInstances, error);
      });
      
  }

  addNewBundle = (injectee: Vuex.ActionContext<State, any>, params):
    void => {
    connection.addNewBundle(params);
  }

  link = (injectee: Vuex.ActionContext<State, any>, params):
    void => {
    connection.link(params);
  }

  unlink = (injectee: Vuex.ActionContext<State, any>, params):
    void => {
    connection.unlink(params);
  }

};