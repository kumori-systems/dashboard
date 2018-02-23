import { EcloudElement } from './ecloudelement';

/**
 * Phisical or virtual component of linited availability within a computer or
 * information management system. Includes means for input, processing, output,
 * communication and storage.
 */
export abstract class Resource extends EcloudElement {

  usedBy: string[] = [];
  /**
   * Phisical or virtual component of linited availability within a computer or
   * information management system. Includes means for input, processing,
   * output, communication and storage.
   * @param uri <string> Uniform Resource Identifier for this resource.
   */
  constructor(uri: string, usedBy?: string[]) {
    super(uri);
    if (usedBy) this.usedBy = usedBy;
  }

}

/**
 * An identification text that defines a realm of administrative autonomy,
 * authority or control within the Internet.
 */
export class Domain extends Resource {

  /** <domain.State> Availability of this domain. Default WARNING. */
  state: Domain.STATE = Domain.STATE.WARNING;
  /** <string> Direction of this domain.*/
  url: string = null;
  /**
   * An identification text that defines a realm of administrative autonomy,
   * authority or control within the Internet.
   * @param uri <string> Uniform Resource Identifier for this domain.
   * @param url <string> Direction of this domain.
   * @param state <Domain.State> Availability of this domain. Default Pending.
   */
  constructor(uri: string, url: string, state: Domain.STATE, usedBy: string[]) {
    super(uri, usedBy);
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
 * Represents a phisical data volume which won't persist on restarts.
 */
export class VolatileVolume {

  /** <string> Identification of the volume in the deployment. */
  readonly id: string;

  /** <number> Size of the volume in GB. */
  readonly size: number;

  filesystem: Volume.FILESYSTEM = Volume.FILESYSTEM.XFS;

  /**
   * <{ [itemId: string]: VolatileVolume.Instance }> Instances of the volatile
   * volume.
   */
  items: { [itemId: string]: VolatileVolume.Instance };

  /**
   * Represents a phisical data volume which won't persist on restarts.
   * @param id <string> Identification of the volume in the deployment.
   * @param size <number> Size of the volume in GB.
   */
  constructor(id: string, size: number, items?: {
    [itemId: string]: VolatileVolume.Instance
  }, filesystem?: Volume.FILESYSTEM) {

    if (!id) throw new Error('Volatile volumes require an id');
    this.id = id;

    if (!size) throw new Error('Volatile volumes require a size');
    this.size = size;

    if (items) this.items = items;
    if (filesystem) this.filesystem = filesystem;
  }
}

export module VolatileVolume {
  export class Instance {

    readonly id: string;
    name: string;
    associatedRole: string;
    associatedInstance: string;

    constructor(
      id: string, name: string, associatedRole?: string,
      associatedInstance?: string, filesystem?: Volume.FILESYSTEM
    ) {
      if (!id) throw new Error('Volatile volumes instances require an id');
      this.id = id;
      if (name) this.name = name;
      if (associatedRole) this.associatedRole = associatedRole;
      if (associatedInstance) this.associatedInstance = associatedInstance;
    }

  }
}

/**
 * Phisical data volume.
 */
export class Volume extends Resource {

  filesystem: Volume.FILESYSTEM = Volume.FILESYSTEM.XFS;
  readonly size: number;
  items: { [id: string]: Volume.Instance } = {};
  name: string = '';

  /**
   * Phisical data volume
   * @param uri <string> Uniform Resource Identifier for this volume.
   * @param filesystem <Volume.FILESYSTEM> Filesystem associated to the volume.
   * @param size <number> Size of the volume in GB.
   */
  constructor(
    uri: string,
    size: number,
    filesystem?: Volume.FILESYSTEM,
    items?: { [id: string]: Volume.Instance },
    usedBy?: string
  ) {

    super(uri, [usedBy]);

    if (!size) throw new Error('A volume must have a size associated.');
    if (size <= 0) throw new Error('A volume\'s size must be higher than 0.');
    this.size = size;

    if (filesystem)
      this.filesystem = filesystem;

    if (items) this.items = items;

    let array = this._name.split('/');
    for (let i = 1; i < array.length; i++)
      this.name += array[i];

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

    /** <string> The URI of the volume which this object is instance of. */
    public uri: string = null;

    /** <string> Service role associated to the volume. */
    public associatedRole: string = null;

    /** <string> Service role instance associated to the volume. */
    public associatedInstance: string = null;

    /**
     * Constructor of a volume instance.
     * @param id  <string> The id which identifies the instance.
     * @param uri <string> The URI of the volume which this object is instance
     *  of.
     */
    constructor(
      id: string, uri?: string, associatedRole?: string,
      associatedInstance?: string
    ) {
      if (!id) throw new Error('A volume instance must have an id');
      this.id = id;
      if (uri) this.uri = uri;
      if (associatedRole) this.associatedRole = associatedRole;
      if (associatedInstance) this.associatedInstance = associatedInstance;
    }

  }

}

/**
 * A cornfirmation of veracity of the connection.
 */
export class Certificate extends Resource {

  /** Certificate key. */
  key: string;

  /** Certificate. */
  cert: string;

  /**
   * A confirmation of veracity of the connection.
   * @param uri <string> Uniform Resource Identifier for this data volume.
   */
  constructor(uri: string, key: string, cert: string, usedBy: string[]) {
    super(uri, usedBy);
    if (key) this.key = key;
    if (cert) this.cert = cert;
  }

}