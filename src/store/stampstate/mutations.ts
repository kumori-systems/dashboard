import Vue from 'vue';
import Vuex from 'vuex';
import State from './state';

import {
  Certificate, Component, Deployment, Domain, PersistentVolume, Runtime,
  Service, VolatileVolume
} from './classes';
/**
 * Mutations to handle the representation of the stamp state easier.
 * 
 * IMPORTANT BEFORE EDITING. A little research has been done to check the
 * impact of a each function in the process time. Observed functions are;
 * Vue.set(), Destructurator ...{} and Array.push()
 * 
 * The result of the research showed than;
 * Destructurator is better than vue.set by 2 cases.
 * The mean of time of Destructurator is more or less 2ms less than
 * vue.set's mean.
 * 
 * The case of array.push() is not clear. Sometimes it semms to deppend on the
 * size of the array and sometimes it seems it's depending on the work of
 * the browser. But both arent always true.
 */
export default class Mutations implements Vuex.MutationTree<State> {
  [name: string]: Vuex.Mutation<State>;

  /**
   * Clear the local state.
   */
  clearState = (state: State): void => {
    state.certificates = {};
    state.components = {};
    state.deployments = {};
    state.domains = {};
    state.runtimes = {};
    state.services = {};
    state.persistentVolumes = {};
    state.volatileVolumes = {};
    state.volumeMetrics = {};
    state.selectedService = null;
    state.serviceMetrics = {};
  }


  /** Adds one or more deployments to the state */
  deploy = (state: State, payload: { [urn: string]: Deployment }): void => {

    for (let dep in payload) {

      let serv = payload[dep].service;

      // If the service is already in the state, it's marked as usedby
      if (state.services[serv]) {
        if (state.services[serv].usedBy.indexOf(dep) < 0)
          state.services[serv].usedBy.push(dep);
      }

      // Initialitze deployment metrics
      if (!state.serviceMetrics[dep])
        state.serviceMetrics[dep] = [];

    }

    state.deployments = { ...state.deployments, ...payload };
  }

  /** Removes one deployment from the state */
  undeploy = (state: State, deploymentURN: string): void => {

    if (state.deployments[deploymentURN]) {

      // Unlink all related deployments
      for (let chann in state.deployments[deploymentURN].channels) {
        for (let conn in state.deployments[deploymentURN].channels[chann]) {
          this.unlink(state, {
            deploymentOne: deploymentURN,
            channelOne: chann,
            deploymentTwo: state.deployments[deploymentURN]
              .channels[chann][conn].destinyDeploymentId,
            channelTwo: state.deployments[deploymentURN]
              .channels[chann][conn].destinyChannelId
          });
        }
      }

      // Remove this deployment from all domains
      for (let dom in state.domains) {
        if (state.domains[dom]) {
          let index = state.domains[dom].usedBy.indexOf(deploymentURN);
          if (index !== -1) {
            state.domains[dom].usedBy.splice(index, 1);
          }
        }
      }

      // Remove this deployment from all certificates
      for (let cert in state.certificates) {
        if (state.certificates[cert]) {
          let index = state.certificates[cert].usedBy.indexOf(deploymentURN);
          if (index !== -1) {
            state.certificates[cert].usedBy.splice(index, 1);
          }
        }
      }

      // Remove this deployment from the service
      let ser = state.deployments[deploymentURN].service;
      if (state.services[ser]) {
        let index = state.services[ser].usedBy.indexOf(deploymentURN);
        state.services[ser].usedBy.splice(index, 1);
      }

      // Remove deployment metrics
      Vue.delete(state.serviceMetrics, deploymentURN);

      // Remove this deployment from the state
      Vue.delete(state.deployments, deploymentURN);
    }

  }

  addInstance = (state: State,
    payload: {
      'deploymentId': string,
      'roleId': string,
      'instanceId': string,
      'instance': Deployment.Role.Instance
    }
  ): void => {

    (<Deployment>state.deployments[payload.deploymentId])
      .roles[payload.roleId].instances = {
        ...(<Deployment>state.deployments[payload.deploymentId])
          .roles[payload.roleId].instances,
        [payload.instanceId]: payload.instance
      };

  }

  /** Adds one or more services to the state */
  addService = (state: State,
    payload: { [urn: string]: Service }): void => {

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

  /**
   * Removes one service from the state. The stamp will only allow this
   * operation when there are no deployments from this service
   */
  removeService = (state: State, serviceURN: string): void => {

    // Remove this service from the state
    Vue.delete(state.services, serviceURN);

  }

  /** Adds one or more components to the state */
  addComponent = (state: State,
    payload: { [urn: string]: Component }): void => {

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
  removeComponent = (state: State, componentURN: string): void => {

    // When a component is erased from the state, all deployments using it
    // are previously undeployed

    // Remove component from the state
    Vue.delete(state.components, componentURN);

  }

  /** Adds one or more runtimes to the state */
  addRuntime = (state: State, payload: { [urn: string]: Runtime }): void => {

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
  removeRuntime = (state: State, runtimeURN: string): void => {
    //  All components which are using this runtime must be removed before this
    //  runtime can be removed

    // Remove runtime from the state
    Vue.delete(state.runtimes, runtimeURN);
  }

  /** Adds one or more domains to the state */
  addDomain = (state: State, payload: { [urn: string]: Domain }): void => {
    console.debug('Entra en la mutación addDomain');
    state.domains = { ...state.domains, ...payload };
    console.debug('Sale de la mutación addDomain');
  }

  /** Removes one domain from the state */
  removeDomain = (state: State, domainURN: string): void => {
    Vue.delete(state.domains, domainURN);
  }

  /** Adds one or more volumes to the state */
  addPersistentVolume = (state: State, payload: {
    [urn: string]: PersistentVolume
  }): void => {
    state.persistentVolumes = { ...state.persistentVolumes, ...payload };
  }

  /** Removes one volume from the state */
  removePersistentVolume = (state: State, volumeURN: string): void => {
    Vue.delete(state.persistentVolumes, volumeURN);
  }

  /** Adds one or more volumes to the state */
  addVolatileVolume = (state: State, payload: {
    [urn: string]: VolatileVolume
  }): void => {
    state.volatileVolumes = { ...state.volatileVolumes, ...payload };
  }

  /** Removes one volume from the state */
  removeVolatileVolume = (state: State, volumeURN: string): void => {
    Vue.delete(state.volatileVolumes, volumeURN);
  }

  /** Adds one or more certificates to the state */
  addCertificate = (state: State,
    payload: { [urn: string]: Certificate }): void => {
    state.certificates = { ...state.certificates, ...payload };
  }

  /** Removes one certificate from the state */
  removeCertificate = (state: State, certificateURN: string): void => {
    Vue.delete(state.certificates, certificateURN);
  }

  /** Adds one or more service metrics to the state */
  addServiceMetrics = (state: State, metricBundle: {
    [deploymentId: string]: {
      'data': { [property: string]: string | number },
      'roles': {
        [rolId: string]:
        {
          'data': { [property: string]: number | string },
          'instances': {
            [instanceId: string]: { [property: string]: number | string }
          }
        }
      }
    }
  }) => {

    const METRICS_BUFFER_SIZE: number = 100;

    for (let deploymentId in metricBundle) { // This will only happen once
      if (state.serviceMetrics[deploymentId]) {

        let metrics = state.serviceMetrics[deploymentId]
          .concat([metricBundle[deploymentId]]);

        while (metrics.length > METRICS_BUFFER_SIZE) { metrics.shift(); }

        // Optimized way of adding metrics to the storage
        state.serviceMetrics = {
          ...state.serviceMetrics,
          [deploymentId]: metrics
        };

      }
    }
  }

  /** Adds one or more volume metrics to the state */
  addVolumeMetrics = (state: State, metricBundle: {
    [itemId: string]: {
      'timestamp': string,
      'free': number,
      'total': number,
      'usage': number,
      'used': number
    }
  }) => {

    const METRICS_BUFFER_SIZE: number = 100;

    for (let volumeInstaceId in metricBundle) { // This will only happen once
      let metrics =
        (state.volumeMetrics[volumeInstaceId] ?
          state.volumeMetrics[volumeInstaceId] : [])
          .concat([metricBundle[volumeInstaceId]]);

      while (metrics.length > METRICS_BUFFER_SIZE) { metrics.shift(); }

      // Optimized way of adding metrics to the storage
      state.volumeMetrics = {
        ...state.volumeMetrics,
        [volumeInstaceId]: metrics
      };
    }
  }

  /** Links two services */
  link = (state: State,
    { deploymentOne, channelOne, deploymentTwo, channelTwo }): void => {

    let conn = {
      'destinyDeploymentId': deploymentTwo,
      'destinyChannelId': channelTwo
    };

    // if deployment and channel, both exists in the state
    if (state.deployments[deploymentOne]) {
      if (!state.deployments[deploymentOne].channels[channelOne]) {
        state.deployments[deploymentOne].channels[channelOne] = [];
      }
      if (state.deployments[deploymentOne].channels[channelOne].findIndex(
        (elem) => {
          return (elem.destinyChannelId === conn.destinyChannelId)
            && (elem.destinyDeploymentId === conn.destinyDeploymentId);
        })
        === -1) { // if connexion isn't already inserted
        state.deployments[deploymentOne].channels[channelOne].push(conn);
      }
    }

    conn = {
      'destinyDeploymentId': deploymentOne,
      'destinyChannelId': channelOne
    };

    if (state.deployments[deploymentTwo]) {
      if (!state.deployments[deploymentTwo].channels[channelTwo]) {
        state.deployments[deploymentTwo].channels[channelTwo] = [];
      }
      if (state.deployments[deploymentTwo].channels[channelTwo].findIndex(
        (elem) => {
          return (elem.destinyChannelId === conn.destinyChannelId)
            && (elem.destinyDeploymentId === conn.destinyDeploymentId);
        })
        === -1) { // if connexion isn't already inserted
        state.deployments[deploymentTwo].channels[channelTwo].push(conn);
      }
    }
  }

  /** Unlinks two services */
  unlink = (state: State,
    { deploymentOne, channelOne, deploymentTwo, channelTwo }): void => {
    let index;
    // Locate connexion
    if (state.deployments[deploymentOne]
      && state.deployments[deploymentOne].channels[channelOne]) {
      index = state.deployments[deploymentOne].channels[channelOne].findIndex(
        (elem) => {
          return (elem.destinyChannelId === channelTwo)
            && (elem.destinyDeploymentId === deploymentTwo);
        });
      // Remove connexion
      if (index >= 0) {
        state.deployments[deploymentOne].channels[channelOne].splice(index, 1);
      }
    }

    // Locate connexion
    if (state.deployments[deploymentTwo]
      && state.deployments[deploymentTwo].channels[channelTwo]) {
      index = state.deployments[deploymentTwo].channels[channelTwo].findIndex(
        (elem) => {
          return (elem.destinyChannelId === channelOne)
            && (elem.destinyDeploymentId === deploymentOne);
        });
      // Remove connexion
      if (index >= 0) {
        state.deployments[deploymentTwo].channels[channelTwo].splice(index, 1);
      }
    }
  }

  /**
   * This retains the selected service in the elements view for deploying an
   * instance of it.
   */
  selectedService = (state: State, serviceURN: string): void => {
    state.selectedService = serviceURN;
  }
};