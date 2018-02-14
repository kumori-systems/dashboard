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
  constructor(uri: string, usedBy: string[]) {
    super(uri);
    if (this.usedBy) this.usedBy = usedBy;
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
 * Phisical data volume.
 */
export class Volume extends Resource {

  readonly filesystem: Volume.FILESYSTEM;
  readonly size: number;
  items: { [id: string]: Volume.Instance } = {};

  /**
   * Phisical data volume
   * @param uri <string> Uniform Resource Identifier for this volume.
   * @param filesystem <Volume.FILESYSTEM> Filesystem associated to the volume.
   * @param size <number> Size of the volume in MB.
   */
  constructor(
    uri: string, filesystem: Volume.FILESYSTEM, size: number,
    items?: { [id: string]: Volume.Instance },
    usedBy?: string[]
  ) {

    super(uri, usedBy);

    if (!filesystem)
      throw new Error('A volume must have a filesystem associated');
    this.filesystem = filesystem;

    if (!size) throw new Error('A volume must have a size associated.');
    if (size <= 0) throw new Error('A volume\'s size must be higher than 0.');
    this.size = size;

    if (items) this.items = items;

  }
}

export module Volume {

  /**
   * Available volume file systems.
   */
  export enum FILESYSTEM { XFS = 'XFS', Ext4 = 'Ext4' }

  export class Instance {

    /** <string> The id which identifies the instance. */
    public readonly id: string;

    /** <string> The URI of the volume which this object is instance of. */
    public readonly uri: string;

    /** The disc actual usage in so much for one */
    private _usage: number = 0;

    /**
     * Constructor of a volume instance.
     * @param id  <string> The id which identifies the instance.
     * @param uri <string> The URI of the volume which this object is instance
     *  of.
     */
    constructor(id: string, uri: string) {
      if (!id) throw new Error('A volume instance must have an id');
      this.id = id;
      if (!uri) throw new Error('A volume instance must have an URI');
      this.uri = uri;
    }

    /** Sets the usage of the disc. */
    set usage(val: number) {
      if (val >= 0 && val <= 1) {
        this._usage = val;
      }
    }

    /** Retrieves the usage of the disc. */
    get usage() {
      return this._usage;
    }

  }

}

/**
 * A cornfirmation of veracity of the connection.
 */
export class Certificate extends Resource {

  /**
   * A confirmation of veracity of the connection.
   * @param uri <string> Uniform Resource Identifier for this data volume.
   */
  constructor(uri: string, usedBy: string[]) {
    super(uri, usedBy);
  }

}