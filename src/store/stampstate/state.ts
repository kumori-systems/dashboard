import {
  Certificate, Component, Deployment, Domain, Runtime, Service, Volume
} from './classes';

/**
 * Representation of the stamp state.
 */
export default class State {

  /** Map of deployments. */
  deployments: { [uri: string]: Deployment } = {};

  /** Map of services. */
  services: { [uri: string]: Service } = {};

  /** Map of components. */
  components: { [uri: string]: Component } = {};

  /** Map of runtimes. */
  runtimes: { [uri: string]: Runtime } = {};

  /** Map of volumes. */
  volumes: { [uri: string]: Volume } = {};

  /** Map of certificates. */
  certificates: { [uri: string]: Certificate } = {};

  /** Map of domains. */
  domains: { [uri: string]: Domain } = {};

  /** Map of metrics. */
  metrics: {
    [deploymentId: string]: {
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
  } = {};

  /** Constructor of the state. */
  constructor() { }
}