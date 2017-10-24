import urlencode from 'urlencode';
import StampElement from './stampelement';
import { isServiceEntrypoint, getElementVersion, getElementOwner, getElementName } from '../../proxy/utils';
import { Metric } from '../stamp_state/metric';
export class Link {
  deploymentOne: string;
  channelOne: string;
  deploymentTwo: string;
  channelTwo: string;
  constructor(deploymentOne: string, channelOne: string, deploymentTwo: string, channelTwo: string) {
    this.deploymentOne = deploymentOne;
    this.channelOne = channelOne;
    this.deploymentTwo = deploymentTwo;
    this.channelTwo = channelTwo;
  }
}

export class Deployment {
  readonly uri: string;
  owner: string = null;
  name: string = null; // nombre amistoso para el usuario
  serviceId: string = null; // servicio que define el despliegue
  resourcesConfig: { [resource: string]: any } = null; // encaja cómo llama el servicio a las resources con la definición real de las resources
  parameters: any = null;
  roles: { [rolName: string]: Deployment.Rol } = null;
  website: Array<string> = [];
  links: Array<Link> = [];
  isEntrypoint: boolean = false;
  metrics: [Date, { 'data': Metric, 'roles': { [roleId: string]: { 'data': Metric, 'instances': { [instanceId: string]: Metric } } } }][] = [];
  path: string = null;
  constructor(uri: string, name: string, serviceId: string, resourcesConfig: { [resource: string]: any }, parameters: any, roles: { [rolName: string]: Deployment.Rol }, links: Array<Link>, website: Array<string>) {
    if (uri) {
      this.uri = uri;
      this.owner = getElementOwner(uri);
    }
    this.path = '/deployment/' + urlencode(uri);

    if (name && name !== null) this.name = name;
    if (serviceId && serviceId !== null) {
      this.serviceId = serviceId;
      this.isEntrypoint = isServiceEntrypoint(this.serviceId);

      if (this.name === null) {
        this.name = getElementName(serviceId) + getElementVersion(serviceId);
      }
    }

    if (resourcesConfig && resourcesConfig !== null) this.resourcesConfig = resourcesConfig;
    if (parameters && parameters !== null) this.parameters = parameters;
    if (roles && roles !== null) this.roles = roles;
    if (links && links !== null) this.links = links;
    if (website && website !== null) this.website = website;
  }

  get state(): Deployment.State {
    let res: Deployment.State = Deployment.State.UNKOWN;
    let ok: number = 0;
    let warning: number = 0;
    let error: number = 0;
    let unkwon: number = 0;
    for (let rol in this.roles) {
      switch (this.roles[rol].state) {
        case Deployment.Rol.State.OK:
          ok++;
          break;
        case Deployment.Rol.State.DANGER:
          error++;
          break;
        case Deployment.Rol.State.WARNING:
          warning++;
          break;
        default:
          unkwon++;
      }
    }

    if (error > 0) {
      res = Deployment.State.DANGER;
    }
    else if (warning > 0) {
      res = Deployment.State.WARNING;
    }
    else if (ok > 0) {
      res = Deployment.State.OK;
    }

    return res;
  }
}

export module Deployment {
  export enum State { OK, DANGER, WARNING, UNKOWN };

  export class Rol {
    configuration: any;
    cpu: number;
    memory: number;
    ioperf: number;
    iopsintensive: boolean;
    bandwidth: number;
    resilience: number;
    instanceList: { [instanceId: string]: Rol.Instance };
    instanceNumber: number;
    constructor(configuration: any, cpu: number, memory: number, ioperf: number, iopsintensive: boolean, bandwidth: number, resilience: number, instanceList: { [instanceId: string]: Rol.Instance }) {
      this.configuration = configuration;
      this.cpu = cpu;
      this.memory = memory;
      this.ioperf = ioperf;
      this.iopsintensive = iopsintensive;
      this.bandwidth = bandwidth;
      this.resilience = resilience;
      this.instanceList = instanceList;
      this.instanceNumber = 0;
      for (let key in instanceList) {
        this.instanceNumber++;
      }
    };

    get state(): Rol.State {
      let res: Rol.State = Rol.State.UNKOWN;
      let connected: number = 0;
      let disconnected: number = 0;
      let unkwon: number = 0;
      for (let instance in this.instanceList) {
        if (this.instanceList[instance]) {
          switch (this.instanceList[instance].state) {
            case Rol.Instance.State.CONNECTED:
              connected++;
              break;
            case Rol.Instance.State.DISCONNECTED:
              disconnected++;
              break;
            default:
              unkwon++;
          }
        }
      }

      if (connected > 0 && disconnected === 0) {
        res = Rol.State.OK;
      }
      else if (connected > 0 && disconnected > 0) {
        res = Rol.State.WARNING;
      }
      else if (connected === 0 && disconnected > 0) {
        res = Rol.State.DANGER;
      }

      return res;
    }
  }

  export module Rol {
    export enum State { OK, DANGER, WARNING, UNKOWN };

    export class Instance {

      cnid: string;
      publicIp: string;
      privateIp: string;
      arrangement: Instance.Arrangement;
      volumes: { [key: string]: string; };
      ports: { [key: string]: string; };
      state: Instance.State;
      constructor(cnid: string, publicIp: string, privateIp: string, arrangement: Instance.Arrangement, volumes?: { [key: string]: string; }, ports?: { [key: string]: string; }) {
        this.cnid = cnid;
        this.publicIp = publicIp;
        this.privateIp = privateIp;
        this.arrangement = arrangement;
        this.volumes = volumes;
        this.ports = ports;
        this.state = Instance.State.UNKOWN;
      }

      setState(connected: boolean) {
        if (connected) {
          this.state = Instance.State.CONNECTED;
        } else {
          this.state = Instance.State.DISCONNECTED;
        }
      }
    }

    export module Instance {
      export enum State { CONNECTED, DISCONNECTED, UNKOWN };

      export class Arrangement {
        minInstances: number;
        maxInstances: number;
        cpu: number;
        memory: number;
        bandwith: number;
        failureZones: number;
        constructor(minInstances, maxInstances, cpu, memory, bandwith, failureZones) {
          this.minInstances = minInstances;
          this.maxInstances = maxInstances;
          this.cpu = cpu;
          this.memory = memory;
          this.bandwith = bandwith;
          this.failureZones = failureZones;
        }
      }
    }
  }
}