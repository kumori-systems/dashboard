import Vuex from 'vuex';
import State from './state';

import PriorityQueue from 'priorityqueue';

import { utils } from '../../api';
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

  certificates = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.certificates;

  }

  components = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.components;

  }

  deployments = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.deployments;

  }

  domains = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.domains;

  }

  orderDeploymentsByName = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

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

  persistentVolumes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.persistentVolumes;

  }

  runtimes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.runtimes;

  }

  selectedService = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.selectedService;

  }

  serviceMetrics = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.serviceMetrics;

  }

  services = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.services;

  }

  volatileVolumes = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.volatileVolumes;

  }

  volumeMetrics = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any) => {

    return state.volumeMetrics;

  }

};