import {
  Certificate, Component, Connector, Deployment, Domain, LoadBalancerConnector,
  Manifest, PersistentVolume, ProvidedChannel, Runtime, Service, VolatileVolume
} from './classes';

/**
 * Representation of the stamp state.
 */
export default class State {

  /** Map of deployments. */
  deployments: { [urn: string]: Deployment };

  /** Map of services. */
  services: { [urn: string]: Service };

  /** Map of components. */
  components: { [urn: string]: Component };

  /** Map of runtimes. */
  runtimes: { [urn: string]: Runtime };

  /** Map of persistent volumes. */
  persistentVolumes: { [urn: string]: PersistentVolume };

  /** Map of volatile volumes. */
  volatileVolumes: { [urn: string]: VolatileVolume };

  /** Map of certificates. */
  certificates: { [urn: string]: Certificate };

  /** Map of domains. */
  domains: { [urn: string]: Domain };

  manifests: { [urn: string]: Manifest };

  /** Map of service metrics. */
  serviceMetrics: {
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
  };

  /** Map of volume metrics. */
  volumeMetrics: {
    [volumeInstanceId: string]: {
      [property: string]: number | string
    }[]
  };

  /** Selected service in elements view to deploy */
  selectedService: string;

  /** Constructor of the state. */
  constructor() {
    this.deployments = {};
    this.services = {};
    this.components = {};
    this.manifests = {};
    this.runtimes = {};
    this.persistentVolumes = {};
    this.volatileVolumes = {};
    this.certificates = {};
    this.domains = {};
    this.serviceMetrics = {};
    this.volumeMetrics = {};
    this.selectedService = null;
  }
}