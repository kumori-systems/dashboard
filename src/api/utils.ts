import {
  AdmissionEvent as EcloudEvent, Deployment as EcloudDeployment, EcloudEventType
} from 'admission-client';
import {
  Certificate, Channel, Component, Connector, DependedChannel, Deployment,
  Domain, FullConnector, HTTPEntryPoint, LoadBalancerConnector, ProvidedChannel,
  PublishSubscribeConnector, Resource, Runtime, Service, Volume
} from '../store/stampstate/classes';

export function transformEcloudDeploymentToDeployment(
  ecloudDeployment: EcloudDeployment) {

  let roles: { [rolId: string]: Deployment.Role } = {};
  let instances: { [instanceId: string]: Deployment.Role.Instance };

  for (let rolId in ecloudDeployment.roles) {
    instances = {};
    for (let instanceId in ecloudDeployment.roles[rolId].instances) {
      instances[instanceId] = new Deployment.Role.Instance(
        instanceId,
        ecloudDeployment.roles[rolId].instances[instanceId].connected ?
          Deployment.Role.Instance.STATE.CONNECTED :
          ecloudDeployment.roles[rolId].instances[instanceId]
            .connected === false ?
            Deployment.Role.Instance.STATE.DISCONNECTED :
            Deployment.Role.Instance.STATE.UNKOWN,
        ecloudDeployment.roles[rolId].instances[instanceId].arrangement.cpu,
        ecloudDeployment.roles[rolId].instances[instanceId].arrangement.memory,
        ecloudDeployment.roles[rolId].instances[instanceId].arrangement
          .bandwith,
        ecloudDeployment.roles[rolId].instances[instanceId].volumes,
        ecloudDeployment.roles[rolId].instances[instanceId].ports
      );
    }

    roles[rolId] = new Deployment.Role(
      rolId, // name
      ecloudDeployment.roles[rolId].component, // component
      {
        ...ecloudDeployment.roles[rolId].configuration,
        ...ecloudDeployment.roles[rolId].entrypoint
      }, // configuration
      ecloudDeployment.roles[rolId].arrangement.cpu, // cpu
      ecloudDeployment.roles[rolId].arrangement.memory, // memory
      ecloudDeployment.roles[rolId].arrangement.ioperf, // ioperf
      ecloudDeployment.roles[rolId].arrangement.iopsintensive, // iopsintensive
      ecloudDeployment.roles[rolId].arrangement.bandwidth, // bandwith
      ecloudDeployment.roles[rolId].arrangement.resilience, // resilience
      instances, // instances
      ecloudDeployment.roles[rolId].arrangement.mininstances, // mininstances
      ecloudDeployment.roles[rolId].arrangement.maxinstances // maxinstances
    );
  }

  let resourcesConfig: { [resource: string]: any } = {};
  // ecloudDeployment.resources;
  for (let res in ecloudDeployment.resources) {
    if (ecloudDeployment.resources[res].resource.name) {
      resourcesConfig[ecloudDeployment.resources[res].resource.name] =
        ecloudDeployment.resources[res].resource;
    } else {
      console.warn('found resource not following structure: ', res);
    }
  }

  let parameters: any = {};
  let links: Array<Deployment.Link> = [];

  for (let firstChannel in ecloudDeployment.links) {
    for (let secondDeployment in ecloudDeployment.links[firstChannel])
      for (
        let secondChannel in
        ecloudDeployment.links[firstChannel][secondDeployment]
      )
        links.push(
          new Deployment.Link(firstChannel, secondDeployment, secondChannel));
  }

  let res: Deployment = null;

  if (isServiceEntrypoint(ecloudDeployment.service)) {
    res = new HTTPEntryPoint(
      ecloudDeployment.urn, // uri
      parameters,
      roles,
      resourcesConfig,
      links
    );
  } else {
    res = new Deployment(
      ecloudDeployment.urn, // uri
      (<any>ecloudDeployment).name, // name: string
      parameters, // parameters: any
      ecloudDeployment.service, // serviceId: string
      roles, // roles: { [rolName: string]: DeploymentRol }
      resourcesConfig, // resourcesConfig: { [resource: string]: any }
      links
    );
  }
  return res;
}
export function transformManifestToService(manifest: {
  spec: string,
  name: string,
  configuration: {
    resources: Array<{ name: string, type: string }>,
    parameters: Array<any>
  },
  roles: [{
    name: string,
    component: string,
    resources: {},
    parameters: {}
  }],
  channels: {
    requires: Array<any>,
    provides: [{
      name: string,
      type: string,
      protocol: string
    }]
  },
  connectors: [{
    type: string,
    depended: [{
      role: string,
      endpoint: string,
    }],
    provided: [{
      role: string,
      endpoint: string
    }]
  }]
}): Service {
  let resources: { [resourceId: string]: string } = {};
  for (let i = 0; i < manifest.configuration.resources.length; i++) {
    resources[manifest.configuration.resources[i].name] =
      manifest.configuration.resources[i].type;
  }

  let roles: { [rolId: string]: Service.Role } = {};
  for (let i = 0; i < manifest.roles.length; i++) {
    roles[manifest.roles[i].name] = new Service.Role(
      manifest.roles[i].component, // component
      manifest.roles[i].parameters, // parameters
      manifest.roles[i].resources // resources
    );

  }

  let proChannels: { [channelId: string]: ProvidedChannel } = {};
  for (let i = 0; i < manifest.channels.provides.length; i++) {
    let res: ProvidedChannel;
    switch (manifest.channels.provides[i].type) {
      case 'eslap://eslap.cloud/channel/request/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.TYPE.REQUEST, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/reply/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.TYPE.REPLY, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/send/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.TYPE.SEND, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/receive/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.TYPE.RECEIVE, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/duplex/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.TYPE.DUPLEX, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case ' eslap://eslap.cloud/endpoint/request/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.TYPE.ENDPOINT_REQUEST, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case ' eslap://eslap.cloud/endpoint/reply/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.TYPE.ENDPOINT_REPLY, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      default:
        console.error('Not expected channel type: %s',
          manifest.channels.provides[i].type);
    };
    proChannels[manifest.channels.provides[i].name] = res;
  }

  let depChannels: { [channelId: string]: DependedChannel } = {};
  for (let i = 0; i < manifest.channels.requires.length; i++) {
    let res: DependedChannel;

    switch (manifest.channels.requires[i].type) {
      case 'eslap://eslap.cloud/channel/request/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.TYPE.REQUEST, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/reply/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.TYPE.REPLY, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/send/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.TYPE.SEND, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/receive/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.TYPE.RECEIVE, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/duplex/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.TYPE.DUPLEX, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/endpoint/request/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.TYPE.ENDPOINT_REQUEST, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.TYPE.ENDPOINT_REPLY, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      default:
        console.error('Not expected channel type: %s',
          manifest.channels.requires[i].type);
    };
    depChannels[manifest.channels.requires[i].name] = res;
  }


  let connectors: Array<Connector> = [];
  for (let conn in manifest.connectors) {
    let res: Connector;
    switch (manifest.connectors[conn].type) {
      case 'eslap://eslap.cloud/connector/loadbalancer/1_0_0':
        res = new LoadBalancerConnector(
          manifest.connectors[conn].provided, // provided
          manifest.connectors[conn].depended // depended
        );
        break;
      case 'eslap://eslap.cloud/connector/pubsub/1_0_0':
        res = new PublishSubscribeConnector(
          manifest.connectors[conn].provided, // provided
          manifest.connectors[conn].depended // depended
        );
        break;
      case 'eslap://eslap.cloud/connector/complete/1_0_0':
        res = new PublishSubscribeConnector(
          manifest.connectors[conn].provided, // provided
          manifest.connectors[conn].depended // depended
        );
        break;
      default:
        console.error('Not expected connector type: %s',
          manifest.connectors[conn].type);
    }
    connectors.push(res);
  }

  return new Service(
    manifest.name, // uri:string
    resources, // resources: Array<string>,
    manifest.configuration.parameters, // parameters: Array<string>,
    roles, // roles: { [rolId: string]: Service.Rol },
    proChannels, // proChannels: { [channelId: string]: Service.Rol.Channel },
    depChannels, // reqChannels: { [channelId: string]: Service.Rol.Channel },
    connectors
  );
}
export function transformManifestToComponent(manifest: {
  code: string,
  profile: Object,
  configuration: {
    parameters: [{
      type: string,
      name: string
    }],
    resources: [{
      name: string,
      type: string
    }]
  },
  channels: {
    requires: [{
      protocol: string,
      type: string,
      name: string
    }],
    provides: [{
      protocol: string,
      type: string,
      name: string
    }]
  },
  runtime: string,
  name: string,
  spec: string,
  codelocator: string
}): Component {

  let resources: { [resourceName: string]: string } = {};
  if (manifest.configuration.resources)
    for (let i = 0; i < manifest.configuration.resources.length; i++) {
      resources[manifest.configuration.resources[i].name] =
        manifest.configuration.resources[i].type;
    }

  let proChannels: { [channelId: string]: Channel } = {};
  if (manifest.channels && manifest.channels.provides)
    for (let i = 0; i < manifest.channels.provides.length; i++) {
      let res: Channel;
      switch (manifest.channels.provides[i].type) {
        case 'eslap://eslap.cloud/channel/request/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.TYPE.REQUEST, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.TYPE.REPLY, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/send/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.TYPE.SEND, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/receive/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.TYPE.RECEIVE, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/duplex/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.TYPE.DUPLEX, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/request/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.TYPE.ENDPOINT_REQUEST, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.TYPE.ENDPOINT_REPLY, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        default:
          console.error('Not expected channel type: %s',
            manifest.channels.provides[i].type);
      };

      proChannels[manifest.channels.provides[i].name] = res;
    }

  let depChannels: { [channelId: string]: Channel } = {};
  if (manifest.channels && manifest.channels.requires)
    for (let i = 0; i < manifest.channels.requires.length; i++) {
      let res: DependedChannel;

      switch (manifest.channels.requires[i].type) {
        case 'eslap://eslap.cloud/channel/request/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.TYPE.REQUEST, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.TYPE.REPLY, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/send/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.TYPE.SEND, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/receive/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.TYPE.RECEIVE, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/duplex/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.TYPE.DUPLEX, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/request/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.TYPE.ENDPOINT_REQUEST, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.TYPE.ENDPOINT_REPLY, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        default:
          console.error('Not expected channel type: %s',
            manifest.channels.requires[i].type);
      };
      depChannels[manifest.channels.requires[i].name] = res;
    }

  return new Component(
    manifest.name, // uri: string
    manifest.runtime, // runtime: string
    resources, // resourcesConfig: { [resourceName: string]: string }
    manifest.configuration.parameters, // parameters: Object
    proChannels, // proChannels: { [channelId: string]: Service.Rol.Channel }
    depChannels // depChannels: { [channelId: string]: Service.Rol.Channel }
  );
}
export function transformManifestToResource(manifest: {
  spec: string, name: string, parameters: any
}): Resource {
  let res: Resource = null;
  switch (getResourceType(manifest.spec)) {
    case ResourceType.domain:
      res = new Domain(
        manifest.name,
        manifest.parameters.vhost,
        Domain.STATE.SUCCESS,
        []
      );
      break;
    case ResourceType.certificate:
      res = new Certificate(
        manifest.name,
        []
      );
      break;
    case ResourceType.volume:
      res = new Volume(
        manifest.name,
        []
      );
      break;
    default:
      console.error('Resource type not espected: ', manifest.spec);
  }
  return res;
}
export function transformManifestToRuntime(manifest: {
  spec: string,
  name: string,
  derived: {
    from: string
  },
  sourcedir: string,
  entrypoint: string,
  metadata: {
    description: string,
    os_name: string,
    os_version: string,
    os_release: string,
    software: {
      [key: string]: any
    }
  }
}): Runtime {
  return new Runtime(manifest.name);
}

export function transformEcloudEventDataToMetrics(ecloudEvent: EcloudEvent): {
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
  }
} {
  let res: {
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
    }
  } = {};
  // Inicializamos el deployment
  res[ecloudEvent.data.deploymentUrn] = { 'data': {}, 'roles': {} };

  // Obtenemos los datos de los deployment
  for (let property in ecloudEvent.data.data) {
    res[ecloudEvent.data.deploymentUrn].data[property] =
      ecloudEvent.data.data[property].mean;
  }
  res[ecloudEvent.data.deploymentUrn].data['timestamp'] = ecloudEvent.timestamp;

  // Inicializamos los roles
  for (let rolId in ecloudEvent.data.roles) {
    res[ecloudEvent.data.deploymentUrn].roles[rolId] = {
      'data': {}, 'instances': {}
    };

    // Obtenemos los datos de los roles
    for (let property in ecloudEvent.data.roles[rolId].data) {
      res[ecloudEvent.data.deploymentUrn].roles[rolId].data[property] =
        ecloudEvent.data.roles[rolId].data[property].mean;
    }
    res[ecloudEvent.data.deploymentUrn].roles[rolId].data['timestamp'] =
      ecloudEvent.timestamp;

    // Obtenemos los datos de las instáncias
    for (let instanceId in ecloudEvent.data.roles[rolId].instances) {
      res[ecloudEvent.data.deploymentUrn].roles[rolId]
        .instances[instanceId] = {};
      for (let property in ecloudEvent.data.roles[rolId]
        .instances[instanceId]) {
        res[ecloudEvent.data.deploymentUrn].roles[rolId]
          .instances[instanceId][property]
          = ecloudEvent.data.roles[rolId]
            .instances[instanceId][property].mean;
      }
      res[ecloudEvent.data.deploymentUrn].roles[rolId]
        .instances[instanceId]['timestamp'] = ecloudEvent.timestamp;
    }
  }

  return res;
}


export enum ElementType { deployment, service, runtime, component, resource }

export function getElementType(uri: string): ElementType {
  let res: ElementType = null;

  let splitted = uri.split('/');

  let i = 3;

  if (splitted[2] === 'temporary') { i = i + 2; }

  // Obtain the type. In case it's a temporary element, the type will be twice
  // realocated to the left
  switch (splitted[i]) {
    case 'runtime':
      console.warn('deprecated element type \'runtime\': %s', uri);
    case 'runtimes':
      res = ElementType.runtime;
      break;
    case 'services':
      res = ElementType.service;
      break;
    case 'components':
      res = ElementType.component;
      break;
    case 'resources':
      res = ElementType.resource;
      break;
    default:
      console.error('Unknown element type', uri);
  }
  return res;
}
export enum ResourceType { volume, certificate, domain }

export function getResourceType(uri: string): ResourceType {
  let res: ResourceType;
  let splitted = uri.split('/');
  let i = 4;
  if (splitted[2] === 'temporary') { i = i + 2; }

  // Obtain the type. In case it's a temporary element, the type will be twice
  // realocated to the left
  switch (splitted[i]) {
    case 'volume':
      console.warn('deprecated resource type \'volume\': %s', uri);
    case 'volumes':
      res = ResourceType.volume;
      break;
    case 'cert':
      res = ResourceType.certificate;
      break;
    case 'vhost':
      res = ResourceType.domain;
      break;
    default:
      console.error('Resource type not covered', uri);
  }
  return res;
}

export function getElementAtributes(uri: string): [string, string, string] {
  let splitted: string[] = uri.split('/');
  let domain = splitted[2];
  let name = splitted[4];
  for (let i = 5; i < splitted.length - 1; i++) {
    name += '.' + splitted[i];
  }
  let version = splitted[splitted.length - 1];

  return [domain, name, version];
}

export function getElementDomain(uri: string): string {
  return uri.split('/')[2];
}

export function getElementName(uri: string): string {
  let splitted: Array<string> = uri.split('/');
  let name = splitted[4];
  for (let i = 5; i < splitted.length - 1; i++) {
    name += '.' + splitted[i];
  }
  return name;
}

export function getElementVersion(uri: string): string {
  let splitted: Array<string> = uri.split('/');
  return splitted[splitted.length - 1];
}

export function isServiceEntrypoint(uri: string): boolean {
  const entrypoints = ['eslap://eslap.cloud/services/http/inbound/1_0_0'];
  return entrypoints.indexOf(uri) !== -1;
}

export function transformDeploymentToManifest(deployment: Deployment) {
  let manifestRoles = {};

  for (let rolId in deployment.roles) {
    manifestRoles[rolId] = {};
    manifestRoles[rolId].resources = {};
    manifestRoles[rolId].resources['__instances'] =
      (<Deployment.Role>deployment.roles[rolId]).actualInstances;
    manifestRoles[rolId].resources['__cpu'] =
      (<Deployment.Role>deployment.roles[rolId]).cpu;
    manifestRoles[rolId].resources['__memory'] =
      (<Deployment.Role>deployment.roles[rolId]).memory;
    manifestRoles[rolId].resources['__ioperf'] =
      (<Deployment.Role>deployment.roles[rolId]).ioperf;
    manifestRoles[rolId].resources['__iopsintensive'] =
      (<Deployment.Role>deployment.roles[rolId]).iopsintensive;
    manifestRoles[rolId].resources['__bandwidth'] =
      (<Deployment.Role>deployment.roles[rolId]).bandwidth;
    manifestRoles[rolId].resources['__resilience'] =
      (<Deployment.Role>deployment.roles[rolId]).resilience;
  }

  // TODO: deployments must have a parameter 'name'. This will fixed in a future
  // ticket
  console.warn('No name can be added to a deployment on it\'s creation');
  return {
    'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
    'servicename': deployment.service,
    // 'name': deployment.name,
    'interconnection': true,
    'configuration': {
      'resources': deployment.resourcesConfig,
      'parameters': deployment.parameters
    },
    'roles': manifestRoles
  };
}
export function transformDomainToManifest(domain: string) {
  // TODO: This has to be fixed in a new ticket. The domain of the user has to
  // bee chosen
  console.warn('Creating element uri with default domain \'dashboard\'');
  return {
    spec: 'eslap://eslap.cloud/resource/vhost/1_0_0',
    name: 'eslap://dashboard/resources/vhost/' + domain,
    parameters: {
      vhost: domain
    }
  };
}
export function transformDataVolumeToManifest(params) {
  console.error('DataVolume creation is under development');
}