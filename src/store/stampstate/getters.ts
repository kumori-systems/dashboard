import Vuex from 'vuex';
import State from './state';

import PriorityQueue from 'priorityqueue';

import * as utils from '../../api/utils';
import {
  Certificate, Channel, Component, DependedChannel, Deployment, Domain,
  ECloudElement, EntryPoint, HTTPEntryPoint, PersistentVolume, ProvidedChannel,
  Resource, Runtime, Service, VolatileVolume
} from './classes';

/**
 * Getters to handle the representation of the stamp state easier.
 */
export default class Getters implements Vuex.GetterTree<State, any> {
  [name: string]: Vuex.Getter<State, any>;

  deployments = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: Deployment } => {
    return state.deployments;
  }

  /**
   * Gets the deployment urns ordered by their names.
   * @returns <string[]> array of the urns ordered by deployment name
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
        '_urn': state.deployments[dep]._urn
      });
    }
    let res: string[] = [];
    while (pq.size() > 0) {
      res.push(pq.pop()['_urn']);
    }
    return res;

  }


  deployment = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (deploymentURN: string) => Deployment => {

    return (deploymentURN: string) => {
      return state.deployments[deploymentURN];
    };

  }

  serviceMetrics = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): {
      [deploymentURN: string]: {
        'data': {
          [property: string]: number | string
        },
        'roles': {
          [rolId: string]: {
            'data': {
              [property: string]: number | string
            },
            'instances': {
              [instanceId: string]: {
                [property: string]: number | string
              }

            }
          }
        }
      }[]
    } => {

    return state.serviceMetrics;

  }

  /** Returns metrics related to volumes. */
  volumeMetrics = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): {
      [volumeInstanceId: string]: {
        [property: string]: number | string
      }[]
    } => {

    return state.volumeMetrics;

  }

  deploymentFromPath = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (deploymentPath: string) => Deployment => {

    return (deploymentPath: string) => {
      let res: string = null;
      for (let urn in state.deployments) {
        if (state.deployments[urn]._path === deploymentPath) {
          res = urn;
        }
      }
      return (getters.deployment as Function)(res);
    };

  }

  numDeployments = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): number => {

    let res: number = 0;
    for (let urn in state.deployments)
      res++;
    return res;

  }


  components = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: Component } => {

    return state.components;

  }

  component = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURN: string) => Component => {

    return (componentURN: string) => {
      return state.components[componentURN];
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
      for (let urn in state.components) {
        if (searchFilter === null || urn.indexOf(searchFilter) !== -1) {
          let componentDomain = utils.getElementDomain(urn);
          let componentName = utils.getElementName(urn);
          let componentVersion = utils.getElementVersion(urn);

          if (!res[componentDomain])
            res[componentDomain] = {};
          if (!res[componentDomain][componentName])
            res[componentDomain][componentName] = {};

          res[componentDomain][componentName][componentVersion] = urn;
        }
      }

      return res;
    };

  }

  componentUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURN: string) => string[] => {

    return (componentURN: string) => {
      let res: string[] = [];
      if (state.components[componentURN]) {
        res = state.components[componentURN].usedBy;
      }
      return res;
    };

  }

  services = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: Service } => {

    return state.services;

  }

  service = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURN: string) => Service => {

    return (serviceURN: string) => {
      return state.services[serviceURN];
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
      for (let urn in state.services) {
        if (searchFilter === null || urn.indexOf(searchFilter) !== -1) {
          let serviceDomain = utils.getElementDomain(urn);
          let serviceName = utils.getElementName(urn);
          let serviceVersion = utils.getElementVersion(urn);

          if (!res[serviceDomain])
            res[serviceDomain] = {};
          if (!res[serviceDomain][serviceName])
            res[serviceDomain][serviceName] = {};

          res[serviceDomain][serviceName][serviceVersion] = urn;
        }
      }
      return res;
    };

  }

  serviceUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (serviceURN: string) => string[] => {

    return (serviceURN: string) => {
      let res: string[] = [];
      if (state.services[serviceURN]) {
        res = state.services[serviceURN].usedBy;
      }
      return res;
    };

  }

  certificatesByOwner = (state?: State, getters?: Getters, rootState?: any,
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
      for (let urn in state.certificates) {
        if (searchFilter === null || urn.indexOf(searchFilter) !== -1) {
          let certificateDomain = utils.getElementDomain(urn);
          let certificateName = utils.getElementName(urn);
          let certificateVersion = utils.getElementVersion(urn);

          if (!res[certificateDomain])
            res[certificateDomain] = {};
          if (!res[certificateDomain][certificateName])
            res[certificateDomain][certificateName] = {};

          res[certificateDomain][certificateName][certificateVersion] = urn;
        }
      }
      return res;
    };

  }

  certificateUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (certificateURN: string) => string[] => {

    return (certificateURN: string) => {
      let res: string[] = [];
      if (state.certificates[certificateURN]) {
        res = state.certificates[certificateURN].usedBy;
      }
      return res;
    };

  }



  getServiceProvidedChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (serviceURN: string) =>
      ProvidedChannel[] => {

    return (serviceURN: string) => {
      let res = [];
      if ((<Service>state.services[serviceURN])) { // if service exists
        for (let providedChannel in
          (<Service>state.services[serviceURN]).providedChannels) {
          res.push(providedChannel);
        }
      }
      return res;
    };

  }

  getServiceDependedChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (serviceURN: string) =>
      DependedChannel[] => {

    return (serviceURN: string) => {
      let res = [];
      if ((<Service>state.services[serviceURN])) { // if service exists
        for (let dependedChannel in
          (<Service>state.services[serviceURN]).dependedChannels) {
          res.push(dependedChannel);
        }
      }
      return res;
    };

  }

  getTotalProvidedDeploymentChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (serviceURN: string,
      channelId: string) => { 'value': string, 'text': string }[] => {

    return (serviceId: string, channelId: string) => {

      let type: string = (<Service>state.services[serviceId])
        .dependedChannels[channelId].type;
      let typeSearched: Channel.CHANNEL_TYPE[] = [];
      switch (type) {
        case Channel.CHANNEL_TYPE.ENDPOINT_REQUEST:
        case Channel.CHANNEL_TYPE.REQUEST:
          typeSearched = [
            Channel.CHANNEL_TYPE.REPLY, Channel.CHANNEL_TYPE.ENDPOINT_REPLY
          ];
          break;
        case Channel.CHANNEL_TYPE.ENDPOINT_REPLY:
        case Channel.CHANNEL_TYPE.REPLY:
          typeSearched = [
            Channel.CHANNEL_TYPE.REQUEST, Channel.CHANNEL_TYPE.ENDPOINT_REQUEST
          ];
          break;
        default:
          throw new Error(
            'Not expected channel type \'' + type + '\' on  \'' + serviceId
            + ':' + channelId + '\''
          );
      }

      let res: { 'value': string, 'text': string }[] = [];

      for (let deploymentId in state.deployments) {
        if (!(state.deployments[deploymentId] instanceof EntryPoint)) {
          let serviceId: string = state.deployments[deploymentId].service;
          if (state.services[serviceId]) { // if service exists
            for (let providedChannelId in
              state.services[serviceId].providedChannels) {

              if (typeSearched.indexOf(state.services[serviceId]
                .providedChannels[providedChannelId].type) !== -1) {

                let elem: {
                  'value': string,
                  'text': string
                } = {
                    'value': JSON.stringify({
                      'deployment': deploymentId,
                      'channel': providedChannelId
                    }),
                    'text': (getters.deployment as any)(deploymentId).name
                      + ' ~ ' + providedChannelId
                  };

                if (res.indexOf(elem) === -1)
                  res.push(elem);
              }
            }
          }
        }
      }
      return res;
    };

  }

  getTotalDependedDeploymentChannels = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): (deploymentURN: string,
      serviceURN: string, channelId: string) => {
        'value': string, 'text': string
      }[] => {

    return (myDeploymentId: string, serviceId: string, channelId: string) => {
      // Depending on the channel type, the search will be different
      let type: string = (<Service>state.services[serviceId])
        .providedChannels[channelId].type;
      let typeSearched: Channel.CHANNEL_TYPE[] = [];
      switch (type) {
        case Channel.CHANNEL_TYPE.ENDPOINT_REQUEST:
        case Channel.CHANNEL_TYPE.REQUEST:
          typeSearched = [
            Channel.CHANNEL_TYPE.REPLY, Channel.CHANNEL_TYPE.ENDPOINT_REPLY
          ];
          break;
        case Channel.CHANNEL_TYPE.ENDPOINT_REPLY:
        case Channel.CHANNEL_TYPE.REPLY:
          typeSearched = [
            Channel.CHANNEL_TYPE.REQUEST, Channel.CHANNEL_TYPE.ENDPOINT_REQUEST
          ];
          break;

        default:
          console.error('Not expected channel type \'%s\' on  \'%s:%s\'', type,
            serviceId, channelId);
      }

      let res: { 'value': string, 'text': string }[] = [];

      for (let deploymentId in state.deployments) {
        if (
          state.deployments[deploymentId] instanceof HTTPEntryPoint
          && state.deployments[deploymentId].channels['frontend']
          && state.deployments[deploymentId].channels['frontend'].length > 0
          && state.deployments[deploymentId].channels['frontend'][0]
            .destinyDeploymentId !== myDeploymentId
        ) {
          // If it's an entrypoint in use, and I'm not using it,
          // it's not in the list of possibles
        } else {

          let serviceId: string = state.deployments[deploymentId].service;
          if (state.services[serviceId]) { // if service exists
            for (let requiredChannelId in
              state.services[serviceId].dependedChannels) {


              if (typeSearched.indexOf(state.services[serviceId]
                .dependedChannels[requiredChannelId].type) !== -1) {

                let elem: {
                  'value': string,
                  'text': string
                } = {
                    'value': JSON.stringify({
                      'deployment': deploymentId,
                      'channel': requiredChannelId
                    }),
                    'text': (getters.deployment as any)(deploymentId).name
                      + ' ~ ' + requiredChannelId
                  };

                if (res.indexOf(elem) === -1) {
                  res.push(elem);
                }

              }
            }
          }
        }
      }
      return res;
    };

  }

  runtimes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: Runtime } => {

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
      for (let urn in state.runtimes) {
        if (searchFilter === null || urn.indexOf(searchFilter) !== -1) {

          let runtimeDomain = utils.getElementDomain(urn);
          let runtimeName = utils.getElementName(urn);
          let runtimeVersion = utils.getElementVersion(urn);

          if (!res[runtimeDomain])
            res[runtimeDomain] = {};
          if (!res[runtimeDomain][runtimeName])
            res[runtimeDomain][runtimeName] = {};

          res[runtimeDomain][runtimeName][runtimeVersion] = urn;
        }
      }
      return res;
    };

  }

  runtimeUsedBy = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (componentURN: string) => string[] => {

    return (runtimeURN: string) => {
      let res: string[] = [];
      if (state.runtimes[runtimeURN]) {
        res = state.runtimes[runtimeURN].usedBy;
      }
      return res;
    };

  }

  persistentVolumes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: PersistentVolume } => {

    return state.persistentVolumes;

  }

  volatileVolumes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: VolatileVolume } => {

    return state.volatileVolumes;

  }

  domains = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: Domain } => {

    return state.domains;

  }

  certificates = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): { [urn: string]: Certificate } => {

    return state.certificates;

  }

  elementInfo = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): (urn: string) => any => {

    return (urn: string) => {
      let res: any = null;
      switch (utils.getElementType(urn)) {
        case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
          res = state.components[urn];
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
          res = state.runtimes[urn];
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
          res = state.services[urn];
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE:
          switch (utils.getResourceType(urn)) {
            case Resource.RESOURCE_TYPE.CERTIFICATE:
              res = state.certificates[urn];
              break;
            default:
            // Not expected call for this kind of resource
          }
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.DEPLOYMENT:
          // Not expected call for this kind of resource
          break;
        default:
          throw new Error('Unknown element type \'' + urn + '\'');
      }
      return res;
    };

  }

  selectedService = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): string => {

    return state.selectedService;

  }

};