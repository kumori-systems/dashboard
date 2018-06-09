import { ECloudElement } from './ecloudelement';

/**
 * Phisical or virtual component of linited availability within a computer or
 * information management system. Includes means for input, processing, output,
 * communication and storage.
 */
export class Resource extends ECloudElement {

  /** <string> Identifier of the resource in the stamp. */
  readonly _urn: string;

  /** <Resource.RESOURCE_TYPE> Resource type. */
  readonly _resource_type: Resource.RESOURCE_TYPE;

  /** <string[]> Marks the elements which use this resource in the stamp. */
  usedBy: string[] = [];

  /**
   * Phisical or virtual component of linited availability within a computer or
   * information management system. Includes means for input, processing,
   * output, communication and storage.
   * @param urn <string> URN for this resource with the format
   *  'eslap://<domain>/deployment/<name>/<version>'.
   * @param resourceType <Resource.RESOURCE_TYPE> Type of the resource.
   * @param usedBy <string> URN of the service which uses this resource.
   */
  constructor(
    urn: string, resourceType: Resource.RESOURCE_TYPE, usedBy?: string
  ) {
    super(ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE);
    if (!urn) {
      throw new Error('A resource requires an URN');
    }
    this._urn = urn;
    if (!resourceType) {
      throw new Error('A resource requires a resource type');
    }
    this._resource_type = resourceType;
    if (usedBy) this.usedBy = [usedBy];
  }

}

export module Resource {

  /** Available types of resource. */
  export enum RESOURCE_TYPE {
    CERTIFICATE = 'certificate', DOMAIN = 'domain',
    PERSISTENT_VOLUME = 'persistent volume', VOLATILE_VOLUME = 'volatile volume'
  }

}

/**
 * An identification text that defines a realm of administrative autonomy,
 * authority or control within the Internet.
 */
export class Domain extends Resource {

  /** <domain.State> Availability of this domain. Default WARNING. */
  state: Domain.STATE = Domain.STATE.WARNING;

  /**
   * <string> URN of this domain with the format
   * 'eslap://<domain>/deployment/<name>/<version>'.
   */
  url: string = null;

  /**
   * An identification text that defines a realm of administrative autonomy,
   * authority or control within the Internet.
   * @param urn <string> Uniform Resource Identifier for this domain.
   * @param url <string> Direction of this domain.
   * @param state <Domain.State> Availability of this domain. Default Pending.
   * @param usedBy <string> URN of the service which uses this domain.
   */
  constructor(urn: string, url: string, state: Domain.STATE, usedBy: string) {
    super(urn, Resource.RESOURCE_TYPE.DOMAIN, usedBy);
    if (url) this.url = url;
    if (state) this.state = state;
  }

}

export module Domain {

  /** Representation of the availavility of the domain. */
  export enum STATE {
    SUCCESS = 'validated', WARNING = 'under validation', DANGER = 'erroneous'
  }

}


/**
 * Phisical data volume.
 */
export abstract class Volume extends Resource {

  /** <Volume.FILESYSTEM> Filesystem associated to this volume. */
  readonly filesystem: Volume.FILESYSTEM = Volume.FILESYSTEM.XFS;

  /** <number> Size in GB of this volume. */
  readonly size: number;

  /** <string> Volume name. */
  name: string = null;

  /** <string> Role of the service which uses this volume. */
  associatedRole: string = null;

  /** <{ [id: string]: Volume.Instance }> Instances of this volume. */
  items: { [id: string]: Volume.Instance } = {};

  /**
   * Phisical data volume
   * @param urn <string> The URN of the volume in the ECloud environment.
   * @param volumeType <Resource.RESOURCE_TYPE.PERSISTENT_VOLUME |
   *  Resource.RESOURCE_TYPE.VOLATILE_VOLUME> Type of the volume being created.
   * @param name <string> Name of the volume in the service.
   * @param size <number> Size of the volume in GB.
   * @param filesystem <Volume.FILESYSTEM> Filesystem associated to the volume.
   * @param associatedRole <string> Name of the role which uses this volume.
   * @param items <{ [id: string]: Volume.Instance }> Instances of this volume.
   * @param usedBy <string> URN of the service which uses this instance.
   */
  constructor(
    urn: string,
    volumeType: Resource.RESOURCE_TYPE.PERSISTENT_VOLUME |
      Resource.RESOURCE_TYPE.VOLATILE_VOLUME,
    name: string,
    size: number,
    filesystem?: Volume.FILESYSTEM,
    associatedRole?: string,
    items?: { [id: string]: Volume.Instance },
    usedBy?: string
  ) {

    super(urn, volumeType, usedBy);

    if (name) this.name = name;

    if (!size) {
      throw new Error('A volume must have a size associated.');
    }
    if (size <= 0) {
      throw new Error('A volume\'s size must be higher than 0.');
    }
    this.size = size;

    if (filesystem) this.filesystem = filesystem;
    if (associatedRole) this.associatedRole = associatedRole;

    if (items) this.items = items;

  }

}

export module Volume {

  /**
   * Available volume file systems.
   */
  export enum FILESYSTEM { XFS = 'XFS' }

  export class Instance {

    /** <string> The id which identifies the instance. */
    public readonly id: string;

    /** <string> The URN of the volume which this object is instance of. */
    public _urn: string = null;

    /** <string> Name of the volume in the service. */
    readonly volumeName: string;

    /** <string> Service role associated to the volume. */
    public associatedRole: string = null;

    /** <string> Service role instance associated to the volume. */
    public associatedInstance: string = null;

    public usage: number = -1;

    /**
     * Constructor of a volume instance.
     * @param id  <string> The id which identifies the instance.
     * @param volumeName <string> Name of the volume in the service.
     * @param definitionURN <string> The URN of the volume which this object is
     *  instance of.
     * @param associatedRole <string> Name of the role which makes use of this
     *  instance.
     * @param associatedInstance <sting> Name of the instance which makes use of
     *  this instance.
     * @param usage <number> Percentage of usage of the volume.
     */
    constructor(
      id: string, volumeName: string, definitionURN?: string,
      associatedRole?: string, associatedInstance?: string, usage?: number
    ) {

      if (!id) {
        throw new Error('A volume instance must have an id');
      }
      this.id = id;
      if (!volumeName) {
        throw new Error('A volume instance must reference a volume');
      }
      this.volumeName = volumeName;
      if (definitionURN) this._urn = definitionURN;
      if (associatedRole) this.associatedRole = associatedRole;
      if (associatedInstance) this.associatedInstance = associatedInstance;
      if (usage && usage < 0) {
        throw new Error('A volume usage cant be negative');
      }
      if (usage) this.usage = usage;

    }

  }

}

/**
 * Phisicall data volume which persists during reboots of the service.
 */
export class PersistentVolume extends Volume {

  /**
   * Represents a phisical data volume which won't persist on restarts.
   * @param urn <string> The URN of the volume in the ECloud environment.
   * @param name <string> Name of the volume in the service.
   * @param size <number> Size of the volume in GB.
   * @param items <{ [itemId: string]: PersistentVolume.Instance }>
   * @param associatedRole <string> Name of the role which uses this volume.
   * @param filesystem <Volume.FILESYSTEM> Filesystem used in the volume.
   * @param usedBy <string> URN of the service which uses this instance.
   */
  constructor(urn: string, name: string, size: number, items?: {
    [itemId: string]: PersistentVolume.Instance
  }, associatedRole?: string, filesystem?: Volume.FILESYSTEM, usedBy?: string) {
    super(
      urn, Resource.RESOURCE_TYPE.PERSISTENT_VOLUME, name, size, filesystem,
      associatedRole, items, usedBy
    );
  }

}


export module PersistentVolume {

  /** Instance of a Persistent volume. */
  export class Instance extends Volume.Instance {

    /**
     * Instance of a Persistent volume.
     * @param id <string> Identification of the volume in the stamp.
     * @param name <string> Name of the volume in the service.
     * @param definitionURN <string> The URN of the volume which this object is
     *  instance of.
     * @param associatedRole <string> Name of the role which uses this instance.
     * @param associatedInstance <string> Name of the instance which makes use
     *  of this instance.
     * @param usage <number> Percentage of usage of the volume.
     */
    constructor(
      id: string, name: string, definitionURN: string, associatedRole?: string,
      associatedInstance?: string, usage?: number
    ) {
      super(id, name, definitionURN, associatedRole, associatedInstance, usage);
    }

  }

}

/**
 * Represents a phisical data volume which won't persist on restarts.
 */
export class VolatileVolume extends Volume {

  /**
   * Represents a phisical data volume which won't persist on restarts.
   * @param id <string> Identification of the volume in the deployment.
   * @param name <string> Name of the volume in the stamp.
   * @param size <number> Size of the volume in GB.
   * @param items <{ [id: string]: VolatileVolume.Instance }> Instances of this
   *  volume.
   * @param filesystem <Volume.FILESYSTEM> Filesystem used in the volume.
   * @param associatedRole <string> Name of the role which uses this volume.
   * @param usedBy <string> URN of the service which uses this volume.
   */
  constructor(id: string, name: string, size: number, items?: {
    [itemId: string]: VolatileVolume.Instance
  }, filesystem?: Volume.FILESYSTEM, associatedRole?: string, usedBy?: string) {
    super(
      id, Resource.RESOURCE_TYPE.VOLATILE_VOLUME, name, size, filesystem,
      associatedRole, items, usedBy
    );
  }

}

export module VolatileVolume {

  /** Instance of a VolatileVolume. */
  export class Instance extends Volume.Instance {

    /**
     * Instance of a VolatileVolume.
     * @param id <string> Identificatio of th evolume in the deployment.
     * @param name <string> Identification of th evolume in the service.
     * @param definitionURN <string> The URN of the volume which this object is
     *  instance of.
     * @param associatedRole <string> Name of the role which uses this instance.
     * @param associatedInstance <string> Name of the instance which makes use
     *  of this isntance.
     * @param filesystem <Volume.FILESYSTEM> Filesystem used in the volume.
     */
    constructor(
      id: string, name: string, definitionURN?: string, associatedRole?: string,
      associatedInstance?: string, usage?: number
    ) {
      super(id, name, definitionURN, associatedRole, associatedInstance, usage);
    }

  }

}

/**
 * A cornfirmation of veracity of the connection.
 */
export class Certificate extends Resource {

  /** Certificate key. */
  readonly key: string;

  /** Certificate. */
  readonly cert: string;

  /** Certification authority. */
  readonly ca: string;

  /**
   * A confirmation of veracity of the connection.
   * @param urn <string> Uniform Resource Identifier for this data volume.
   * @param key <string> Key associated to the certificate.
   * @param cert <string> Certificate itself.
   * @param usedBy <string> URN of the service which uses this certificate.
   */
  constructor(
    urn: string, key: string, cert: string, ca?: string, usedBy?: string
  ) {

    super(urn, Resource.RESOURCE_TYPE.CERTIFICATE, usedBy);
    if (!key) {
      throw new Error('A certificate requires a key.');
    }
    this.key = key;
    if (!cert) {
      throw new Error('A certificate requires a cert.');
    }
    this.cert = cert;
    if (ca) this.ca = ca;

  }

}