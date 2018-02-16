import {
  AdmissionEvent as EcloudEvent, Deployment as EcloudDeployment, EcloudEventType
} from 'admission-client';
import {
  BooleanParameter, Certificate, Channel, Component, Connector, DependedChannel,
  Deployment, Domain, FullConnector, HTTPEntryPoint, IntegerParameter,
  JsonParameter, ListParameter, LoadBalancerConnector, NumberParameter,
  Parameter, ProvidedChannel, PublishSubscribeConnector, Resource, Runtime,
  Service, StringParameter, Volume
} from '../store/stampstate/classes';

import { User } from '../store/pagestate/classes';

export function transformEcloudDeploymentToDeployment(
  ecloudDeployment: EcloudDeployment
) {

  let roles: { [rolId: string]: Deployment.Role } = {};
  let instances: { [instanceId: string]: Deployment.Role.Instance };
  let volumes: { [instanceId: string]: Volume.Instance } = {};

  let resources: { [resource: string]: Resource } = {};

  for (let res in ecloudDeployment.resources) {

    switch (getResourceType(ecloudDeployment.resources[res].type)) {
      case ResourceType.certificate:
        // resources[res] = new Certificate();
        console.warn('Certificates can\'t actually be represented');
        break;
      case ResourceType.domain:
        resources[res] = new Domain(
          ecloudDeployment.resources[res].resource.name,
          ecloudDeployment.resources[res].resource.parameters.vhost,
          Domain.STATE.SUCCESS,
          [ecloudDeployment.urn]
        );
        break;
      case ResourceType.volume:
        if (!ecloudDeployment.resources[res].resource.name) {
          console.warn('Volatile volumes actually can\'t be represented');
        } else {
          resources[res] = new Volume(
            ecloudDeployment.resources[res].resource.name,
            ecloudDeployment.resources[res].resource.parameters.size,
            ecloudDeployment.resources[res].resource.parameters.filesystem
            || Volume.FILESYSTEM.XFS,
            null,
            ecloudDeployment.urn
          );
        }

        break;
      default:
        console.error(
          'Resource not following structure', res,
          ecloudDeployment.resources[res]
        );
    }
  }

  for (let rolId in ecloudDeployment.roles) {
    instances = {};
    for (let instanceId in ecloudDeployment.roles[rolId].instances) {

      console.debug('instance', instanceId,
        ecloudDeployment.roles[rolId].instances[instanceId]);

      volumes = {};

      if (
        ecloudDeployment.roles[rolId].instances[instanceId].configuration &&
        ecloudDeployment.roles[rolId].instances[instanceId].configuration
          .resources
      ) {
        for (
          let res in ecloudDeployment.roles[rolId].instances[instanceId]
            .configuration.resources
        ) {
          switch (getResourceType(ecloudDeployment.roles[rolId]
            .instances[instanceId].configuration.resources[res].type)) {
            case ResourceType.volume:

              let volInst: Volume.Instance = new Volume.Instance(
                ecloudDeployment.roles[rolId].instances[instanceId]
                  .configuration.resources[res].parameters.id,
                ecloudDeployment.roles[rolId].instances[instanceId]
                  .configuration.resources[res].parameters.urn
                  || resources[res] ? resources[res]._uri : undefined,
                rolId,
                instanceId
              );

              volumes[res] = volInst;
              if (resources[res]) {
                (<Volume>resources[res]).items[volInst.id] = volInst;
              }

              break;
            default:
              console.warn('Not expected resource inside instance',
                ecloudDeployment.roles[rolId]
                  .instances[instanceId].configuration.resources[res]
              );
          }
        }
      }

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
        volumes,
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

  let parameters: any = {};

  let channels: {
    [originChannel: string]: {
      destinyChannelId: string,
      destinyDeploymentId: string
    }[]
  } = {};

  for (let originChannel in ecloudDeployment.links) {
    for (let destinyDeploymentId in ecloudDeployment.links[originChannel]) {
      for (
        let destinyChannel in
        ecloudDeployment.links[originChannel][destinyDeploymentId]
      ) {
        if (!channels[originChannel]) {
          channels[originChannel] = [];
        }
        channels[originChannel].push({
          'destinyChannelId': destinyChannel,
          'destinyDeploymentId': destinyDeploymentId
        });
      }
    }
  }

  let res: Deployment = null;

  if (isServiceEntrypoint(ecloudDeployment.service)) {
    res = new HTTPEntryPoint(
      ecloudDeployment.urn, // uri
      parameters, // parameters: any
      roles, // roles: { [rolName: string]: DeploymentRol }
      resources, // resources: { [resource: string]: Resource }
      channels // channels
    );
  } else {
    res = new Deployment(
      ecloudDeployment.urn, // uri
      (<any>ecloudDeployment).name, // name: string
      parameters, // parameters: any
      ecloudDeployment.service, // serviceId: string
      roles, // roles: { [rolName: string]: DeploymentRol }
      resources, // resources: { [resource: string]: Resource }
      channels // channels
    );
  }
  return res;
}

export function transformManifestToService(manifest: {
  spec: string,
  name: string,
  configuration: {
    resources: Array<{ name: string, type: string }>,
    parameters: Array<{ name: string, type: string }>
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

  // Collecting service resources
  let resources: { [resourceId: string]: string } = {};
  for (let i = 0; i < manifest.configuration.resources.length; i++) {
    resources[manifest.configuration.resources[i].name] =
      manifest.configuration.resources[i].type;
  }

  // Collecting service parameters
  let parameters: { [parameter: string]: Parameter } = {};
  for (let paramIndex in manifest.configuration.parameters) {
    let par: Parameter;
    switch (manifest.configuration.parameters[paramIndex].type) {
      case 'eslap://eslap.cloud/parameter/boolean/1_0_0':
        par = new BooleanParameter();
        break;
      case 'eslap://eslap.cloud/parameter/integer/1_0_0':
        par = new IntegerParameter();
        break;
      case 'eslap://eslap.cloud/parameter/json/1_0_0':
        par = new JsonParameter();
        break;
      case 'eslap://eslap.cloud/parameter/list/1_0_0':
        par = new ListParameter();
        break;
      case 'eslap://eslap.cloud/parameter/number/1_0_0':
        par = new NumberParameter();
        break;
      case 'eslap://eslap.cloud/parameter/string/1_0_0':
        par = new StringParameter();
        break;
      default:
        console.error('Parameter type not recognized: ',
          manifest.configuration.parameters[paramIndex].type);
    }
    parameters[manifest.configuration.parameters[paramIndex].name] = par;
  }

  // Collecting service roles
  let roles: { [rolId: string]: Service.Role } = {};
  for (let i = 0; i < manifest.roles.length; i++) {
    roles[manifest.roles[i].name] = new Service.Role(
      manifest.roles[i].component, // component
      manifest.roles[i].parameters, // parameters
      manifest.roles[i].resources // resources
    );
  }

  // Collecting service provided channels
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

  // Collectinc service depended channels
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

  // Collecting service connectors
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

  // Creating the service
  return new Service(
    manifest.name, // uri:string
    resources, // resources: Array<string>,
    parameters, // {[parameter:string]: Parameter},
    roles, // roles: { [roleId: string]: Service.Role },
    proChannels, // proChannels: { [channelId: string]: Service.Role.Channel },
    depChannels, // reqChannels: { [channelId: string]: Service.Role.Channel },
    connectors
  );
}

export function transformManifestToComponent(manifest: {
  code: string,
  profile: object,
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
    manifest.configuration.parameters, // parameters: object
    proChannels, // proChannels: { [channelId: string]: Service.Role.Channel }
    depChannels // depChannels: { [channelId: string]: Service.Role.Channel }
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
        manifest.name, // volume uri
        manifest.parameters.size, // size
        manifest.parameters.fileSystem // filesystem
      );
      break;
    default:
      console.error(
        'Not expected resource type when translating a manifest',
        manifest.spec
      );
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
            [property: string]: number | string | object
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
              [property: string]: number | string | object
            }

          }
        }
      }
    }
  } = {};

  // Deployment initialization
  res[ecloudEvent.data.deploymentUrn] = { 'data': {}, 'roles': {} };

  // Obtaining deployment data
  for (let property in ecloudEvent.data.data) {
    res[ecloudEvent.data.deploymentUrn].data[property] =
      ecloudEvent.data.data[property].mean;
  }
  res[ecloudEvent.data.deploymentUrn].data['timestamp'] = ecloudEvent.timestamp;

  // Role initialization
  for (let rolId in ecloudEvent.data.roles) {
    res[ecloudEvent.data.deploymentUrn].roles[rolId] = {
      'data': {}, 'instances': {}
    };

    // Obtaining role data
    for (let property in ecloudEvent.data.roles[rolId].data) {
      res[ecloudEvent.data.deploymentUrn].roles[rolId].data[property] =
        ecloudEvent.data.roles[rolId].data[property].mean;
    }
    res[ecloudEvent.data.deploymentUrn].roles[rolId].data['timestamp'] =
      ecloudEvent.timestamp;

    // Obtaining instance data
    for (let instanceId in ecloudEvent.data.roles[rolId].instances) {
      res[ecloudEvent.data.deploymentUrn].roles[rolId]
        .instances[instanceId] = {};
      for (let property in ecloudEvent.data.roles[rolId]
        .instances[instanceId]) {

        if (property === 'volumes') { // This instance has got a volume

          if (
            !res[ecloudEvent.data.deploymentUrn].roles[rolId]
              .instances[instanceId]['volumes']
          ) {

            res[ecloudEvent.data.deploymentUrn].roles[rolId]
              .instances[instanceId]['volumes'] = {};

          }

          for (let volumeId in ecloudEvent.data.roles[rolId]
            .instances[instanceId]['volumes']) {

            if (
              !res[ecloudEvent.data.deploymentUrn].roles[rolId]
                .instances[instanceId]['volumes'][volumeId]
            ) {

              res[ecloudEvent.data.deploymentUrn].roles[rolId]
                .instances[instanceId]['volumes'][volumeId] = {};

            }

            for (
              let prop in ecloudEvent.data.roles[rolId]
                .instances[instanceId]['volumes'][volumeId]
            ) {

              res[ecloudEvent.data.deploymentUrn].roles[rolId]
                .instances[instanceId]['volumes'][volumeId][prop] =
                ecloudEvent.data.roles[rolId]
                  .instances[instanceId]['volumes'][volumeId][prop].mean;

            }
          }

        }

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
  if (uri.startsWith('eslap://eslap.cloud/resource/vhost/'))
    return ResourceType.domain;
  if (uri.startsWith('slap//eslap.cloud/resource/cert/server/'))
    return ResourceType.certificate;
  if (uri.startsWith('eslap://eslap.cloud/resource/volume/persistent/'))
    return ResourceType.volume;

  let res: ResourceType = null;
  let splitted = uri.split('/');
  let i = 4;
  if (splitted[2] === 'temporary') { i = i + 2; }

  // Obtain the type. In case it's a temporary element, the type will be twice
  // realocated to the left
  switch (splitted[i]) {
    case 'volume':
    // console.warn('deprecated resource type \'volume\': %s', uri);
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
      console.error(
        'Not expected resource type %s when obtaining a resource type',
        splitted[i]
      );
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
    manifestRoles[rolId].resources['__mininstances'] =
      (<Deployment.Role>deployment.roles[rolId]).minInstances;
    manifestRoles[rolId].resources['__maxinstances'] =
      (<Deployment.Role>deployment.roles[rolId]).maxInstances;
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

  return {
    'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
    'servicename': deployment.service,
    'nickname': deployment.name,
    'interconnection': true,
    'configuration': {
      'resources': deployment.resources,
      'parameters': deployment.parameters
    },
    'roles': manifestRoles
  };
}

export function transformDomainToManifest(uri: string, domain: string) {
  return {
    spec: 'eslap://eslap.cloud/resource/vhost/1_0_0',
    name: uri,
    parameters: {
      vhost: domain
    }
  };
}

export function transformVolumeToManifest(uri: string,
  filesystem: Volume.FILESYSTEM, size: number) {

  return {
    spec: 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
    name: uri,
    parameters: {
      filesystem,
      size
    }
  };

}