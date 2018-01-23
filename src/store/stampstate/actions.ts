import Vuex from 'vuex';
import State from './state';

import { connection } from '../../api';
import * as utils from '../../api/utils';
import { Notification } from '../pagestate/classes';
import { Deployment } from './classes';


/**
 * Actions to handle the representation of the stamp state easier.
 */
export default class Actions implements Vuex.ActionTree<State, any> {
  [name: string]: Vuex.Action<State, any>;

  /**
   * Obtains information from a stamp element.
   * @requires elementURI <string> Element identification.
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
   * Adds a new deployment to the stamp.
   * @requires deployment <Deployment> Deployment to add in the stamp.
   */
  addDeployment = (injectee: Vuex.ActionContext<State, any>,
    deployment: Deployment): void => {

    connection.addDeployment(deployment).catch((error) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error deploying',
          'Error deploying ' + deployment._uri + ': ' + error)
      );

    });
  }

  /**
   * Removes a deployment from the stamp.
   * @requires deploymentURN <string> URN of the deployment to remove.
   */
  undeploy = (injectee: Vuex.ActionContext<State, any>, deploymentURN: string):
    void => {
    connection.undeployDeployment(deploymentURN).catch((error) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error undeploying',
          'Error undeploying ' + deploymentURN + ': ' + error)
      );

    });
  }

  /**
   * Adds a new domain to the stamp.
   * @requires domain <string> Domain name to be added to the stamp.
   */
  addNewDomain = (injectee: Vuex.ActionContext<State, any>, domain: string):
    void => {
    connection.addDomain(domain).catch((err) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error registering a domain',
          'Error registering a domain ' + domain + ': ' + err)
      );

    });
  }

  /**
   * Removes an element from the stamp.
   * @requires elementId <string> Element identification to be removed form the
   *  stamp.
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
    }).catch((err) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error removing an element',
          'Error removing element ' + elementId + ': ' + err)
      );

    });
  }

  /**
   * Downloads a manifest from the stamp.
   * @requires elementURN <string> Identification of the element to be removed
   *  from the stamp.
   */
  downloadManifest = (injectee: Vuex.ActionContext<State, any>,
    elementURN: string):
    void => {
    connection.downloadManifest(elementURN).catch((err) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error downloading manifest',
          'Error downloading manifest from ' + elementURN + ': ' + err)
      );

    });
  }

  /**
   * Changes the state of a deployment.
   * @requires Object <{deploymentURN, roleNumInstances, killInstances}> Object
   *  representing the changes to be made on the deployment.
   */
  aplyingChangesToDeployment = (injectee: Vuex.ActionContext<State, any>, {
    deploymentURN, roleNumInstances, killInstances
  }): void => {

    connection.aplyChangesToDeployment(
      deploymentURN, roleNumInstances, killInstances
    ).catch((err) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR,
          'Error modifying deployment',
          'Error modifying deployment' + deploymentURN + ': ' + err)
      );

    });

  }

  /**
   * Adds a new bundle in the stamp.
   * @requires file <File> File to be sended to the stamp.
   */
  addNewBundle = (injectee: Vuex.ActionContext<State, any>, file: File):
    void => {

    connection.addNewBundle(file).catch((err) => {
      
      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error uploading a bundle',
          'Error: ' + err)
      );

    });

  }

  /**
   * Links two deployments in the stamp.
   * @requires params <{ deploymentOne: string, channelOne: string,
   *  deploymentTwo: string, channelTwo: string }> Object with the deploymentss
   *  and the channels to link.
   */
  link = (injectee: Vuex.ActionContext<State, any>, params: {
    deploymentOne: string, channelOne: string, deploymentTwo: string,
    channelTwo: string
  }): void => {

    connection.link(params).catch((err) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error linking deployments',
          'Error linking deployments: ' + err)
      );

    });

  }

  /**
  * Unlinks two deployments in the stamp.
  * @requires params <{ deploymentOne: string, channelOne: string,
  *  deploymentTwo: string, channelTwo: string }> Object with the deployments
  *  and the channels to unlink.
  */
  unlink = (injectee: Vuex.ActionContext<State, any>, params): void => {

    connection.unlink(params).catch((err) => {

      injectee.dispatch('addNotification',
        new Notification(
          Notification.LEVEL.ERROR, 'Error unlinking deployments',
          'Error unlinking deployments: ' + err
        )
      );

    });

  }

  /**
   * Stores in the state the selected service on elements view to be able
   * to show it on addDeploymentView.
   * @requires serviceURI <string> Id of the service.
   */
  selectedService = (injectee: Vuex.ActionContext<State, any>,
    serviceURI: string): void => {

    injectee.commit('selectedService', serviceURI);

  }

};