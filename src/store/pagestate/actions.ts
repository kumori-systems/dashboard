import Vuex from 'vuex';
import State from './state';

import { connection } from '../../api';
import { getResourceType, ResourceType } from '../../api/utils';
import {
  Component, Deployment, Resource, Runtime, Service
} from '../stampstate/classes';
import { BackgroundAction, Notification, User } from './classes';

/**
 * Actions to handle this page's state easier.
 */
export default class Actions implements Vuex.ActionTree<State, any> {
  [name: string]: Vuex.Action<State, any>;

  addBackgroundAction = (injectee: Vuex.ActionContext<State, any>,
    action): void => {

    injectee.commit('addBackgroundAction', action);

  }

  processingBackgroundAction = (injectee: Vuex.ActionContext<State, any>,
    { id, details }): void => {

    injectee.commit('processingBackgroundAction', { id, details });

  }

  finishBackgroundAction = (injectee: Vuex.ActionContext<State, any>,
    { id, state, details }): void => {

    injectee.commit('finishBackgroundAction', { id, state, details });

  }

  addNotification = (injectee: Vuex.ActionContext<State, any>,
    notification: Notification): void => {

    injectee.commit('addNotification', notification);

  }

  /** Signs the user out of the page. */
  signout = (injectee: Vuex.ActionContext<State, any>, payload): void => {

    // If localstorage is available
    if (typeof (Storage) !== 'undefined') {
      // Removes the user form localstorage
      localStorage.removeItem('user');
    }

    // Removes the user from vuex
    injectee.commit('clearState');

  }

  /**
   * Tries to sign the user into the system.
   * @requires payload <{ username: string, userpassword: string }>
   * @description The required actions are started in the background.
   * If the user successfully signs-in the loaded user is saved in the state.
   * If the user is not authenticated the error message can be seen in the
   * respective background action.
   */
  signin = (injectee: Vuex.ActionContext<State, any>, payload: {
    username: string, userpassword: string, userid: string, token: {
      accessToken: string, expiresIn: number, refreshToken: string,
      tokenType: string
    }
  }): void => {

    // Update background action info
    const authenticationAction = new BackgroundAction('authentication',
      'User authentication in the system');

    const loadInfoAction = new BackgroundAction('loadInfo',
      'Action which loads data from the system');

    injectee.dispatch('addBackgroundAction', authenticationAction);
    injectee.dispatch('processingBackgroundAction', {
      'id': authenticationAction.id,
      'details': 'Validating user'
    });

    // Launch background action
    connection.login(
      payload.username, payload.userpassword, payload.userid, payload.token
    ).then((user) => {

      injectee.dispatch('finishBackgroundAction', {
        'id': authenticationAction.id,
        'state': BackgroundAction.State.SUCCESS,
        'details': 'Authentication sucessfull'
      });

      // Loading process
      injectee.dispatch('addBackgroundAction', loadInfoAction);
      injectee.dispatch('processingBackgroundAction', {
        'id': loadInfoAction.id,
        'details': 'Loading data..'
      });

      // Load all elements
      return connection.getRegisteredElements().then(() => {

        console.debug('Stored a reference to all elements from the platform');

        // Load all deployments
        return connection.getDeploymentList().then(() => {

          console.debug('Retrieved all deployments from the platform');

          injectee.dispatch('finishBackgroundAction', {
            'id': loadInfoAction.id,
            'state': BackgroundAction.State.SUCCESS,
            'details': 'All data loaded'
          });

          // If localstorage is available
          if (typeof (Storage) !== 'undefined') {
            // Stores the item in local storage
            localStorage.setItem('user',
              JSON.stringify(user));
          }

          // Stores the item in vuex
          user.state = User.State.AUTHENTICATED;
          injectee.commit('signIn', user);

        });

      }).catch((error) => {

        if (!error.code || error.code !== '001') {
          injectee.dispatch('finishBackgroundAction', {
            'id': loadInfoAction.id,
            'state': BackgroundAction.State.FAIL,
            'details': 'Error loading data, please contact your administrator'
          });
          console.error('Error loading data: ', error);
        }

      });

    }).catch((error) => {

      injectee.dispatch('finishBackgroundAction', {
        'id': authenticationAction.id,
        'state': BackgroundAction.State.FAIL,
        'details': 'Authentication failure'
      });

    });

    connection.onAddDeployment((deploymentId: string,
      deployment: Deployment) => {

      let val: { [id: string]: Deployment } = {};
      val[deploymentId] = deployment;
      injectee.commit('addDeployment', val);

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Added deployment',
          'New deployment added ' + deploymentId));

    });

    connection.onAddInstance((deploymentId: string, roleId: string,
      instanceId: string, instance: Deployment.Role.Instance) => {

      injectee.commit('addInstance', {
        'deploymentId': deploymentId,
        'roleId': roleId,
        'instanceId': instanceId,
        'instance': instance
      });

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Added instance',
          'New instance added ' + instanceId));

    });

    connection.onModifyDeployment((value) => {

      // Unused event

    });

    connection.onRemoveDeployment((deploymentId) => {

      injectee.commit('removeDeployment', deploymentId);

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Undeployed service',
          'Removed service ' + deploymentId)
      );

    });

    connection.onAddService((serviceId: string, service: Service) => {

      let val: { [id: string]: Service } = {};
      val[serviceId] = service;
      injectee.commit('addService', val);

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Registered service',
          'Registered service ' + serviceId)
      );

    });

    connection.onAddComponent((componentId: string, component: Component) => {

      let val: { [id: string]: Component } = {};
      val[componentId] = component;
      injectee.commit('addComponent', val);
      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Registered component',
          'Registered component ' + componentId)
      );

    });

    connection.onAddRuntime((runtimeId: string, runtime: Runtime) => {

      let val: { [id: string]: Runtime } = {};
      val[runtimeId] = runtime;
      injectee.commit('addRuntime', val);
      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Registered runtime',
          'Registered runtime ' + runtimeId)
      );

    });

    connection.onAddResource((resourceId: string, resource: Resource) => {

      // Obtenemos el tipo de resource del que estamos hablando
      let type: ResourceType = getResourceType(resourceId);
      let commitString: string;
      switch (type) {
        case ResourceType.certificate:
          commitString = 'addCertificate';
          break;
        case ResourceType.domain:
          commitString = 'addDomain';
          break;
        case ResourceType.volume:
          commitString = 'addVolume';
          break;
        default:
          console.error('Not expected resource type at %s', resourceId);
      }

      /**
       * If the object is not known for the page it won't be added, but the page
       * will keep loading.
       * 
       * TODO: This must be checked
       */
      if (type) {

        let val: { [id: string]: Resource } = {};
        val[resourceId] = resource;
        injectee.commit(commitString, val);
        injectee.dispatch('addNotification',
          new Notification(Notification.LEVEL.INFO, 'Registered resource',
            'Registered resurce ' + resourceId)
        );

      }

    });

    connection.onRemoveResource((resourceId: string) => {

      injectee.commit('removeResource', resourceId);

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Removed resource',
          'Removed resurce ' + resourceId)
      );

    });

    connection.onAddMetrics((metrics) => {

      injectee.commit('addMetrics', metrics);

    });

    connection.onLink((params) => {

      injectee.commit('link', params);

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Linked deployments',
          'Linked deployments')
      );

    });

    connection.onUnlink((params) => {

      injectee.commit('unlink', params);

      injectee.dispatch('addNotification',
        new Notification(Notification.LEVEL.INFO, 'Unlinked deployments',
          'Unlinked deployments')
      );

    });
  }
};