import { Deployment } from './deployment';
import { Service, VolatileVolume } from './index';

/**
 * Especialitzed type of deployment with the functionality of connecting
 * another deployment to the outside.
 */
export abstract class EntryPoint extends Deployment {
  constructor(uri: string, name: string, parameters: any, service: string,
    roles: { [rol: string]: Deployment.Role },
    resourcesConfig: { [resource: string]: any },
    channels: {
      [originChannel: string]: {
        destinyChannelId: string, destinyDeploymentId: string
      }[]
    },
    volatileVolumes: { [volumeId: string]: VolatileVolume }
  ) {
    super(
      uri, name, parameters, service, roles, resourcesConfig, channels,
      volatileVolumes
    );
  }
}

export module EntryPoint {

  /** Entrypoint Types. */
  export enum TYPE {
    HTTP_INBOUND = 'eslap://eslap.cloud/services/http/inbound/1_0_0'
  };
}

/** Deployment which gives conectivity outside the stamp via http. */
export class HTTPEntryPoint extends EntryPoint {

  /** List of websites associated to the entrypoint. */
  websites: string[] = [];

  /**
   * Constructor of the HTTPEntryPoint class.
   * @param URI id of the service.
   * @param parameters parameters for the service.
   * @param roles service roles.
   * @param resourcesConfig service resources config.
   * @param channels service channel unions.
   */
  constructor(URI: string, parameters: any,
    roles: { [roleURI: string]: Deployment.Role }, resourcesConfig: any,
    channels: {
      [originChannel: string]: {
        destinyChannelId: string,
        destinyDeploymentId: string
      }[]
    }, volatileVolumes?: { [volumeId: string]: VolatileVolume }) {
    super(
      URI,
      roles && roles['sep'].configuration ?
        roles['sep'].configuration.domain : null,
      parameters,
      EntryPoint.TYPE.HTTP_INBOUND,
      roles,
      resourcesConfig,
      channels,
      volatileVolumes
    );

    if (roles && roles['sep'].configuration) {
      this.websites.push(roles['sep'].configuration.domain);
    }

  }
}