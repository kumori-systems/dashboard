import { Deployment } from './deployment';
import { Service } from './index';

export abstract class EntryPoint extends Deployment { }

export module EntryPoint {
  export enum TYPE {
    HTTP_INBOUND = 'eslap://eslap.cloud/services/http/inbound/1_0_0'
  };
  /**
   * Gets if a element is a entrypoint.
  * @param service <string> URI of the service which defines this deployment.
  */
  export function isEntrypoint(p: Service | Deployment | string): boolean {
    let res: TYPE;
    switch (typeof p) {
      case 'string':
        try {
          res = <TYPE>(<string>p);
        } catch (e) {
          return false;
        }
      case 'object':
        let elementType: string = null;
        try {
          elementType = (<any>p).URI.split('/')[2];
        } catch (e) {
          // If there is no URI, then p is a wrong type of object
          throw new Error('isEntrypoint expects a Service, a Deployment or a'
            + ' String');
        }
        switch (elementType) {
          case 'deployment':
            res = <TYPE>(<string>((<Deployment>p).service));
            break;
          case 'service':
            res = <TYPE>(<string>((<Service>p)._uri));
            break;
          default:
            // If it's nor a deployment or a service maybe it's a component
            throw new Error('isEntrypoint expects a Service, a Deployment or a'
              + ' String');
        }
      default:
        // Nor string or object is not a valid type
        throw new Error('isEntrypoint expects a Service, a Deployment or a'
          + ' String');
    }
  }
}

/**
 * Especialitzed type of deployment with the functionality of connecting another
 * deployment to the outside.
 */
export class HTTPEntryPoint extends EntryPoint {
  entryPointMetrics: HTTPEntryPoint.Metrics = null;
  websites: string[] = [];
  constructor(URI: string, parameters: any,
    roles: { [roleURI: string]: Deployment.Role }, resourcesConfig: any,
    links: Deployment.Link[]) {
    super(
      URI,
      roles && roles['sep'].configuration ?
      roles['sep'].configuration.domain : null,
      parameters,
      EntryPoint.TYPE.HTTP_INBOUND,
      roles,
      resourcesConfig,
      links);

    // TODO: The configuration should be given in a future ticket
    if (roles && roles['sep'].configuration)
      this.websites.push(roles['sep'].configuration.domain);
  }
}
export module HTTPEntryPoint {
  /**
   *  Measure properties from Ecloud HTTP Entrypoints.
   */
  export class Metrics {
    time: Date[] = [];
    timestamp_init: number[] = [];
    timestamp_end: number[] = [];
    elapsed_msec: number[] = [];
    http_requests_per_second: number[] = [];
    http_errors_per_second: number[] = [];
    http_size_in_per_second: number[] = [];
    http_size_out_per_second: number[] = [];
    http_chunk_in_per_second: number[] = [];
    http_chunk_out_per_second: number[] = [];
    http_response_time: number[] = [];
    ws_size_in_per_second: number[] = [];
    ws_size_out_per_second: number[] = [];
    ws_chunk_in_per_second: number[] = [];
    ws_chunk_out_per_second: number[] = [];

    /**
     * Measure properties from Ecloud HTTP Entrypoints.
     */
    constructor();
    /**
     * Measure properties from Ecloud HTTP Entrypoints.
     * @param time <Date[]> Date when the property was measured.
     * @param timestamp_init 
     * @param timestamp_end 
     * @param elapsed_msec 
     * @param http_requests_per_second 
     * @param http_errors_per_second 
     * @param http_size_in_per_second 
     * @param http_size_out_per_second 
     * @param http_chunk_in_per_second 
     * @param http_chunk_out_per_second 
     * @param http_response_time 
     * @param ws_size_in_per_second 
     * @param ws_size_out_per_second 
     * @param ws_chunk_in_per_second 
     * @param ws_chunk_out_per_second 
     */
    constructor(time?: Date, timestamp_init?: number, timestamp_end?: number,
      elapsed_msec?: number, http_requests_per_second?: number,
      http_errors_per_second?: number, http_size_in_per_second?: number,
      http_size_out_per_second?: number, http_chunk_in_per_second?: number,
      http_chunk_out_per_second?: number, http_response_time?: number,
      ws_size_in_per_second?: number, ws_size_out_per_second?: number,
      ws_chunk_in_per_second?: number, ws_chunk_out_per_second?: number) {
      if (time) this.time.push(time);
      if (timestamp_init) this.timestamp_init.push(timestamp_init);
      if (timestamp_end) this.timestamp_end.push(timestamp_end);
      if (elapsed_msec) this.elapsed_msec.push(elapsed_msec);
      if (http_requests_per_second)
        this.http_requests_per_second.push(http_requests_per_second);
      if (http_errors_per_second)
        this.http_errors_per_second.push(http_errors_per_second);
      if (http_size_in_per_second)
        this.http_size_in_per_second.push(http_size_in_per_second);
      if (http_size_out_per_second)
        this.http_size_out_per_second.push(http_size_out_per_second);
      if (http_chunk_in_per_second)
        this.http_chunk_in_per_second.push(http_chunk_in_per_second);
      if (http_chunk_out_per_second)
        this.http_chunk_out_per_second.push(http_chunk_out_per_second);
      if (http_response_time) this.http_response_time.push(http_response_time);
      if (ws_size_in_per_second)
        this.ws_size_in_per_second.push(ws_size_in_per_second);
      if (ws_size_out_per_second)
        this.ws_size_out_per_second.push(ws_size_out_per_second);
      if (ws_chunk_in_per_second)
        this.ws_chunk_in_per_second.push(ws_chunk_in_per_second);
      if (ws_chunk_out_per_second)
        this.ws_chunk_out_per_second.push(ws_chunk_out_per_second);
    }

    /**
     *  Adds some values to the metrics
     */
    addValues(em: HTTPEntryPoint.Metrics): void {
      for (let i in em.time) {
        this.time.push(em.time[i]);
        this.timestamp_init.push(em.timestamp_init[i]);
        this.timestamp_end.push(em.timestamp_end[i]);
        this.elapsed_msec.push(em.elapsed_msec[i]);
        this.http_requests_per_second.push(em.http_requests_per_second[i]);
        this.http_errors_per_second.push(em.http_errors_per_second[i]);
        this.http_size_in_per_second.push(em.http_size_in_per_second[i]);
        this.http_size_out_per_second.push(em.http_size_out_per_second[i]);
        this.http_chunk_in_per_second.push(em.http_chunk_in_per_second[i]);
        this.http_chunk_out_per_second.push(em.http_chunk_out_per_second[i]);
        this.http_response_time.push(em.http_response_time[i]);
        this.ws_size_in_per_second.push(em.ws_size_in_per_second[i]);
        this.ws_size_out_per_second.push(em.ws_size_out_per_second[i]);
        this.ws_chunk_in_per_second.push(em.ws_chunk_in_per_second[i]);
        this.ws_chunk_out_per_second.push(em.ws_chunk_out_per_second[i]);
      }
    }
    getFormattedMetrics() {
      return {
        labels: this.time,
        datasets: [
          {
            label: 'http_requests_per_second',
            backgroundColor: '#1fc8db',
            borderColor: '#1fc8db',
            fill: false,
            data: this.http_requests_per_second
          },
          {
            label: 'http_errors_per_second',
            backgroundColor: '#fce473',
            borderColor: '#fce473',
            fill: false,
            data: this.http_errors_per_second
          },
          {
            label: 'http_size_in_per_second',
            backgroundColor: '#42afe3',
            borderColor: '#42afe3',
            fill: false,
            data: this.http_size_in_per_second
          },
          {
            label: 'http_size_out_per_second',
            backgroundColor: '#9999ff',
            borderColor: '#9999ff',
            fill: false,
            data: this.http_size_out_per_second
          },
          {
            label: 'http_response_time',
            backgroundColor: '#ed6c63',
            borderColor: '#ed6c63',
            fill: false,
            data: this.http_response_time
          },
          {
            label: 'ws_size_in_per_second',
            backgroundColor: '#97cd76',
            borderColor: '#97cd76',
            fill: false,
            data: this.ws_size_in_per_second
          },
          {
            label: 'ws_size_out_per_second',
            backgroundColor: '##ffb366',
            borderColor: '##ffb366',
            fill: false,
            data: this.ws_size_out_per_second
          }
        ]
      };
    }
  }
}