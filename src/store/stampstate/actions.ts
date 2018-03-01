import Vuex from 'vuex';
import State from './state';

import { ProxyConnection } from '../../api';
import * as utils from '../../api/utils';
import { BackgroundAction, Notification } from '../pagestate/classes';
import { Deployment, ECloudElement, Resource } from './classes';

/**
 * Actions to handle the representation of the stamp state easier.
 */
export default class Actions implements Vuex.ActionTree<State, any> {
  [name: string]: Vuex.Action<State, any>;

  /**
   * Obtains information from a stamp element.
   * @requires elementURN <string> Element identification.
   */
  getElementInfo = (injectee: Vuex.ActionContext<State, any>,
    elementURN: string): void => {
    // Obtain the element in the state
    let res: any = undefined;
    switch (utils.getElementType(elementURN)) {
      case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
        res = injectee.state.runtimes[elementURN];
        break;
      case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
        res = injectee.state.services[elementURN];
        break;
      case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
        res = injectee.state.components[elementURN];
        break;
      case ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE:
        let resourceType: Resource.RESOURCE_TYPE =
          utils.getResourceType(elementURN);
        switch (resourceType) {
          case Resource.RESOURCE_TYPE.CERTIFICATE:
            res = injectee.state.certificates[elementURN];
            break;
          case Resource.RESOURCE_TYPE.DOMAIN:
            res = injectee.state.domains[elementURN];
            break;
          case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
            res = injectee.state.persistentVolumes[elementURN];
            break;
          case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:
            res = injectee.state.volatileVolumes[elementURN];
            break;
          default:
            throw new Error('ResourceType not covered ' + resourceType);
        }
        break;
      default:
        throw new Error('Unkown element type at ' + elementURN);
    }

    // If the element isn't stored in the state, info is requested to the
    // platform
    if (!res && res !== null) {

      ProxyConnection.instance.getElementInfo(elementURN).catch((err) => {
        if (err.message !== 'Duplicated request')
          console.error('Error getting info from element %s', elementURN, err);
      });
    }

  }

  /**
   * Adds a new deployment to the stamp.
   * @requires deployment <Deployment> Deployment to add in the stamp.
   */
  deploy = (injectee: Vuex.ActionContext<State, any>,
    deployment: Deployment): void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.DEPLOY_SERVICE)
    );

    ProxyConnection.instance.deploy(deployment).then(() => {

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

    ProxyConnection.instance.undeployDeployment(deploymentURN).then(() => {

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
   * Adds a volume to the system.
   * @requires urn string which represents the URN of the element.
   * @requires filesystem filesystem selected for the volume.
   * @requires size size of the volume in GB.
   */
  addVolume = (injectee: Vuex.ActionContext<State, any>,
    { urn, filesystem, size }): void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.REGISTER_VOLUME)
    );

    ProxyConnection.instance.addVolume(urn, filesystem, size).then(() => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.REGISTER_VOLUME,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).catch((err: Error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.REGISTER_VOLUME,
        'state': BackgroundAction.STATE.FAIL
      });

      injectee.dispatch('addNotification',
        new Notification(
          Notification.LEVEL.ERROR,
          'Error registering a volume',
          'Error registering a volume ' + urn,
          JSON.stringify(err.message, null, 4)
        )
      );

    });
  }

  /**
   * Adds a new domain to the system.
   * @requires urn string which represents the URN of the element.
   * @requires domain <string> Domain name to be added to the system.
   */
  addDomain = (injectee: Vuex.ActionContext<State, any>, { urn, domain }):
    void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.REGISTER_DOMAIN)
    );

    ProxyConnection.instance.addDomain(urn, domain).then(() => {

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
      case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
        injectee.dispatch(
          'addBackgroundAction',
          new BackgroundAction(BackgroundAction.TYPE.UNREGISTER_COMPONENT)
        );
        break;
      case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
        injectee.dispatch(
          'addBackgroundAction',
          new BackgroundAction(BackgroundAction.TYPE.UNREGISTER_SERVICE)
        );
        break;
      case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
        injectee.dispatch(
          'addBackgroundAction',
          new BackgroundAction(BackgroundAction.TYPE.UNREGISTER_RUNTIME)
        );
        break;
      default:
      // console.error('Error deleting element: Unknown type of element');
    }

    ProxyConnection.instance.deleteElement(elementId).then(() => {
      let action: string;
      switch (utils.getElementType(elementId)) {
        case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
          action = 'removeComponent';
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_COMPONENT,
            'state': BackgroundAction.STATE.SUCCESS
          });
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
          action = 'removeService';
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_SERVICE,
            'state': BackgroundAction.STATE.SUCCESS
          });
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
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
        case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_COMPONENT,
            'state': BackgroundAction.STATE.FAIL
          });
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.UNREGISTER_SERVICE,
            'state': BackgroundAction.STATE.FAIL
          });
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
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

    ProxyConnection.instance.downloadManifest(elementURN)
      .catch((err: Error) => {

        injectee.dispatch('addNotification',
          new Notification(
            Notification.LEVEL.ERROR,
            'Error downloading manifest',
            'Error downloading manifest from ' + elementURN,
            JSON.stringify(err.message, null, 4)
          )
        );

      });

  }

  /**
   * Changes the state of a deployment.
   * @requires object <{deploymentURN, roleNumInstances, killInstances}> object
   *  representing the changes to be made on the deployment.
   */
  aplyingChangesToDeployment = (injectee: Vuex.ActionContext<State, any>, {
    deploymentURN, roleNumInstances, killInstances
  }): void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.SCALE_SERVICE)
    );

    ProxyConnection.instance.aplyChangesToDeployment(
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

    ProxyConnection.instance.addNewBundle(file).then(() => {

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
   *  deploymentTwo: string, channelTwo: string }> object with the deploymentss
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

    ProxyConnection.instance.link(params).then(() => {

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
  *  deploymentTwo: string, channelTwo: string }> object with the deployments
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

    ProxyConnection.instance.unlink(params).then(() => {

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
   * @requires serviceURN <string> Id of the service.
   */
  selectedService = (injectee: Vuex.ActionContext<State, any>,
    serviceURN: string): void => {

    injectee.commit('selectedService', serviceURN);

  }

};