import { Deployment } from './deployment';
import { Service, VolatileVolume } from './index';

import { config } from '../../../api';

export function addPortToURL(url: string): string {
  let res: string = url;

  let pointer: number = res.length;

  if (res.indexOf('/') >= 0) {
    pointer = res.indexOf('/');
  }

  if ((<any>config).PORT) {
    res = res.substring(0, pointer) + ':' + (<any>config).PORT
      + res.substring(pointer, res.length);
  }

  return res;
}


/**
 * Especialitzed type of deployment with the functionality of connecting
 * another deployment to the outside.
 */
export abstract class EntryPoint extends Deployment {
  constructor(urn: string, name: string, parameters: any, service: string,
    roles: { [rol: string]: Deployment.Role },
    resourcesConfig: { [resource: string]: any },
    channels: {
      [originChannel: string]: {
        destinyChannelId: string, destinyDeploymentId: string
      }[]
    }
  ) {
    super(urn, name, parameters, service, roles, resourcesConfig, channels);
  }
}

export module EntryPoint {

  /** Entrypoint Types. */
  export enum ENTRYPOINT_TYPE {
    HTTP_INBOUND = 'eslap://eslap.cloud/services/http/inbound/1_0_0'
  };

}

/** Deployment which gives conectivity outside the stamp via http. */
export class HTTPEntryPoint extends EntryPoint {

  /** List of websites associated to the entrypoint. */
  websites: { url: string, text: string }[] = [];

  /**
   * Constructor of the HTTPEntryPoint class.
   * @param URN id of the service.
   * @param parameters parameters for the service.
   * @param roles service roles.
   * @param resourcesConfig service resources config.
   * @param channels service channel unions.
   */
  constructor(URN: string, parameters: any,
    roles: { [roleURN: string]: Deployment.Role }, resourcesConfig: any,
    channels: {
      [originChannel: string]: {
        destinyChannelId: string,
        destinyDeploymentId: string
      }[]
    }, volatileVolumes?: { [volumeId: string]: VolatileVolume }) {

    super(
      URN,
      roles && roles['sep'].configuration ?
        roles['sep'].configuration.domain : null,
      parameters,
      EntryPoint.ENTRYPOINT_TYPE.HTTP_INBOUND,
      roles,
      resourcesConfig,
      channels
    );

    if (roles && roles['sep'].configuration) {
      this.websites.push(
        {
          url: addPortToURL(roles['sep'].configuration.domain),
          text: roles['sep'].configuration.domain
        }

      );
    }

  }

}