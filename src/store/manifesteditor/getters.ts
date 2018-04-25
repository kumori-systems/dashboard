import Vuex from 'vuex';
import State from './state';

import { tools } from './utils';

import { ECloudElement, Manifest } from '../stampstate/classes';

import { getElementType } from '../../api/utils';

/**
 * Getters to handle the representation of the stamp state easier.
 */
export default class Getters implements Vuex.GetterTree<State, any> {
  [name: string]: Vuex.Getter<State, any>;

  registries = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return []
      .concat(Object.keys(getters.deployments).forEach((v, i, a) => {
        return { 'urn': v, 'type': 'deployment' };
      }))
      .concat(Object.keys(getters.services).forEach((v, i, a) => {
        return { 'urn': v, 'type': 'service' };
      }))
      .concat(Object.keys(getters.components).forEach((v, i, a) => {
        return { 'urn': v, 'type': 'component' };
      }))
      .concat(Object.keys(getters.runtimes).forEach((v, i, a) => {
        return { 'urn': v, 'type': 'runtime' };
      }))
      .concat(Object.keys(getters.domains).forEach((v, i, a) => {
        return { 'urn': v, 'type': 'resource' };
      }))
      .concat(Object.keys(getters.persistentVolumes).forEach((v, i, a) => {
        return { 'urn': v, 'type': 'resource' };
      }))
      .concat(Object.keys(getters.certificates).forEach((v, i, a) => {
        return { 'urn': v, 'type': 'resource' };
      }));

  }

  getAlerts = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.alerts;
  }


  menuOptions = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let res = [];
    if (state.currentManifest) {
      let manifest = getters.manifests[state.currentManifest];
      res = res.concat(state.Settings.menuOptions[manifest.type])
        .concat(state.Settings.menuOptions['shared']);
    }

    return res;
  }

  getSettings = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.Settings;
  }

  alertPan = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.showAlertPan;
  }

  getManifest = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentManifest !== '')
      return getters.manifests[state.currentManifest];
  }

  blockEditName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return true;
  }

  // DEPLOYMENT
  getArrangements = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    let res = [];
    if (state.currentManifest) {
      let deploy = getters.manifests[state.currentManifest];
      for (let role in deploy.roles) {
        res.push({ name: role });
      }
    }
    return res;

  }

  getDeployParams = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.deploymentState.paramsList;
  }

  getArragementRes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.deploymentState.arrangements;
  }

  getMainArrangements = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.Settings.manifestStructure.elementtype.arrangements.main_enum;
  }

  getOptArrangements = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.Settings.manifestStructure.elementtype.arrangements.opt_enum;
  }

  // SERVICE
  getServiceName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    let res = {
      name: '',
      domain: '',
      version: ''
    };
    if (state.currentManifest) {
      let splitted: string = getters.manifests[state.currentManifest]
        ._urn.split('/');
      res.name = splitted[4];
      res.domain = splitted[2];
      res.version = splitted[5];
    }
    return res;

  }

  // ROLES
  getCurrentRole = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    let res: { name: string, component: string, resources: any[] };
    if (state.currentRole >= 0) {

      let service = getters.manifests[state.currentManifest];
      let role = service.roles[state.currentRole];
      res = {
        name: role.name,
        component: role.component,
        resources: role.resources ?
          Object.keys(role.resources).map(function (key) {
            return { name: role.resources[key], key: key };
          }) : []
      };

    } else {

      res = { name: '', component: '', resources: [] };

    }

    return res;

  }

  getCurrentRoleIndex = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.currentRole;
  }

  getCurrentRoleResource = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let service = getters.manifests[state.currentManifest];
    if (state.currentRole >= 0) {

      let role = service.roles[state.currentRole];
      let components = getters.getComponents;
      let component = components[role.component];
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
  }

  getCurrentRoleParams = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let service = getters.manifests[state.currentManifest];
    if (state.currentRole >= 0) {
      let role = service.roles[state.currentRole];
      let component = getters.getComponents[role.component];
      return component.configuration.parameters;
    }
    return [];
  }

  // CHANNELS 
  getChannels = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let res = [];
    if (state.currentManifest) {
      res = getters.manifests[state.currentManifest].channels;
    }
    return res;
  }

  getCurrentConnector = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.currentConnector;
  }

  // CONNECTORS
  getCurrConnDepended = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentConnector >= 0) {
      let connectors = getters.getConnectors;
      if (connectors.length > state.currentConnector) {
        let list = connectors[state.currentConnector].depended;
        return tools.parseConnChannels(list);
      }
    }
  }

  getCurrConnProvided = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentConnector >= 0) {
      let connectors = getters.getConnectors;
      if (connectors.length > state.currentConnector) {
        let list = connectors[state.currentConnector].provided;
        return tools.parseConnChannels(list);
      }
    }
  }

  getAllConnProvided = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return tools.getAllChannels(state, getters, 'provides');
  }

  getAllConnDepended = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return tools.getAllChannels(state, getters, 'requires');
  }

  getConnectors = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): {
      name: string, id: string, depended: any[], provided: any[]
    }[] => {

    let res = [];
    let currentManifest = state.currentManifest;
    if (currentManifest) {

      let connectors = getters.manifests[currentManifest].connectors;
      let genId = -1;
      for (let conn in connectors) {

        res.push({
          'id': ++genId,
          'name': connectors[conn].type.split('/')[4],
          'depended': connectors[conn].depended,
          'provided': connectors[conn].provided
        });

      }

    }
    return res;

  }

  // COMPONENTS
  getComponents = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    let components = {};
    let manifests = rootState.stampstate.manifests;
    for (let man in manifests) {
      if (manifests[man].type === 'component') {
        components[man] = manifests[man];
      }
    }
    return components;

  }

  // RESOURCES
  /**
   * Obtains from all manifests all thoose which are resources
   */
  getResources = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    let res = [];
    for (let uri in state.manifests) {
      if (getElementType(uri) === ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE) {
        res.push(state.manifests[uri]);
      }
    }
    return res;
  }

  // PARAMETERS
  getBypassParams = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    if (state.currentRole >= 0) {
      let role = getters.manifests[state.currentManifest]
        .roles[state.currentRole];
      return getters.manifests[state.currentManifest].configuration.parameters
        .findIndex(x => x.name === role.name) !== -1;
    }
    return null;
  }

  currentManifest = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.currentManifest;
  }

  manifestList = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.manifestList;
  }

  clearModals = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.clearModals;
  }

  validation = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.serviceState.validation;
  }

  servName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.serviceState.name;
  }

  updater = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {
    return state.serviceState.updater;
  }

};