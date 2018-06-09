import { ECloudElement } from './ecloudelement';

/**
 * Conjunction of software to support the execution of a component.
 */
export class Runtime extends ECloudElement {

  /** Uniform Resource Name which identifies this runtime in the stamp. */
  readonly _urn: string;

  derived_from: string = null;
  sourcedir: string = null;
  entrypoint: string = null;

  metadata: {
    description?: string,
    os_name?: string,
    os_version?: string,
    os_release?: string,
    software?: {
      [key: string]: any
    }
  } = null;

  /** All components whicha are actually using this runtime. */
  usedBy: string[] = [];

  /**
   * Conjunction of software to support the execution of a component.
   * @param urn <string> Uniform Resource Name for this runtime.
   */
  constructor(
    urn: string, derivedFrom?: string, sourcedir?: string, entrypoint?: string,
    metadata?: {
      description?: string,
      os_name?: string,
      os_version?: string,
      os_release?: string,
      software?: {
        [key: string]: any
      }
    }
  ) {

    super(ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME);
    if (!urn) {
      console.error('A runtime requires an URN');
      throw new Error('A runtime requires an URN');
    }
    this._urn = urn;

    if (derivedFrom) { this.derived_from = derivedFrom; }
    if (sourcedir) { this.sourcedir = sourcedir; }
    if (entrypoint) { this.entrypoint = entrypoint; }
    if (metadata) { this.metadata = metadata; }
  }

}