import urlencode from 'urlencode';
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
    readonly id: string;
    configuration: any;
    cpu: number;
    memory: number;
    ioperf: number;
    iopsintensive: boolean;
    bandwidth: number;
    resilience: number;
    instanceList: { [instanceId: string]: Rol.Instance };
    instanceNumber: number;
    constructor(id: string, configuration: any, cpu: number, memory: number, ioperf: number, iopsintensive: boolean, bandwidth: number, resilience: number, instanceList: { [instanceId: string]: Rol.Instance }) {
      this.id = id;
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
      readonly id: string;
      cpu: number = 1;
      memory: number = 1;
      bandwidth: number = 1;
      volumes: { [key: string]: string; } = {};
      ports: { [key: string]: string; } = {};
      state: Instance.State = Instance.State.UNKOWN;
      constructor(id: string, cpu: number, memory: number, bandwidth: number, volumes?: { [key: string]: string; }, ports?: { [key: string]: string; }) {
        if (!id) throw new Error('An instance cant be created without an id');
        this.id = id;
        if (cpu && cpu !== null && cpu > 0) this.cpu = cpu;
        if (memory && memory !== null && memory > 0) this.memory = memory;
        if (bandwidth && bandwidth !== null && bandwidth > 0) this.bandwidth = bandwidth;
        if (volumes && volumes !== null) this.volumes = volumes;
        if (ports && ports !== null) this.ports = ports;
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
    }
  }
}