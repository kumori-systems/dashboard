import { ECloudElement } from './ecloudelement';

/**
 * Document which defines an element in the ECloud environment.
 */
export class Manifest extends ECloudElement {

  /** Uniform Resource Name which identifies this manifest in the stamp. */
  readonly _urn: string;

  /** The manifest itself */
  manifest: Object = null;

  /**
   * Document which defines an element in the ECloud environment.
   */
  constructor(urn, manifest) {
    super(ECloudElement.ECLOUDELEMENT_TYPE.MANIFEST);
    this._urn = urn;
    this.manifest = manifest;

    /* For manifest editor - INIT */
    console.debug('Manifest contains: ', manifest);
    try {
      let spec = manifest.spec ? manifest.spec.split('/') :
        manifest.type ? manifest.type.split('/') :
          manifest.urn.split('/');
      let type: string;
      if (spec[3] === 'manifest') {
        type = spec[spec.length - 2];
      } else {
        type = spec[3];
      }
      this.manifest['_type'] = type;
      this.manifest['_filePath'] = this._urn;

    } catch (error) {
      console.error('Error: ' + error);
    }
    /* For manifest editor - END */
  }

}