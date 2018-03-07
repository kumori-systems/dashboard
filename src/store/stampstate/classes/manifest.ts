import { ECloudElement } from './ecloudelement';

/**
 * Document which defines an element in the ECloud environment.
 */
export class Manifest extends ECloudElement {

  /**
   * Document which defines an element in the ECloud environment.
   */
  constructor() {
    super(ECloudElement.ECLOUDELEMENT_TYPE.MANIFEST);
  }

}