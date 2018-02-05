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

  finishBackgroundAction = (injectee: Vuex.ActionContext<State, any>,
    { type, state, details }): void => {

    injectee.commit('finishBackgroundAction', { type, state, details });

  }

  addNotification = (injectee: Vuex.ActionContext<State, any>,
    notification: Notification): void => {

    injectee.commit('addNotification', notification);

  }

  /** Signs the user out of the page. */
  signout = (injectee: Vuex.ActionContext<State, any>, payload): void => {

    // If sessionstorage is available
    if (typeof (Storage) !== 'undefined') {
      // Removes the user form sessionstorage
      sessionStorage.removeItem('user');
    }

    // Removes the user from vuex
    injectee.commit('clearState');

    // Closes all connections to the system.
    connection.logout();

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

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.LOGIN, 'Validating user')
    );

    // Launch background action
    connection.login(
      payload.username, payload.userpassword, payload.userid, payload.token
    ).then((user) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.LOGIN,
        'state': BackgroundAction.STATE.SUCCESS
      });

      injectee.dispatch(
        'addBackgroundAction',
        new BackgroundAction(
          BackgroundAction.TYPE.LOADING_DATA,
          'Loading data..'
        )
      );

      // Load all elements
      return connection.getRegisteredElements().then(() => {

        console.debug('Stored a reference to all elements from the platform');

        // Load all deployments
        return connection.getDeploymentList().then(() => {

          console.debug('Retrieved all deployments from the platform');

          // If sessionstorage is available
          if (typeof (Storage) !== 'undefined') {
            // Stores the item in local storage
            sessionStorage.setItem('user',
              JSON.stringify(user));
          }

          // Stores the item in vuex
          user.state = User.State.AUTHENTICATED;
          injectee.commit('signIn', user);

          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.LOADING_DATA,
            'state': BackgroundAction.STATE.SUCCESS
          });

        });

      }).catch((error) => {
        if (error.code && error.code === '001') {
          // This kind of error can be ignored
        } else {
          console.error(error);
          injectee.dispatch('signout');
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.LOADING_DATA,
            'state': BackgroundAction.STATE.FAIL,
            'details': 'Error loading data, retry and if the problem persists, '
              + 'please contact your administrator'
          });
        }

      });

    }).catch((error) => {

      injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.LOGIN,
        'state': BackgroundAction.STATE.FAIL,
        'details': 'Authentication failure'
      });

    });

    connection.onMustSignOut((reason: string) => {

      injectee.dispatch('signout').then(() => {
        injectee.dispatch('finishBackgroundAction', {
          'type': BackgroundAction.TYPE.LOGIN,
          'state': BackgroundAction.STATE.FAIL,
          'details': reason
        });
      });

    });

    connection.onAddDeployment((deploymentId: string,
      deployment: Deployment) => {

      let val: { [id: string]: Deployment } = {};
      val[deploymentId] = deployment;
      injectee.commit('addDeployment', val);

    });

    connection.onAddInstance((deploymentId: string, roleId: string,
      instanceId: string, instance: Deployment.Role.Instance) => {

      injectee.commit('addInstance', {
        'deploymentId': deploymentId,
        'roleId': roleId,
        'instanceId': instanceId,
        'instance': instance
      });

    });

    connection.onRemoveDeployment((deploymentId) => {

      injectee.commit('removeDeployment', deploymentId);

    });

    connection.onAddService((serviceId: string, service: Service) => {

      let val: { [id: string]: Service } = {};
      val[serviceId] = service;
      injectee.commit('addService', val);

    });

    connection.onAddComponent((componentId: string, component: Component) => {

      let val: { [id: string]: Component } = {};
      val[componentId] = component;
      injectee.commit('addComponent', val);

    });

    connection.onAddRuntime((runtimeId: string, runtime: Runtime) => {

      let val: { [id: string]: Runtime } = {};
      val[runtimeId] = runtime;
      injectee.commit('addRuntime', val);

    });

    connection.onAddResource((resourceId: string, resource: Resource) => {

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
          console.error('Not expected resource type %s', resourceId);
      }

      /**
       * If the object is not known for the page it won't be added, but the page
       * will keep loading.
       */
      if (type) {

        let val: { [id: string]: Resource } = {};
        val[resourceId] = resource;
        injectee.commit(commitString, val);

      }

    });

    connection.onAddMetrics((metrics) => {

      injectee.commit('addMetrics', metrics);

    });

    connection.onLink((params) => {

      injectee.commit('link', params);

    });

    connection.onUnlink((params) => {

      injectee.commit('unlink', params);

    });

    connection.onAddNotification((notification: Notification) => {
      injectee.dispatch('addNotification', notification);
    });

  }

  /** Marks a notification as readed. */
  readNotification = (injectee: Vuex.ActionContext<State, any>, payload):
    void => {
    injectee.commit('readNotification', payload);
  }

};