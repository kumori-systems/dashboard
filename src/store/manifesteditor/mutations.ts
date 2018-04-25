import Vue from 'vue';
import Vuex from 'vuex';
import State from './state';

import webSettings from './settings';
import { validProp, validType } from './utils/validator';

import { Manifest } from '../stampstate/classes';

export default class Mutations implements Vuex.MutationTree<State> {
  [name: string]: Vuex.Mutation<State>;

  /**
   * Loads manifests to the manifesteditor module state.
   */
  loadManifests = (state: State, payload: { [uri: string]: Manifest }
  ): void => {
    state.manifests = payload;
  }

  updateManifest = (state: State, payload: { data: any, path: string }
  ): void => {

    let modifiedManifest = state.manifests[state.currentManifest];

    let object = modifiedManifest;
    let key = payload.path;
    let data = payload.data;

    while (key.indexOf('.') !== -1) {
      let partOne = key.substr(0, key.indexOf('.'));
      let partTwo = key.substr(key.indexOf('.') + 1, key.length);
      object = object[partOne];
      key = partTwo;
      console.debug('part ONE', partOne);
      console.debug('part TWO', partTwo);
    }
    object[key] = data;

    console.debug('Path contains', payload.path);
    console.debug('Data contains', payload.data);

    // The change will be something like
    // state.manifests[path] = data





    state.manifests = {
      ...state.manifests,
      [modifiedManifest._urn]: modifiedManifest

    };

  }

  /**
   * Clear the local state.
   */
  clearState = (state: State): void => {
    state.temporalManifest = null;
    state.mDependencies = {};
    state.confirm = {
      accept: null,
      deny: null
    };
    state.alerts = [];
    state.graph = {};
    state.showAlertPan = false;
    state.Settings = webSettings;
    state.socket = null;
    state.manifestList = [];
    state.currentManifest = '';
    state.clearModals = false;

    // DEPLOYMENT
    state.deploymentState = {
      name: '',
      service: '',
      arrangements: {},
      resources: {},
      parameters: {},
      paramsList: [],
      charts: {},
      colorsData: {},
      validation: {
        name: { err: false, msg: '' }
      },
      resValidation: {},
      paramValidation: {},
      arrValidation: {},
      updater: false
    };

    state.currentArrangement = '';

    // SERVICE
    state.currentRole = -1;
    state.currentConnector = -1;
    state.roleState = {
      role: { name: '', component: '', resources: [] },
      validation: {
        name: { err: false, msg: '' },
        component: { err: false, msg: '' }
      },
      resourceValidation: {},
      updater: false,
      valid: true
    };

    state.channelState = {
      channel: {
        index: -1,
        inout: 'provides',
        data: { name: '', type: '', protocol: '' }
      },
      validation: {
        name: { err: false, msg: '' },
        type: { err: false, msg: '' },
        protocol: { err: false, msg: '' }
      },
      updater: false,
      valid: true
    };

    state.serviceState = {
      name: {
        domain: '',
        name: '',
        version: ''
      },
      validation: {
        domain: { err: false, msg: '' },
        name: { err: false, msg: '' },
        version: { err: false, msg: '' }
      },
      updater: false
    };

    // COMPONENT
    state.componentState = {
      name: {
        domain: '',
        name: '',
        version: ''
      },
      runtime: '',
      validation: {
        runtime: { err: false, msg: '' }
      },
      updater: false
    };

    state.configurationState = {
      pname: '',
      rname: '',
      resources: [],
      parameters: [],
      validation: {
        pname: { err: false, msg: '' },
        rname: { err: false, msg: '' }
      },
      updater: false
    };

    // RESOURCE
    state.resourceState = {
      name: {
        domain: '',
        name: '',
        type: '',
        version: ''
      },
      parameters: {},
      validation: {
        domain: { err: false, msg: '' },
        name: { err: false, msg: '' },
        type: { err: false, msg: '' },
        version: { err: false, msg: '' }
      },
      updater: false
    };

    // RUNTIME
    state.runtimeState = {
      name: {
        domain: '',
        name: '',
        version: ''
      },
      validation: {
        domain: { err: false, msg: '' },
        name: { err: false, msg: '' },
        version: { err: false, msg: '' }
      },
      updater: false
    };
  }
  // APP

  addAlert = (state: State, payload: any): void => {
    state.alerts.push(payload);
  }

  deleteAlert = (state: State, payload: any): void => {
    state.alerts.splice(payload, 1);
  }

  resetAlerts = (state: State, payload: any): void => {
    state.alerts = [];
  }

  displayAlertPan = (state: State, payload: any): void => {
    state.showAlertPan = payload;
  }

  deleteValidation = (state: State, payload: any): void => {
    payload = {};
  }

  /**
   * Removes the validation of the resources at the deployment state
   */
  deleteDeploymentStateValidation = (state: State, payload: any): void => {
    state.deploymentState.resValidation = {};
  }

  resetValidation = (state: State, payload: any): void => {
    payload.validation[payload.key] = false;
  }

  resetAllValidation = (state: State, payload: any): void => {
    for (let prop in payload) {
      payload[prop].err = false;
    }
  }

  updateAllValidation = (state: State, payload: any): void => {
    payload.currState.valid = false;
    for (let prop in payload.currState.validation) {
      payload.currState.validation[prop] = validProp(
        payload.type,
        prop,
        payload.data[prop]
      );

      if (!payload.currState.validation[prop].err) {
        payload.currState.valid = true;
      }
    }
  }

  updateValidation = (state: State, payload: any): void => {
    let dinamicProp = payload.dinamic ? payload.dinamic : payload.prop;
    payload.validation[payload.prop] = validProp(
      payload.type,
      dinamicProp,
      payload.value
    );
  }

  updateValidationType = (state: State, payload: any): void => {
    payload.validation[payload.prop] = validType(payload.type, payload.value);
  }

  setErrValidation = (state: State, payload: any): void => {
    payload.validation[payload.prop] = { err: true, msg: payload.msg };
  }

  /**
   * This method changes any value of the state referenced by payload.validation
   * which has a parameter as the same name as payload.prop to payload.msg.
   */
  setValidation = (state: State,
    payload: { validation: any, prop: string, msg: string }): void => {
    console.debug('changing param \'%s\' to \'%s\' at', payload.prop,
      payload.msg, payload.validation);
    payload.validation[payload.prop] = { err: false, msg: payload.msg };
  }

  /**
   * Switches the uri of the current manifest.
   */
  setManifest = (state: State, uri: string): void => {
    state.currentManifest = uri;
  }

  clearModals = (state: State, payload: any): void => {
    state.clearModals = payload;
  }

  // DEPLOYMENT
  updateDeployState = (state: State, payload: any): void => {
    state.deploymentState = {
      ...state.deploymentState,
      [payload.key]: payload.value
    };
    state.deploymentState.updater = !state.deploymentState.updater;
  }

  // TODO - 'updater' here should be wrong.. it changes depending if the number
  // of calls to this method is even or odd
  updateDeployResState = (state: State, payload: { key: string, value: any }
  ): void => {
    state.deploymentState = {
      ...state.deploymentState,
      resources: {
        ...state.deploymentState.resources,
        [payload.key]: payload.value
      },
      updater: !state.deploymentState.updater
    };
  }

  updateDeployParamState = (state: State, payload: any): void => {
    state.deploymentState = {
      ...state.deploymentState,
      parameters: {
        ...state.deploymentState.parameters,
        [payload.key]: payload.value
      },
      updater: !state.deploymentState.updater
    };
  }

  setArrangement = (state: State, payload: any): void => {
    let deploy = state.manifests[state.currentManifest];
    state.deploymentState = {
      ...state.deploymentState,
      arrangements: {
        ...state.deploymentState.arrangements,
        ...deploy.roles[payload].resources
      }
    };
    state.currentArrangement = payload;
  }

  updateArrangementState = (state: State, payload: any): void => {
    state.deploymentState = {
      ...state.deploymentState,
      arrangements: {
        [payload.key]: payload.value
      },
      updater: !state.deploymentState.updater
    };
  }

  setRoleName = (state: State, newName: string): void => {
    // TODO
  }

  updateArrangement = (state: State, payload: any): void => {
    state.manifests[state.currentManifest].roles[state.currentArrangement]
      .resources = payload;
  }

  deleteArrangementState = (state: State, payload: any): void => {
    delete state.deploymentState.arrangements[payload];
    delete state.deploymentState.arrValidation[payload];
    state.deploymentState = {
      ...state.deploymentState,
      updater: !state.deploymentState.updater
    };
  }

  setDeploymentParams = (state: State): void => {

    let deploy = state.manifests[state.currentManifest];
    let service = state.manifests[deploy.servicename];
    let serviceParams = service.configuration.parameters;
    let paramsList = [];

    state.deploymentState = {
      ...state.deploymentState,
      paramValidation: {}
    };

    if (deploy.configuration && deploy.configuration.parameters) {
      for (let key in deploy.configuration.parameters) {
        let parameter = {
          name: '',
          type: '',
          data: null,
          role: '',
          default: ''
        };
        parameter.name = key;
        let param = serviceParams.filter(x => {
          return x.name === key;
        });

        if (param.length > 0) {
          let type = param[0].type.split('/')[4];
          parameter.type = type;
          parameter.data = deploy.configuration.parameters[key];

          if (type === 'json') {
            let roles = service.roles.filter(x => {
              return x.name === key;
            });

            if (roles.length > 0) {
              parameter.type = 'role';
              parameter.data = [];
              let component = state.manifests[roles[0].component];
              let paramsHash = {};
              for (let p of component.configuration.parameters) {
                paramsHash[p.name] = {
                  type: p.type,
                  default: p.default ? p.default : ''
                };
              }

              let data = deploy.configuration.parameters[key];
              Object.keys(data).map((pKey, index) => {
                state.deploymentState.parameters[key + pKey] = data[pKey];
                state.deploymentState.paramValidation[key + pKey] = {
                  err: false,
                  msg: ''
                };
                parameter.data.push({
                  name: pKey,
                  type: paramsHash[pKey].type.split('/')[4],
                  role: key,
                  default: paramsHash[pKey].default
                });
              });
            } else {
              state.deploymentState.parameters[key] =
                deploy.configuration.parameters[key];
              state.deploymentState.paramValidation[key] = {
                err: false,
                msg: ''
              };
            }
          } else {
            state.deploymentState.paramValidation[key] = {
              err: false,
              msg: ''
            };
          }

          paramsList.push(parameter);
        } else {
          state.alerts.push({
            text: 'rolenotfound',
            type: state.Settings.alerts.danger,
            extra: key
          });
        }
      }
    }

    state.deploymentState = {
      ...state.deploymentState,
      'paramsList': paramsList
    };
  }

  setDeployCharts = (state: State, payload: any): void => {
    state.deploymentState = {
      ...state.deploymentState,
      'charts': payload
    };
  }

  // COMPONENT
  updateCompState = (state: State, payload: any): void => {
    state.componentState = {
      ...state.componentState,
      [payload.key]: payload.value,
      'updater': !state.componentState.updater
    };
  }

  updateConfigState = (state: State, payload: any): void => {
    state.configurationState = {
      ...state.configurationState,
      [payload.key]: payload.value,
      'updater': !state.configurationState.updater
    };
  }

  updateConfState = (state: State, payload: any): void => {
    state.configurationState = {
      ...state.configurationState,
      [payload.key]: payload.value,
      'updater': !state.configurationState.updater
    };
  }

  setComponentRuntime = (state: State, payload: any): void => {
    state.temporalManifest = {
      ...state.temporalManifest,
      'runtime': payload.value
    };
  }

  setComponentResources = (state: State, payload: any): void => {
    state.temporalManifest = {
      ...state.temporalManifest,
      'configuration': {
        ...state.temporalManifest.configuration,
        'resources': payload
      }
    };
  }

  setComponentParameters = (state: State, payload: any): void => {
    state.temporalManifest = {
      ...state.temporalManifest,
      'configuration': {
        ...state.temporalManifest.configuration,
        'parameters': payload
      }
    };
  }

  // SERVICE
  setServiceName = (state: State, payload: any): void => {
    state.temporalManifest = {
      ...state.temporalManifest,
      'name': payload
    };
  }

  updateServState = (state: State, payload: any): void => {
    state.serviceState = {
      ...state.serviceState,
      'name': {
        ...state.serviceState.name,
        [payload.key]: payload.value
      },
      'updater': !state.serviceState.updater
    };
  }

  setServs = (state: State, payload: any): void => {
    state.manifestList = payload;
  }

  setDependencies = (state: State, payload: any): void => {
    state.mDependencies = payload;
  }

  setStateName = (state: State, payload: any): void => {
    payload.state.name = payload.param;
  }

  // ROLES
  setRole = (state: State, role: number): void => {

    if (role < state.manifests[state.currentManifest].roles.length) {
      state.currentRole = role;

      if (state.currentRole >= 0) {

        let role = state.manifests[state.currentManifest]
          .roles[state.currentRole];

        state.roleState = {
          ...state.roleState,
          'role': {
            name: role.name,
            component: role.component,
            resources: role.resources !== undefined ?
              Object.keys(role.resources).map((key) => {
                return { name: role.resources[key], key: key };
              })
              : []
          }
        };

      }

    }

  }

  updateRoles = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      roles: state.temporalManifest.roles.push(payload)
    };

  }

  updateRoleName = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'roles': {
        ...state.temporalManifest.roles,
        [state.currentRole]: {
          ...state.temporalManifest.roles[state.currentRole],
          'name': payload
        }
      }
    };

  }

  updateConfirmationAccept(state: State, payload: any) {
    state.confirm.accept = payload;
  }

  updateConfirmationDeny(state: State, payload: any) {
    state.confirm.deny = payload;
  }

  updateRoleComp = (state: State, component: string): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'roles': {
        ...state.temporalManifest.roles,
        [state.currentRole]: {
          ...state.temporalManifest.roles[state.currentRole],
          'component': component
        }
      }
    };

  }

  updateRoleRes = (state: State, payload: any): void => {
    state.temporalManifest = {
      ...state.temporalManifest,
      'roles': {
        ...state.temporalManifest.roles[state.currentRole],
        'resources': payload
      }
    };
  }

  updateRoleState = (state: State, payload: any): void => {

    state.roleState = {
      ...state.roleState,
      'role': {
        ...state.roleState.role,
        [payload.key]: payload.value
      },
      'updater': !state.roleState.updater
    };

  }

  deleteRole = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'roles': state.temporalManifest.roles.splice(payload, 1)
    };

  }

  resetRole = (state: State, payload: any): void => {
    state.currentRole = -1;
    state.roleState = {
      ...state.roleState,
      'role': { name: '', component: '', resources: [] }
    };
  }

  // CHANNELS
  resetChannel = (state: State, payload: any): void => {

    state.channelState = {
      ...state.channelState,
      'channel': {
        index: -1,
        inout: 'provides',
        data: { name: '', type: '', protocol: '' }
      }
    };

  }

  setChannel = (state: State, payload: any): void => {
    state.channelState = {
      ...state.channelState,
      'channel': payload
    };
  }

  setChannelDirect = (state: State, payload: any): void => {

    state.channelState = {
      ...state.channelState,
      'channel': {
        ...state.channelState.channel,
        'inout': payload
      }
    };

  }

  updateChannels = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'channels': {
        ...state.temporalManifest,
        [payload.direction]: payload.channels
      }
    };

  }

  updateChannState = (state: State, payload: any): void => {

    state.channelState = {
      ...state.channelState,
      'channel': {
        ...state.channelState.channel,
        'data': {
          ...state.channelState.channel.data,
          [payload.key]: payload.value
        }
      },
      'updater': !state.channelState.updater
    };

  }

  // CONNECTORS
  setConnector = (state: State, payload: any): void => {
    state.currentConnector = payload;
  }

  updateConnectors = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'connectors': payload
    };

  }

  deleteConnList = (state: State, payload: any): void => {

    if (state.currentConnector >= 0) {

      let direction = payload.type === state.Settings.listTypes
        .connectorList.provided ? 'provided' : 'depended';

      state.temporalManifest = {
        ...state.temporalManifest,
        'connectors': {
          ...state.temporalManifest.connectors,
          [state.currentConnector]: {
            ...state.temporalManifest.connectors[state.currentConnector],
            'direction': state.temporalManifest.connectors
            [state.currentConnector][direction].splice(payload.index, 1)

          }
        }
      };
    }
  }

  resetConnector = (state: State,
    manifests: { [urn: string]: Manifest; }): void => {
    let service = manifests[state.currentManifest];

    if (service.connectors.length > 0) {
      state.currentConnector = 0;
    } else {
      state.currentConnector = 1;
    }
  }

  // RESOURCES
  updateServRes = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'configuration': {
        ...state.temporalManifest.configuration,
        'resources': {
          ...state.temporalManifest.configuration.resources,
          [payload.index]: {
            ...state.temporalManifest.configuration.resources[payload.index],
            'name': payload.name
          }
        }

      }
    };

  }

  updateRolRes = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'roles': {
        ...state.temporalManifest.roles,
        [state.currentRole]: {
          ...state.temporalManifest.roles[state.currentRole],
          'resources': {
            ...state.temporalManifest.roles[state.currentRole].resources,
            [payload.name]: payload.tag
          }
        }
      }
    };

  }

  setServRes = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'configuration': {
        ...state.temporalManifest.configuration,
        'resources': payload.res
      }
    };

  }

  setRolRes = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'roles': {
        ...state.temporalManifest.roles,
        [state.currentRole]: {
          ...state.temporalManifest.roles[state.currentRole],
          'resources': payload.res
        }
      }
    };

  }

  updateResourceState = (state: State, payload: any): void => {

    state.resourceState = {
      ...state.resourceState,
      [payload.key]: payload.value,
      'updater': !state.resourceState.updater
    };

  }

  // RUNTIMES
  updateRuntimeState = (state: State, payload: any): void => {

    state.runtimeState = {
      ...state.runtimeState,
      [payload.key]: payload.value,
      'updater': !state.runtimeState.updater
    };

  }

  updateRuntimeStateParent = (state: State, payload: any): void => {

    state.runtimeState = {
      ...state.runtimeState,
      [payload.parent]: {
        ...state.runtimeState[payload.parent],
        [payload.key]: payload.value
      },
      'updater': state.runtimeState.updater
    };

  }

  // PARAMETERS
  setServParams = (state: State, payload: any): void => {

    state.temporalManifest = {
      ...state.temporalManifest,
      'configuration': {
        ...state.temporalManifest.configuration,
        'parameters': payload
      }
    };

  }
}
