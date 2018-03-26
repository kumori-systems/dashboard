import { setTimeout } from 'timers';
import Vuex from 'vuex';
import State from './state';

import { ProxyConnection } from '../../api';
import { getResourceType } from '../../api/utils';
import {
  Certificate, Component, Deployment, Domain, Resource, Runtime, Service, Volume
} from '../stampstate/classes';
import { BackgroundAction, Notification, User } from './classes';

import {
  PersistentVolume, VolatileVolume
} from '../stampstate/classes/resource';
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
    ProxyConnection.instance.signOut();

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

      return ProxyConnection.instance.signIn(
        payload.username, payload.userpassword, payload.userid, payload.token
      );

    }).then((user) => { // Finish signIn action in the state

      return injectee.dispatch('finishBackgroundAction', {
        'type': BackgroundAction.TYPE.SIGNIN,
        'state': BackgroundAction.STATE.SUCCESS
      }).then(() => user);

    }).then((user) => { // Define all listeners

      ProxyConnection.instance.onMustSignOut((reason: string) => {

        injectee.dispatch('signOut').then(() => {
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.SIGNIN,
            'state': BackgroundAction.STATE.FAIL,
            'details': reason
          });
        });

      });

      ProxyConnection.instance.onRefreshToken((token) => {

        injectee.dispatch('refreshToken', token);

      });

      ProxyConnection.instance.onDeploy((deploymentId: string,
        deployment: Deployment) => {

        let val: { [id: string]: Deployment } = {};
        val[deploymentId] = deployment;
        injectee.commit('deploy', val);

      });

      ProxyConnection.instance.onAddInstance((deploymentId: string,
        roleId: string, instanceId: string, instance: Deployment.Role.Instance
      ) => {

        injectee.commit('addInstance', {
          'deploymentId': deploymentId,
          'roleId': roleId,
          'instanceId': instanceId,
          'instance': instance
        });

      });

      ProxyConnection.instance.onUndeploy((deploymentId) => {

        injectee.commit('undeploy', deploymentId);

      });

      ProxyConnection.instance.onAddService((serviceId: string,
        service: Service) => {

        let val: { [id: string]: Service } = {};
        val[serviceId] = service;
        injectee.commit('addService', val);

      });

      ProxyConnection.instance.onAddComponent((componentId: string,
        component: Component) => {

        let val: { [id: string]: Component } = {};
        val[componentId] = component;
        injectee.commit('addComponent', val);

      });

      ProxyConnection.instance.onAddRuntime((runtimeId: string,
        runtime: Runtime) => {

        let val: { [id: string]: Runtime } = {};
        val[runtimeId] = runtime;
        injectee.commit('addRuntime', val);

      });

      ProxyConnection.instance.onAddCertificate((resourceId: string,
        resource: Certificate) => {

        let val: { [id: string]: Certificate } = {};
        val[resourceId] = resource;
        injectee.commit('addCertificate', val);

      });

      ProxyConnection.instance.onAddDomain((resourceId: string,
        resource: Domain) => {

        let val: { [id: string]: Domain } = {};
        val[resourceId] = resource;
        injectee.commit('addDomain', val);

      });

      ProxyConnection.instance.onAddPersistentVolume((resourceURN: string,
        resource: PersistentVolume) => {

        let val: { [urn: string]: PersistentVolume } = {};
        val[resourceURN] = resource;
        injectee.commit('addPersistentVolume', val);

      });

      ProxyConnection.instance.onAddVolatileVolume((resourceId: string,
        resource: VolatileVolume) => {

        let val: { [id: string]: VolatileVolume } = {};
        val[resourceId] = resource;
        injectee.commit('addVolatileVolume', val);

      });

      ProxyConnection.instance.onAddServiceMetrics((metrics) => {

        injectee.commit('addServiceMetrics', metrics);

      });

      ProxyConnection.instance.onAddVolumeMetrics((metrics) => {

        injectee.commit('addVolumeMetrics', metrics);

      });


      ProxyConnection.instance.onLink((params) => {

        injectee.commit('link', params);

      });

      ProxyConnection.instance.onUnlink((params) => {

        injectee.commit('unlink', params);

      });

      ProxyConnection.instance.onAddNotification(
        (notification: Notification) => {

          injectee.dispatch('addNotification', notification);

        });
      return user;

    }).then((user) => { // Start loading action in the state

      return injectee.dispatch(
        'addBackgroundAction',
        new BackgroundAction(
          BackgroundAction.TYPE.LOADING_DATA, 'Loading data..'
        )
      ).then(() => user);

    }).then((user) => { // Load all elements

      console.debug('Going to get a reference to all elements from the stamp');

      return ProxyConnection.instance.getRegisteredElements().then(() => {

        console.debug('Retrieved all elements from the stamp');

        injectee.dispatch('addNotification',
          new Notification(
            Notification.LEVEL.DEBUG,
            'Stored reference to items',
            'Stored a reference to all items in the platform',
            null
          )
        );
        return user;
      });

    }).then((user) => { // Load all resources

      console.debug('Retrieving all resources from the stamp');

      return ProxyConnection.instance.getResources().then(() => {

        console.debug('Retrieved all resources from the stamp');

        injectee.dispatch('addNotification',
          new Notification(
            Notification.LEVEL.DEBUG,
            'Retrieved resources data',
            'Retrieved all resources data from the platform',
            null
          )
        );
        return user;
      }).catch((err) => {
        console.error(err);
        return user;
      });

    }).then((user) => { // Load all deployments
      
      console.debug('Going to ask for deployment info');
      return ProxyConnection.instance.getDeploymentList().then(() => {
        console.debug('Retrieved info from all deployments');

        injectee.dispatch('addNotification',
          new Notification(
            Notification.LEVEL.DEBUG,
            'Retrieved deployment data',
            'Retrieved all deployment data from the platform',
            null
          )
        );

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

          ProxyConnection.instance.renewToken(actualToken)
            .then((renewedToken) => {
              injectee.commit('refreshToken', renewedToken);

              // Update localstorage info
              localStorage.setItem(
                'user', JSON.stringify(injectee.getters.user)
              );

            }).catch((error) => {

              // It was not possible to refresh the token
              // So it's set a time out and when the timeout expires, the user
              // Will automatically signout of the page
              setTimeout(() => {
                injectee.dispatch('addNotification', new Notification(
                  Notification.LEVEL.ERROR,
                  'Error refreshing token',
                  'The dashboard was unable to refresh the actual token',
                  error
                ));
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

          return injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.LOADING_DATA,
            'state': BackgroundAction.STATE.FAIL,
            'details': 'Error loading data, retry and if the problem '
              + 'persists, please contact your administrator'
          });

        });

      } else {

        injectee.dispatch('finishBackgroundAction', {
          'type': BackgroundAction.TYPE.SIGNIN,
          'state': BackgroundAction.STATE.FAIL,
          'details': 'Authentication failure'
        });

      }

    });
  }

  /** Marks a notification as readed. */
  readNotification = (injectee: Vuex.ActionContext<State, any>, payload):
    void => {
    injectee.commit('readNotification', payload);
  }

};