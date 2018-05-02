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
  loadManifests = (state: State, manifests: { [uri: string]: Manifest }
  ): void => {

    console.debug('MUTATION - loadManifests');

    state.manifests = manifests;
  }

  updateManifest = (state: State, payload: { data: any, path: string }
  ): void => {

    console.debug('MUTATION - updateManifests');

    let modifiedManifest = state.manifests[state.currentManifest];

    let object = modifiedManifest;
    let key = payload.path;
    let data = payload.data;

    while (key.indexOf('.') !== -1) {
      let partOne = key.substr(0, key.indexOf('.'));
      let partTwo = key.substr(key.indexOf('.') + 1, key.length);
      object = object[partOne];
      key = partTwo;
    }
    object[key] = data;

    state.manifests = {
      ...state.manifests,
      [modifiedManifest._urn]: modifiedManifest

    };

  }

  /**
   * Clear the local state.
   */
  clearState = (state: State): void => {

    console.debug('MUTATION - clearState');

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

    console.debug('MUTATION - addAlert');

    state.alerts.push(payload);
  }

  deleteAlert = (state: State, payload: any): void => {

    console.debug('MUTATION - deleteAlert');

    state.alerts.splice(payload, 1);
  }

  resetAlerts = (state: State, payload: any): void => {

    console.debug('MUTATION - resetAlerts');

    state.alerts = [];
  }

  /**
   * Marks if the warning modal should be shown or not
   */
  displayAlertPan = (state: State, payload: boolean): void => {

    console.debug('MUTATION - displayAlertPan');

    state.showAlertPan = payload;
  }

  deleteValidation = (state: State, payload: any): void => {

    console.debug('MUTATION - deleteValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats.
    payload = {};
  }

  /**
   * Removes the validation of the resources at the deployment state
   */
  deleteDeploymentStateValidation = (state: State, payload: any): void => {

    console.debug('MUTATION - deleteDeploymentStateValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    state.deploymentState.resValidation = {};
  }

  resetValidation = (state: State, payload: any): void => {

    console.debug('MUTATION - resetValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    payload.validation[payload.key] = false;
  }

  resetAllValidation = (state: State, payload: any): void => {

    console.debug('MUTATION - resetAllValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    for (let prop in payload) {
      payload[prop].err = false;
    }
  }

  updateAllValidation = (state: State, payload: any): void => {

    console.debug('MUTATION - updatAllValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
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

    console.debug('MUTATION - updatValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    let dinamicProp = payload.dinamic ? payload.dinamic : payload.prop;
    payload.validation[payload.prop] = validProp(
      payload.type,
      dinamicProp,
      payload.value
    );
  }

  updateValidationType = (state: State, payload: any): void => {

    console.debug('MUTATION - updatValidationType');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    payload.validation[payload.prop] = validType(payload.type, payload.value);
  }

  setErrValidation = (state: State, payload: any): void => {

    console.debug('MUTATION - setErrValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    payload.validation[payload.prop] = { err: true, msg: payload.msg };
  }

  /**
   * This method changes any value of the state referenced by payload.validation
   * which has a parameter as the same name as payload.prop to payload.msg.
   */
  setValidation = (state: State,
    payload: { validation: any, prop: string, msg: string }): void => {

    console.debug('MUTATION - setValidation');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    console.debug(
      'changing param \'%s\' to \'%s\' at '
      + JSON.stringify(payload.validation),
      payload.prop,
      payload.msg
    );
    payload.validation[payload.prop] = { err: false, msg: payload.msg };
  }

  /**
   * Switches the uri of the current manifest.
   */
  setManifest = (state: State, uri: string): void => {


    console.debug('MUTATION - setManifest');

    state.currentManifest = uri;
  }

  clearModals = (state: State, payload: any): void => {

    console.debug('MUTATION - clearModals');

    state.clearModals = payload;
  }

  // DEPLOYMENT
  /**
   * TODO - Possible bug. 'updater' changes depending if the number of calls to
   * this method is even or odd
   */
  updateDeployState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateDeployState');

    state.deploymentState = {
      ...state.deploymentState,
      [payload.key]: payload.value,
      updater: !state.deploymentState.updater
    };

  }

  /**
   * TODO - Possible bug. 'updater' changes depending if the number of calls to
   * this method is even or odd
   */
  updateDeployResState = (state: State, payload: { key: string, value: any }
  ): void => {

    console.debug('MUTATION - updateDeployResState');

    state.deploymentState = {
      ...state.deploymentState,
      resources: {
        ...state.deploymentState.resources,
        [payload.key]: payload.value
      },
      updater: !state.deploymentState.updater
    };

  }

  /**
   * TODO - Possible bug. 'updater' changes depending if the number of calls to
   * this method is even or odd
   */
  updateDeployParamState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateDeployParamState');

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

    console.debug('MUTATION - setArrangement');

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

  /**
   * TODO - Possible bug. 'updater' changes depending if the number of calls to
   * this method is even or odd
   */
  updateArrangementState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateArrangementState');

    state.deploymentState = {
      ...state.deploymentState,
      arrangements: {
        [payload.key]: payload.value
      },
      updater: !state.deploymentState.updater
    };
  }

  updateArrangement = (state: State, payload: any): void => {

    console.debug('MUTATION - updateArrangement');

    // TODO - Possible bug. This doesn't triggers a change.
    // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
    state.manifests[state.currentManifest].roles[state.currentArrangement]
      .resources = payload;
  }

  deleteArrangementState = (state: State, payload: any): void => {

    console.debug('MUTATION - deleteArrangementState');

    Vue.delete(state.deploymentState.arrangements, payload);
    Vue.delete(state.deploymentState.arrValidation, payload);

    state.deploymentState = {
      ...state.deploymentState,
      updater: !state.deploymentState.updater
    };
  }

  /**
   * Function with possible bugs
   */
  setDeploymentParams = (state: State): void => {

    console.debug('MUTATION - setDeploymentParams');

    // Current deployment
    let deploy = state.manifests[state.currentManifest];

    // Service of the current deployment
    let service = state.manifests[deploy.servicename];

    // Service params
    let serviceParams = service.configuration.parameters;

    // Result param list
    let paramsList = [];

    // Removes the parameter validation
    state.deploymentState = {
      ...state.deploymentState,
      paramValidation: {}
    };

    if (deploy.configuration && deploy.configuration.parameters) {
      for (let key in deploy.configuration.parameters) {

        // New parameter
        let parameter = {
          name: key, type: '', data: null, role: '', default: ''
        };

        // Old parameter
        let param = serviceParams.filter(x => {
          return x.name === key;
        });

        if (param.length > 0) {

          // Obtains the param type
          let type = param[0].type.split('/')[4];
          parameter.type = type;

          // Obtains the parameter value
          parameter.data = deploy.configuration.parameters[key];

          if (type === 'json') {

            /*
              ????? Don't know the reason of this filter
              Example values:
              key : 0
              x.name : 'myRoleName'
            */
            let roles = service.roles.filter(x => {
              return x.name === key;
            });

            if (roles.length > 0) { // There are roles

              parameter.type = 'role'; // Sets the new parameter type
              parameter.data = []; // Sets the new parameter value


              // Obtains the component of the FIRST role ?????
              let component = state.manifests[roles[0].component];
              let paramsHash: {
                [paramname: string]: { type: string, default: any }
              } = {};

              // For each parameter in the component add it to paramsHash
              for (let p of component.configuration.parameters) {

                paramsHash[p.name] = {
                  type: p.type,
                  default: p.default ? p.default : ''
                };

              }

              // Obtains the old parameter value
              let data = deploy.configuration.parameters[key];

              // For each parameter at the json parameter
              // TODO - maps can be dangerous if 'data' cant be converted to an
              //  object.
              Object.keys(data).map((pKey, index) => {

                /*
                  TODO - Possible bug. This doesn't triggers a change.
                  https://vuejs.org/v2/guide/reactivity.html#Change
                    -Detection-Caveats
                */
                state.deploymentState.parameters[key + pKey] = data[pKey];

                /*
                  TODO - Possible bug. This doesn't triggers a change.
                  https://vuejs.org/v2/guide/reactivity.html#Change
                    -Detection-Caveats
                */
                state.deploymentState.paramValidation[key + pKey] = {
                  err: false,
                  msg: ''
                };

                // Adds the value to the parameter
                parameter.data.push({
                  name: pKey,
                  type: paramsHash[pKey].type.split('/')[4],
                  role: key,
                  default: paramsHash[pKey].default
                });

              });
            } else { // There aren't roles

              /*
                TODO - Possible bug. This doesn't triggers a change.
                https://vuejs.org/v2/guide/reactivity.html#Change
                  -Detection-Caveats
              */
              state.deploymentState.parameters[key] = deploy.configuration
                .parameters[key];

              /*
                TODO - Possible bug. This doesn't triggers a change.
                https://vuejs.org/v2/guide/reactivity.html#Change
                  -Detection-Caveats
              */
              state.deploymentState.paramValidation[key] = {
                err: false,
                msg: ''
              };

            }

          } else {

            /*
              TODO - Possible bug. This doesn't triggers a change.
              https://vuejs.org/v2/guide/reactivity.html#Change
                -Detection-Caveats
            */
            state.deploymentState.paramValidation[key] = {
              err: false,
              msg: ''
            };

          }

          paramsList.push(parameter);

        } else {

          // Adds an alarm
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

    console.debug('MUTATION - setDeployCharts');

    state.deploymentState = {
      ...state.deploymentState,
      'charts': payload
    };

  }


  /**
   * Possible bug
   */
  updateCompState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateCompState');

    state.componentState = {
      ...state.componentState,
      [payload.key]: payload.value,

      // TODO - What if odd | even number of calls to this function?
      'updater': !state.componentState.updater
    };

  }

  /**
   * Possible bug
   */
  updateConfigState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateConfigState');

    state.configurationState = {
      ...state.configurationState,
      [payload.key]: payload.value,

      // TODO - What if odd number of calls to this function?
      'updater': !state.configurationState.updater
    };

  }

  updateConfState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateConfState');

    state.configurationState = {
      ...state.configurationState,
      [payload.key]: payload.value,

      // TODO - What if odd number of calls to this function?
      'updater': !state.configurationState.updater
    };

  }

  setComponentRuntime = (state: State, payload: any): void => {

    console.debug('MUTATION - updateComponentRuntime');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'runtime': payload.value
      }
    };

  }

  setComponentResources = (state: State, payload: any): void => {

    console.debug('MUTATION - setComponentResources');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'configuration': {
          ...state.manifests[state.currentManifest].configuration,
          'resources': payload
        }
      }
    };

  }

  setComponentParameters = (state: State, payload: any): void => {

    console.debug('MUTATION - setComponentParameters');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'configuration': {
          ...state.manifests[state.currentManifest].configuration,
          'parameters': payload
        }
      }
    };

  }

  // SERVICE
  setServiceName = (state: State, payload: any): void => {

    console.debug('MUTATION - setServiceName');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'name': payload
      }
    };

  }

  updateServState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateServState');

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

    console.debug('MUTATION - setServs');

    state.manifestList = payload;

  }

  setDependencies = (state: State, payload: any): void => {

    console.debug('MUTATION - setDependencies');

    state.mDependencies = payload;

  }

  setStateName = (state: State, payload: any): void => {

    console.debug('MUTATION - setStateName');

    payload.state.name = payload.param;

  }

  // ROLES
  setRole = (state: State, role: number): void => {

    console.debug('MUTATION - setRole');

    console.debug('Cuando entramos en setRole tenemos como rol ' + role);

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

    console.debug('MUTATION - updateRoles');

    let roles = state.manifests[state.currentManifest].roles;
    roles.push(payload);

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        roles: roles
      }
    };

  }

  updateRoleName = (state: State, newRoleName: string): void => {

    console.debug('MUTATION - updateRoleName');

    let roles = state.manifests[state.currentManifest].roles;
    roles[state.currentRole] = {
      ...state.manifests[state.currentManifest].roles[state.currentRole],
      'name': newRoleName
    };

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        roles: roles
      }
    };

  }

  updateChannelNameInConnectors = (state: State,
    payload: { key: any, value: any }): void => {

    payload.key = payload.value;

  }

  deleteChannelInConnectors = (state: State, payload: { key: any, value: any }
  ): void => {

    payload.key = payload.value;

  }

  addConnector = (state: State, payload: { key: any, value: any }): any => {

    payload.key.push(payload.value);

  }

  updateConfirmationAccept = (state: State, payload: any): void => {

    console.debug('MUTATION - updateConfirmationAccept');

    state.confirm = {
      ...state.confirm,
      'accept': payload
    };

  }

  updateConfirmationDeny = (state: State, payload: any): void => {

    console.debug('MUTATION - updateConfirmationDeny');

    state.confirm = {
      ...state.confirm,
      'deny': payload
    };

  }

  updateRoleComp = (state: State, component: string): void => {

    console.debug('MUTATION - updateRoleComp');

    console.debug('updating role component to: ' + component);

    let roles = state.manifests[state.currentManifest].roles;
    roles[state.currentRole] = {
      ...state.manifests[state.currentManifest].roles[state.currentRole],
      'component': component
    };

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'roles': roles
      }
    };

  }

  updateRoleRes = (state: State, payload: any): void => {

    console.debug('MUTATION - updateRoleRes');

    let roles = state.manifests[state.currentManifest].roles;
    roles[state.currentRole] = {
      ...state.manifests[state.currentManifest].roles[state.currentRole],
      'resources': payload
    };

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'roles': roles
      }
    };

  }

  updateRoleState = (state: State, payload: { key: string, value: any }
  ): void => {

    console.debug('MUTATION - updateRoleState');

    console.debug(
      'Entramos en updateRoleState con key %s value '
      + JSON.stringify(payload.value), payload.key
    );

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

    console.debug('MUTATION - deleteRole');

    let roles = state.manifests[state.currentManifest].roles;
    roles.splice(payload, 1);

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'roles': roles
      }
    };

  }

  resetRole = (state: State, payload: any): void => {

    console.debug('MUTATION - resetRole');

    state.currentRole = -1;
    state.roleState = {
      ...state.roleState,
      'role': { name: '', component: '', resources: [] }
    };

  }

  // CHANNELS
  resetChannel = (state: State, payload: any): void => {

    console.debug('MUTATION - resetChannel');

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

    console.debug('MUTATION - setChannel');

    state.channelState = {
      ...state.channelState,
      'channel': payload
    };

  }

  setChannelDirect = (state: State, payload: any): void => {

    console.debug('MUTATION - setChannelDirect');

    state.channelState = {
      ...state.channelState,
      'channel': {
        ...state.channelState.channel,
        'inout': payload
      }
    };

  }

  updateChannels = (state: State, payload: any): void => {

    console.debug('MUTATION - updateChannels');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'channels': {
          ...state.manifests[state.currentManifest].channels,
          [payload.direction]: payload.channels
        }
      }
    };

  }

  updateChannState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateChannState');

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

  /**
   * Updates any property of a channel.
   */
  updateChannelProperty = (state: State, payload: {
    key: string, value: string, channIndex: string,
    inout: 'requires' | 'provides'
  }): void => {

    console.debug('MUTATION - updateChannelProperty');

    let channels = state.manifests[state.currentManifest].channels;
    console.debug('Payload contains', payload);

    console.debug('The group of channels contain', channels[payload.inout]);
    console.debug(
      'The selected channel contain',
      channels[payload.inout][payload.channIndex]
    );

    channels[payload.inout][payload.channIndex][payload.key] = payload.value;
    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'channels': channels
      }
    };

  }

  // CONNECTORS
  setConnector = (state: State, payload: any): void => {

    console.debug('MUTATION - setConnector');

    state.currentConnector = payload;

  }

  /**
   * Sets the callback for the accept button on the warning modal
   */
  setConfirmAccept = (state: State, payload: any): void => {

    console.debug('MUTATION - setConfirmAccept');

    state.confirm = {
      ...state.confirm,
      'accept': payload
    };
  }

  /**
   * Sets the callback for the deny button on the warning modal
   */
  setConfirmDeny = (state: State, payload: any): void => {

    console.debug('MUTATION - setConfirmDeny');

    state.confirm = {
      ...state.confirm,
      'deny': payload
    };

  }


  updateConnectors = (state: State, payload: any): void => {

    console.debug('MUTATION - updateConnectors');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'connectors': payload
      }
    };

  }

  setProvidedConnectors = (state: State, payload: { key: any, value: any }
  ): void => {

    console.debug('MUTATION - setProvidedConnectors');

    payload.key = payload.value;

  }

  setDependedConnectors = (state: State, payload: { key: any, value: any }
  ): void => {

    console.debug('MUTATION - setDependedConnectors');

    payload.key = payload.value;

  }

  updateRoleNameInConnector = (state: State,
    payload: { key: any, value: string }): void => {

    console.debug('MUTATION - updateRoleNameInConnector');

    payload.key = payload.value;

  }

  udpateRoleNameInParameters = (state: State,
    payload: { key: any, value: string }): void => {


    console.debug('MUTATION - updateRoleNameInParameters');

    payload.key = payload.value;

  }

  deleteConnList = (state: State, payload: any): void => {

    console.debug('MUTATION - deleteConnList');

    if (state.currentConnector >= 0) {

      let direction = payload.type === state.Settings.listTypes
        .connectorList.provided ? 'provided' : 'depended';

      state.manifests = {
        ...state.manifests,
        [state.currentManifest]: {
          ...state.manifests[state.currentManifest],
          'connectors': {
            ...state.manifests[state.currentManifest].connectors,
            [state.currentConnector]: {
              ...state.manifests[state.currentManifest]
                .connectors[state.currentConnector],
              'direction': state.manifests[state.currentManifest]
                .connectors[state.currentConnector][direction]
                .splice(payload.index, 1)
            }
          }
        }
      };

    }

  }

  resetConnector = (state: State,
    manifests: { [urn: string]: Manifest; }): void => {

    console.debug('MUTATION - resetConnector');

    let service = manifests[state.currentManifest];

    if (service.connectors.length > 0) {
      state.currentConnector = 0;
    } else {
      state.currentConnector = 1;
    }

  }

  // RESOURCES
  updateServRes = (state: State, payload: any): void => {

    console.debug('MUTATION - updateServRes');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'configuration': {
          ...state.manifests[state.currentManifest].configuration,
          'resources': {
            ...state.manifests[state.currentManifest].configuration.resources,
            [payload.index]: {
              ...state.manifests[state.currentManifest].configuration
                .resources[payload.index],
              'name': payload.name
            }
          }
        }
      }
    };

  }

  updateRolRes = (state: State, payload: any): void => {

    console.debug('MUTATION - updateRolRes');

    let roles = state.manifests[state.currentManifest].roles;
    roles[state.currentRole] = {
      ...state.manifests[state.currentManifest].roles[state.currentRole],
      'resources': payload
    };

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'roles': roles
      }
    };

  }

  setServRes = (state: State, payload: any): void => {

    console.debug('MUTATION - setServRes');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'configuration': {
          ...state.manifests[state.currentManifest].configuration,
          'resources': payload.res
        }
      }
    };

  }

  updateResourceState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateResourceState');

    state.resourceState = {
      ...state.resourceState,
      [payload.key]: payload.value,
      'updater': !state.resourceState.updater
    };

  }

  // RUNTIMES
  updateRuntimeState = (state: State, payload: any): void => {

    console.debug('MUTATION - updateRuntimeState');

    state.runtimeState = {
      ...state.runtimeState,
      [payload.key]: payload.value,
      'updater': !state.runtimeState.updater
    };

  }

  updateRuntimeStateParent = (state: State, payload: any): void => {

    console.debug('MUTATION - updateRuntimeStateParent');

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

    console.debug('MUTATION - updateServParams');

    state.manifests = {
      ...state.manifests,
      [state.currentManifest]: {
        ...state.manifests[state.currentManifest],
        'configuration': {
          ...state.manifests[state.currentManifest].configuration,
          'parameters': payload
        }
      }
    };

  }
}
