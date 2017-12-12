import Vuex from 'vuex';
import State from './state';

import PriorityQueue from 'priorityqueue';

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

  /**
   * Gets the deployment uris ordered by their names.
   * @returns <string[]> array of the uris ordered by deployment name
  */
  orderDeploymentsByName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): string[] => {

    let pq: PriorityQueue = new PriorityQueue({
      comparator: (a, b) => {
        return a.name < b.name ? 1 : -1;
      }
    });

    for (let dep in state.deployments) {
      pq.push({
        'name': state.deployments[dep].name,
        '_uri': state.deployments[dep]._uri
      });
    }

    let res: string[] = [];

    while (pq.size() > 0) {
      res.push(pq.pop()['_uri']);
    }


    return res;
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


  components = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [uri: string]: Component } => {
    return state.components;
  }

  component = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURI: string) => Component => {
    return (componentURI: string) => {
      return state.components[componentURI];
    };
  }

  componentsByOwner = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (searchFilter: string) => {
      [owner: string]: { [name: string]: { [version: string]: string } }
    } => {
    return (searchFilter: string) => {
      let res: {
        [owner: string]: { [name: string]: { [version: string]: string } }
      } = {};
      for (let uri in state.components) {
        if (searchFilter === null || uri.indexOf(searchFilter) !== -1) {
          let [componentDomain, componentName, componentVersion] =
            utils.getElementAtributes(uri);

          if (!res[componentDomain])
            res[componentDomain] = {};
          if (!res[componentDomain][componentName])
            res[componentDomain][componentName] = {};

          res[componentDomain][componentName][componentVersion] = uri;
        }
      }

      return res;
    };
  }

  componentUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURI: string) => string[] => {
    return (componentUri: string) => {
      let res: string[] = [];
      if (state.components[componentUri]) {
        res = state.components[componentUri].usedBy;
      }
      return res;
    };
  }

  services = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [uri: string]: Service } => {
    return state.services;
  }

  servicesList = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): string[] => {
    let res: string[] = [];
    for (let ser in state.services) {
      res.push(ser);
    }
    return res;
  }

  service = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURI: string) => Service => {
    return (serviceURI: string) => {
      return state.services[serviceURI];
    };
  }

  servicesByOwner = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (searchFilter: string) => {
      [owner: string]: {
        [name: string]: {
          [version: string]: string
        }
      }
    } => {
    return (searchFilter: string) => {
      let res: {
        [owner: string]: {
          [name: string]: {
            [version: string]: string
          }
        }
      } = {};
      for (let uri in state.services) {
        if (searchFilter === null || uri.indexOf(searchFilter) !== -1) {
          let [serviceDomain, serviceName, serviceVersion] =
            utils.getElementAtributes(uri);

          if (!res[serviceDomain])
            res[serviceDomain] = {};
          if (!res[serviceDomain][serviceName])
            res[serviceDomain][serviceName] = {};

          res[serviceDomain][serviceName][serviceVersion] = uri;
        }
      }
      return res;
    };
  }

  serviceUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURI: string) => string[] => {
    return (serviceUri: string) => {
      let res: string[] = [];
      if (state.services[serviceUri]) {
        res = state.services[serviceUri].usedBy;
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
      channelId: string) => {
        'value': string, 'text': string
      }[] => {
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

      let res: {
        'value': string, 'text': string
      }[] = [];

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
                res.push(
                  {
                    'value': JSON.stringify({
                      'deployment': deploymentId,
                      'channel': providedChannelId
                    }),
                    'text': (getters.deployment as any)(deploymentId).name
                      + ' ~ ' + providedChannelId
                  }
                ); // Lo añadimos
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
      channelId: string) => {
        'value': string, 'text': string
      }[] => {
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

      let res: {
        'value': string, 'text': string
      }[]
        = [];
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
                res.push(
                  {
                    'value': JSON.stringify({
                      'deployment': deploymentId,
                      'channel': requiredChannelId
                    }),
                    'text': (getters.deployment as any)(deploymentId).name
                      + ' ~ ' + requiredChannelId
                  }
                ); // Lo añadimos
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

  runtimes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [uri: string]: Runtime } => {
    return state.runtimes;
  }

  runtimesByOwner = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (searchFilter: string) => {
      [owner: string]: {
        [name: string]: {
          [version: string]: string
        }
      }
    } => {
    return (searchFilter: string) => {
      let res: {
        [owner: string]: {
          [name: string]: {
            [version: string]: string
          }
        }
      } = {};
      for (let uri in state.runtimes) {
        if (searchFilter === null || uri.indexOf(searchFilter) !== -1) {
          let [runtimeDomain, runtimeName, runtimeVersion] =
            utils.getElementAtributes(uri);

          if (!res[runtimeDomain])
            res[runtimeDomain] = {};
          if (!res[runtimeDomain][runtimeName])
            res[runtimeDomain][runtimeName] = {};

          res[runtimeDomain][runtimeName][runtimeVersion] = uri;
        }
      }
      return res;
    };
  }

  runtimeUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURI: string) => string[] => {
    return (runtimeUri: string) => {
      let res: string[] = [];
      if (state.runtimes[runtimeUri]) {
        res = state.runtimes[runtimeUri].usedBy;
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

  elementInfo = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (uri: string) => any => {
    return (uri: string) => {
      let res: any = null;
      switch (utils.getElementType(uri)) {
        case utils.ElementType.component:
          res = state.components[uri];
          break;
        case utils.ElementType.runtime:
          res = state.runtimes[uri];
          break;
        case utils.ElementType.service:
          res = state.services[uri];
          break;
        case utils.ElementType.deployment:
        case utils.ElementType.resource:
          console.warn('This case is under development');
          break;
        default:
          console.error('Unknown element type %s', uri);
      }
      return res;
    };
  }

};