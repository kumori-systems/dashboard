/**
 * Measurable element.
 */
export abstract class Measurable {
  /** */

  metrics: [Date, {
    'data': Metric, 'roles': {
      [roleId: string]: {
        'data': Metric, 'instances': { [instanceId: string]: Metric }
      }
    }
  }][] = [];
}

/**
 * Measure properties from Ecloud deployments.
 */
export class Metric {
  /** <Date> Date when the property was measured. */
  readonly timestamp: Date;
  /** <number> Amount of CPU. */
  readonly cpu: number;
  /** <number> Amount of RAM and SWAP used. */
  readonly memory: number;
  /** <number> Amount of incomming bandwidth. */
  readonly bandwidth_input: number;
  /** <number> Amount of outgoing bandwidth. */
  readonly bandwidth_output: number;
  /** <number> Amount of Request Per Minute. */
  readonly rpm: number;
  /** <number> Average Response time. */
  readonly res: number;


  /**
   * Measure properties from Ecloud deployments.
   * @param timestamp <Date[]> Date when the property was measured.
   * @param cpu <number[]> Amount of CPU.
   * @param memory <number[]> Amount of RAM and SWAP used.
   * @param bandwidth_input <number[]> Amount of incomming bandwidth.
   * @param bandwidth_output <number[]> Amount of outgoing bandwidth.
   * @param rpm <number[]> Amount of Request Per Minute.
   * @param res <number[]> Average Response time.
   */
  constructor(timestamp: Date, cpu: number, memory: number,
    bandwidth_input: number, bandwidth_output: number, rpm: number,
    res: number) {
    this.timestamp = timestamp;
    this.cpu = cpu;
    this.memory = memory;
    this.bandwidth_input = bandwidth_input;
    this.bandwidth_output = bandwidth_output;
    this.rpm = rpm;
    this.res = res;
  }
}