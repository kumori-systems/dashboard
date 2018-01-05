import { EcloudElement } from './ecloudelement';
import {
  Channel, Connector, DependedChannel, FullConnector, LoadBalancerConnector,
  Parameter, ProvidedChannel, PublishSubscribeConnector
} from './index';

/**
 * Definition of a system for the Ecloud ecosystem.
 */
export class Service extends EcloudElement {
  /** <any> Service configuration parameters. */
  parameters: { [parameter: string]: Parameter } = {};

  /**
   * <{ [role: string]: Service.Role }> Set of behaviours and properties for a
   * component.
   */
  roles: { [role: string]: Service.Role } = {};

  /**
   * <{[resource:string]:string}> Asotiation form a name to the uri of the
   * resource.
   */
  resources: { [resource: string]: string } = {};

  /**
   * <{ [channel: string]: Service.Rol.Channel }> Set of channels which provide
   * data on connection.
   */
  providedChannels: { [channel: string]: ProvidedChannel } = {};

  /**
   * <{ [channel: string]: Service.Rol.Channel }> Set of channels which require
   * data on connection.
   */
  dependedChannels: { [channel: string]: DependedChannel } = {};

  /** <Service.Connector[]> Connections between channels in this service. */
  connectors: Connector[] = [];

  /** <string[]> Actual deployments which instance the service. */
  usedBy: string[] = [];

  /**
   * Definition of a system for the Ecloud ecosystem.
   * @param uri <string> Uniform Resource Identifier for this service.
   * @param resources <{[resource:string]:string}> Asotiation form a name to the
   *  uri of the resource.
   * @param parameters <any> Set of parameters passed to the initialitzation of
   * this service.
   * @param roles { [role: string]: Service.Role } Set of behaviours and
   * properties for a component.
   * @param providedChannels <{ [channel: string]: ProvidedChannel }> Set of
   * channels which provide data on connection.
   * @param dependedChannels <{ [channel: string]: DependedChannel }> Set of
   * channels which require data on connection.
   */
  constructor(
    uri: string, resources: { [resource: string]: string },
    parameters: { [parameter: string]: Parameter },
    roles: { [rol: string]: Service.Role },
    providedChannels: { [channel: string]: ProvidedChannel },
    dependedChannels: { [channel: string]: DependedChannel },
    connectors: Connector[]
  ) {
    super(uri);
    if (resources) this.resources = resources;
    if (parameters) this.parameters = parameters;
    if (roles) this.roles = roles;
    if (providedChannels) this.providedChannels = providedChannels;
    if (dependedChannels) this.dependedChannels = dependedChannels;
    if (connectors) this.connectors = connectors;
  }
}

export module Service {

  /** Set of behaviours and properties for a component. */
  export class Role {

    /** <string> URI of the component which will be executed as this role. */
    readonly component: string;

    /** <any> Set of parameters passed to the initialitzation of this role. */
    parameters: { [parameter: string]: Parameter } = {};

    /**
     * <{ [resource: string]: string }> Asotiation form a name to the uri of
     * the resource.
     */
    resources: { [resource: string]: string } = {};

    /**
     * Set of behaviours and properties for a component.
     * @param component <string> URI of the component which will be executed as
     * this role.
     * @param parameters <any> Set of parameters passed to the initialitzation
     * of this role.
     * @param resources <{ [resource: string]: string }> Asotiation form a name
     * to the uri of the resource.
     */
    constructor(
      component: string, parameters: { [parameter: string]: Parameter },
      resources: { [resource: string]: string }
    ) {
      if (!component) throw new Error('Invalid value for component in Role');
      this.component = component;
      if (parameters) this.parameters = parameters;
      if (resources) this.resources = resources;
    }
  }
}