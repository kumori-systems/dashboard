import { ECloudElement } from './ecloudelement';
import { Channel } from './index';

/**
 * Component from Ecloud ecosystem.
 */
export class Component extends ECloudElement {

  /** <string> URN which identifies the component in the ECloud environment. */
  readonly _urn: string;

  /** <string> URN of the runtime used for this component. */
  runtime: string = null;

  /** <any> Set of parameters passed to the initialitzation of this component.*/
  parameters: any = null;

  /**
   * <{[resource:string]:string}> Set of parameters configuring the resources
   * used by this component.
   */
  resourcesConfig: { [resource: string]: string } = {};

  /**
   * <{ [channel: string]: Channel }> Set of channels which provide data on
   * connection.
   */
  proChannels: { [channel: string]: Channel } = {};

  /**
   * <{ [channel: string]: Channel }> Set of channels which require data on
   * connection.
   */
  reqChannels: { [channel: string]: Channel } = {};

  /** <string[]> All services which use this component*/
  usedBy: string[] = [];

  /**
   * Component from Ecloud ecosystem.
   * @param urn <string> Uniform Resource name for this element following
   * the format 'eslap://<domain>/<elmenttype>/<name>/<version>'.
   * @param runtime <string> URN of the runtime used for this component.
   * @param resourcesConfig <{[resource:string]:string}> Set of parameters
   * configuring the resources used by this component.
   * @param parameters <any> Set of parameters passed to the initialitzation of
   * this component.
   * @param proChannels <{ [channel: string]: Channel }> Set of channels which
   * provide data on connection.
   * @param reqChannels <{ [channel: string]: Channel }> Set of channels which
   * require data on connection.
   */
  constructor(urn: string, runtime: string,
    resourcesConfig: { [resource: string]: string }, parameters: any,
    proChannels: { [channel: string]: Channel },
    reqChannels: { [channel: string]: Channel }) {
    super(ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT);
    if (!urn) {
      console.error('A component needs an URN associated.');
      throw new Error('A component needs an URN associated.');
    }
    this._urn = urn;
    if (runtime) this.runtime = runtime;
    if (parameters) this.parameters = parameters;
    if (resourcesConfig) this.resourcesConfig = resourcesConfig;
    if (proChannels) this.proChannels = proChannels;
    if (reqChannels) this.reqChannels = reqChannels;
  }

}