import { ECloudElement } from './ecloudelement';

/**
 * Relation between two elements.
 */
export abstract class Channel extends ECloudElement {

  /** <string> Readable identifier of this channel. */
  readonly name: string;

  /** <Channel.Type> Type of connection provided by this channel. */
  readonly type: Channel.CHANNEL_TYPE;

  /** <string> Protocol which is running this channel. */
  protocol: string = null;

  /**
   * Connection which alows a role to send or receive data from other ecloud
   * elements.
   * @param name <string> Readable identifier of this channel.
   * @param type <Channel.Type> Type of connection provided by this channel.
   * @param protocol <string> Protocol which is running this channel.
   */
  constructor(name: string, type: Channel.CHANNEL_TYPE, protocol: string) {
    super(ECloudElement.ECLOUDELEMENT_TYPE.CHANNEL);
    if (!name) this.name = name;
    if (!type) {
      throw new Error('Invalid Type for Channel: ' + type);
    }
    this.type = type;
    if (!protocol) this.protocol = protocol;
  }
}

export module Channel {

  /** Indicates how the channel can be used from within the element. */
  export enum CHANNEL_TYPE {
    REQUEST = 'request',
    REPLY = 'reply',
    SEND = 'send',
    RECEIVE = 'receive',
    DUPLEX = 'duplex',
    ENDPOINT_REQUEST = 'endpoint_request',
    ENDPOINT_REPLY = 'endpoint_Reply'
  };

}

/** Give access the provided function set of the element. */
export class ProvidedChannel extends Channel {

  /** Allowed type of channels for a ProvidedChannel */
  readonly allowedTypes: Channel.CHANNEL_TYPE[] = [
    Channel.CHANNEL_TYPE.REPLY, Channel.CHANNEL_TYPE.RECEIVE,
    Channel.CHANNEL_TYPE.SEND,
    Channel.CHANNEL_TYPE.DUPLEX, Channel.CHANNEL_TYPE.ENDPOINT_REQUEST,
    Channel.CHANNEL_TYPE.ENDPOINT_REPLY
  ];

  /**
   * Give access the provided function set of the element.
   * @param name <string> Readable identifier of this channel.
   * @param type <Channel.Type> Type of connection provided by this channel.
   * @param protocol <string> Protocol which is running this channel. 
   */
  constructor(name: string, type: Channel.CHANNEL_TYPE, protocol: string) {
    super(name, type, protocol);
    if (this.allowedTypes.indexOf(type) === -1) {
      throw new Error('Invalid Type for ProvidedChannel: ' + type);
    }
  }

}

/** Gives a element access to it's dependencies. */
export class DependedChannel extends Channel {

  /** Allowed type of channels for a DependedChannel */
  readonly allowedTypes: Channel.CHANNEL_TYPE[] = [
    Channel.CHANNEL_TYPE.SEND,
    Channel.CHANNEL_TYPE.RECEIVE,
     Channel.CHANNEL_TYPE.REQUEST,
    Channel.CHANNEL_TYPE.DUPLEX, Channel.CHANNEL_TYPE.ENDPOINT_REQUEST,
    Channel.CHANNEL_TYPE.ENDPOINT_REPLY
  ];

  /**
   * Gives a element access to it's dependencies.
   * @param name <string> Readable identifier of this channel.
   * @param type <Channel.Type> Type of connection provided by this channel.
   * @param protocol <string> Protocol which is running this channel.
   */
  constructor(name: string, type: Channel.CHANNEL_TYPE, protocol: string) {
    super(name, type, protocol);
    if (this.allowedTypes.indexOf(type) === -1) {
      throw new Error('Invalid Type for DependededChannel: ' + type);
    }
  }

}

/**
 * Connects two channels. Can connect a service channel to a role channel or a
 * role channel to another role channel.
 */
export abstract class Connector {

  /** <ProvidedChannel[]> Collection of send channels. */
  provided: Connector.Direction[] = [];

  /** <DependedChannel[]> Collection of receive channels. */
  depended: Connector.Direction[] = [];

  /**
   * Creates a connection between two stamp elements
   * @param provided components which give information.
   * @param depended components which require information.
   */
  constructor(provided: Connector.Direction[],
    depended: Connector.Direction[]) {
    if (!provided) {
      throw new Error('Invalid value for provided in Connector');
    }

    if (provided.length === 0) {
      throw new Error('Number of channels must be > 0.');
    }

    this.provided = provided;

    if (!depended) {
      throw new Error('Invalid value for depended in Connector');
    }
    if (depended.length === 0) {
      throw new Error('Number of channels must be > 0.');
    }

    this.depended = depended;
  };

}

export module Connector {

  export class Direction {

    /** URN of the element where we make the connection. */
    endpoint: string = null;

    /** Role where we are connecting from or to. */
    role: string = null;

    /**
     * One point of the connection.
     * @param endpoint deployment.
     * @param role role.
     */
    constructor(endpoint: string, role: string) {
      if (endpoint) this.endpoint = endpoint;
      if (role) this.role = role;
    }

  }

}

/**
 * Designed to relate a set of request channels with a set of reply
 * channels.
 */
export class LoadBalancerConnector extends Connector {

  /**
   * Designed to relate a set of request channels with a set of reply channels.
   * @param provided <ProvidedChannel[]> Collection of reply channels.
   * @param depended <DependedChannel[]> Collection of request channels.
   */
  constructor(provided: Connector.Direction[],
    depended: Connector.Direction[]) {

    super(provided, depended);

  }

}

/**
 * Messages send through one of the attached send channels are broadcasted to
 * all attached receive channels.
 */
export class PublishSubscribeConnector extends Connector {

  /**
   * Messages send through one of the attached send channels are broadcasted to
   * all attached receive channels.
   * @param provided <ProvidedChannel[]> Collection of send channels.
   * @param depended <DependedChannel[]> <DependedChannel[]> Collection of
   * receive channels.
   */
  constructor(provided: Connector.Direction[],
    depended: Connector.Direction[]) {

    super(provided, depended);

  }

}

/**
 * Pairs two list of dependent duplex channels. A message sent from a channel in
 * on list will be reveiced by a role instance with a channel from the other
 * list.
 */
export class FullConnector extends Connector {

  /**
   * Messages send through one of the attached send channels are broadcasted to
   * all attached receive channels.
   * @param provided <ProvidedChannel[]> Collection of duplex channels.
   * @param depended <DependedChannel[]> <DependedChannel[]> Collection of
   * duplex channels.
   */
  constructor(provided: Connector.Direction[],
    depended: Connector.Direction[]) {

    super(provided, depended);

  }

}