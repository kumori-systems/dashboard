import Vuex from 'vuex';
import State from './state';

import { parseConnChannels, getAllChannels } from './utils'

/**
 * Getters to handle the representation of the stamp state easier.
 */
export default class Getters implements Vuex.GetterTree<State, any> {
  [name: string]: Vuex.Getter<State, any>;

  getAlerts = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.alerts;
  };

  menuOptions = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let manifest = state.manifests[state.currentManifest];
    return state.Settings.menuOptions[manifest.type]
      .concat(state.Settings.menuOptions['shared']);
  };

  getSettings = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.Settings;
  };

  alertPan = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.showAlertPan;
  };

  getManifest = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentManifest != '')
      return state.manifests[state.currentManifest];
  };

  blockEditName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return true;
  };

  //DEPLOYMENT
  getArrangements = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    let deploy = state.manifests[state.currentManifest];
    let arrangements = [];
    Object.keys(deploy.roles).map(function (key, index) {
      arrangements.push({ name: key });
      return true;
    })

    return arrangements;
  };

  getDeployParams = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.deploymentState.paramsList;
  };

  getArragementRes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.deploymentState.arrangements;
  };

  getMainArrangements = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.Settings.manifestStructure.elementtype.arrangements.main_enum;
  };

  getOptArrangements = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.Settings.manifestStructure.elementtype.arrangements.opt_enum;
  };

  // SERVICE
  getServiceName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return {
      name: state.manifests[state.currentManifest].name.split('/')[4],
      domain: state.manifests[state.currentManifest].name.split('/')[2],
      version: state.manifests[state.currentManifest].name.split('/')[5]
    }
  };

  // ROLES
  getCurrentRole = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentRole >= 0) {
      let service = state.manifests[state.currentManifest];
      let role = service.roles[state.currentRole];
      state.roleState.role = {
        name: role.name,
        component: role.component,
        resources: (role.resources != undefined) ? Object.keys(role.resources).map(function (key) { return { name: role.resources[key], key: key }; }) : []
      }
    }
    else
      state.roleState.role = { name: '', component: '', resources: [] };

    return state.roleState.role;
  };

  getCurrentRoleIndex = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.currentRole;
  };

  getCurrentRoleResource = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let service = state.manifests[state.currentManifest];
    if (state.currentRole >= 0) {
      let role = service.roles[state.currentRole]
      let component = getters.getComponents[role.component];
      let resources = component.configuration.resources;

      let rows = [];
      if (resources.length > 0) {
        for (let i = 0; i < resources.length; i++) {
          let depId = role.resources ? role.resources[resources[i].name] : '';
          rows.push([
            {
              id: 'name',
              ref: resources[i].name + i,
              value: resources[i].name,
              type: state.Settings.inlineForms.valueTypes.text
            },
            {
              id: 'resType',
              ref: resources[i].name + i,
              value: resources[i].type.match(/resource\/(.+)\//)[1],
              type: state.Settings.inlineForms.valueTypes.text,
              fullType: resources[i].type
            },
            {
              id: 'depid',
              ref: resources[i].name + i,
              value: depId,
              type: state.Settings.inlineForms.valueTypes.input
            }
          ]);
        }
        return {
          headers: state.Settings.inlineForms.headers.resource,
          rows: rows
        };
      }
    }
    return { headers: state.Settings.inlineForms.headers.resource, rows: [] };
  };
  getCurrentRoleParams = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let service = state.manifests[state.currentManifest];
    if (state.currentRole >= 0) {
      let role = service.roles[state.currentRole]
      let component = getters.getComponents[role.component];
      return component.configuration.parameters;
    }
    return [];
  };

  // CHANNELS 
  getChannels = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.manifests[state.currentManifest].channels;
  };
  getCurrentConnector = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.currentConnector;
  };

  // CONNECTORS
  getCurrConnDepended = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentConnector >= 0) {
      let connectors = getters.getConnectors;
      if (connectors.length > state.currentConnector) {
        let list = connectors[state.currentConnector].depended;
        return parseConnChannels(list);
      }
    }
  };

  getCurrConnProvided = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentConnector >= 0) {
      let connectors = getters.getConnectors;
      if (connectors.length > state.currentConnector) {
        let list = connectors[state.currentConnector].provided;
        return parseConnChannels(list);
      }
    }
  };

  getAllConnProvided = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return getAllChannels(state, getters, 'provides');
  };

  getAllConnDepended = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return getAllChannels(state, getters, 'requires');
  };

  getConnectors = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let connectors = state.manifests[state.currentManifest].connectors;
    let genId = -1;
    return Object.keys(connectors).map(function (key) {
      return {
        id: ++genId,
        name: connectors[key].type.split("/")[4],
        depended: connectors[key].depended,
        provided: connectors[key].provided
      };
    });
  };

  // COMPONENTS
  getComponents = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let components = {};
    Object.keys(state.manifests).map(function (key, index) {
      if (state.manifests[key].type == 'component') {
        components[key] = state.manifests[key];
      }
      return true;
    })

    return components;
  };

  // RESOURCES
  getResources = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let res = [];
    Object.keys(state.manifests).map(function (key, index) {
      if (state.manifests[key].type == 'resource') {
        res.push(state.manifests[key]);
      }
      return true;
    })
    return res;
  };

  // PARAMETERS
  getBypassParams = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentRole >= 0) {
      let role = state.manifests[state.currentManifest].roles[state.currentRole];
      return state.manifests[state.currentManifest].configuration.parameters.findIndex(x => x.name == role.name) != -1;
    }
  };

  manifests = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.manifests;
  };

  currentManifest = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.currentManifest;
  };

  manifestList = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.manifestList;
  };

  clearModals = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.clearModals;
  };

  validation = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.serviceState.validation
  };

  servName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.serviceState.name;
  }

  updater = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.serviceState.updater;
  }

};