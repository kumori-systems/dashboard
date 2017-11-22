import Vue from 'vue';
import Vuex from 'vuex';
import State from './state';

import {
  Certificate, Component, Deployment, Domain, Metric, Runtime, Service, Volume
} from './classes';
/**
 * Mutations to handle the representation of the stamp state easier.
 */
export default class Mutations implements Vuex.MutationTree<State> {
  [name: string]: Vuex.Mutation<State>;

  /** Adds one or more deployments to the state */
  addDeployment = (state: State,
    payload: { [uri: string]: Deployment }): void => {
    state.deployments = { ...state.deployments, ...payload };
  }

  /** Removes one deployment from the state */
  removeDeployment = (state: State, deploymentURI: string): void => {
    Vue.delete(state.deployments, deploymentURI);
  }

  addInstance = (state: State,
    payload: {
      'deploymentId': string,
      'roleId': string,
      'instanceId': string,
      'instance': Deployment.Role.Instance
    }
  ): void => {
    Vue.set((<Deployment>state.deployments[payload.deploymentId])
      .roles[payload.roleId].instances, payload.instanceId, payload.instance);
  }


  /** Adds one or more services to the state */
  addService = (state: State,
    payload: { [uri: string]: Service }): void => {
    state.services = { ...state.services, ...payload };
  }

  /** Removes one service from the state */
  removeService = (state: State, serviceURI: string): void => {
    Vue.delete(state.services, serviceURI);
  }

  /** Adds one or more components to the state */
  addComponent = (state: State,
    payload: { [uri: string]: Component }): void => {
    state.components = { ...state.components, ...payload };
  }

  /** Removes one component from the state */
  removeComponent = (state: State, componentURI: string): void => {
    Vue.delete(state.components, componentURI);
  }

  /** Adds one or more runtimes to the state */
  addRuntime = (state: State, payload: { [uri: string]: Runtime }): void => {
    state.runtimes = { ...state.runtimes, ...payload };
  }

  /** Removes one runtime from the state */
  removeRuntime = (state: State, runtimeURI: string): void => {
    Vue.delete(state.runtimes, runtimeURI);
  }

  /** Adds one or more domains to the state */
  addDomain = (state: State, payload: { [uri: string]: Domain }): void => {
    for (let domainResource in payload) {
      for (let deploymentId in state.deployments) {
        if (state.deployments[deploymentId].resourcesConfig[domainResource]
          !== undefined)
          payload[domainResource].usedBy.push(deploymentId);
      }
    }
    state.domains = { ...state.domains, ...payload };
  }

  /** Removes one domain from the state */
  removeDomain = (state: State, domainURI: string): void => {
    Vue.delete(state.domains, domainURI);
  }

  /** Adds one or more volumes to the state */
  addVolume = (state: State, payload: { [uri: string]: Volume }): void => {
    for (let domainResource in payload) {
      for (let deploymentId in state.deployments) {
        if (state.deployments[deploymentId].resourcesConfig[domainResource]
          !== undefined)
          payload[domainResource].usedBy.push(deploymentId);
      }
    }
    state.volumes = { ...state.volumes, ...payload };
  }

  /** Removes one volume from the state */
  removeVolume = (state: State, volumeURI: string): void => {
    Vue.delete(state.volumes, volumeURI);
  }

  /** Adds one or more certificates to the state */
  addCertificate = (state: State,
    payload: { [uri: string]: Certificate }): void => {
    for (let domainResource in payload) {
      for (let deploymentId in state.deployments) {
        if (state.deployments[deploymentId].resourcesConfig[domainResource]
          !== undefined)
          payload[domainResource].usedBy.push(deploymentId);
      }
    }
    state.certificates = { ...state.certificates, ...payload };
  }

  /** Removes one certificate from the state */
  removeCertificate = (state: State, certificateURI: string): void => {
    Vue.delete(state.certificates, certificateURI);
  }

  /** Adds one or more certificates to the state */
  addMetrics = (state: State, metricBundle: {
    [deploymentId: string]:
    {
      'data': Metric, 'roles': {
        [rolId: string]:
        { 'data': Metric, 'instances': { [instanceId: string]: Metric } }
      }
    }
  }) => {
    for (let deploymentId in metricBundle) { // This will only happen once
      state.deployments[deploymentId].metrics
        .push([metricBundle[deploymentId].data.timestamp,
        metricBundle[deploymentId]
        ]);
    }
  }


};