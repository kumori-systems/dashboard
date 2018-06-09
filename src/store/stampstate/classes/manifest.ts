import { ECloudElement } from './ecloudelement';

/**
 * Document which defines an element in the ECloud environment.
 */
export class Manifest extends ECloudElement {

  /** Uniform Resource Name which identifies this manifest in the stamp. */
  readonly _urn: string;

  /** Label used for manifest editor. */
  readonly label: string;

  /** This holds the real type */
  _type: string = undefined;

  /** Type used for the manifest editor. */
  type: string = undefined;

  /** The name of the service implemented by this deployment. */
  servicename: string = undefined;

  /** Deployment which uses this element. */
  deployment: string = undefined;

  /** When a runtime is derived from another one. */
  derived: string = undefined;

  /** Subitems of this element. */
  items: any = undefined;

  /** Name of this element. */
  name: string = undefined;

  /** Owner of this element. */
  owner: string = undefined;

  /** Parameters of this element. */
  parameters: string = undefined;

  /** Channels of a service or a component. */
  channels: any = undefined;

  /** Connectors of a service. */
  connectors: any = undefined;

  /** Component or runtime code. */
  code: string = undefined;

  /** Component or runtime code. */
  codelocator: string = undefined;

  /** Configuration parameters of this element. */
  configuration: any = undefined;

  /** This element's metadata. */
  metadata: any = undefined;

  /** This element's profile. */
  profile: any = undefined;

  /** Service roles. */
  roles: any = undefined;

  /** Component's runtime */
  runtime: string = undefined;

  resources: any = undefined;

  interconnection: any = undefined;

  /** Specification of the element. */
  spec: string = undefined;

  /** Runtime sourcedir. */
  sourcedir: string = undefined;

  /** Runtime entrypoint. */
  entrypoint: string = undefined;

  /** Runtime agent. */
  agent: string = undefined;

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
    if (manifest.type) { this._type = manifest.type; }
    if (manifest.channels) { this.channels = manifest.channels; }
    if (manifest.connectors) { this.connectors = manifest.connectors; }
    if (manifest.code) { this.code = manifest.code; }
    if (manifest.codelocator) { this.codelocator = manifest.codelocator; }
    if (manifest.configuration) { this.configuration = manifest.configuration; }
    if (manifest.metadata) { this.metadata = manifest.metadata; }
    if (manifest.profile) { this.profile = manifest.profile; }
    if (manifest.roles) { this.roles = manifest.roles; }
    if (manifest.runtime) { this.runtime = manifest.runtime; }
    if (manifest.spec) { this.spec = manifest.spec; }
    if (manifest.service) { this.servicename = manifest.service; }
    if (manifest.derived) { this.derived = manifest.derived; }
    if (manifest.interconnection) {
      this.interconnection = manifest.interconnection;
    }
    if (manifest.resources) {
      this.resources = manifest.resources;
    }
    if (manifest.sourcedir) { this.sourcedir = manifest.sourcedir; }
    if (manifest.entrypoint) { this.entrypoint = manifest.entrypoint; }
    if (manifest.agent) { this.agent = manifest.agent; }

    /* For manifest editor - INIT */
    this.label = this._urn;
    try {
      let spec = this.spec ? this.spec.split('/') :
        this._type ? this._type.split('/') :
          this._urn.split('/');

      if (spec[3] === 'manifest') {
        this.type = spec[spec.length - 2];
      } else {
        this.type = spec[3];
      }
    } catch (error) {
      /*
      console.error('Error: ' + error);
      */
    }
    /* For manifest editor - END */
  }

}