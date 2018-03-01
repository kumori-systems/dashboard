import {
  AdmissionEvent as EcloudEvent, Deployment as EcloudDeployment, EcloudEventType
} from 'admission-client';
import {
  BooleanParameter, Certificate, Channel, Component, Connector, DependedChannel,
  Deployment, Domain, ECloudElement, EntryPoint, FullConnector, HTTPEntryPoint,
  IntegerParameter, JsonParameter, ListParameter, LoadBalancerConnector,
  NumberParameter, Parameter, ProvidedChannel, PublishSubscribeConnector,
  Resource, Runtime, Service, StringParameter, VolatileVolume, Volume
} from '../store/stampstate/classes';

import { ProxyConnection } from './index';

import { User } from '../store/pagestate/classes';
import { PersistentVolume } from '../store/stampstate/classes/resource';

/**
 * Given an URN returns the ECloud element type
 * @param urn <string> URN which represents the element in the stamp.
 */
export function getElementType(urn: string): ECloudElement.ECLOUDELEMENT_TYPE {

  let res: ECloudElement.ECLOUDELEMENT_TYPE = null;
  try {

    let splitted = urn.split('/');

    let i = 3;

    // If this is a temporary element, the type will be twice realocated to the
    // left
    if (splitted[2] === 'temporary') { i = i + 2; }

    switch (splitted[i]) {
      case 'runtime':
      case 'runtimes':
        res = ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME;
        break;
      case 'service':
      case 'services':
        res = ECloudElement.ECLOUDELEMENT_TYPE.SERVICE;
        break;
      case 'component':
      case 'components':
        res = ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT;
        break;
      case 'resource':
      case 'resources':
        res = ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE;
        break;
      default:
        console.error('Unknown element type', urn);
    }

  } catch (err) {
    throw new Error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }

  return res;
}

/**
 * Given a URN of an element returns the resource type of the element.
 * @param urn <string> 
 */
export function getResourceType(urn: string): Resource.RESOURCE_TYPE {

  if (urn.startsWith('eslap://eslap.cloud/resource/vhost/'))
    return Resource.RESOURCE_TYPE.DOMAIN;
  if (urn.startsWith('slap//eslap.cloud/resource/cert/server/'))
    return Resource.RESOURCE_TYPE.CERTIFICATE;
  if (urn.startsWith('eslap://eslap.cloud/resource/volume/persistent/'))
    return Resource.RESOURCE_TYPE.PERSISTENT_VOLUME;
  if (urn.startsWith('eslap://eslap.cloud/resource/volume/volatile/'))
    return Resource.RESOURCE_TYPE.VOLATILE_VOLUME;

  let res: Resource.RESOURCE_TYPE = null;
  try {

    let splitted = urn.split('/');
    let i = 4;
    if (splitted[2] === 'temporary') { i = i + 2; }

    // Obtain the type. In case it's a temporary element, the type will be twice
    // realocated to the left
    switch (splitted[i]) {
      case 'volume':
      case 'volumes':
        res = Resource.RESOURCE_TYPE.PERSISTENT_VOLUME;
        break;
      case 'cert':
        res = Resource.RESOURCE_TYPE.CERTIFICATE;
        break;
      case 'vhost':
        res = Resource.RESOURCE_TYPE.DOMAIN;
        break;
      default:

        // This part is supposed to be a temporary solution.
        switch (splitted[i + 1]) {
          case 'volume':
          case 'volumes':
            res = Resource.RESOURCE_TYPE.PERSISTENT_VOLUME;
            break;
          case 'cert':
            res = Resource.RESOURCE_TYPE.CERTIFICATE;
            break;
          case 'vhost':
            res = Resource.RESOURCE_TYPE.DOMAIN;
            break;
          default:
            throw new Error(
              'Not able to extract resource from \'' + urn + '\'.'
            );
        }
    }

  } catch (err) {
    throw new Error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }

  return res;

}

/**
 * Given the URN of an element returns it's domain.
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function getElementDomain(urn: string): string {

  let res: string = null;

  try {
    res = urn.split('/')[2];
  } catch (err) {
    throw new Error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }

  return res;

}

/**
 * Given the URN of an element returns it's name.
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function getElementName(urn: string): string {

  let res: string = null;
  try {
    res = urn.split('/')[2];

    let splitted: Array<string> = urn.split('/');
    res = splitted[4];
    for (let i = 5; i < splitted.length - 1; i++) {
      res += '.' + splitted[i];
    }

  } catch (err) {
    throw new Error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }
  return res;

}

/**
 * Given the URN of an element returns it's version.
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function getElementVersion(urn: string): string {

  let res: string = null;
  try {

    let splitted: Array<string> = urn.split('/');
    res = splitted[splitted.length - 1];

  } catch (err) {
    throw new Error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }
  return res;

}

/**
 * Given an URN of an element returns if the 
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function isServiceEntrypoint(urn: string): boolean {

  let res: boolean = false;
  switch (urn) {
    case EntryPoint.ENTRYPOINT_TYPE.HTTP_INBOUND:
      res = true;
    default:
    // Do nothing because res is already false
  }
  return res;

}

/**
 * Transforms the library class Ecloud Deployment to a local Deployment.
 * @param emitter <ProxyConnection> Emmiter to send notifications of events.
 * @param ecloudDeployment <EcloudDeployment> Deployment represented in the
 *  ecloud deployment class.
 */
export function transformEcloudDeploymentToDeployment(
  emitter: ProxyConnection,
  ecloudDeployment: EcloudDeployment
): Deployment {

  let resources: { [resource: string]: string } = {};
  let roles: { [rolId: string]: Deployment.Role } = {};

  // This must before be added to their respective resources
  let resourceInstances: Volume.Instance[] = [];

  // For each role
  for (let rolId in ecloudDeployment.roles) {
    let roleResources: {} = {};

    let instances: { [instanceId: string]: Deployment.Role.Instance } = {};

    for (let instanceId in ecloudDeployment.roles[rolId].instances) {
      let instanceResources: {} = {};

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

            case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
              let volInst: PersistentVolume.Instance =
                new PersistentVolume.Instance(
                  ecloudDeployment.roles[rolId].instances[instanceId]
                    .configuration.resources[res].parameters.id, // id
                  res, // volume name
                  // definition URN
                  ecloudDeployment.resources[res].resource.name,
                  rolId, // associated role
                  instanceId, // associated instance
                  null // usage
                );

              instanceResources[res] = volInst;

              resourceInstances.push(volInst);

              break;

            case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:

              let volatileVolInst: VolatileVolume.Instance =
                new VolatileVolume.Instance(
                  ecloudDeployment.roles[rolId].instances[instanceId]
                    .configuration.resources[res].parameters.id, // id
                  res, // volume name,
                  ecloudDeployment.roles[rolId].instances[instanceId]
                    .configuration.resources[res].name,
                  rolId, // associated role
                  instanceId, // associated instance
                  ecloudDeployment.roles[rolId].instances[instanceId]
                    .configuration.resources[res].parameters.filesystem
                );

              instanceResources[res] = volatileVolInst;

              resourceInstances.push(volatileVolInst);

              break;

            default:

              console.warn('Not expected resource inside instance',
                res,
                ecloudDeployment.roles[rolId].instances[instanceId]
                  .configuration.resources[res]
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
        instanceResources,
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

  for (let res in ecloudDeployment.resources) {

    switch (getResourceType(ecloudDeployment.resources[res].type)) {
      case Resource.RESOURCE_TYPE.CERTIFICATE:
        // Ther's actually a bug in which deployments with no certificates
        // return a resource with null parameters
        if (ecloudDeployment.resources[res].resource.parameters) {
          resources[res] = ecloudDeployment.resources[res].resource.parameters
            .name;

          emitter.onAddCertificate(
            ecloudDeployment.resources[res].resource.name,
            new Certificate(
              ecloudDeployment.resources[res].resource.parameters.name, // urn
              ecloudDeployment.resources[res].resource.parameters.content
                .key, // key
              ecloudDeployment.resources[res].resource.parameters.content
                .cert, // certificate
              ecloudDeployment.urn // usedBy
            )
          );
        }
        break;

      case Resource.RESOURCE_TYPE.DOMAIN:
        resources[res] = ecloudDeployment.resources[res].resource.name;
        emitter.onAddDomain(
          ecloudDeployment.resources[res].resource.name,
          new Domain(
            ecloudDeployment.resources[res].resource.name, // urn
            ecloudDeployment.resources[res].resource.parameters.vhost, // domain
            Domain.STATE.SUCCESS, // state
            ecloudDeployment.urn // usedBy
          )
        );
        break;

      case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
        resources[res] = ecloudDeployment.resources[res].resource.name;

        let persistentItems: {
          [persitentVolInstance: string]: PersistentVolume.Instance
        } = {};
        for (let resInstIndex in resourceInstances) {
          if (resourceInstances[resInstIndex].volumeName === res) {
            persistentItems[resourceInstances[resInstIndex].id] =
              resourceInstances[resInstIndex];
          }
        }

        emitter.onAddPersistentVolume(
          ecloudDeployment.resources[res].resource.name,
          new PersistentVolume(
            ecloudDeployment.resources[res].resource.name, // urn
            res, // name
            ecloudDeployment.resources[res].resource.parameters.size, // size
            persistentItems, // items
            null, // associated role
            ecloudDeployment.resources[res].resource.parameters.filesystem
            || Volume.FILESYSTEM.XFS, // filesystem
            ecloudDeployment.urn // usedBy
          )
        );
        break;

      case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:
        let volatileItems: {
          [volatileVolInstance: string]: VolatileVolume.Instance
        } = {};

        /* There is a problem in which the identifier of the volume must be
        taken from the instances and not from the volume in the deployment
        definition */
        let volumeURN: string;


        for (let resInstIndex in resourceInstances) {
          if (resourceInstances[resInstIndex].volumeName === res) {
            volatileItems[resourceInstances[resInstIndex].id] =
              resourceInstances[resInstIndex];

            volumeURN =
              volatileItems[resourceInstances[resInstIndex].id]._urn;
          }
        }

        resources[res] = volumeURN;

        // Due to the identifier, volatile volumes can't be added when getting
        // the info of a deployment and must be added in a different call
        emitter.onAddVolatileVolume(
          res,
          new VolatileVolume(
            res, // name
            volumeURN, // id
            ecloudDeployment.resources[res].resource.parameters.size, // size
            volatileItems, // items
            // filesystem
            ecloudDeployment.resources[res].resource.parameters.filesystem,
            null, // associated role
            ecloudDeployment.urn // usedBy
          )
        );
        break;

      default:
        throw new Error('Resource not following structure \'' + res + '\' ' +
          ecloudDeployment.resources[res]
        );
    }
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
      ecloudDeployment.urn, // urn
      parameters, // parameters: any
      roles, // roles: { [rolName: string]: DeploymentRol }
      resources, // resources: { [resource: string]: Resource }
      channels // channels
    );
  } else {
    res = new Deployment(
      ecloudDeployment.urn, // urn
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
          Channel.CHANNEL_TYPE.REQUEST, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/reply/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.CHANNEL_TYPE.REPLY, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/send/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.CHANNEL_TYPE.SEND, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/receive/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.CHANNEL_TYPE.RECEIVE, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/duplex/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.CHANNEL_TYPE.DUPLEX, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case ' eslap://eslap.cloud/endpoint/request/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
          manifest.channels.provides[i].protocol // protocol
        );
        break;
      case ' eslap://eslap.cloud/endpoint/reply/1_0_0':
        res = new ProvidedChannel(
          manifest.channels.provides[i].name, // name
          Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
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
          Channel.CHANNEL_TYPE.REQUEST, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/reply/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.CHANNEL_TYPE.REPLY, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/send/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.CHANNEL_TYPE.SEND, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/receive/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.CHANNEL_TYPE.RECEIVE, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/channel/duplex/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.CHANNEL_TYPE.DUPLEX, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/endpoint/request/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
          manifest.channels.requires[i].protocol // protocol
        );
        break;
      case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
        res = new DependedChannel(
          manifest.channels.requires[i].name, // name
          Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
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
    manifest.name, // urn:string
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
            Channel.CHANNEL_TYPE.REQUEST, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.REPLY, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/send/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.SEND, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/receive/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.RECEIVE, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/duplex/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.DUPLEX, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/request/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
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
            Channel.CHANNEL_TYPE.REQUEST, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.REPLY, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/send/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.SEND, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/receive/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.RECEIVE, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/duplex/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.DUPLEX, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/request/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
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
    manifest.name, // urn: string
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
    case Resource.RESOURCE_TYPE.DOMAIN:
      /*
      res = new Domain(
        manifest.name,
        manifest.parameters.vhost,
        Domain.STATE.SUCCESS,
        []
      );
      */
      break;
    case Resource.RESOURCE_TYPE.CERTIFICATE:
      /*
      res = new Certificate(
        manifest.name,
        manifest.parameters.content.key, // key
        manifest.parameters.content.cert, // certificate
        []
      );
      */
      break;
    case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
      /*
      res = new Volume(
        manifest.name, // volume urn
        manifest.parameters.size, // size
        manifest.parameters.fileSystem // filesystem
      );
      */
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

export function transformEcloudEventDataToServiceMetrics(
  ecloudEvent: EcloudEvent
): {
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

export function transformEcloudEventDataToVolumeMetrics(
  ecloudEvent: EcloudEvent
): {
    [itemId: string]: {
      [property: string]: string | number
    }
  } {

  let res: {
    [itemId: string]: {
      'timestamp': string,
      'free': number,
      'total': number,
      'usage': number,
      'used': number
    }
  } = {};

  res[ecloudEvent.data.item] = {
    'timestamp': null,
    'free': -1,
    'total': -1,
    'usage': -1,
    'used': -1
  };

  for (let property in ecloudEvent.data.data) {
    res[ecloudEvent.data.item][property] = ecloudEvent.data.data[property].mean;
  }
  res[ecloudEvent.data.item]['timestamp'] = ecloudEvent.timestamp;

  return res;
}

export function transformDeploymentToManifest(deployment: Deployment): Object {

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

export function transformDomainToManifest(urn: string, domain: string): Object {

  return {
    spec: 'eslap://eslap.cloud/resource/vhost/1_0_0',
    name: urn,
    parameters: {
      vhost: domain
    }
  };

}

export function transformVolumeToManifest(
  urn: string, filesystem: Volume.FILESYSTEM, size: number
): Object {

  return {
    spec: 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
    name: urn,
    parameters: {
      filesystem,
      size
    }
  };

}