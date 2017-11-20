import { EcloudElement } from './ecloudelement';
import { } from './index';

/**
 * Conjunction of software to support the execution of a component.
 */
export class Runtime extends EcloudElement {
  /**
   * Conjunction of software to support the execution of a component.
   * @param uri <string> Uniform Resource Identifier for this runtime.
   */
  constructor(uri: string) {
    super(uri);
  }
}