import Vuex from 'vuex';

import {
  getElementDomain,
  getElementName,
  getElementType,
  getElementVersion,
  getResourceType
} from '../../api/utils';
import State from './state';
import { tools } from './utils';

import { ECloudElement, Manifest, Resource } from '../stampstate/classes';

import FileSaver from 'file-saver';

const maniAPI = {
  callback: (actionContext: Vuex.ActionContext<State, any>, todo: any) => {
    for (let mutation of todo) {
      actionContext.commit(mutation.name, mutation.params);
    }
  },
  updateManifest: (data: any, path: string,
    actionContext: Vuex.ActionContext<State, any>, actions: any) => {

    actionContext.commit('updateManifest', { data, path });
    maniAPI.callback(actionContext, actions.success);

  },
  getGraph: (data, actionContext) => {
    /*
    console.error('GETGRAPH is under development');
    */
    let url = '/getgraph?service=' + data;
    // maniAPI.GET(url, actionContext, maniAPI.manageRes);

  },
  makeParams: (data, path, file) => {

    return { data: data, path: file.filePath, jsonPath: path };

  },
  manageRes: (actionContext, response) => {

    let res = JSON.parse(response.bodyText);
    if (res.status === 200) actionContext.dispatch('setState', res.data);
    if (res.status === 201) actionContext.dispatch('setServs', res.data);
    if (res.status === 500) {
      actionContext.dispatch('resetService');
      res.path = res.path !== undefined ? res.path : '';
      actionContext.dispatch('addAlert', { text: res.error, extra: res.path });
    }

  }

};

/**
 * Actions to handle the representation of the stamp state easier.
 */
export default class Actions implements Vuex.ActionTree<State, any> {
  [name: string]: Vuex.Action<State, any>;

  /**
   * This action is the responsible for copying all manifests from the
   * stampstate module of the store to the manifesteditor module of the store.
   */
  loadManifests = (actionContext: Vuex.ActionContext<State, any>): void => {

    actionContext.commit('clearLocalState');

    actionContext.commit(
      'loadManifests', actionContext.rootState.stampstate.manifests
    );

    let runtimes: { 'eslap': string }[] = [];

    for (let runtimeURI in actionContext.rootState.stampstate.runtimes) {
      if (actionContext.rootState.stampstate.runtimes[runtimeURI]) {
        runtimes.push({ 'eslap': runtimeURI });
      }
    }

    actionContext.commit('loadRuntimes', runtimes);

  }
  downloadTemporalManifest = (actionContext: Vuex.ActionContext<State, any>
  ): void => {

    let temporalManifest = actionContext.state
      .manifests[actionContext.state.currentManifest];

    // Stores the temporal manifest in a local file
    FileSaver.saveAs(
      new Blob([JSON.stringify(temporalManifest, null, 2) + '\n'], {
        type: 'application/json;charset=utf-8'
      }),
      'TemporalManifest.' + temporalManifest._urn + '.json'
    );

  }

  // TODO - dont know what this is used for
  setState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    actionContext.commit('setState', payload);
  }

  // TODO - alerts should be handled by the page
  deleteAlert = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    actionContext.commit('deleteAlert', payload);
  }

  // TODO - alerts should be handled by the page
  alertResult = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    actionContext.commit('displayAlertPan', false);
    if (payload) {
      actionContext.state.confirm.accept();
    } else {
      actionContext.state.confirm.deny();
    }
  }

  // TODO - alerts should be handled by the page
  addAlert = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    payload.extra = payload.extra !== undefined ? payload.extra : '';
    actionContext.commit('addAlert', {
      text: payload.text,
      type: actionContext.state.Settings.alerts.danger,
      extra: payload.extra
    });
  }

  // TODO - don't know the payload type
  clearModals = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    actionContext.commit('clearModals', payload);
  }

  /**
   * Sets the deployment state.
   */
  setDeploymentState = (actionContext: Vuex.ActionContext<State, any>
  ): void => {
    let deploy: Manifest = actionContext.state
      .manifests[actionContext.state.currentManifest];

    // Obtains the name of the service
    let serviceName = {
      name: getElementName(deploy.servicename),
      domain: getElementDomain(deploy.servicename),
      version: getElementVersion(deploy.servicename)
    };

    // Obtains deployment parameters
    let parameters = deploy.configuration ?
      deploy.configuration.parameters : {};

    // Updates deployment's name
    actionContext.commit(
      'updateDeployState', { key: 'name', value: deploy.name }
    );

    // Updates deployment's service
    actionContext.commit(
      'updateDeployState', { key: 'service', value: serviceName }
    );

    // Updates deployment's resources
    actionContext.commit(
      'updateDeployState', { key: 'resources', value: deploy.resources }
    );

    // Updates deployment's parameters
    actionContext.commit(
      'updateDeployState', { key: 'parameters', value: parameters }
    );

    // Updates deployment's interconnection
    actionContext.commit(
      'updateDeployState',
      {
        key: 'interconnection',
        value: deploy.interconnection ? deploy.interconnection : null
      }
    );

    // Removes the resource validation
    actionContext.commit('deleteDeploymentStateValidation');

    for (let key in deploy.resources) {

      // It seems it's a bug in here, so it changes 'updater' depending of
      // if there is an even or odd number of resources
      actionContext.commit(
        'updateDeployResState', { key: key, value: deploy.resources[key] }
      );

      // This will change state.deploymentState.resValidation[key] to ''
      actionContext.commit(
        'setValidation',
        {
          validation: actionContext.state.deploymentState.resValidation,
          prop: key,
          msg: ''
        }
      );
    }

    actionContext.dispatch('validateDeployRes');
    actionContext.commit('setDeploymentParams');
  }

  validateDeployRes = (actionContext: Vuex.ActionContext<State, any>): void => {

    if (actionContext.state.currentManifest) {

      // Current manifest - which must be a deployment
      let deploy: Manifest = actionContext.state
        .manifests[actionContext.state.currentManifest];

      // Service of the deployment referenced by current manifest
      let service: Manifest = actionContext.state
        .manifests[deploy.servicename];

      // Resources of the deploymentState
      let userState = actionContext.state.deploymentState.resources;

      for (let x in userState) { // For each resource at deploymentState

        // If the resource is a volatile volume, no change should be allowed
        let resType = getResourceType(userState[x].type);
        if (
          resType !== Resource.RESOURCE_TYPE.VOLATILE_VOLUME
          &&
          resType !== Resource.RESOURCE_TYPE.CERTIFICATE
        ) {

          // If a resource is selected
          if (
            userState[x].resource
            && userState[x].resource.name
            && userState[x].resource.name.length > 0
          ) {

            let res = actionContext.state.manifests[userState[x].resource.name];
            if (res) {
              // If the resource's type is not the required type
              if (res._type !== deploy.resources[x].type) {

                // Set error invalid type
                actionContext.commit('setErrValidation', {
                  validation: actionContext.state.deploymentState.resValidation,
                  prop: x,
                  msg: 'invalidType'
                });

              }
            } else { // If the resource doesn't exists in the state

              // Set error manifest not found
              actionContext.commit(
                'setErrValidation',
                {
                  validation: actionContext.state.deploymentState.resValidation,
                  prop: x,
                  msg: 'manifest404'
                }
              );

            }

          } else { // No resource is selected

            // Set error not allowed empty parameter
            actionContext.commit('setErrValidation', {
              validation: actionContext.state.deploymentState.resValidation,
              prop: x,
              msg: 'empty'
            });

          }
        }
      }
    }
  }

  updateDeployState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let validation = actionContext.state.deploymentState.validation;
    actionContext.commit('updateDeployState', payload);
    actionContext.commit('updateValidation', {
      validation: validation,
      prop: payload.key,
      type: 'deployment',
      value: payload.value
    });
    if (!actionContext.state.deploymentState.validation.name.err) {
      maniAPI.updateManifest(payload.value, 'name', actionContext, {
        success: [],
        failure: []
      });
    }

  }

  updateDeployParamState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let validation = actionContext.state.deploymentState.paramValidation;
    let key = payload.role + payload.name;
    actionContext.commit('updateDeployParamState', {
      key: key,
      value: payload.value
    });
    actionContext.commit(
      'resetValidation',
      { validation: validation, key: key }
    );
    actionContext.commit('updateValidationType', {
      validation: validation,
      prop: key,
      type: payload.type,
      value: payload.value
    });

    if (!validation[key].err) {
      let path = 'configuration.parameters.';
      if (payload.role.length > 0) path = path + payload.role + '.';
      path = path + payload.name;

      switch (payload.type) {
        case 'number':
        case 'integer':
          payload.value = payload.value * 1;
          break;
        case 'vhost':
        case 'list':
        case 'json':
          payload.value = JSON.parse(payload.value);
          break;

        default:
          break;
      }
      maniAPI.updateManifest(payload.value, path, actionContext, {
        success: [],
        failure: []
      });
    }

  }

  updateDeployResState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('updateDeployResState', payload);

    actionContext.commit(
      'resetAllValidation',
      actionContext.state.deploymentState.resValidation
    );

    actionContext.dispatch('validateDeployRes');

    maniAPI.updateManifest(
      payload.value,
      'configuration.resources.' + payload.key,
      actionContext,
      {
        success: [],
        failure: []
      }
    );

  }

  setArrangement = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('setArrangement', payload);
    actionContext.dispatch('validateArrangements');

  }

  validateArrangements = (actionContext: Vuex.ActionContext<State, any>
  ): void => {

    let arrangements = actionContext.state.deploymentState.arrangements;
    Object.keys(arrangements).filter(x => {
      actionContext.commit('updateValidation', {
        type: 'arrangements',
        prop: x,
        value: arrangements[x].toString(),
        validation: actionContext.state.deploymentState.arrValidation
      });
    });

  }

  updateArrangementState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let validation = actionContext.state.deploymentState.arrValidation;

    actionContext.commit('updateArrangementState', payload);
    actionContext.commit('resetValidation', {
      key: payload.key,
      validation: validation
    });
    actionContext.commit('updateValidation', {
      type: 'arrangements',
      prop: payload.key,
      value: payload.value.toString(),
      validation: validation
    });
    if (!validation[payload.key].err) {
      payload.value = tools.parseType(
        payload.value,
        actionContext.state.Settings.manifestStructure.elementtype.arrangements
          .types[payload.key].type
      );
      let path = 'roles.' + actionContext.state.currentArrangement
        + '.resources';
      let resources = Object.assign(
        {},
        actionContext.state.manifests[actionContext.state.currentManifest]
          .roles[actionContext.state.currentArrangement].resources
      );
      resources[payload.key] = payload.value;

      maniAPI.updateManifest(resources, path, actionContext, {
        success: [
          {
            name: 'updateArrangement',
            params: resources
          }
        ],
        failure: []
      });
    }

  }

  delteArrangement = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let path = 'roles.' + actionContext.state.currentArrangement + '.resources';
    let resources = Object.assign(
      {},
      actionContext.state.manifests[actionContext.state.currentManifest]
        .roles[actionContext.state.currentArrangement].resources
    );
    delete resources[payload];

    maniAPI.updateManifest(resources, path, actionContext, {
      success: [
        { name: 'updateArrangement', params: resources },
        { name: 'deleteArrangementState', params: payload }
      ],
      failure: []
    });

  }

  addArrangement = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let validation = actionContext.state.deploymentState.arrValidation;
    let path = 'roles.' + actionContext.state.currentArrangement + '.resources';
    let resources = Object.assign(
      {},
      actionContext.state.manifests[actionContext.state.currentManifest]
        .roles[actionContext.state.currentArrangement].resources
    );

    resources[payload] =
      actionContext.state.Settings.manifestStructure.elementtype.arrangements
        .types[payload].default;
    let success = [
      {
        name: 'updateArrangementState',
        params: {
          key: payload,
          value: resources[payload]
        }
      },
      {
        name: 'updateValidation',
        params: {
          type: 'arrangements',
          prop: payload,
          value: resources[payload].toString(),
          validation: validation
        }
      }
    ];
    maniAPI.updateManifest(resources, path, actionContext, {
      success: success,
      failure: []
    });

  }

  setDeployCharts = (actionContext: Vuex.ActionContext<State, any>): void => {

    let colorsData = actionContext.state.deploymentState.colorsData;

    let setColor = (colors, key) => {
      let color = colorsData[key];
      if (!color) {

        color = '#' + Math.floor(Math.random() * 16777215).toString(16);

        while (colors.indexOf(color) > -1 || color.length < 7) {

          color = '#' + Math.floor(Math.random() * 16777215).toString(16);

        }

        colorsData[key] = color;

      }

      colors.push(color);

    };

    let charts = {
      instances: {
        id: 'instances',
        data: [],
        colors: [],
        resize: true
      },
      cpu: {
        id: 'cpu',
        data: [],
        colors: [],
        resize: true
      },
      memory: {
        id: 'memory',
        data: [],
        colors: [],
        resize: true
      },
      resume: {
        id: 'resume',
        data: [],
        colors: [],
        resize: true,
        xkey: 'prop',
        ykeys: '["val"]',
        grid: 'true'
      }
    };

    let totales = {
      instances: 0,
      cpu: 0,
      memory: 0
    };

    let currentManifest = actionContext.state.currentManifest;
    if (currentManifest) {

      let roles = actionContext.state.manifests[currentManifest].roles;

      for (let key in roles) {

        charts.instances.data.push({
          label: key,
          value: roles[key].arrangement.instances
        });

        setColor(charts.instances.colors, key);
        charts.cpu.data.push({
          label: key,
          value: roles[key].arrangement.cpu
        });

        setColor(charts.cpu.colors, key);
        charts.memory.data.push({
          label: key,
          value: roles[key].arrangement.memory
        });

        setColor(charts.memory.colors, key);
        totales.instances += roles[key].arrangement.instances;
        totales.cpu += roles[key].arrangement.cpu;
        totales.memory += roles[key].arrangement.memory;

      }

      Object.keys(totales).map(key => {
        charts.resume.data.push({ prop: key, val: totales[key] });
      });

      actionContext.commit('setDeployCharts', charts);
    }

  }

  // COMPONENTS
  setComponentState = (actionContext: Vuex.ActionContext<State, any>): void => {

    let component = actionContext.state
      .manifests[actionContext.state.currentManifest];

    actionContext.commit('updateCompState', {
      key: 'name',
      value: {
        'domain': getElementDomain(component._urn),
        'name': getElementName(component._urn),
        'version': getElementVersion(component._urn)
      }
    });

    actionContext.commit('updateCompState', {
      key: 'runtime',
      value: component.runtime
    });

    actionContext.commit('updateConfState', {
      key: 'resources',
      value: component.configuration.resources
    });

    actionContext.commit('updateConfState', {
      key: 'parameters',
      value: component.configuration.parameters
    });

    let validation = actionContext.state.componentState.validation;

    actionContext.commit('updateAllValidation', {
      type: 'component',
      data: component,
      currState: actionContext.state.componentState
    });

    if (
      actionContext.state.Settings.manifestStructure.elementtype.runtime.enum
        .filter(x => { return x.eslap === component.runtime; }).length === 0
    ) {

      actionContext.commit('setErrValidation', {
        validation: validation,
        prop: 'runtime',
        msg: 'wrongruntime'
      });

    }

  }

  updateComponentState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('updateCompState', payload);
    let component = actionContext.state
      .manifests[actionContext.state.currentManifest];

    let path = '';
    let success = [];
    if ((payload.key = 'runtime')) {
      path = payload.key;
      success.push({
        name: 'setComponentRuntime',
        params: {
          value: payload.value
        }
      });
    }

    actionContext.commit('updateAllValidation', {
      type: 'component',
      data: component,
      currState: actionContext.state.componentState
    });

    maniAPI.updateManifest(payload.value, path, actionContext, {
      success: success,
      failure: []
    });
  }

  updateConfigState = (
    actionContext: Vuex.ActionContext<State, any>,
    payload: any
  ): void => {
    let component = actionContext.state
      .manifests[actionContext.state.currentManifest];
    actionContext.commit('updateConfigState', payload);
    actionContext.commit('resetValidation', {
      key: payload.key,
      validation: actionContext.state.configurationState.validation
    });
    if (
      payload.key === 'rname' &&
      component.configuration.resources.filter(x => {
        return x.name === payload.value;
      }).length > 0
    )
      actionContext.commit('setErrValidation', {
        validation: actionContext.state.configurationState.validation,
        prop: 'rname',
        msg: 'dupname'
      });
    if (
      payload.key === 'pname' &&
      component.configuration.parameters.filter(x => {
        return x.name === payload.value;
      }).length > 0
    ) {
      actionContext.commit('setErrValidation', {
        validation: actionContext.state.configurationState.validation,
        prop: 'pname',
        msg: 'dupname'
      });
    }
  }

  addComponentResource = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    let component = actionContext.state
      .manifests[actionContext.state.currentManifest];
    actionContext.commit('updateValidation', {
      type: 'configuration',
      prop: 'rname',
      value: payload.name,
      validation: actionContext.state.configurationState.validation
    });

    if (
      component.configuration.resources.filter(x => {
        return x.name === payload.name;
      }).length > 0
    ) {
      actionContext.commit('setErrValidation', {
        validation: actionContext.state.configurationState.validation,
        prop: 'rname',
        msg: 'dupname'
      });
    }

    if (!actionContext.state.configurationState.validation.rname.err) {
      let resources = component.configuration.resources.slice();
      resources.push(payload);

      maniAPI.updateManifest(
        resources,
        'configuration.resources',
        actionContext,
        {
          success: [
            {
              name: 'setComponentResources',
              params: resources
            },
            {
              name: 'updateConfigState',
              params: {
                key: 'resources',
                value: resources
              }
            },
            {
              name: 'updateConfigState',
              params: {
                key: 'rname',
                value: ''
              }
            }
          ],
          failure: []
        });
    }
  }

  addComponentParameter = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    let component = actionContext.state
      .manifests[actionContext.state.currentManifest];
    actionContext.commit('updateValidation', {
      type: 'configuration',
      prop: 'pname',
      value: payload.name,
      validation: actionContext.state.configurationState.validation
    });
    if (
      component.configuration.parameters.filter(x => {
        return x.name === payload.name;
      }).length > 0
    )
      actionContext.commit('setErrValidation', {
        validation: actionContext.state.configurationState.validation,
        prop: 'pname',
        msg: 'dupname'
      });

    if (!actionContext.state.configurationState.validation.pname.err) {
      let parameters = component.configuration.parameters.slice();
      parameters.push(payload);

      maniAPI.updateManifest(
        parameters,
        'configuration.parameters',
        actionContext,
        {
          success: [
            {
              name: 'setComponentParameters',
              params: parameters
            },
            {
              name: 'updateConfigState',
              params: {
                key: 'parameters',
                value: parameters
              }
            },
            {
              name: 'updateConfigState',
              params: {
                key: 'pname',
                value: ''
              }
            }
          ],
          failure: []
        });
    }
  }

  deleteComponentResource = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    let component = actionContext.state
      .manifests[actionContext.state.currentManifest];
    let resources = component.configuration.resources.slice();
    resources.splice(payload.index, 1);
    maniAPI.updateManifest(
      resources,
      'configuration.resources',
      actionContext,
      {
        success: [
          {
            name: 'setComponentResources',
            params: resources
          },
          {
            name: 'updateConfigState',
            params: {
              key: 'resources',
              value: resources
            }
          }
        ],
        failure: []
      });
  }

  deleteComponentParameter = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    let component = actionContext.state
      .manifests[actionContext.state.currentManifest];
    let parameters = component.configuration.parameters.slice();
    parameters.splice(payload.index, 1);
    maniAPI.updateManifest(
      parameters,
      'configuration.parameters',
      actionContext,
      {
        success: [
          {
            name: 'setComponentParameters',
            params: parameters
          },
          {
            name: 'updateConfigState',
            params: {
              key: 'parameters',
              value: parameters
            }
          }
        ],
        failure: []
      });
  }

  // SERVICE
  resetService = (actionContext: Vuex.ActionContext<State, any>): void => {
    actionContext.commit('clearModals', true);
    actionContext.commit('setManifest', '');
  }

  setServs = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    if (payload && Object.keys(payload).length) {
      actionContext.commit(
        'setServs',
        Object.keys(payload).map(function (key, index) {
          return {
            value: key,
            label: key,
            type: payload[key].type,
            id: index
          };
        })
      );
    }

    let services = [];
    Object.keys(payload).map(function (key, index) {
      if (payload[key].type === 'service') {
        services.push(payload[key]);
      }
      return true;
    });

    let mDependencies = {};
    for (let serv of services) {
      for (let role of serv.roles)
        if (role.component) mDependencies[role.component] = serv.name;
    }

    actionContext.commit('setDependencies', mDependencies);
    actionContext.dispatch('setState', payload);

    if (actionContext.state.currentManifest.length > 0) {
      if (payload[actionContext.state.currentManifest] !== undefined) {
        actionContext.dispatch(
          'setManifest',
          actionContext.state.currentManifest
        );
      } else {
        actionContext.commit('setManifest', '');
      }
    } else {
      actionContext.commit('setManifest', '');
    }
  }

  /**
   * When a menu is chosen the mani
   */
  setManifest = (actionContext: Vuex.ActionContext<State, any>,
    manifestURN: string): void => {

    // Changes state.currentManifest
    actionContext.commit('setManifest', manifestURN);

    // Obtains the actual element
    let element: Manifest = actionContext.state
      .manifests[actionContext.state.currentManifest];

    let state: any = null;
    switch (element.type) {
      case 'service':
        state = actionContext.state.serviceState;
        actionContext.commit('resetConnector', actionContext.state.manifests);
        break;

      case 'component':
        state = actionContext.state.componentState;
        actionContext.dispatch('setComponentState');
        break;

      case 'deployments':
        actionContext.dispatch('setDeploymentState');
        break;

      case 'resource':
        actionContext.dispatch('setResourceState');
        break;

      case 'runtime':
        state = actionContext.state.runtimeState;
        actionContext.dispatch('setRuntimeState');
        break;

      default:
        /*
        console.error('Unidentified element type at manifest editor', element);
        */
    }

    if (state) {
      actionContext.commit('setStateName', {
        state: state,
        param: {
          name: getElementName(element.name),
          domain: getElementDomain(element.name),
          version: getElementVersion(element.name)
        }
      });

      actionContext.commit('updateAllValidation', {
        type: 'service',
        data: actionContext.getters.getServiceName,
        currState: actionContext.state.serviceState
      });
    }
  }

  updateServiceName = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    let manifest = actionContext.state
      .manifests[actionContext.state.currentManifest];
    maniAPI.updateManifest('', 'name', actionContext, {
      success: [
        {
          name: 'setServiceName',
          params: {
            'domain': getElementDomain(manifest._urn),
            'name': getElementName(manifest._urn),
            'version': getElementVersion(manifest._urn)
          }
        }
      ],
      failure: [
        {
          name: 'setServiceName',
          params: manifest._urn
        }
      ]
    });
  }

  updateServState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('updateValidation', {
      type: 'service',
      prop: payload.key,
      value: payload.value,
      validation: actionContext.state.serviceState.validation
    });
    actionContext.commit('updateServState', payload);
    let path = 'name';
    maniAPI.updateManifest(payload.value, path, actionContext, {
      success: [],
      failure: []
    });

  }

  // ROLES
  setRole = (actionContext: Vuex.ActionContext<State, any>,
    actualRoleNumber: number): void => {

    // Resets the state.currentRole
    actionContext.commit('resetRole');

    // actionContext.state.roleState.resourceValidation = {}
    actionContext.commit(
      'deleteValidation',
      actionContext.state.roleState.resourceValidation
    );

    // TODO - Analizando
    actionContext.commit('setRole', actualRoleNumber);

    let currentManifest =
      actionContext.getters.manifests[actionContext.state.currentManifest];

    let role = currentManifest.roles[actionContext.state.currentRole];

    let component = actionContext.getters.manifests[role.component];

    if (component.configuration.resources) {
      component.configuration.resources.map(elem => {
        actionContext.commit('setValidation', {
          validation: actionContext.state.roleState.resourceValidation,
          prop: elem.name,
          msg: ''
        });
      });
    }

    actionContext.commit('updateAllValidation', {
      type: 'role',
      data: actionContext.getters.manifests[actionContext.state.currentManifest]
        .roles[actualRoleNumber],
      currState: actionContext.state.roleState
    });
  }

  updateRoleName = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let validation = actionContext.state.roleState.validation;
    if (validation) {

      actionContext.dispatch('updateRoleState', {
        key: 'name',
        value: payload
      });

      let roles = actionContext.state.manifests[
        actionContext.state.currentManifest
      ].roles.filter((rol, index) => {
        return rol.name === payload
          && index !== actionContext.state.currentRole;
      });

      if (roles.length > 0) {

        actionContext.commit('setErrValidation', {
          validation: validation,
          prop: 'name',
          msg: 'dupname'
        });

      }

      if (!validation.name.err && actionContext.state.currentRole > -1) {

        actionContext.dispatch('updateRoleNameInConnectors', {
          oldName: actionContext.state
            .manifests[actionContext.state.currentManifest]
            .roles[actionContext.state.currentRole].name,
          newName: payload
        });

        actionContext.dispatch('updateRoleNameInParams', {
          oldName: actionContext.state
            .manifests[actionContext.state.currentManifest]
            .roles[actionContext.state.currentRole].name,
          newName: payload
        });


        maniAPI.updateManifest(
          payload,
          'roles.' + actionContext.state.currentRole + '.name',
          actionContext,
          {
            success: [
              {
                name: 'updateRoleName',
                params: payload
              }
            ],
            failure: []
          }
        );

      }

    }

  }

  updateRoleNameInParams = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    // Obtains the current manifest parameters
    let parameters = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].configuration.parameters;

    for (let j = 0; j < parameters.length; j++) {
      if (payload.oldName === parameters[j].name) {
        actionContext.commit(
          'udpateRoleNameInParameters',
          {
            key: parameters[j].name,
            value: payload.newName
          }
        );
      }
    }

    maniAPI.updateManifest(
      parameters,
      'configuration.parameters',
      actionContext,
      {
        success: [
          {
            name: 'setServParams',
            params: parameters
          }
        ],
        failure: []
      }
    );
  }

  updateRoleNameInConnectors = (actionContext: Vuex.ActionContext<State, any>,
    payload: { oldName: string, newName: string }): void => {

    // Manifest connectors
    let connectors = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].connectors;

    // Updates the role name in a list
    let UpdateConnList = (data, list) => {
      for (let j: number = 0; j < list.length; j++) {
        if (list[j].role && data.oldName === list[j].role) {
          actionContext.commit('updateRoleNameInConnector', {
            key: list[j].role,
            value: data.newName
          });
        }
      }
    };
    for (let i: number = 0; i < connectors.length; i++) {
      UpdateConnList(payload, connectors[i].provided);
      UpdateConnList(payload, connectors[i].depended);
    }

    maniAPI.updateManifest(
      connectors,
      'connectors',
      actionContext,
      {
        success: [
          {
            name: 'updateConnectors',
            params: connectors
          }
        ],
        failure: []
      }
    );
  }

  addRole = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('updateAllValidation', {
      type: 'role',
      data: payload,
      currState: actionContext.state.roleState
    });

    if (actionContext.state.roleState.valid) {

      actionContext.commit('addRole', payload);

      try {

        let conf = actionContext.state.manifests[payload.component]
          .configuration;

        if (conf.resources.length === 0 && conf.parameters.length === 0) {

          actionContext.commit('clearModals', true);

        } else if (conf.resources) {

          conf.resources.map(elem => {

            actionContext.commit('setValidation', {
              validation: actionContext.state.roleState.resourceValidation,
              prop: elem.name,
              msg: ''
            });

          });

        }

      } catch (e) {

        actionContext.commit('clearModals', true);

      }

      actionContext.commit('updateRoles', payload);
      actionContext.commit('setRole',
        actionContext.state.manifests[
          actionContext.state.currentManifest
        ].roles.length - 1
      );

    }
  }

  /**
   * Updates the role component.
   */
  updateRoleComp = (actionContext: Vuex.ActionContext<State, any>,
    newComponent: string): void => {

    // Sets confirm callback
    actionContext.commit('updateConfirmationAccept', () => {

      actionContext.commit('updateRoleState', {
        key: 'component', value: newComponent
      });

      actionContext.dispatch(
        'deleteRoleFromConnectors', actionContext.state.currentRole
      );

      actionContext.dispatch(
        'deleteRoleFromResources', actionContext.state.currentRole
      );

      actionContext.dispatch(
        'deleteRolesResouces', actionContext.state.currentRole
      );

      actionContext.dispatch(
        'deleteRoleFromParameters', actionContext.state.currentRole
      );

      maniAPI.updateManifest(
        newComponent,
        'roles.' + actionContext.state.currentRole + '.component',
        actionContext,
        {
          success: [{
            name: 'updateRoleComp',
            params: newComponent
          }],
          failure: []
        });
    });

    // Sets deny callback
    actionContext.commit('updateConfirmationDeny', () => {
      actionContext.commit('updateRoleComp', actionContext.state
        .manifests[actionContext.state.currentManifest]
        .roles[actionContext.state.currentRole].component
      );
      actionContext.commit('updateRoleState', {
        key: 'component',
        value: actionContext.state
          .manifests[actionContext.state.currentManifest]
          .roles[actionContext.state.currentRole].component
      });
    });

    // Show warning modal
    actionContext.commit('displayAlertPan', true);
  }

  updateRoleState = (actionContext: Vuex.ActionContext<State, any>,
    payload: { key: string, value: string }): void => {
    actionContext.commit('updateRoleState', payload);
    actionContext.commit('updateValidation', {
      type: 'role',
      prop: payload.key,
      value: payload.value,
      validation: actionContext.state.roleState.validation
    });
  }

  deleteRole = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('displayAlertPan', true);


    actionContext.commit('setConfirmAccept', () => {

      actionContext.commit('resetRole');
      actionContext.dispatch('deleteRoleFromConnectors', payload);
      actionContext.dispatch('deleteRoleFromResources', payload);
      actionContext.dispatch('deleteRoleFromParameters', payload);
      actionContext.commit('deleteRole', payload);

      let roles = actionContext.state.manifests[
        actionContext.state.currentManifest
      ].roles;

      maniAPI.updateManifest(
        roles,
        'roles',
        actionContext,
        {
          success: [
            {
              name: 'deleteRole',
              params: payload
            }
          ],
          failure: []
        }
      );
    }
    );

    actionContext.commit('setConfirmDeny', () => { });

  }

  deleteRoleFromConnectors = (actionContext: Vuex.ActionContext<State, any>,
    actualRoleNumber: number): void => {

    // Current manifest roles
    let roles = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].roles;

    // Current role
    let role = roles[actualRoleNumber];

    // Current manifest connectors
    let connectors = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].connectors;

    let filterConn = function (elem) {
      return elem.role && elem.role !== role.name;
    };
    for (let i = 0; i < connectors.length; i++) {

      actionContext.commit('setProvidedConnectors',
        {
          key: connectors[i].provided,
          value: connectors[i].provided.filter(filterConn)
        }
      );

      actionContext.commit('setDependedConnectors',
        {
          key: connectors[i].depended,
          value: connectors[i].depended.filter(filterConn)
        }
      );

    }

    maniAPI.updateManifest(
      connectors,
      'connectors',
      actionContext,
      {
        success: [
          {
            name: 'updateConnectors',
            params: connectors
          }
        ],
        failure: []
      }
    );
  }

  deleteRoleFromResources = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    // Obtains the current role
    let role = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].roles[payload];

    // UPDATE SERVICE RESOURCES
    let resources = actionContext.state
      .manifests[actionContext.state.currentManifest].configuration.resources;

    if (resources) {

      let roleRes = {};
      for (let prop in role.resources) {
        roleRes[role.resources[prop]] = true;
      }

      let filteredResources = resources.filter((elem) => {
        return !roleRes[elem.name];
      });

      actionContext.commit('updateRoleRes', filteredResources);

      maniAPI.updateManifest(
        resources,
        'configuration.resources',
        actionContext,
        {
          success: [{
            name: 'setServRes',
            params: filteredResources
          }],
          failure: []
        }
      );

    }

  }

  deleteRolesResouces = (actionContext: Vuex.ActionContext<State, any>,
    actualRoleIndex: number): void => {

    // Obtains the roles from the current manifest
    let roles = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].roles;

    // Obtains the current role
    let role = roles[actualRoleIndex];

    // Removes the resources from the role state
    actionContext.commit('updateRoleState', { key: 'resources', value: {} });

    maniAPI.updateManifest(
      role,
      'roles.' + actualRoleIndex,
      actionContext,
      {
        success: [
          {
            name: 'updateRoleRes',
            params: {}
          }
        ],
        failure: []
      }
    );

  }

  deleteRoleFromParameters = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    // Obtains current manifest roles
    let roles = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].roles;

    // Obtains current role
    let role = roles[payload];

    // Obtains current role parameters
    let parameters = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].configuration.parameters.filter((elem) => {
      return elem && elem.name && elem.name !== role.name;
    });

    maniAPI.updateManifest(
      parameters,
      'configuration.parameters',
      actionContext,
      {
        success: [{
          name: 'setServParams',
          params: parameters
        }],
        failure: []
      }
    );
  }

  // RESOURCES
  setResource = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    let role = actionContext.state
      .manifests[actionContext.state.currentManifest]
      .roles[actionContext.state.currentRole];
    let sResources = actionContext.state
      .manifests[actionContext.state.currentManifest]
      .configuration.resources.slice();
    let sResIndex = sResources.findIndex(x => x['name'] === payload.oldTag);
    let path = '';

    let validation = actionContext.state.roleState.resourceValidation;

    actionContext.commit('updateValidation', {
      type: 'role',
      prop: payload.name,
      dinamic: 'resource',
      value: payload.tag,
      validation: validation
    });

    if (!validation[payload.name].err) {
      let duplicateRes = sResources.filter(x => {
        return x.name === payload.tag;
      });
      if (duplicateRes.length === 0) {
        if (actionContext.state.currentRole > -1) {
          if (
            role.resources &&
            role.resources[payload.name] &&
            sResIndex > -1
          ) {
            if (payload.tag.length > 0) {
              // actualizar
              path = 'configuration.resources.' + sResIndex;
              sResources[sResIndex].name = payload.tag;
              maniAPI.updateManifest(
                sResources[sResIndex],
                path,
                actionContext,
                {
                  success: [
                    {
                      name: 'updateServRes',
                      params: {
                        index: sResIndex,
                        name: payload.tag
                      }
                    }
                  ],
                  failure: []
                });

              path =
                'roles.' +
                actionContext.state.currentRole +
                '.resources.' +
                payload.name;
              let rResources = {};
              Object.assign(rResources, role.resources);
              rResources[payload.name] = payload.tag;
              maniAPI.updateManifest(
                rResources[payload.name],
                path,
                actionContext,
                {
                  success: [
                    {
                      name: 'updateRolRes',
                      params: {
                        name: payload.name,
                        tag: payload.tag
                      }
                    }
                  ],
                  failure: []
                });
            } else {
              // borrar
              path = 'configuration.resources';
              sResources.splice(sResIndex, 1);
              maniAPI.updateManifest(
                sResources,
                path,
                actionContext,
                {
                  success: [
                    {
                      name: 'setServRes',
                      params: sResources
                    }
                  ],
                  failure: []
                });

              path = 'roles';
              let rResources = {};
              Object.assign(rResources, role.resources);
              delete rResources[payload.name];
              let roles = actionContext.state.manifests[
                actionContext.state.currentManifest
              ].roles.slice();
              roles[actionContext.state.currentRole].resources = rResources;

              maniAPI.updateManifest(roles, path, actionContext, {
                success: [
                  {
                    name: 'updateRoleRes',
                    params: rResources
                  }
                ],
                failure: []
              });
            }
          } else if (payload.tag.length > 0) {
            // crear
            if (sResIndex < 0) {
              sResources.push({ name: payload.tag, type: payload.type });
              sResIndex = sResources.length;
            } else {
              sResources[sResIndex] = { name: payload.tag, type: payload.type };
            }
            path = 'configuration.resources';
            maniAPI.updateManifest(sResources, path, actionContext, {
              success: [
                {
                  name: 'setServRes',
                  params: sResources
                }
              ],
              failure: []
            });

            let rResources = {};
            if (role.resources) {
              Object.assign(rResources, role.resources);
              rResources[payload.name] = payload.tag;
            } else {
              rResources[payload.name] = payload.tag;
            }
            path = 'roles.' + actionContext.state.currentRole + '.resources';
            maniAPI.updateManifest(rResources, path, actionContext, {
              success: [
                {
                  name: 'updateRoleRes',
                  params: rResources
                }
              ],
              failure: []
            });
          }
        }
      } else {
        if (duplicateRes.length === 1 && payload.tag !== payload.oldTag)
          actionContext.commit('setErrValidation', {
            validation: actionContext.state.roleState.resourceValidation,
            prop: payload.name,
            msg: 'dupname'
          });
      }
    }
  }

  setResourceState = (actionContext: Vuex.ActionContext<State, any>): void => {
    actionContext.commit(
      'deleteValidation',
      actionContext.state.resourceState.validation
    );
    let resource = actionContext.state
      .manifests[actionContext.state.currentManifest];
    // resourceState
    let resourceName = {
      name: getElementName(resource._urn),
      //  version: name[name.length - 1],
      domain: getElementDomain(resource._urn),
      type: getResourceType(resource._type)
    };
    actionContext.commit('updateResourceState', {
      key: 'name',
      value: resourceName
    });

    Object.keys(resourceName).map(x => {
      actionContext.commit('setValidation', {
        validation: actionContext.state.resourceState.validation,
        prop: x,
        msg: ''
      });
    });

    let parameters = {};
    Object.keys(resource.parameters).map(key => {
      parameters[key] = resource.parameters[key];
      actionContext.commit('setValidation', {
        validation: actionContext.state.resourceState.validation,
        prop: key,
        msg: ''
      });
    });
    actionContext.commit('updateResourceState', {
      key: 'parameters',
      value: parameters
    });
  }

  updateResourceState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    let validation = actionContext.state.resourceState.validation;
    let params = Object.assign(
      {}, actionContext.state.resourceState.parameters
    );
    actionContext.commit('updateValidationType', {
      validation: validation,
      prop: payload.key,
      type: payload.type,
      value: payload.value
    });
    params[payload.key] = payload.value;
    actionContext.commit('updateResourceState', {
      key: 'parameters',
      value: params
    });

    if (!validation[payload.key].err) {
      let path = 'parameters.' + payload.key;

      switch (payload.type) {
        case 'number':
        case 'integer':
          payload.value = payload.value * 1;
          break;
        case 'vhost':
        case 'list':
        case 'json':
          payload.value = JSON.parse(payload.value);
          break;

        default:
          break;
      }
      maniAPI.updateManifest(payload.value, path, actionContext, {
        success: [],
        failure: []
      });
    }
  }

  // RUNTIMES
  setRuntimeState = (actionContext: Vuex.ActionContext<State, any>): void => {

    let runtime = actionContext.state
      .manifests[actionContext.state.currentManifest];

    actionContext.commit('updateRuntimeState', {
      key: 'name',
      value: {
        domain: getElementDomain(runtime._urn),
        name: getElementName(runtime._urn),
        version: getElementVersion(runtime._urn)
      }
    });

    if (runtime.derived) {
      actionContext.commit('updateRuntimeState', {
        key: 'derived',
        value: runtime.derived
      });

      Object.keys(runtime.derived).map(key => {
        actionContext.commit('setValidation', {
          validation: actionContext.state.runtimeState.validation,
          prop: key,
          msg: ''
        });
      });
    }

    let runsettings = {};
    if (runtime.sourcedir) {
      runsettings['sourcedir'] = runtime.sourcedir;
      actionContext.commit('setValidation', {
        validation: actionContext.state.runtimeState.validation,
        prop: 'sourcedir',
        msg: ''
      });
    }
    if (runtime.entrypoint) {
      runsettings['entrypoint'] = runtime.entrypoint;
      actionContext.commit('setValidation', {
        validation: actionContext.state.runtimeState.validation,
        prop: 'entrypoint',
        msg: ''
      });
    }
    if (runtime.agent) {
      runsettings['agent'] = runtime.agent;
      actionContext.commit('setValidation', {
        validation: actionContext.state.runtimeState.validation,
        prop: 'agent',
        msg: ''
      });
    }

    actionContext.commit('updateRuntimeState', {
      key: 'runsettings',
      value: runsettings
    });

    if (runtime.metadata) {
      actionContext.commit('updateRuntimeState', {
        key: 'metadata',
        value: runtime.metadata
      });
      actionContext.commit('setValidation', {
        validation: actionContext.state.runtimeState.validation,
        prop: 'metadata',
        msg: ''
      });
    }
  }

  updateRuntimeState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let validation = actionContext.state.runtimeState.validation;
    let path = '';

    actionContext.commit('updateValidationType', {
      validation: validation,
      prop: payload.key,
      type: payload.type,
      value: payload.value
    });

    if (payload.parent) {

      actionContext.commit('updateRuntimeStateParent', {
        key: payload.key,
        value: payload.value,
        parent: payload.parent
      });
      if (payload.parent === 'derived') path = 'derived.';

    } else {
      actionContext.commit('updateRuntimeState', {
        key: payload.parent ? payload.parent : payload.key,
        value: payload.value
      });
    }

    if (!validation[payload.key].err) {
      path = path + payload.key;

      switch (payload.type) {
        case 'number':
        case 'integer':
          payload.value = payload.value * 1;
          break;
        case 'vhost':
        case 'list':
        case 'json':
          payload.value = JSON.parse(payload.value);
          break;

        default:
          break;
      }
      maniAPI.updateManifest(payload.value, path, actionContext, {
        success: [],
        failure: []
      });
    }
  }

  // PARAMETERS
  changeBypass = (actionContext: Vuex.ActionContext<State, any>): void => {
    if (actionContext.state.currentRole >= 0) {
      let role =
        actionContext.state
          .manifests[actionContext.state.currentManifest]
          .roles[actionContext.state.currentRole];
      let params = actionContext.state.manifests[
        actionContext.state.currentManifest
      ].configuration.parameters.slice();
      let pIndex = params.findIndex(x => x.name === role.name);
      if (pIndex > -1) {
        params.splice(pIndex, 1);
      } else {
        params.push({
          name: role.name,
          type: actionContext.state.Settings.manifestStructure.elementtype
            .parameter.enum.find(x => x.name === 'json').eslap
        });
      }
      let path = 'configuration.parameters';
      maniAPI.updateManifest(params, path, actionContext, {
        success: [
          {
            name: 'setServParams',
            params: params
          }
        ],
        failure: []
      });
    }
  }

  // CHANNELS
  setChannel = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    payload.data = Object.assign(
      {},
      actionContext.state.manifests[actionContext.state.currentManifest]
        .channels[payload.inout][payload.index]
    );
    actionContext.commit('setChannel', payload);
    actionContext.commit('updateAllValidation', {
      type: 'channel',
      data:
        actionContext.state.manifests[actionContext.state.currentManifest]
          .channels[payload.inout][payload.index],
      currState: actionContext.state.channelState
    });
  }

  deleteChannel = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    payload.data = Object.assign({},
      actionContext.state.manifests[actionContext.state.currentManifest]
        .channels[payload.inout][payload.index]
    );

    // Sets the callback for the accept button at the warning modal
    actionContext.commit('setConfirmAccept', () => {
      let channels = actionContext.state.manifests[
        actionContext.state.currentManifest
      ].channels[payload.inout].slice();
      channels.splice(payload.index, 1);
      let path = 'channels.' + payload.inout;
      maniAPI.updateManifest(channels, path, actionContext, {
        success: [
          {
            name: 'updateChannels',
            params: {
              channels: channels,
              direction: payload.inout
            }
          }
        ],
        failure: []
      });
      actionContext.dispatch('deleteChannelInConnectors', payload);
    });

    // Sets the callback for the deny button at the warning modal
    actionContext.commit('setConfirmDeny', () => { });

    // Shows the warning modal
    actionContext.commit('displayAlertPan', true);
  }

  deleteChannelInConnectors = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let service = actionContext.state
      .manifests[actionContext.state.currentManifest];

    if (service.type === 'service') {

      let filterConn = function (elem) {
        return elem.role !== undefined || elem.endpoint !== payload.data.name;
      };


      for (let i = 0; i < service.connectors.length; i++) {

        actionContext.commit('deleteChannelInConnectors', {
          key: service.connectors[i].provided,
          value: service.connectors[i].provided.filter(filterConn)
        });

        actionContext.commit('deleteChannelInConnectors', {
          key: service.connectors[i].depended,
          value: service.connectors[i].depended.filter(filterConn)
        });

      }

      maniAPI.updateManifest(
        service.connectors,
        'connectors',
        actionContext,
        {
          success: [
            {
              name: 'updateConnectors',
              params: service.connectors
            }
          ],
          failure: []
        }
      );

    }

  }

  updateCurrentChannel = (actionContext: Vuex.ActionContext<State, any>,
    payload: { index: string, data: any, inout: 'provides' | 'requires' }
  ): void => {

    // Obtains the component manifest as the current manifest from the state
    let service = actionContext.state
      .manifests[actionContext.state.currentManifest];

    // component channels
    let channels = service.channels[payload.inout].slice();

    /*
      If the service channel type isn't the same as the purposed type
      Or the service channel protocol isn't the same as the purposed protocol
      ( and protocol is not empty )
    */
    if (
      channels[payload.index].type !== payload.data.type
      || (
        channels[payload.index].protocol !== payload.data.protocol
        && payload.data.protocol !== ''
      )
    ) {

      // Sets the confirmation callback on the warning modal
      actionContext.commit('setConfirmAccept', () => {

        // Deletes the channel in all connectors
        actionContext.dispatch('deleteChannelInConnectors', payload);

        let path = 'channels.' + payload.inout;
        maniAPI.updateManifest(channels, path, actionContext, {
          success: [
            {
              name: 'updateChannels',
              params: {
                channels: channels,
                direction: payload.inout
              }
            }
          ],
          failure: []
        });

        // Sets the channel type
        actionContext.commit('updateChannelProperty', {
          key: 'type', value: payload.data.type, channIndex: payload.index,
          inout: payload.inout
        });

        // Sets the channel protocol
        actionContext.commit('updateChannelProperty', {
          key: 'protocol', value: payload.data.protocol,
          channIndex: payload.index, inout: payload.inout
        });

        // Updates the manifest. Still needed?
        maniAPI.updateManifest(
          channels,
          'channels.' + payload.inout,
          actionContext,
          {
            success: [
              {
                name: 'updateChannels',
                params: {
                  channels: channels,
                  direction: payload.inout
                }
              }
            ],
            failure: []
          }
        );

      });

      // Sets the deny callback on the warning modal
      actionContext.commit('setConfirmDeny', () => {

        // Updates the channel type
        actionContext.dispatch('updateChannState', {
          key: 'type',
          value: channels[payload.index].type
        });

        // Updates the channel protocol
        actionContext.dispatch('updateChannState', {
          key: 'protocol',
          value: channels[payload.index].protocol
        });
      });

      // Shows the warning modal
      actionContext.commit('displayAlertPan', true);

    } else {

      let validation = actionContext.state.channelState.validation;

      // Updates the name of the channel
      actionContext.dispatch('updateChannState', {
        key: 'name', value: payload.data.name
      });

      // Obtains provided channels from the current manifest which name is the
      // same. This only tries to prove this channel name is unique in the
      // component
      let direct = 'provides';
      let filteredChan = actionContext.state.manifests[
        actionContext.state.currentManifest
      ].channels[direct].filter((chann, index) => {
        return (
          chann.name === payload.data.name
          && (direct === payload.inout ? index !== payload.index : true)
        );
      });

      if (filteredChan.length > 0) { // If the channel name is duplicated

        // Show duplicated name error
        actionContext.commit('setErrValidation', {
          validation: validation,
          prop: 'name',
          msg: 'dupname'
        });

      }

      // Obtains required channels from the current manifest which name is the
      // same. This only tries to prove this channel name is unique in the
      // component
      direct = 'requires';
      filteredChan = actionContext.state.manifests[
        actionContext.state.currentManifest
      ].channels[direct].filter((chann, index) => {
        return (
          chann.name === payload.data.name &&
          (direct === payload.inout ? index !== payload.index : true)
        );
      });

      if (filteredChan.length > 0) { // If the channel name is duplicated

        // Show duplicated name error
        actionContext.commit('setErrValidation', {
          validation: validation,
          prop: 'name',
          msg: 'dupname'
        });

      }

      if (!validation.name.err) { // If there is no error validating the name

        // Updates the channel name in connectors
        actionContext.dispatch('updateChannelInConnectors', {
          oldName: channels[payload.index].name,
          newName: payload.data.name
        });

        // Updates the channel name
        actionContext.commit('updateChannelProperty', {
          key: 'name', value: payload.data.name, channIndex: payload.index,
          inout: payload.inout
        });

        // Updates the channel type
        actionContext.commit('updateChannelProperty', {
          key: 'type', value: payload.data.type, channIndex: payload.index,
          inout: payload.inout
        });

        // Updates the channel protocol
        actionContext.commit('updateChannelProperty', {
          key: 'protocol', value: payload.data.protocol,
          channIndex: payload.index, inout: payload.inout
        });

        // Updates the manifest. Still needed?
        maniAPI.updateManifest(
          channels,
          'channels.' + payload.inout,
          actionContext,
          {
            success: [
              {
                name: 'updateChannels',
                params: {
                  channels: channels,
                  direction: payload.inout
                }
              }
            ],
            failure: []
          }
        );

      }

    }

  }

  updateChannelInConnectors = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let service = actionContext.state
      .manifests[actionContext.state.currentManifest];

    if (service.type === 'service') {

      let UpdateConnList = (data, list) => {
        for (let j = 0; j < list.length; j++) {
          if (!list[j].role && data.oldName === list[j].endpoint) {

            actionContext.commit('updateChannelNameInConnectors', {
              key: list[j].endpoint,
              value: data.newName
            });

          }
        }
      };
      for (let i = 0; i < service.connectors.length; i++) {
        UpdateConnList(payload, service.connectors[i].provided);
        UpdateConnList(payload, service.connectors[i].depended);
      }

      maniAPI.updateManifest(
        service.connectors,
        'connectors',
        actionContext,
        {
          success: [
            {
              name: 'updateConnectors',
              params: service.connectors
            }
          ],
          failure: []
        }
      );

    }

  }

  setChannelDirect = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {
    actionContext.commit('resetChannel');
    actionContext.commit(
      'resetAllValidation',
      actionContext.state.channelState.validation
    );
    actionContext.commit('setChannelDirect', payload);
  }

  addChannel = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('updateAllValidation', {
      type: 'channel',
      data: payload.data,
      currState: actionContext.state.channelState
    });
    if (actionContext.state.channelState.valid) {
      let channels = actionContext.state.manifests[
        actionContext.state.currentManifest
      ].channels[payload.inout].slice();
      channels.push(payload.data);
      let path = 'channels.' + payload.inout;
      maniAPI.updateManifest(channels, path, actionContext, {
        success: [
          {
            name: 'updateChannels',
            params: {
              channels: channels,
              direction: payload.inout
            }
          },
          {
            name: 'setChannel',
            params: {
              index: channels.length - 1,
              inout: payload.inout,
              data: payload.data
            }
          }
        ],
        failure: []
      });
    }

  }

  updateChannState = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('updateChannState', payload);
    actionContext.commit('updateValidation', {
      type: 'channel',
      prop: payload.key,
      value: payload.value,
      validation: actionContext.state.channelState.validation
    });

  }

  // CONNECTORS
  setConnector = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('setConnector', payload);

  }

  deleteConnector = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let connectors = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].connectors;

    actionContext.commit('deleteConnector', {
      key: connectors,
      value: payload
    });

    if (connectors.length > 0) {
      if (payload > 0) {
        actionContext.commit('setConnector', payload - 1);
      } else {
        actionContext.commit('setConnector', 0);
      }
    } else {
      actionContext.commit('setConnector', -1);
    }

    maniAPI.updateManifest(
      connectors,
      'connectors',
      actionContext,
      {
        success: [
          {
            name: 'updateConnectors',
            params: connectors
          }
        ],
        failure: []
      }
    );

  }

  addConnector = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    actionContext.commit('addConnector', {
      key: actionContext.state.manifests[
        actionContext.state.currentManifest
      ].connectors,
      value: payload
    });

    maniAPI.updateManifest(
      actionContext.state.manifests[
        actionContext.state.currentManifest
      ].connectors,
      'connectors',
      actionContext,
      {
        success: [
          {
            name: 'updateConnectors',
            params: actionContext.state.manifests[
              actionContext.state.currentManifest
            ].connectors
          }
        ],
        failure: []
      }
    );

    actionContext.commit('setConnector', actionContext.state.manifests[
      actionContext.state.currentManifest
    ].connectors.length - 1);

  }

  addConnection = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    let connectors = actionContext.state.manifests[
      actionContext.state.currentManifest
    ].connectors;


    actionContext.commit('addConnection', {
      key: connectors[actionContext.state.currentConnector][payload.direction],
      value: payload.element
    });

    maniAPI.updateManifest(
      connectors,
      'connectors',
      actionContext,
      {
        success: [
          {
            name: 'updateConnectors',
            params: connectors
          }
        ],
        failure: []
      }
    );

  }

  deleteConnList = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    if (actionContext.state.currentConnector >= 0) {

      let direction = payload.type === actionContext.state.Settings.listTypes
        .connectorList.provided ? 'provided' : 'depended';

      actionContext.commit(
        'deleteConnectionChannel',
        {
          key: actionContext.state.manifests[
            actionContext.state.currentManifest
          ].connectors[actionContext.state.currentConnector][direction],
          value: payload.index
        }
      );

      /*
      maniAPI.updateManifest(
        actionContext.state.manifests[
          actionContext.state.currentManifest
        ].connectors[actionContext.state.currentConnector][direction],
        'connectors.' + actionContext.state.currentConnector + '.' + direction,
        actionContext,
        {
          success: [
            {
              name: 'deleteConnList',
              params: payload
            }
          ],
          failure: []
        }
      );
      */

    }

  }

  setRoleName = (actionContext: Vuex.ActionContext<State, any>, newName: string
  ): void => {

    actionContext.commit('setRoleName', newName);

  }

  // ROUTING ACTIONS
  cleanCurrent = (actionContext: Vuex.ActionContext<State, any>,
    payload: any): void => {

    switch (payload.split('#')[1]) {
      case actionContext.state.Settings.modalProps.roles.id:
        actionContext.commit('resetRole');
        actionContext.commit(
          'resetAllValidation',
          actionContext.state.roleState.validation
        );
        break;

      case actionContext.state.Settings.modalProps.channels.id:
        actionContext.commit('resetChannel');
        actionContext.commit(
          'resetAllValidation',
          actionContext.state.channelState.validation
        );
        break;

      case actionContext.state.Settings.modalProps.connectors.id:
        actionContext.commit('resetConnector', actionContext.state.manifests);
        break;

      default:
    }

  }

}
