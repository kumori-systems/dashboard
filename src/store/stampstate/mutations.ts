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

    for (let dep in payload) {
      let serv = payload[dep].service;

      // If the service is already in the state, it's marked as usedby
      if (state.services[serv]) {
        state.services[serv].usedBy.push(dep);
      }

      // If deployment is using any resorce, it's marked as usedby
      for (let res in payload[dep].resourcesConfig) {
        if (payload[dep].resourcesConfig[res] instanceof Domain) {
          console.debug('MUTATIONS: Domain resource found');
        }
      }
    }

    state.deployments = { ...state.deployments, ...payload };
  }

  /** Removes one deployment from the state */
  removeDeployment = (state: State, deploymentURI: string): void => {
    // remove this deployment from all domains
    for (let dom in state.domains) {
      if (state.domains[dom]) {
        let index = state.domains[dom].usedBy.indexOf(deploymentURI);
        if (index !== -1) {
          state.domains[dom].usedBy.splice(index, 1);
        }
      }
    }

    // remove this deployment from the service
    let ser = state.deployments[deploymentURI].service;
    if (state.services[ser]) {
      let index = state.services[ser].usedBy.indexOf(deploymentURI);
      state.services[ser].usedBy.splice(index, 1);
    }

    /// remove this deployment from the state
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

    // for each service we add
    for (let ser in payload) {
      if (payload[ser]) {
        // if any deployment is using this service, advice it
        for (let dep in state.deployments) {
          if (
            state.deployments[dep].service === ser
            && payload[ser].usedBy.indexOf(dep) < 0
          ) {
            payload[ser].usedBy.push(dep);
          }
        }

        // If this service is using any component, advice it
        for (let role in payload[ser].roles) {
          // if component is already in the state
          if (state.components[payload[ser].roles[role].component]) {
            state.components[payload[ser].roles[role].component].usedBy.concat(
              payload[ser].usedBy
            );
          }
        }

      }
    }


    // add services to the state
    state.services = { ...state.services, ...payload };
  }

  /** Removes one service from the state */
  removeService = (state: State, serviceURI: string): void => {
    // This service wont be removed if any deployment is using it

    // Remove this service from the state
    Vue.delete(state.services, serviceURI);
  }

  /** Adds one or more components to the state */
  addComponent = (state: State,
    payload: { [uri: string]: Component }): void => {

    // for each component we add
    for (let comp in payload) {

      // if any deployment is using this component, advice it
      for (let serv in state.services) {
        if (state.services[serv]) {
          for (let role in state.services[serv].roles) {
            if (state.services[serv].roles[role].component === comp) {
              for (let dep in state.services[serv].usedBy) {
                if (payload[comp].usedBy
                  .indexOf(state.services[serv].usedBy[dep]) < 0) {
                  payload[comp].usedBy.push(state.services[serv].usedBy[dep]);
                }
              }
            }
          }
        }
      }
    }

    state.components = { ...state.components, ...payload };
  }

  /** Removes one component from the state */
  removeComponent = (state: State, componentURI: string): void => {
    // When a component is erased from the state, all deployments using it
    // are previously undeployed

    // Remove component from the state
    Vue.delete(state.components, componentURI);
  }

  /** Adds one or more runtimes to the state */
  addRuntime = (state: State, payload: { [uri: string]: Runtime }): void => {
    // Check for all components using this runtime
    for (let runt in payload) {

      // If any component is using this runtime, advice it
      for (let comp in state.components) {
        if (state.components[comp] && state.components[comp].runtime === runt) {
          for (let dep in state.components[comp].usedBy) {
            if (payload[runt].usedBy
              .indexOf(state.components[comp].usedBy[dep]) < 0) {
              payload[runt].usedBy.push(state.components[comp].usedBy[dep]);
            }
          }
        }
      }
    }

    // Add runtimes to the state
    state.runtimes = { ...state.runtimes, ...payload };
  }

  /** Removes one runtime from the state */
  removeRuntime = (state: State, runtimeURI: string): void => {
    //  All components which are using this runtime must be removed before this
    //  runtime can be removed

    // Remove runtime from the state
    Vue.delete(state.runtimes, runtimeURI);
  }

  /** Adds one or more domains to the state */
  addDomain = (state: State, payload: { [uri: string]: Domain }): void => {
    state.domains = { ...state.domains, ...payload };
  }

  /** Removes one domain from the state */
  removeDomain = (state: State, domainURI: string): void => {
    Vue.delete(state.domains, domainURI);
  }

  /** Adds one or more volumes to the state */
  addVolume = (state: State, payload: { [uri: string]: Volume }): void => {
    state.volumes = { ...state.volumes, ...payload };
  }

  /** Removes one volume from the state */
  removeVolume = (state: State, volumeURI: string): void => {
    Vue.delete(state.volumes, volumeURI);
  }

  /** Adds one or more certificates to the state */
  addCertificate = (state: State,
    payload: { [uri: string]: Certificate }): void => {
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
      if (state.deployments[deploymentId]) {
        state.deployments[deploymentId].metrics.push([
          metricBundle[deploymentId].data.timestamp,
          metricBundle[deploymentId]
        ]);


        // If we receive metrics from an instance, it means the instance is
        // connected
        for (let role in metricBundle[deploymentId].roles) {
          for (let inst in metricBundle[deploymentId].roles[role].instances) {
            state.deployments[deploymentId].roles[role].instances[inst].state =
              Deployment.Role.Instance.STATE.CONNECTED;
          }
        }

      }
    }
  }
};