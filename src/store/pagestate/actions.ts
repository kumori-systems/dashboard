import { setTimeout } from 'timers';
import Vuex from 'vuex';
import State from './state';

import { connection } from '../../api';
import { getResourceType, ResourceType } from '../../api/utils';
import {
  Component, Deployment, Resource, Runtime, Service
} from '../stampstate/classes';
import { BackgroundAction, Notification, User } from './classes';


import PSGetters from './getters';


let checktokeninterval = null;

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

  refreshToken = (injectee: Vuex.ActionContext<State, any>, token: User.Token):
    void => {

    injectee.commit('refreshToken', token);

  }

  /** Adds a notification in the local state. */
  addNotification = (injectee: Vuex.ActionContext<State, any>,
    notification: Notification): void => {

    injectee.commit('addNotification', notification);

  }

  /** Signs the user out of the page. */
  signOut = (injectee: Vuex.ActionContext<State, any>, payload): void => {

    // If localstorage is available
    if (typeof (Storage) !== 'undefined') {

      // Removes the user form localStorage
      localStorage.removeItem('user');

    }

    // Removes the token checking interval
    clearInterval(checktokeninterval);

    // Removes the user from vuex
    injectee.commit('clearState');

    // Closes all connections to the system.
    connection.signOut();

  }

  /**
   * Tries to sign the user into the system.
   * @requires payload <{ username: string, userpassword: string }>
   * @description The required actions are started in the background.
   * If the user successfully signs-in the loaded user is saved in the state.
   * If the user is not authenticated the error message can be seen in the
   * respective background action.
   */
  signIn = (injectee: Vuex.ActionContext<State, any>, payload: {
    username: string, userpassword: string, userid: string, token: User.Token
  }): void => {

    injectee.dispatch(
      'addBackgroundAction',
      new BackgroundAction(BackgroundAction.TYPE.SIGNIN, 'Validating user')
    ).then(() => { // Check correc id and password

      return connection.signIn(
        payload.username, payload.userpassword, payload.userid, payload.token
      );

    }).then((user) => { // Finish signIn action in the state

      return injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.SIGNIN,
        'state': BackgroundAction.STATE.SUCCESS
      }).then(() => user);

    }).then((user) => { // Start loading action in the state

      return injectee.dispatch(
        'addBackgroundAction',
        new BackgroundAction(
          BackgroundAction.TYPE.LOADING_DATA, 'Loading data..'
        )
      ).then(() => user);

    }).then((user) => { // Load all elements
      
      return connection.getRegisteredElements().then(() => {
        console.debug('Stored a reference to all elements from the platform');
        return user;
      });

    }).then((user) => { // Load all deployments

      return connection.getDeploymentList().then(() => {
        console.debug('Retrieved all deployments from the platform');
        return user;
      });

    }).then((user) => { // Locally stores the user

      // If localStorage is available
      if (typeof (Storage) !== 'undefined') {
        // Stores the item in local storage
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Stores the user in vuex
      user.state = User.State.AUTHENTICATED;
      injectee.commit('signIn', user);

      return injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.LOADING_DATA,
        'state': BackgroundAction.STATE.SUCCESS
      });

    }).then((user) => { // Sets the token check interval

      const tokenCheckerTimeInterval = 1000 * 60 * 10; // 10 minutes

      checktokeninterval = setInterval(() => {

        let actualToken = ((<PSGetters>injectee.getters).user as any as User)
          .token;

        // This is the last interval in which the token will be alive
        if (new Date() > new Date(
          new Date(actualToken.creationDate).getTime()
          + actualToken.expiresIn * 1000
          - tokenCheckerTimeInterval
        )) {

          connection.renewToken(actualToken)
            .then((renewedToken) => {
              injectee.commit('refreshToken', renewedToken);

              // Update localstorage info
              localStorage.setItem('user', injectee.getters.user);

            }).catch((error) => {

              // It was not possible to refresh the token
              // So it's set a time out and when the timeout expires, the user
              // Will automatically signout of the page
              setTimeout(() => {
                console.error('Error refreshing token', error);
                injectee.dispatch('signOut').then(() => {
                  injectee.dispatch('finishBackgroundAction', {
                    'type': BackgroundAction.TYPE.SIGNIN,
                    'state': BackgroundAction.STATE.FAIL,
                    'details': 'Token refresh failed'
                  });
                });
              },
                new Date(
                  new Date(actualToken.creationDate).getTime()
                  + actualToken.expiresIn * 1000
                ).getTime() - (new Date()).getTime()
              );
            });


        } else {
          // Not yet time to renew the token
        }

      }, tokenCheckerTimeInterval);



    }).catch((error: Error) => {
      if (error.message === 'Duplicated request') {
        // This just happens because vuex makes a lot of requests at the same
        // time
      }
      else if (
        error.message === 'Network Error'
        || error.message === 'Connection error!'
      ) {
        injectee.dispatch('finishBackgroundAction', {
          'type': BackgroundAction.TYPE.SIGNIN,
          'state': BackgroundAction.STATE.FAIL,
          'details': 'Network error'
        });
      }
      else if (error.message === 'Element not covered') {

        injectee.dispatch('signOut').then(() => {
          console.error(error);
          return injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.LOADING_DATA,
            'state': BackgroundAction.STATE.FAIL,
            'details': 'Error loading data, retry and if the problem '
              + 'persists, please contact your administrator'
          });
        });

      } else {

        console.error(error);
        injectee.dispatch('finishBackgroundAction', {
          'type': BackgroundAction.TYPE.SIGNIN,
          'state': BackgroundAction.STATE.FAIL,
          'details': 'Authentication failure'
        });

      }

    });

    connection.onMustSignOut((reason: string) => {

      injectee.dispatch('signOut').then(() => {
        injectee.dispatch('finishBackgroundAction', {
          'type': BackgroundAction.TYPE.SIGNIN,
          'state': BackgroundAction.STATE.FAIL,
          'details': reason
        });
      });

    });

    connection.onRefreshToken((token) => {
      injectee.dispatch('refreshToken', token);
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