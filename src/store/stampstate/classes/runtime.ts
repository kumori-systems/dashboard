import { ECloudElement } from './ecloudelement';

/**
 * Conjunction of software to support the execution of a component.
 */
export class Runtime extends ECloudElement {

  /** Uniform Resource Name which identifies this runtime in the stamp. */
  readonly _urn: string;

  /** All components whicha are actually using this runtime. */
  usedBy: string[] = [];

  /**
   * Conjunction of software to support the execution of a component.
   * @param urn <string> Uniform Resource Name for this runtime.
   */
  constructor(urn: string) {

    super(ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME);
    if (!urn) {
      console.error('A runtime requires an URN');
      throw new Error('A runtime requires an URN');
    }
    this._urn = urn;

  }

}