import Vuex from 'vuex';
import State from './state';

import * as utils from '../../api/utils';
import {
  Certificate, Channel, Component, DependedChannel, Deployment, Domain,
  EntryPoint, Metric, ProvidedChannel, Runtime, Service
} from './classes';

/**
 * Getters to handle the representation of the stamp state easier.
 */
export default class Getters implements Vuex.GetterTree<State, any> {
  [name: string]: Vuex.Getter<State, any>;

  deployments = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [uri: string]: Deployment } => {
    return state.deployments;
  }

  deployment = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (deploymentURI: string) => Deployment => {
    return (deploymentURI: string) => {
      return state.deployments[deploymentURI];
    };
  }

  deploymentMetricList = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (deploymentURI: string) => [Date, {
      'data': Metric,
      'roles': {
        [roleId: string]: {
          'data': Metric, 'instances': {
            [instanceId: string]: Metric
          }
        }
      }
    }][] => {
    return (deploymentId: string): [Date, {
      'data': Metric, 'roles': {
        [roleId: string]: {
          'data': Metric, 'instances': {
            [instanceId: string]: Metric
          }
        }
      }
    }][] => {
      return (<Deployment>state.deployments[deploymentId]).metrics;
    };
  }

  deploymentFromPath = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (deploymentPath: string) => Deployment => {
    return (deploymentPath: string) => {
      let res: string = null;
      for (let uri in state.deployments) {
        if (state.deployments[uri]._path === deploymentPath) {
          res = uri;
        }
      }
      return (getters.deployment as Function)(res);
    };
  }

  numDeployments = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): number => {
    let res: number = 0;
    for (let uri in state.deployments)
      res++;
    return res;
  }

  component = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURI: string) => Component => {
    return (componentURI: string) => {
      return state.components[componentURI];
    };
  }

  componentsByOwner = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): {
      [owner: string]: { [name: string]: { [version: string]: string } }
    } => {
    let res: {
      [owner: string]: { [name: string]: { [version: string]: string } }
    } = {};
    for (let uri in state.components) {
      let [componentDomain, componentName, componentVersion] =
        utils.getElementAtributes(uri);

      if (!res[componentDomain])
        res[componentDomain] = {};
      if (!res[componentDomain][componentName])
        res[componentDomain][componentName] = {};

      res[componentDomain][componentName][componentVersion] = uri;
    }

    return res;
  }

  componentUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURI: string) => Service[] => {
    return (componentUri: string) => {
      let res: Service[] = [];
      for (let uri in state.services) {
        if (state.services[uri]) {
          for (let r in state.services[uri].roles) {
            if (state.services[uri].roles[r].component === componentUri) {
              res.push(state.services[uri]);
            }
          }
        }
      }
      return res;
    };
  }

  services = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [uri: string]: Service } => {
    return state.services;
  }

  service = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURI: string) => Service => {
    return (serviceURI: string) => {
      return state.services[serviceURI];
    };
  }

  servicesByOwner = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): {
      [owner: string]: {
        [name: string]: {
          [version: string]: string
        }
      }
    } => {
    let res: {
      [owner: string]: {
        [name: string]: {
          [version: string]: string
        }
      }
    } = {};
    for (let uri in state.services) {
      let [serviceDomain, serviceName, serviceVersion] =
        utils.getElementAtributes(uri);

      if (!res[serviceDomain])
        res[serviceDomain] = {};
      if (!res[serviceDomain][serviceName])
        res[serviceDomain][serviceName] = {};

      res[serviceDomain][serviceName][serviceVersion] = uri;
    }
    return res;
  }

  serviceUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURI: string) => Deployment[] => {
    return (serviceUri: string) => {
      let res: Deployment[] = [];
      for (let uri in state.deployments) {
        if (state.deployments[uri].service === serviceUri) {
          res.push(state.deployments[uri]);
        }
      }
      return res;
    };
  }

  getServiceRoles = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURI: string) =>
      string[] => {
    return (serviceURI: string) => {
      let res: Array<string> = [];
      if ((<Service>state.services[serviceURI]))
        for (let role in (<Service>state.services[serviceURI]).roles) {
          res.push(role);
        }
      return res;
    };
  }

  getServiceProvidedChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (serviceURI: string) =>
      ProvidedChannel[] => {
    return (serviceURI: string) => {
      let res = [];
      if ((<Service>state.services[serviceURI])) { // if service exists
        for (let providedChannel in
          (<Service>state.services[serviceURI]).providedChannels) {
          res.push(providedChannel);
        }
      }
      return res;
    };
  }

  getServiceDependedChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (serviceURI: string) =>
      DependedChannel[] => {
    return (serviceURI: string) => {
      let res = [];
      if ((<Service>state.services[serviceURI])) { // if service exists
        for (let dependedChannel in
          (<Service>state.services[serviceURI]).dependedChannels) {
          res.push(dependedChannel);
        }
      }
      return res;
    };
  }


  getTotalProvidedDeploymentChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (serviceURI: string,
      channelId: string) => string[] => {
    return (serviceId: string, channelId: string) => {
      // Obtenemos el canal y miramos de qué tipo es
      let type: string = (<Service>state.services[serviceId])
        .dependedChannels[channelId].type;
      let typeSearched: Channel.TYPE[] = [];
      switch (type) {
        case Channel.TYPE.ENDPOINT_REQUEST:
          console.warn('deprecated channel URI \'endpoint\'');
        case Channel.TYPE.REQUEST:
          typeSearched = [Channel.TYPE.REPLY, Channel.TYPE.ENDPOINT_REPLY];
          break;
        case Channel.TYPE.ENDPOINT_REPLY:
          console.warn('deprecated channel URI \'endpoint\'');
        case Channel.TYPE.REPLY:
          typeSearched = [Channel.TYPE.REQUEST, Channel.TYPE.ENDPOINT_REQUEST];
          break;

        default:
          console.error('Not expected channel type \'%s\' on  \'%s:%s\'', type,
            serviceId, channelId);
      }

      let res: string[] = [];
      for (let deploymentId in state.deployments) {
        if (!(state.deployments[deploymentId] instanceof EntryPoint)
          || state.deployments[deploymentId].links.length === 0) {
          // Si es un entrypoint y ya está en uso no lo listamos
          let serviceId: string = state.deployments[deploymentId].service;
          if (state.services[serviceId]) { // if service exists
            for (let providedChannelId in
              state.services[serviceId].providedChannels) {
              // Recorremos los canales required del servicio
              if (typeSearched.indexOf(state.services[serviceId]
                .providedChannels[providedChannelId].type) !== -1) {
                // Si encaja con el tipo de canal que buscamos
                res.push(state.deployments[deploymentId].name + ' + '
                  + providedChannelId); // Lo añadimos
              }
            }
          }
        }
      }
      return res;
    };
  }


  getTotalDependedDeploymentChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (serviceURI: string,
      channelId: string) => string[] => {
    return (serviceId: string, channelId: string) => {
      // Obtenemos el canal y miramos de qué tipo es
      let type: string = (<Service>state.services[serviceId])
        .providedChannels[channelId].type;
      let typeSearched: Channel.TYPE[] = [];
      switch (type) {
        case Channel.TYPE.ENDPOINT_REQUEST:
        // console.warn('deprecated channel URI \'endpoint\'');
        case Channel.TYPE.REQUEST:
          typeSearched = [Channel.TYPE.REPLY, Channel.TYPE.ENDPOINT_REPLY];
          break;
        case Channel.TYPE.ENDPOINT_REPLY:
        // console.warn('deprecated channel URI \'endpoint\'');
        case Channel.TYPE.REPLY:
          typeSearched = [Channel.TYPE.REQUEST, Channel.TYPE.ENDPOINT_REQUEST];
          break;

        default:
          console.error('Not expected channel type \'%s\' on  \'%s:%s\'', type,
            serviceId, channelId);
      }

      let res: string[] = [];
      for (let deploymentId in state.deployments) {
        if (state.deployments[deploymentId] instanceof EntryPoint
          || state.deployments[deploymentId].links.length === 0) {
          // Si es un entrypoint y ya está en uso no lo listamos
          let serviceId: string = state.deployments[deploymentId].service;
          if (state.services[serviceId]) { // if service exists
            for (let requiredChannelId in
              state.services[serviceId].dependedChannels) {
              // Recorremos los canales required del servicio
              if (typeSearched.indexOf(state.services[serviceId]
                .dependedChannels[requiredChannelId].type) !== -1) {
                // Si encaja con el tipo de canal que buscamos
                res.push(state.deployments[deploymentId].name + ' + '
                  + requiredChannelId); // Lo añadimos
              }
            }
          }
        }
      }
      return res;
    };
  }

  getServiceResources = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURI: string) => string[] => {
    return (serviceId: string) => {
      let res: Array<string> = [];
      if (state.services[serviceId] && state.services[serviceId].resources)
        for (let resourceIndex in state.services[serviceId].resources) {
          if (state.services[serviceId].resources[resourceIndex])
            res.push(state.services[serviceId].resources[resourceIndex]);
        }
      return res;
    };
  }

  runtimesByOwner = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): {
      [owner: string]: {
        [name: string]: {
          [version: string]: string
        }
      }
    } => {
    let res: {
      [owner: string]: {
        [name: string]: {
          [version: string]: string
        }
      }
    } = {};
    for (let uri in state.runtimes) {
      let [runtimeDomain, runtimeName, runtimeVersion] =
        utils.getElementAtributes(uri);

      if (!res[runtimeDomain])
        res[runtimeDomain] = {};
      if (!res[runtimeDomain][runtimeName])
        res[runtimeDomain][runtimeName] = {};

      res[runtimeDomain][runtimeName][runtimeVersion] = uri;
    }
    return res;
  }

  runtimeUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURI: string) => Component[] => {
    return (runtimeUri: string) => {
      let res: Component[] = [];
      for (let uri in state.components) {
        if (state.components[uri]
          && state.components[uri].runtime === runtimeUri) {
          res.push(state.components[uri]);
        }
      }
      return res;
    };
  }

  domains = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [uri: string]: Domain } => {
    return state.domains;
  }

  certificates = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [uri: string]: Certificate } => {
    return state.certificates;
  }

};