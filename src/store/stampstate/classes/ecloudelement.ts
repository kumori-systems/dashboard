/**
 * Element provided in the Ecloud ecosystem.
 */
export abstract class ECloudElement {

  /** Type which defines the element in the stamp. */
  readonly _element_type: ECloudElement.ECLOUDELEMENT_TYPE;

  /**
   * Element provided in the Ecloud ecosystem.
   * @param elementType <EcloudElement.TYPE> Type of the ecloud element.
   */
  constructor(elementType: ECloudElement.ECLOUDELEMENT_TYPE) {

    if (!elementType) throw new Error('Invalid Ecloud Type: ' + elementType);
    this._element_type = elementType;

  }
}

export module ECloudElement {

  /** Signals the kind of element. */
  export enum ECLOUDELEMENT_TYPE {
    CHANNEL = 'channel',
    COMPONENT = 'component',
    DEPLOYMENT = 'deployment',
    MANIFEST = 'manifest',
    PARAMETER = 'parameter',
    PROTOCOL = 'protocol',
    RESOURCE = 'resource',
    RUNTIME = 'runtime',
    SERVICE = 'service'
  };

}