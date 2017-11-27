import { EcloudElement } from './ecloudelement';
import { Channel } from './index';

/**
 * Component from Ecloud ecosystem.
 */
export class Component extends EcloudElement {
  /** <string> URI of the runtime used for this component. */
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
   * @param uri <string> Uniform Resource Identifier for this element following
   * the format 'eslap://<domain>/<elmenttype>/<name>/<version>'.
   * @param runtime <string> URI of the runtime used for this component.
   * @param resourcesConfig <{[resource:string]:string}> Set of parameters
   * configuring the resources used by this component.
   * @param parameters <any> Set of parameters passed to the initialitzation of
   * this component.
   * @param proChannels <{ [channel: string]: Channel }> Set of channels which
   * provide data on connection.
   * @param reqChannels <{ [channel: string]: Channel }> Set of channels which
   * require data on connection.
   */
  constructor(uri: string, runtime: string,
    resourcesConfig: { [resource: string]: string }, parameters: any,
    proChannels: { [channel: string]: Channel },
    reqChannels: { [channel: string]: Channel }) {
    super(uri);
    if (runtime) this.runtime = runtime;
    if (parameters) this.parameters = parameters;
    if (resourcesConfig) this.resourcesConfig = resourcesConfig;
    if (proChannels) this.proChannels = proChannels;
    if (reqChannels) this.reqChannels = reqChannels;
  }
}