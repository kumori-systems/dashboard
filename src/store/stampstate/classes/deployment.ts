import urlencode from 'urlencode';
import { Resource, Service, VolatileVolume, Volume } from './index';

/**
 * Checks the format of the URI and returns the domain and the name of the
 * element. If the format is not corret it throws an Error.
 */
function rightURIformat(URI): [string, string] {

  try {

    if (!URI) throw new Error();
    let splitted = URI.split('/');
    // Check two first static pieces
    if (splitted[0] !== 'slap:' || splitted[1] !== '' ||
      'deployments' !== splitted[3]) throw new Error();
    // Save domain
    let domain = splitted[2];
    // Save name even if it's got more than one word
    let name = splitted[4];
    for (let i = 5; i < splitted.length - 1; i++) {
      name += '/' + splitted[i];
    }
    return [domain, name];

  } catch (err) {

    throw new Error('URI format error: ' + URI);

  }

}

/**
 * Instance of a service.
 */
export class Deployment {

  /** <string> Uniform Resource Identifier for this deployment. */
  readonly _uri: string;

  /** <string> Where this deployment belongs to. */
  readonly _domain: string;

  /** <string> Path for this deployment based on his URI. */
  readonly _path: string;

  /** <string> Friendly readable text to identify this deployment. */
  name: string = null;

  /** <string> URI of the service which defines this deployment. */
  service: string = null;

  /**
   * <{[resource:string]:Resource}> Set of resources for this deployment.
   */
  resources: { [resource: string]: Resource } = {};

  /**
   * <{ [volumeId: string]: VolatileVolume }> Set of volatile volumes associated
   * to the deployment.
   */
  volatileVolumes: { [volumeId: string]: VolatileVolume } = {};

  /** <any> Set of parameters passed to the initialitzation of this service. */
  parameters: any = null;

  /**
   * { [role: string]: Deployment.Role } Set of behaviours and properties for a
   * component.
   */
  roles: { [role: string]: Deployment.Role } = {};

  /** <Deployment.Link> Connections with this deployment. MUST NOT BE EDITED. */
  channels: {
    [originChannel: string]:
    { destinyChannelId: string, destinyDeploymentId: string }[]
  };

  /**
   * <Deployment.Role.STATE> Represents the state of the conjuntion of the
   * instances. If all instances are connected the state will be GOOD, if all
   * instances are disconnected the state will be ERROR, and if some instances
   * are disconnected but at least one is connected the state will be WARNING.
   */
  get state(): Deployment.Role.STATE {
    let res: Deployment.Role.STATE = Deployment.Role.STATE.UNKOWN;
    let success: number = 0;
    let warning: number = 0;
    let danger: number = 0;
    let unkown: number = 0;

    for (let uri in this.roles) {
      switch (this.roles[uri].state) {
        case Deployment.Role.STATE.SUCCESS:
          success++;
          break;
        case Deployment.Role.STATE.WARNING:
          warning++;
          break;
        case Deployment.Role.STATE.DANGER:
          danger++;
          break;
        default:
          unkown++;
      }
    }

    if (danger > 0) {
      res = Deployment.Role.STATE.DANGER;
    }
    else if (warning > 0) {
      res = Deployment.Role.STATE.WARNING;
    }
    else if (unkown > 0) {
      res = Deployment.Role.STATE.UNKOWN;
    }
    else if (success > 0) {
      res = Deployment.Role.STATE.SUCCESS;
    }

    return res;
  }

  /**
   * Main class of Ecloud ecosystem, which represents the instance of a service.
   * @param uri <string> Uniform Resource Identifier for this element following
   * the format 'eslap://<domain>/deployment/<name>/<version>'.
   * @param name <string> Friendly readable text to identify this deployment.
   * @param parameters <any> Set of parameters passed to the initialitzation of
   * this service.
   * @param service <string> URI of the service which defines this deployment.
   * @param roles { [role: string]: Deployment.Role } Instances of a service
   * rol.
   * @param resourcesConfig <{[resource:string]:string}> Set of parameters
   * configuring the resources used by this deployment.
   * @param channels <{[originChannel: string]:{ destinyChannelId: string,
   * destinyDeploymentId: string }[]> Connections with this deployment.
   */
  constructor(uri: string, name: string, parameters: any, service: string,
    roles: { [rol: string]: Deployment.Role },
    resources: { [resource: string]: Resource }, channels: {
      [originChannel: string]:
      { destinyChannelId: string, destinyDeploymentId: string }[]
    },
    volatileVolumes?: { [volumeId: string]: VolatileVolume }) {

    // Check URI and assign results
    [this._domain, {}] = rightURIformat(uri);
    this._uri = uri;

    // Calculate path
    this._path = '/deployment/' + urlencode(uri);

    if (!service || service.length === 0) throw new Error('Invalid value for '
      + 'service in Deployment:' + service);
    this.service = service;
    if (resources) this.resources = resources;
    if (parameters) this.parameters = parameters;
    if (roles) this.roles = roles;

    // If we've got a name, change the name to the friendly one
    if (name) { this.name = name; }
    else {
      let aux = this.service.split('/');
      this.name = aux[4] + ' ~ ' + aux[aux.length - 1];
    }

    if (channels) this.channels = channels;

    // Assing volatile volumes to the deployment
    if (volatileVolumes) { this.volatileVolumes = volatileVolumes; }
  }


}
export module Deployment {

  /**
   * Instance of a role defined in this deployment's service.
   */
  export class Role {

    /** <string> Readable text which identifies this role in this deployment. */
    readonly name: string;

    /** <string> Component which implements the role. */
    readonly component: string;

    /** <any> Innitial settings for a role. */
    configuration: any = null;

    /** <number> Amount of CPU units available. Default 1. */
    cpu: number = 1;

    /**
     * <number> Amount of main memory units needed by this rol. Each unit
     * corresponds to a certain amount of physical RAM plus swap. Default 1.
     */
    memory: number = 1;

    /**
     * <number> Amount of I/O performance units available. Each IOperf unit
     * corresponds to a specific disk bandwidth rate and to a specific tare of
     * disk operations per second (IOPS) the role can perform. Default 1.
     */
    ioperf: number = 1;

    /**
     * <boolean> Indicates that the component is especially I/O intensive in
     * terms of IOPS. When the value is true, the rate of disk operations per
     * second included per I/O performance unit will be higher. Default false.
     */
    iopsintensive: boolean = false;

    /** <number> Maximum rate (in Mbps) of data transmission through network
     * interfaces. Default 1.
     */
    bandwidth: number = 1;

    /**
     * <number> Number of failures needed to take down all instances of a
     * component. The resilience is specified by levels, but thye indicate
     * various types of failures by likelihood. Default 1.
     */
    resilience: number = 1;

    /**
     * <{ [instance: string]: Role.Instance }>Instances of the role to be
     * mantained running.
     */
    instances: { [instance: string]: Role.Instance } = {};

    /** <number> Actual number of connected instances for this rol. */
    get actualInstances(): number {
      let res: number = 0;
      for (let i in this.instances) {
        if (this.instances[i].state === Role.Instance.STATE.CONNECTED
          || this.instances[i].state === Role.Instance.STATE.DISCONNECTED
          || this.instances[i].state === Role.Instance.STATE.UNKOWN
        )
          res++;
      }
      return res;
    };

    /**
     * <number> Minim amount of instances running at the same time. Default 1.
     */
    minInstances: number = 1;

    /**
     * <number> Maximum amount of instances running at the same time. Default 1.
     */
    maxInstances: number = 1;

    /**
     * <Role.STATE> Represents the state of the conjuntion of the instances.If
     * all instances are connected the state will be GOOD, if all instances are
     * disconnected the state will be ERROR, and if some instances are
     * disconnected but at least one is connected the state will be WARNING.
     */
    get state(): Role.STATE {
      let res: Role.STATE = Role.STATE.UNKOWN;
      let connected: number = 0;
      let disconnected: number = 0;
      let unkown: number = 0;

      for (let uri in this.instances) {
        switch (this.instances[uri].state) {
          case Role.Instance.STATE.DISCONNECTED:
            disconnected++;
            break;
          case Role.Instance.STATE.CONNECTED:
            connected++;
            break;
          default:
            unkown++;
        }
      }

      if (connected === 0 && disconnected > 0) {
        res = Role.STATE.DANGER;
      }
      else if (connected > 0 && disconnected > 0) {
        res = Role.STATE.WARNING;
      }
      else if (connected > 0 && disconnected === 0) {
        res = Role.STATE.SUCCESS;
      }

      return res;
    }

    /**
     * Instance of a role defined in this deployment's service.
     * @param name <string> Readable text which identifies this role in this
     * deployment.
     * @param component <string> Component which implements the role in this
     * deployment.
     * @param configuration <any> Innitial settings for a role.
     * @param cpu <number> Amount of CPU units available. Default 1.
     * @param memory <number> Amount of main memory units needed by this rol.
     * Each unit corresponds to a certain amount of physical RAM plus swap.
     * Default 1.
     * @param ioperf <number> Amount of I/O performance units available.
     * Each IOperf unit corresponds to a specific disk bandwidth rate and to a
     * specific tare of disk operations per second (IOPS) the role can perform.
     * Default 1.
     * @param iopsintensive <boolean> Indicates that the component is especially
     *  I/O intensive in terms of IOPS. When the value is true, the rate of disk
     *  operations per second included per I/O performance unit will be higher.
     * Default false.
     * @param bandwidth <number> Maximum rate (in Mbps) of data transmission
     * through network interfaces. Default 1.
     * @param resilience <number> Number of failures needed to take down all
     * instances of a component. The resilience is specified by levels, but they
     * indicate various types of failures by likelihood. Default 1.
     * @param instances <{ [instance: string]: Role.Instance }>Instances of the
     * role to be mantained running.
     * @param minInstances <number> Minim amount of instances running at the
     * same time. Default 1.
     * @param maxInstances <number> Maximum amount of instances running at the
     * same time. Default 1.
     */
    constructor(name: string, component: string, configuration: any,
      cpu: number, memory: number, ioperf: number, iopsintensive: boolean,
      bandwidth: number, resilience: number,
      instances: { [instanceId: string]: Role.Instance }, minInstances: number,
      maxInstances: number) {

      if (!name || name.length === 0)
        throw new Error('Invalid name for Role: ' + name);
      this.name = name;
      if (!component)
        throw new Error('Invalid component for Role: ' + component);
      this.component = component;
      if (configuration) this.configuration = configuration;
      if (cpu && cpu > 0) this.cpu = cpu;
      if (memory && memory > 0) this.memory = memory;
      if (ioperf && ioperf > 0) this.ioperf = ioperf;
      if (iopsintensive) this.iopsintensive = iopsintensive;
      if (bandwidth && bandwidth > 0) this.bandwidth = bandwidth;
      if (resilience && resilience > 0) this.resilience = resilience;
      if (instances) this.instances = instances;
      if (minInstances) {
        if (minInstances > 0) { this.minInstances = minInstances; }
        else { throw new Error('MinInstances must be higher than 0'); }
      }
      if (maxInstances) {
        if (maxInstances >= minInstances) {
          this.maxInstances = maxInstances;
        } else {
          throw new
            Error('MaxInstances must be equal or higher than minInstances');
        }
      }
    };
  }

  export module Role {

    /**
     * Represents the state of the conjuntion of the instances. If all
     * instances are connected the state will be GOOD, if all instances are
     * disconnected the state will be ERROR, and if some instances are
     * disconnected but at least one is connected the state will be WARNING.
     */
    export enum STATE {
      SUCCESS = 'success', WARNING = 'warning', DANGER = 'danger',
      UNKOWN = 'unkown'
    };

    /**
     * Instance of a component, running as a role, defined in this deployment's
     * service.
     */
    export class Instance {

      /** <string> Identificatior of the instance in Ecloud. */
      cnid: string = null;

      /**
       * <number> Amount of main memory units needed by this instance. Each
       * unit corresponds to a certain amount of physical RAM plus swap.
       * Default 1.
       */
      cpu: number = 1;

      /**
       * <number> Amount of main memory units needed by this rol. Each unit
       * corresponds to a certain amount of physical RAM plus swap. Default 1.
       */
      memory: number = 1;

      /**
       * <number> Maximum rate (in Mbps) of data transmission through network
       * interfaces. Default 1.
       */
      bandwidth: number = 1;

      /**
       * <{ [volume: string]: string; }> Phisical data volumes implied into this
       *  role.
       */
      volumes: { [volume: string]: Volume.Instance } = {};

      /** <{ [port: string]: string; }> Logical ports implied into this role. */
      ports: { [port: string]: string; } = {};

      /**
       * <Instance.STATE> Represents the availability of the instance. Default
       * UNKOWN.
       */
      state: Instance.STATE = Instance.STATE.UNKOWN;

      /**
      * Instance of a component, running as a role, defined in this deployment's
       service.
      * @param cnid <string> Identificatior of the instance in Ecloud.
      * @param state <State> Represents the availability of the rol. Default
      Disconnected.
      * @param cpu <number> Amount of main memory units needed by this instance.
      Each unit corresponds to a certain amount of physical RAM plus swap.
      Default 1.
      * @param memory <number> Amount of main memory units needed by this rol.
      Each unit corresponds to a certain amount of physical RAM plus swap.
      Default 1.
      * @param bandwidth <number> Maximum rate (in Mbps) of data transmission
      through network interfaces. Default 1.
      * @param volumes <{ [volume: string]: string; }> Phisical data volumes
      implied into this role.
      * @param ports <{ [port: string]: string; }> Logical ports implied into
      this role.
      */
      constructor(cnid: string, state: Instance.STATE, cpu: number,
        memory: number, bandwidth: number,
        volumes?: { [volume: string]: Volume.Instance },
        ports?: { [key: string]: string; }) {
        if (!cnid || cnid.length === 0)
          throw new Error('Invalid cnid for Instance: ' + cnid);
        this.cnid = cnid;
        if (state) this.state = state;
        if (cpu && cpu >= 0) this.cpu = cpu;
        if (memory && memory >= 0) this.memory = memory;
        if (bandwidth && bandwidth >= 0) this.bandwidth = bandwidth;
        if (volumes) this.volumes = volumes;
        if (ports) this.ports = ports;
      }

    }

    export module Instance {

      /** Represents the availability of the instance. */
      export enum STATE {
        CONNECTED = 'connected', DISCONNECTED = 'disconnected',
        UNKOWN = 'unkown'
      };

    }
  }
}