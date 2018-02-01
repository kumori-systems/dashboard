import Vuex from 'vuex';
import State from './state';

import { connection } from '../../api';
import * as utils from '../../api/utils';
import { BackgroundAction, Notification } from '../pagestate/classes';
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
      connection.getElementInfo(elementURI).catch((err) => {
        if (err.code !== '001')
          console.error('Error getting info from element %s', elementURI, err);
      });
    }

  }

  /**
   * Adds a new deployment to the stamp.
   * @requires deployment <Deployment> Deployment to add in the stamp.
   */
  addDeployment = (injectee: Vuex.ActionContext<State, any>,
    deployment: Deployment): void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.DEPLOY_SERVICE)
    );

    connection.addDeployment(deployment).then(() => {
      
      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.DEPLOY_SERVICE,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.DEPLOY_SERVICE,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error deploying',
          'Error deploying ' + deployment.name,
          JSON.stringify(err.message, null, 4))
      );

    });
  }

  /**
   * Removes a deployment from the stamp.
   * @requires deploymentURN <string> URN of the deployment to remove.
   */
  undeploy = (injectee: Vuex.ActionContext<State, any>, deploymentURN: string):
    void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.UNDEPLOY_SERVICE)
    );

    connection.undeployDeployment(deploymentURN).then(() => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.UNDEPLOY_SERVICE,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.UNDEPLOY_SERVICE,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error undeploying',
          'Error undeploying ' + deploymentURN,
          JSON.stringify(err.message, null, 4))
      );

    });
  }

  /**
   * Adds a new domain to the stamp.
   * @requires domain <string> Domain name to be added to the stamp.
   */
  addNewDomain = (injectee: Vuex.ActionContext<State, any>, domain: string):
    void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.REGISTER_DOMAIN)
    );

    connection.addDomain(domain).then(() => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.REGISTER_DOMAIN,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.REGISTER_DOMAIN,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error registering a domain',
          'Error registering a domain ' + domain,
          JSON.stringify(err.message, null, 4))
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

    switch (utils.getElementType(elementId)) {
      case utils.ElementType.component:
        injectee.dispatch(
          'addBackgroundAction',
          new BackgroundAction(BackgroundAction.TYPE.UNREGISTER_COMPONENT)
        );
        break;
      case utils.ElementType.service:
        injectee.dispatch(
          'addBackgroundAction',
          new BackgroundAction(BackgroundAction.TYPE.UNREGISTER_SERVICE)
        );
        break;
      case utils.ElementType.runtime:
        injectee.dispatch(
          'addBackgroundAction',
          new BackgroundAction(BackgroundAction.TYPE.UNREGISTER_RUNTIME)
        );
        break;
      default:
      // console.error('Error deleting element: Unknown type of element');
    }

    connection.deleteElement(elementId).then(() => {
      let action: string;
      switch (utils.getElementType(elementId)) {
        case utils.ElementType.component:
          action = 'removeComponent';
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_COMPONENT,
            'state': BackgroundAction.STATE.SUCCESS
          });
          break;
        case utils.ElementType.service:
          action = 'removeService';
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_SERVICE,
            'state': BackgroundAction.STATE.SUCCESS
          });
          break;
        case utils.ElementType.runtime:
          action = 'removeRuntime';
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_RUNTIME,
            'state': BackgroundAction.STATE.SUCCESS
          });
          break;
        default:
          console.error('Error deleting element: Unknown type of element');
      }

      injectee.commit(action, elementId);
    }).catch((err: Error) => {

      switch (utils.getElementType(elementId)) {
        case utils.ElementType.component:
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_COMPONENT,
            'state': BackgroundAction.STATE.FAIL
          });
          break;
        case utils.ElementType.service:
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_SERVICE,
            'state': BackgroundAction.STATE.FAIL
          });
          break;
        case utils.ElementType.runtime:
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_RUNTIME,
            'state': BackgroundAction.STATE.FAIL
          });
          break;
        default:
        // console.error('Error deleting element: Unknown type of element');
      }

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error removing an element',
          'Error removing element ' + elementId,
          JSON.stringify(err.message, null, 4))
      );

    });
  }

  /**
   * Downloads a manifest from the stamp.
   * @requires elementURN <string> Identification of the element to be removed
   *  from the stamp.
   */
  downloadManifest = (injectee: Vuex.ActionContext<State, any>,
    elementURN: string): void => {

    connection.downloadManifest(elementURN).catch((err: Error) => {

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error downloading manifest',
          'Error downloading manifest from ' + elementURN,
          JSON.stringify(err.message, null, 4))
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

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.SCALE_SERVICE)
    );

    connection.aplyChangesToDeployment(
      deploymentURN, roleNumInstances, killInstances
    ).then(() => {
      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.SCALE_SERVICE,
        'state': BackgroundAction.STATE.SUCCESS
      });
    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.SCALE_SERVICE,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR,
          'Error modifying deployment',
          'Error modifying deployment' + deploymentURN,
          JSON.stringify(err.message, null, 4))
      );

    });

  }

  /**
   * Adds a new bundle in the stamp.
   * @requires file <File> File to be sended to the stamp.
   */
  addNewBundle = (injectee: Vuex.ActionContext<State, any>, file: File):
    void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.REGISTER_BUNDLE)
    );

    connection.addNewBundle(file).then(() => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.REGISTER_BUNDLE,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.REGISTER_BUNDLE,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error uploading bundle',
          'Error uploading bundle',
          JSON.stringify(JSON.parse(err.message), null, 4)
        )
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

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.LINK_SERVICES)
    );

    connection.link(params).then(() => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.LINK_SERVICES,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.LINK_SERVICES,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.ERROR, 'Error linking deployments',
          'Error linking deployed services'
          + params.deploymentOne + ':' + params.channelOne
          + params.deploymentTwo + ':' + params.channelTwo,
          JSON.stringify(err.message, null, 4))
      );

    });

  }

  /**
  * Unlinks two deployments in the stamp.
  * @requires params <{ deploymentOne: string, channelOne: string,
  *  deploymentTwo: string, channelTwo: string }> Object with the deployments
  *  and the channels to unlink.
  */
  unlink = (injectee: Vuex.ActionContext<State, any>,
    params: {
      deploymentOne: string, channelOne: string, deploymentTwo: string,
      channelTwo: string
    }): void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.UNLINK_SERVICES)
    );

    connection.unlink(params).then(() => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.UNLINK_SERVICES,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.UNLINK_SERVICES,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(
          Notification.LEVEL.ERROR, 'Error unlinking deployments',
          'Error unlinking deployed services'
          + params.deploymentOne + ':' + params.channelOne
          + params.deploymentTwo + ':' + params.channelTwo,
          JSON.stringify(err.message, null, 4))
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