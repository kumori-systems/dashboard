import {
  Certificate, Component, Deployment, Domain, Runtime, Service, Volume
} from './classes';
/**
 * Representation of the stamp state.
 */
export default class State {
  deployments: { [uri: string]: Deployment };
  services: { [uri: string]: Service };
  components: { [uri: string]: Component };
  runtimes: { [uri: string]: Runtime };
  volumes: { [uri: string]: Volume };
  certificates: { [uri: string]: Certificate };
  domains: { [uri: string]: Domain };

  constructor() {
    this.deployments = {};
    this.services = {};
    this.components = {};
    this.runtimes = {};
    this.volumes = {};
    this.certificates = {};
    this.domains = {};
  }
}