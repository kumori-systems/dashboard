export class Link {
    deploymentOne: string;
    channelOne: string;
    deploymentTwo: string;
    channelTwo: string;
    constructor(deploymentOne: string, channelOne: string, deploymentTwo: string, channelTwo: string) {
        this.deploymentOne = deploymentOne;
        this.channelOne = channelOne;
        this.deploymentTwo = deploymentTwo;
        this.channelTwo = channelTwo;
    }
}

export class Deployment {
    name: string; // nombre amistoso para el usuario
    serviceId: string; // servicio que define el despliegue
    resourcesConfig: { [resource: string]: any }; // encaja cómo llama el servicio a las resources con la definición real de las resources
    parameters: any;
    roles: { [rolName: string]: Deployment.Rol };
    website: Array<string>;
    metrics: Deployment.Metrics;
    isEntrypoint: boolean;
    constructor(name: string, serviceId: string, resourcesConfig: { [resource: string]: any }, parameters: any, roles: { [rolName: string]: Deployment.Rol }, website: Array<string>) {
        this.name = name;
        this.serviceId = serviceId;
        this.resourcesConfig = resourcesConfig;
        this.parameters = parameters;
        this.roles = roles;
        this.website = website;

        if (this.serviceId === 'eslap://eslap.cloud/services/http/inbound/1_0_0') {
            this.isEntrypoint = true;
            this.metrics = new Deployment.EntryPointMetrics();
        }
        else {
            this.isEntrypoint = false;
            this.metrics = new Deployment.CommonMetrics();
        }
    }

    addMetrics(m) {
        if (!this.metrics && this.isEntrypoint) { this.metrics = new Deployment.EntryPointMetrics(); }
        if (!this.metrics && !this.isEntrypoint) { this.metrics = new Deployment.CommonMetrics(); }
        if (this.isEntrypoint) { (<Deployment.EntryPointMetrics>this.metrics).addValues(m.timestamp, m.timestamp_init, m.timestamp_end, m.elapsed_msec, m.http_requests_per_second, m.http_errors_per_second, m.http_size_in_per_second, m.http_size_out_per_second, m.http_chunk_in_per_second, m.http_chunk_out_per_second, m.http_response_time, m.ws_size_in_per_second, m.ws_size_out_per_second, m.ws_chunk_in_per_second, m.ws_chunk_out_per_second); }
        else { (<Deployment.CommonMetrics>this.metrics).addValues(m.timestamp, m.cpu, m.memory, m.bandwith_input, m.bandwith_output, 0, 0); }
    }
}

export module Deployment {

    export abstract class Metrics {
        time: Array<Date>;
        constructor() {
            this.time = [];
        }
        abstract getFormattedMetrics();
    }
    export class EntryPointMetrics extends Metrics {
        timestamp_init: Array<number>;
        timestamp_end: Array<number>;
        elapsed_msec: Array<number>;
        http_requests_per_second: Array<number>;
        http_errors_per_second: Array<number>;
        http_size_in_per_second: Array<number>;
        http_size_out_per_second: Array<number>;
        http_chunk_in_per_second: Array<number>;
        http_chunk_out_per_second: Array<number>;
        http_response_time: Array<number>;
        ws_size_in_per_second: Array<number>;
        ws_size_out_per_second: Array<number>;
        ws_chunk_in_per_second: Array<number>;
        ws_chunk_out_per_second: Array<number>;
        constructor() {
            super();
            this.timestamp_init = [];
            this.timestamp_end = [];
            this.elapsed_msec = [];
            this.http_requests_per_second = [];
            this.http_errors_per_second = [];
            this.http_size_in_per_second = [];
            this.http_size_out_per_second = [];
            this.http_chunk_in_per_second = [];
            this.http_chunk_out_per_second = [];
            this.http_response_time = [];
            this.ws_size_in_per_second = [];
            this.ws_size_out_per_second = [];
            this.ws_chunk_in_per_second = [];
            this.ws_chunk_out_per_second = [];
        }
        /**
         *  Adds some values to the metrics
         * @param time 
         * @param timestamp_init 
         * @param timestamp_end 
         * @param elapsed_msec 
         * @param http_request_per_second 
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
        addValues(time: Date, timestamp_init: number, timestamp_end: number, elapsed_msec: number, http_requests_per_second: number, http_errors_per_second: number, http_size_in_per_second: number, http_size_out_per_second: number, http_chunk_in_per_second: number, http_chunk_out_per_second: number, http_response_time: number, ws_size_in_per_second: number, ws_size_out_per_second: number, ws_chunk_in_per_second: number, ws_chunk_out_per_second: number): void {
            this.time.push(time);
            this.timestamp_init.push(timestamp_init);
            this.timestamp_end.push(timestamp_end);
            this.elapsed_msec.push(elapsed_msec);
            this.http_requests_per_second.push(http_requests_per_second);
            this.http_errors_per_second.push(http_errors_per_second);
            this.http_size_in_per_second.push(http_size_in_per_second);
            this.http_size_out_per_second.push(http_size_out_per_second);
            this.http_chunk_in_per_second.push(http_chunk_in_per_second);
            this.http_chunk_out_per_second.push(http_chunk_out_per_second);
            this.http_response_time.push(http_response_time);
            this.ws_size_in_per_second.push(ws_size_in_per_second);
            this.ws_size_out_per_second.push(ws_size_out_per_second);
            this.ws_chunk_in_per_second.push(ws_chunk_in_per_second);
            this.ws_chunk_out_per_second.push(ws_chunk_out_per_second);
        }
        getFormattedMetrics() {
            return {
                labels: this.time,
                datasets: [
                    {
                        label: 'http_requests_per_second',
                        backgroundColor: '#42afe3',
                        borderColor: '#42afe3',
                        fill: false,
                        data: this.http_requests_per_second
                    },
                    {
                        label: 'http_errors_per_second',
                        backgroundColor: '#ed6c63',
                        borderColor: '#ed6c63',
                        fill: false,
                        data: this.http_errors_per_second
                    },
                    {
                        label: 'http_size_in_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: this.http_size_in_per_second
                    },
                    {
                        label: 'http_size_out_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: this.http_size_out_per_second
                    },
                    {
                        label: 'http_response_time',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
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
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: this.ws_size_out_per_second
                    }
                ]
            };
        }
    }

    export class CommonMetrics extends Metrics {
        cpu: Array<number>;
        memory: Array<number>;
        bandwith_input: Array<number>;
        bandwith_output: Array<number>;
        rpm: Array<number>;
        res: Array<number>;
        constructor() {
            super();
            this.cpu = [];
            this.memory = [];
            this.bandwith_input = [];
            this.bandwith_output = [];
            this.rpm = []; // Request Per Minute
            this.res = []; // Response time
        }

        /**
         * Adds some values to metrics
         * @param time 
         * @param cpu 
         * @param memory 
         * @param bandwith_input 
         * @param bandwith_output 
         * @param rpm 
         * @param res 
         */
        addValues(time: Date, cpu: number, memory: number, bandwith_input: number, bandwith_output: number, rpm: number, res: number): void {
            this.time.push(time);
            this.cpu.push(cpu * 100);
            this.memory.push(memory);
            this.bandwith_input.push(bandwith_input);
            this.bandwith_output.push(bandwith_output);
            this.rpm.push(rpm);
            this.res.push(res);
        }
        getFormattedMetrics() {
            return {
                labels: this.time,
                datasets: [
                    {
                        label: 'CPU',
                        backgroundColor: '#1fc8db',
                        borderColor: '#1fc8db',
                        fill: false,
                        data: this.cpu
                    },
                    {
                        label: 'MEM',
                        backgroundColor: '#fce473',
                        borderColor: '#fce473',
                        fill: false,
                        data: this.memory
                    },
                    {
                        label: 'NET_IN',
                        backgroundColor: '#42afe3',
                        borderColor: '#42afe3',
                        fill: false,
                        data: this.bandwith_input
                    },
                    {
                        label: 'NET_OUT',
                        backgroundColor: '#9999ff',
                        borderColor: '#9999ff',
                        fill: false,
                        data: this.bandwith_output
                    },
                    {
                        label: 'RPM',
                        backgroundColor: '#ed6c63',
                        borderColor: '#ed6c63',
                        fill: false,
                        data: this.rpm
                    },
                    {
                        label: 'RES',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: this.res
                    }
                ]
            };
        }
    }
    export class Rol {
        cpu: number;
        memory: number;
        ioperf: number;
        iopsintensive: boolean;
        bandwidth: number;
        resilience: number;
        instanceList: { [instanceId: string]: Rol.Instance };
        instanceNumber: number;
        metrics: Deployment.Metrics;
        constructor(cpu: number, memory: number, ioperf: number, iopsintensive: boolean, bandwidth: number, resilience: number, instanceList: { [instanceId: string]: Rol.Instance }) {
            this.cpu = cpu;
            this.memory = memory;
            this.ioperf = ioperf;
            this.iopsintensive = iopsintensive;
            this.bandwidth = bandwidth;
            this.resilience = resilience;
            this.instanceList = instanceList;
            this.instanceNumber = 0;
            for (let key in instanceList) {
                this.instanceNumber++;
            }
        };

        addMetrics(isEntrypoint, m) {
            if (!this.metrics && isEntrypoint) { this.metrics = new Deployment.EntryPointMetrics(); }
            if (!this.metrics && !isEntrypoint) { this.metrics = new Deployment.CommonMetrics(); }
            if (isEntrypoint) { (<Deployment.EntryPointMetrics>this.metrics).addValues(m.timestamp, m.timestamp_init, m.timestamp_end, m.elapsed_msec, m.http_requests_per_second, m.http_errors_per_second, m.http_size_in_per_second, m.http_size_out_per_second, m.http_chunk_in_per_second, m.http_chunk_out_per_second, m.http_response_time, m.ws_size_in_per_second, m.ws_size_out_per_second, m.ws_chunk_in_per_second, m.ws_chunk_out_per_second); }
            else { (<Deployment.CommonMetrics>this.metrics).addValues(m.timestamp, m.cpu, m.memory, m.bandwith_input, m.bandwith_output, 0, 0); }
        }
    }
    export module Rol {

        export class Instance {

            cnid: string;
            publicIp: string;
            privateIp: string;
            arrangement: Instance.Arrangement;
            volumes: { [key: string]: string; };
            ports: { [key: string]: string; };
            state: Instance.State;
            metrics: Deployment.Metrics;

            constructor(cnid: string, publicIp: string, privateIp: string, arrangement: Instance.Arrangement, volumes?: { [key: string]: string; }, ports?: { [key: string]: string; }) {
                this.cnid = cnid;
                this.publicIp = publicIp;
                this.privateIp = privateIp;
                this.arrangement = arrangement;
                this.volumes = volumes;
                this.ports = ports;
            }
            setState(connected: boolean) {
                switch (connected) {
                    case true:
                        this.state = Instance.State.CONNECTED;
                        break;
                    case false:
                        this.state = Instance.State.DISCONNECTED;
                        break;
                    default:
                        this.state = Instance.State.ON_PROGRESS;
                }
            }

            addMetrics(isEntrypoint, m) {
                if (!this.metrics && isEntrypoint) { this.metrics = new Deployment.EntryPointMetrics(); }
                if (!this.metrics && !isEntrypoint) { this.metrics = new Deployment.CommonMetrics(); }
                if (isEntrypoint) { (<Deployment.EntryPointMetrics>this.metrics).addValues(m.timestamp, m.timestamp_init, m.timestamp_end, m.elapsed_msec, m.http_requests_per_second, m.http_errors_per_second, m.http_size_in_per_second, m.http_size_out_per_second, m.http_chunk_in_per_second, m.http_chunk_out_per_second, m.http_response_time, m.ws_size_in_per_second, m.ws_size_out_per_second, m.ws_chunk_in_per_second, m.ws_chunk_out_per_second); }
                else { (<Deployment.CommonMetrics>this.metrics).addValues(m.timestamp, m.cpu, m.memory, m.bandwith_input, m.bandwith_output, 0, 0); }
            }

        }
        export module Instance {
            export enum State { CONNECTED, DISCONNECTED, ON_PROGRESS };

            export class Arrangement {
                minInstances: number;
                maxInstances: number;
                cpu: number;
                memory: number;
                bandwith: number;
                failureZones: number;
                constructor(minInstances, maxInstances, cpu, memory, bandwith, failureZones) {
                    this.minInstances = minInstances;
                    this.maxInstances = maxInstances;
                    this.cpu = cpu;
                    this.memory = memory;
                    this.bandwith = bandwith;
                    this.failureZones = failureZones;
                }
            }
        }
    }
}