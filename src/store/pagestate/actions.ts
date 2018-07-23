import { setTimeout } from 'timers';
import Vuex from 'vuex';
import State from './state';

import { ProxyConnection } from '../../api';
import { getResourceType } from '../../api/utils';
import {
  Certificate, Component, Deployment, Domain, Manifest, Resource, Runtime,
  Service, Volume
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

  /**
   * Adds a background action. This is what is seen by the user as an action.
   */
  addBackgroundAction = (injectee: Vuex.ActionContext<State, any>,
    action): void => {

    injectee.commit('addBackgroundAction', action);

  }

  /**
   * Finishes a background action. Marks it as success or fail.
   */
  finishBackgroundAction = (injectee: Vuex.ActionContext<State, any>,
    { type, state, details }): void => {

    injectee.commit('finishBackgroundAction', { type, state, details });

  }

  /** Stores the new token. */
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
   * Tries to sign the user into the system. If the signin is successfull then
   * also sets a few handlers for different events provided by admission-client.
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

      /*
        Listener for when a user is forced to sign out. This happens when the
        token is not valid and could not be updated
       */
      ProxyConnection.instance.onMustSignOut((reason: string) => {

        injectee.dispatch('signOut').then(() => {
          injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.SIGNIN,
            'state': BackgroundAction.STATE.FAIL,
            'details': reason
          });
        });

      });

      /*
        This method is when a token is refreshed and the new token must be
        stored in the store.
       */
      ProxyConnection.instance.onRefreshToken((token) => {

        injectee.dispatch('refreshToken', token);

      });

      /*
        Listens for add manifest event and adds a manifest to the storage.
       */
      ProxyConnection.instance.onAddManifest((manifest: Manifest) => {

        injectee.commit('addManifest', manifest);

      });

      /*
        Listens for ondeploy events and adds new deployments to the storage.
       */
      ProxyConnection.instance.onDeploy((deploymentId: string,
        deployment: Deployment) => {

        let val: { [id: string]: Deployment } = {};
        val[deploymentId] = deployment;
        injectee.commit('deploy', val);

      });

      /*
        Listens for add instance events and adds instances to the storage.
       */
      ProxyConnection.instance.onAddInstance((deploymentId: string,
        addedInstances: { [role: string]: string[] },
        removedInstances: { [role: string]: string[] }
      ) => {
        
        /*
          Here there is a temporal fix related to ticket1289
          (https://gitlab.com/ECloud/project-management/issues/1289)

          This ticket is actually ON_HOLD, due to a dependency with other ticket
          when the ticket is available this should be the entire code:

          injectee.commit('addInstance', {
            'deploymentId': deploymentId,
            'addedInstances': addedInstances,
            'removedInstances': removedInstances
          });

          * Depending on the solution given by the STAMP ticket, other changes
          and possibly a new call will be required. *

         */
        
        injectee.commit('addInstance', {
          'deploymentId': deploymentId,
          'addedInstances': {},
          'removedInstances': removedInstances
        });

        // This is part of the temporal fix
        if (Object.keys(addedInstances).length > 0) {
          ProxyConnection.instance.getDeployment(deploymentId);
        }
        
      });

      /*
        Listens to instance state updates and applies modifications to the
        storage.
       */
      ProxyConnection.instance.onUpdateState((payload: {
        deployment: string,
        role: string,
        instance: string,
        state: Deployment.Role.Instance.STATE
      }) => {

        injectee.commit('updateState', payload);

      });

      /*
        Listens to the add service event and adds the new service to the
        storage.
      */
      ProxyConnection.instance.onAddService((serviceId: string,
        service: Service) => {

        let val: { [id: string]: Service } = {};
        val[serviceId] = service;
        injectee.commit('addService', val);

      });

      /*
        Listens to the add component event and adds it to the storage.
       */
      ProxyConnection.instance.onAddComponent((componentId: string,
        component: Component) => {

        let val: { [id: string]: Component } = {};
        val[componentId] = component;
        injectee.commit('addComponent', val);

      });

      /*
        Listens to the add runtime event and adds it to the storage.
       */
      ProxyConnection.instance.onAddRuntime((runtimeId: string,
        runtime: Runtime) => {

        let val: { [id: string]: Runtime } = {};
        val[runtimeId] = runtime;
        injectee.commit('addRuntime', val);

      });

      /*
        Listens to the add certificate event and adds it to the storage.
       */
      ProxyConnection.instance.onAddCertificate((resourceId: string,
        resource: Certificate) => {

        let val: { [id: string]: Certificate } = {};
        val[resourceId] = resource;
        injectee.commit('addCertificate', val);

      });

      /*
        Listens to the add domain event and adds the new domain to the storage.
       */
      ProxyConnection.instance.onAddDomain((resourceId: string,
        resource: Domain) => {

        let val: { [id: string]: Domain } = {};
        val[resourceId] = resource;
        injectee.commit('addDomain', val);

      });

      /*
        Listens to add persistent volume events and adds new volumes to the
        storage.
      */
      ProxyConnection.instance.onAddPersistentVolume((resourceURN: string,
        resource: PersistentVolume) => {

        let val: { [urn: string]: PersistentVolume } = {};
        val[resourceURN] = resource;
        injectee.commit('addPersistentVolume', val);

      });

      /*
        Listens to add volatile volumes events and adds new volumes to the
        storage.
      */
      ProxyConnection.instance.onAddVolatileVolume((resourceId: string,
        resource: VolatileVolume) => {

        let val: { [id: string]: VolatileVolume } = {};
        val[resourceId] = resource;
        injectee.commit('addVolatileVolume', val);

      });

      /*
        Listens to add service metrics and stores them in the storage.
      */
      ProxyConnection.instance.onAddServiceMetrics((metrics) => {

        injectee.commit('addServiceMetrics', metrics);

      });

      /*
        Listens to volume metrics events and stores them in the storage.
      */
      ProxyConnection.instance.onAddVolumeMetrics((metrics) => {

        let deployments = injectee.getters.deployments;
        let volumeId = Object.keys(metrics)[0];
        let resource = null;

        /*
          All theese bucles are just to find the resource wich contains the
          instance which sended the metrics.
        */
        for (let deploymentURN in deployments) {
          for (let roleURN in deployments[deploymentURN].roles) {
            for (
              let instanceURN in deployments[deploymentURN].roles[roleURN]
                .instances
            ) {
              for (
                let resourceURN in deployments[deploymentURN].roles[roleURN]
                  .instances[instanceURN].resources
              ) {
                if (
                  deployments[deploymentURN].roles[roleURN]
                    .instances[instanceURN].resources[resourceURN]
                    .id === volumeId
                ) {
                  resource = deployments[deploymentURN].roles[roleURN]
                    .instances[instanceURN].resources[resourceURN]
                    ._urn;
                }
              }
            }
          }
        }

        injectee.commit(
          'addVolumeMetrics', { resource, metrics }
        );

      });

      /*
        Listens to link events and makes the relative changes in the storage.
      */
      ProxyConnection.instance.onLink((params) => {

        injectee.commit('link', params);

      });


      /*
        Listens to unlink events and makes the relative changes in the storage.
      */
      ProxyConnection.instance.onUnlink((params) => {

        injectee.commit('unlink', params);

      });

      /*
        Listens to add notification events and adds them to the storage.
      */
      ProxyConnection.instance.onAddNotification(
        (notification: Notification) => {

          injectee.dispatch('addNotification', notification);

        });

      return user;

    }).then((user) => { // Start loading action in the state

      /*
        This is used to show a message when the page is loading.
      */
      return injectee.dispatch(
        'addBackgroundAction',
        new BackgroundAction(
          BackgroundAction.TYPE.LOADING_DATA, 'Loading data..'
        )
      ).then(() => user);

    }).then((user) => { // Load all elements

      /*
        This retrieves the storaged elements in the stamp
      */
      return ProxyConnection.instance.getRegisteredElements().then(() => {
        /*
        injectee.dispatch('addNotification',
          new Notification(
            Notification.LEVEL.DEBUG,
            'Stored reference to items',
            'Stored a reference to all items in the platform',
            null
          )
        );
        */
        return user;
      });

    }).then((user) => { // Load all resources

      /*
        This retrieves the storaged resources in the stamp
      */
      return ProxyConnection.instance.getResources().then(() => {

        /*
        injectee.dispatch('addNotification',
          new Notification(
            Notification.LEVEL.DEBUG,
            'Retrieved resources data',
            'Retrieved all resources data from the platform',
            null
          )
        );
        */
        return user;
      }).catch((err) => {
        /*
        console.error(err);
        */
        return user;
      });

    }).then((user) => { // Load all deployments

      /*
        This retrieves the actual deployments in the stamp
      */
      return ProxyConnection.instance.getDeploymentList().then(() => {

        /*
        injectee.dispatch('addNotification',
          new Notification(
            Notification.LEVEL.DEBUG,
            'Retrieved deployment data',
            'Retrieved all deployment data from the platform',
            null
          )
        );
        */

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

        // This stops the login of the page
        injectee.dispatch('finishBackgroundAction', {
          'type': BackgroundAction.TYPE.SIGNIN,
          'state': BackgroundAction.STATE.FAIL,
          'details': 'Network error'
        });

      }
      else if (error.message === 'Element not covered') {

        // If a not covered error happens, to avoid troubles in the storage
        // the user is signed out -> Remove user form storage
        injectee.dispatch('signOut').then(() => {

          return injectee.dispatch('finishBackgroundAction', {
            'type': BackgroundAction.TYPE.LOADING_DATA,
            'state': BackgroundAction.STATE.FAIL,
            'details': 'Error loading data, retry and if the problem '
              + 'persists, please contact your administrator'
          });

        });

      } else {

        // The authentication request was successfull but the user-password
        // was not recognized by the stamp
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