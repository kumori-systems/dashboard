import { ECloudElement } from './ecloudelement';

/**
 * Document which defines an element in the ECloud environment.
 */
export class Manifest extends ECloudElement {

  /** Uniform Resource Name which identifies this manifest in the stamp. */
  readonly _urn: string;

  /** Type of manifest for manifest editor. */
  readonly _type: string;

  /** Deployment which uses this element. */
  deployment: string = null;

  /** Subitems of this element. */
  items: any = null;

  /** Name of this element. */
  name: string = null;

  /** Owner of this element. */
  owner: string = null;

  /** Parameters of this element. */
  parameters: string = null;

  /** Type of this element. */
  type: string = null;

  /** Channels of a service or a component. */
  channels: any = null;

  /** Connectors of a service. */
  connectors: any = null;

  /** Component or runtime code. */
  code: string = null;

  /** Component or runtime code. */
  codelocator: string = null;

  /** Configuration parameters of this element. */
  configuration: any = {};

  /** This element's metadata. */
  metadata: any = {};

  /** This element's profile. */
  profile: any = {};

  /** Component's runtime */
  runtime: string = null;

  /** Specification of the element. */
  spec: string = null;

  /**
   * Document which defines an element in the ECloud environment.
   */
  constructor(urn, manifest) {
    super(ECloudElement.ECLOUDELEMENT_TYPE.MANIFEST);
    this._urn = urn;
    if (manifest.deployment) { this.deployment = manifest.deployment; }
    if (manifest.items) { this.items = manifest.items; }
    if (manifest.name) { this.name = manifest.name; }
    if (manifest.owner) { this.owner = manifest.owner; }
    if (manifest.parameters) { this.parameters = manifest.parameters; }
    if (manifest.type) { this.type = manifest.type; }
    if (manifest.channels) { this.channels = manifest.channels; }
    if (manifest.connectors) { this.connectors = manifest.connectors; }
    if (manifest.code) { this.code = manifest.code; }
    if (manifest.codelocator) { this.codelocator = manifest.codelocator; }
    if (manifest.configuration) { this.configuration = manifest.configuration; }
    if (manifest.metadata) { this.metadata = manifest.metadata; }
    if (manifest.profile) { this.profile = manifest.profile; }
    if (manifest.runtime) { this.runtime = manifest.runtime; }
    if (manifest.spec) { this.spec = manifest.spec; }

    /* For manifest editor - INIT */
    try {
      let spec = this.spec ? this.spec.split('/') :
        this.type ? this.type.split('/') :
          this._urn.split('/');

      if (spec[3] === 'manifest') {
        this._type = spec[spec.length - 2];
      } else {
        this._type = spec[3];
      }
    } catch (error) {
      console.error('Error: ' + error);
    }
    /* For manifest editor - END */
  }

}