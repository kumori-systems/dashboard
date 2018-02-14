import {
  Certificate, Component, Connector, Deployment, Domain, LoadBalancerConnector,
  ProvidedChannel, Runtime, Service, Volume
} from './classes';

/**
 * Representation of the stamp state.
 */
export default class State {

  /** Map of deployments. */
  deployments: { [uri: string]: Deployment };

  /** Map of services. */
  services: { [uri: string]: Service };

  /** Map of components. */
  components: { [uri: string]: Component };

  /** Map of runtimes. */
  runtimes: { [uri: string]: Runtime };

  /** Map of volumes. */
  volumes: { [uri: string]: Volume };

  /** Map of certificates. */
  certificates: { [uri: string]: Certificate };

  /** Map of domains. */
  domains: { [uri: string]: Domain };

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
              [property: string]: number | string | object
            }

          }
        }
      }
    }[]
  };

  /** Selected service in elements view to deploy */
  selectedService: string;

  /** Constructor of the state. */
  constructor() {
    this.deployments = {
      'slap://eslap.cloud/deployments/dashboard/1_1_1':
        new Deployment(
          'slap://eslap.cloud/deployments/dashboard/1_1_1',
          'MyDeployment',
          {},
          'slap://eslap.cloud/services/dashboard/1_1_1',
          {
            'fe':
              new Deployment.Role(
                'fe', 'slap://eslap.cloud/components/dashboard/1_1_1', {}, 1, 1,
                1, false, 1, 1,
                {
                  'instanceOne':
                    new Deployment.Role.Instance(
                      'instanceOne', Deployment.Role.Instance.STATE.CONNECTED,
                      1, 1, 1,
                      {
                        'myVolume': new Volume.Instance(
                          'myVolume',
                          'slap://omunoz/resource/myvolume/persistent'
                        )
                      }
                    )
                },
                1, 1
              )
          },
          {
            'slap://omunoz/resource/myvolume/persistent':
              new Volume(
                'slap://omunoz/resource/myvolume/persistent',
                Volume.FILESYSTEM.Ext4, 16, null
              )
          },
          {}
        )
    };
    this.services = {
      'slap://eslap.cloud/services/dashboard/1_1_1':
        new Service('eslap://eslap.cloud/services/dashboard/1_1_1',
          {
            persistentvolume:
              'slap://eslap.cloud/resource/volume/persistent/1_0_0'
          },
          {},
          {
            'fe': {
              component: 'slap://eslap.cloud/components/dashboard/0_0_1',
              parameters: {},
              resources: {}
            }
          },
          {
            'service':
              new ProvidedChannel('service', ProvidedChannel.TYPE.REPLY, null)
          }
          ,
          {},
          [
            new LoadBalancerConnector(
              [new Connector.Direction('service', null)],
              [new Connector.Direction('entrypoint', 'fe')]
            )
          ]
        )
    };
    this.components = {};
    this.runtimes = {};
    this.volumes = {
      'slap://omunoz/resource/myvolume/persistent': new Volume(
        'slap://omunoz/resource/myvolume/persistent', Volume.FILESYSTEM.Ext4,
        16, null
      )
    };
    this.certificates = {};
    this.domains = {};
    this.metrics = {
      'slap://eslap.cloud/deployments/dashboard/1_1_1': [
        {
          'data': {
            'a': 5
          },
          'roles': {
            'fe': {
              'data': {
                'a': 5
              },
              'instances': {
                'instanceOne': {
                  'a': 5,
                  'volumes': {
                    'myVolume': {
                      total: 10,
                      used: 8,
                      free: 2,
                      usage: 80
                    }
                  }
                }
              }
            }
          }
        }, {
          'data': {
            'a': 5
          },
          'roles': {
            'fe': {
              'data': {
                'a': 5
              },
              'instances': {
                'instanceOne': {
                  'a': 5,
                  'volumes': {
                    'myVolume': {
                      total: 10,
                      used: 8,
                      free: 2,
                      usage: 80
                    }
                  }
                }
              }
            }
          }
        }
      ]
    };
    this.selectedService = null;
  }
}