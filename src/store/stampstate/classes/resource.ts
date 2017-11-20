import { EcloudElement } from './ecloudelement';

/**
 * Phisical or virtual component of linited availability within a computer or
 * information management system. Includes means for input, processing, output,
 * communication and storage.
 */
export abstract class Resource extends EcloudElement {
  /**
   * Phisical or virtual component of linited availability within a computer or
   * information management system. Includes means for input, processing,
   * output, communication and storage.
   * @param uri <string> Uniform Resource Identifier for this resource.
   */
  constructor(uri: string) {
    super(uri);
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
  constructor(uri: string, url: string, state: Domain.STATE) {
    super(uri);
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
  /**
   * Phisical data volume
   * @param uri <string> Uniform Resource Identifier for this volume.
   */
  constructor(uri: string) {
    super(uri);
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
  constructor(uri: string) {
    super(uri);
  }
}