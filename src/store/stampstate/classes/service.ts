import { ECloudElement } from './ecloudelement';
import {
  Channel, Connector, DependedChannel, FullConnector, LoadBalancerConnector,
  Parameter, ProvidedChannel, PublishSubscribeConnector
} from './index';

/**
 * Definition of a system for the Ecloud ecosystem.
 */
export class Service extends ECloudElement {

  /** Identifier of the service in the stamp. */
  readonly _urn: string;

  /** <any> Service configuration parameters. */
  parameters: { [parameter: string]: Parameter } = {};

  /**
   * <{ [role: string]: Service.Role }> Set of behaviours and properties for a
   * component.
   */
  roles: { [role: string]: Service.Role } = {};

  /**
   * <{[resource:string]:string}> Asotiation form a name to the urn of the
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
   * @param urn <string> Uniform Resource Name for this service.
   * @param resources <{[resource:string]:string}> Asotiation form a name to the
   *  urn of the resource.
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
    urn: string, resources: { [resource: string]: string },
    parameters: { [parameter: string]: Parameter },
    roles: { [rol: string]: Service.Role },
    providedChannels: { [channel: string]: ProvidedChannel },
    dependedChannels: { [channel: string]: DependedChannel },
    connectors: Connector[]
  ) {

    super(ECloudElement.ECLOUDELEMENT_TYPE.SERVICE);
    if (!urn) throw new Error('A service requires an URN');
    this._urn = urn;
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

    /** <string> URN of the component which will be executed as this role. */
    readonly component: string;

    /** <any> Set of parameters passed to the initialitzation of this role. */
    parameters: { [parameter: string]: Parameter } = {};

    /**
     * <{ [resource: string]: string }> Asotiation form a name to the urn of
     * the resource.
     */
    resources: { [resource: string]: string } = {};

    /**
     * Set of behaviours and properties for a component.
     * @param component <string> URN of the component which will be executed as
     * this role.
     * @param parameters <any> Set of parameters passed to the initialitzation
     * of this role.
     * @param resources <{ [resource: string]: string }> Asotiation form a name
     * to the urn of the resource.
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