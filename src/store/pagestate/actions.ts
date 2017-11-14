import Vuex from 'vuex';
import State from './state';

import { connection } from '../../api';
import { getResourceType, ResourceType } from '../../api/utils';
import {
  Component, Deployment, Resource, Runtime, Service
} from '../stampstate/classes';
import { BackgroundAction, User } from './classes';

/**
 * Actions to handle this page's state easier.
 */
export default class Actions implements Vuex.ActionTree<State, any> {
  [name: string]: Vuex.Action<State, any>;

  /**
   * Tries to sign the user into the system.
   * @requires payload <{ username: string, userpassword: string }>
   * @description The required actions are started in the background.
   * If the user successfully signs-in the loaded user is saved in the state.
   * If the user is not authenticated the error message can be seen in the
   * respective background action.
   */
  signin = (injectee: Vuex.ActionContext<State, any>,
    payload: { username: string, userpassword: string }): void => {
    // Update background action info
    const authenticationAction = new BackgroundAction('authentication',
      'User authentication in the system');
    const loadInfoAction = new BackgroundAction('loadInfo',
      'Action which loads data from the system');

    injectee.commit('addBackgroundAction', authenticationAction);
    injectee.commit('processingBackgroundAction', {
      'id': authenticationAction.id,
      'details': 'Validating user'
    });
    // Remove previous authentications or intents
    injectee.commit('signOut');

    // Launch background action

    connection.login(payload.username, payload.userpassword).then((user) => {
      injectee.commit('finishBackgroundAction', {
        'id': authenticationAction.id,
        'state': BackgroundAction.State.SUCCESS,
        'details': 'Authentication sucessfull'
      });

      // Loading process
      injectee.commit('addBackgroundAction', loadInfoAction);
      injectee.commit('processingBackgroundAction', {
        'id': loadInfoAction.id,
        'details': 'Loading data..'
      });

      return connection.getDeploymentList().then(() => {
        console.debug('Retrieved all deployments from the platform');
        return connection.getRegisteredElements().then(() => {
          console.debug('Stored a reference to all elements from the platform');
          injectee.commit('finishBackgroundAction', {
            'id': loadInfoAction.id,
            'state': BackgroundAction.State.SUCCESS,
            'details': 'All data loaded'
          });
          injectee.commit('signIn', new User(user.id, user.name,
            User.State.AUTHENTICATED));
        });
      }).catch((error) => {
        injectee.commit('finishBackgroundAction', {
          'id': loadInfoAction.id,
          'state': BackgroundAction.State.FAIL,
          'details': 'Error loading data: ' + error
        });
      });
    }).catch((error) => {
      injectee.commit('finishBackgroundAction',
        {
          'id': authenticationAction.id,
          'state': BackgroundAction.State.FAIL,
          'details': 'Authentication failure'
        }
      );
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

    connection.onModifyDeployment((value) => {
      console.warn('Received event onModifyDeployment, which is still under'
        + ' development');
    });

    connection.onRemoveDeploymemt((deploymentId) => {
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
          console.error('Not expected resource type %s', type);
      }
      let val: { [id: string]: Resource } = {};
      val[resourceId] = resource;
      injectee.commit(commitString, val);
    });

    connection.onRemoveResource((resourceId: string) => {
      injectee.commit('removeResource', resourceId);
    });

    connection.onAddMetrics((metrics) => {
      injectee.commit('addMetrics', metrics);
    });

  }

  /**
   * Sets if the navigation pannel should be shown.
   * @requires payload <boolean>
   */
  showNavigation = (injectee: Vuex.ActionContext<State, any>,
    show: boolean): void => {
    injectee.commit('showNavigation', show);
  }

  /**
   * Sets if the navigation pannel should be in the minified version.
   * @requires payload <boolean>
   */
  miniNavigation = (injectee: Vuex.ActionContext<State, any>,
    mini: boolean): void => {
    injectee.commit('miniNavigation', mini);
  }
};