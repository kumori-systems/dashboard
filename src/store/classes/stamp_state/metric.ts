export class Metric {
  readonly timestamp: Date;
  readonly cpu: number;
  readonly memory: number;
  readonly bandwith_input: number;
  readonly bandwith_output: number;
  readonly rpm: number;
  readonly res: number;

  /**
   * 
   * @param timestamp 
   * @param cpu 
   * @param memory 
   * @param bandwith_input 
   * @param bandwith_output 
   * @param rpm 
   * @param res 
   */
  constructor(timestamp: Date, cpu: number, memory: number, bandwith_input: number, bandwith_output: number, rpm: number, res: number) {
    this.timestamp = timestamp;
    this.cpu = cpu;
    this.memory = memory;
    this.bandwith_input = bandwith_input;
    this.bandwith_output = bandwith_output;
    this.rpm = rpm;
    this.res = res;
  }
}

export class EPMetrics extends Metric {
  readonly timestamp_init: number;
  readonly timestamp_end: number;
  readonly elapsed_msec: number;
  readonly http_requests_per_second: number;
  readonly http_errors_per_second: number;
  readonly http_size_in_per_second: number;
  readonly http_size_out_per_second: number;
  readonly http_chunk_in_per_second: number;
  readonly http_chunk_out_per_second: number;
  readonly http_response_time: number;
  readonly ws_size_in_per_second: number;
  readonly ws_size_out_per_second: number;
  readonly ws_chunk_in_per_second: number;
  readonly ws_chunk_out_per_second: number;
  /**
   * Constructor of the classs EPMetric.
   * @param timestamp 
   * @param cpu 
   * @param memory 
   * @param bandwith_input 
   * @param bandwith_output 
   * @param rpm 
   * @param res 
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
  constructor(
    timestamp: Date,
    cpu: number,
    memory: number,
    bandwith_input: number,
    bandwith_output: number,
    rpm: number,
    res: number,
    timestamp_init: number,
    timestamp_end: number,
    elapsed_msec: number,
    http_requests_per_second: number,
    http_errors_per_second: number,
    http_size_in_per_second: number,
    http_size_out_per_second: number,
    http_chunk_in_per_second: number,
    http_chunk_out_per_second: number,
    http_response_time: number,
    ws_size_in_per_second: number,
    ws_size_out_per_second: number,
    ws_chunk_in_per_second: number,
    ws_chunk_out_per_second: number
  ) {
    super(timestamp, cpu, memory, bandwith_input, bandwith_output, rpm, res);
    this.timestamp_init = timestamp_init;
    this.timestamp_end = timestamp_end;
    this.elapsed_msec = elapsed_msec;
    this.http_requests_per_second = http_requests_per_second;
    this.http_errors_per_second = http_errors_per_second;
    this.http_size_in_per_second = http_size_in_per_second;
    this.http_size_out_per_second = http_size_out_per_second;
    this.http_chunk_in_per_second = http_chunk_in_per_second;
    this.http_chunk_out_per_second = http_chunk_out_per_second;
    this.http_response_time = http_response_time;
    this.ws_size_in_per_second = ws_size_in_per_second;
    this.ws_size_out_per_second = ws_size_out_per_second;
    this.ws_chunk_in_per_second = ws_chunk_in_per_second;
    this.ws_chunk_out_per_second = ws_chunk_out_per_second;
  }

}
