export enum State { CONNECTED, DISCONNECTED, ON_PROGRESS };

export class Runtime {
}

export abstract class Metrics {
    time: Array<Date>;
    constructor() {
        this.time = [];
    }

    groupValues(m: Metrics) {
        if (this.time.length === 0)
            this.time = m.time;
    };

    concat(m: Metrics) {
        this.time = this.time.concat(m.time);
    }

}
export class EntryPointMetrics extends Metrics {
    timestamp_init: Array<number>;
    timestamp_end: Array<number>;
    elapsed_msec: Array<number>;
    http_request_per_second: Array<number>;
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
        this.http_request_per_second = [];
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

    concat(m: EntryPointMetrics) {
        super.concat(m);
        this.timestamp_init = this.timestamp_init.concat(m.timestamp_init);
        this.timestamp_end = this.timestamp_end.concat(m.timestamp_end);
        this.elapsed_msec = this.elapsed_msec.concat(m.timestamp_init);
        this.http_request_per_second = this.http_request_per_second.concat(m.timestamp_init);
        this.http_errors_per_second = this.http_errors_per_second.concat(m.http_errors_per_second);
        this.http_size_in_per_second = this.http_size_in_per_second.concat(m.timestamp_init);
        this.http_size_out_per_second = this.http_size_out_per_second.concat(m.http_size_out_per_second);
        this.http_chunk_in_per_second = this.http_chunk_in_per_second.concat(m.http_chunk_in_per_second);
        this.http_chunk_out_per_second = this.http_chunk_out_per_second.concat(m.http_chunk_out_per_second);
        this.http_response_time = this.http_response_time.concat(m.http_response_time);
        this.ws_size_in_per_second = this.ws_size_in_per_second.concat(m.ws_size_in_per_second);
        this.ws_size_out_per_second = this.ws_size_out_per_second.concat(m.ws_size_out_per_second);
        this.ws_chunk_in_per_second = this.ws_chunk_in_per_second.concat(m.ws_chunk_in_per_second);
        this.ws_chunk_out_per_second = this.ws_chunk_out_per_second.concat(m.ws_chunk_out_per_second);
    }



    addValues(time: Date, timestamp_init: number, timestamp_end: number, elapsed_msec: number, http_request_per_second: number, http_errors_per_second: number, http_size_in_per_second: number, http_size_out_per_second: number, http_chunk_in_per_second: number, http_chunk_out_per_second: number, http_response_time: number, ws_size_in_per_second: number, ws_size_out_per_second: number, ws_chunk_in_per_second: number, ws_chunk_out_per_second: number) {
        this.time.push(time);
        this.timestamp_init.push(timestamp_init);
        this.timestamp_end.push(timestamp_end);
        this.elapsed_msec.push(elapsed_msec);
        this.http_request_per_second.push(http_request_per_second);
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

    groupValues(m: EntryPointMetrics) {
        if (this.time.length > 0) {
            let res: EntryPointMetrics = new EntryPointMetrics();
            res.time = this.time;
            let i;
            for (i = 0; i < res.time.length; i++) {
                res.timestamp_init.push((this.timestamp_init[i] + m.timestamp_init[i]) / 2);
                res.timestamp_end.push((this.timestamp_end[i] + m.timestamp_end[i]) / 2);
                res.elapsed_msec.push((this.elapsed_msec[i] + m.elapsed_msec[i]) / 2);
                res.http_request_per_second.push((this.http_request_per_second[i] + m.http_request_per_second[i]) / 2);
                res.http_errors_per_second.push((this.http_errors_per_second[i] + m.http_errors_per_second[i]) / 2);
                res.http_size_in_per_second.push((this.http_size_in_per_second[i] + m.http_size_in_per_second[i]) / 2);
                res.http_size_out_per_second.push((this.http_size_out_per_second[i] + m.http_size_out_per_second[i]) / 2);
                res.http_chunk_in_per_second.push((this.http_chunk_in_per_second[i] + m.http_chunk_in_per_second[i]) / 2);
                res.http_chunk_out_per_second.push((this.http_chunk_out_per_second[i] + m.http_chunk_out_per_second[i]) / 2);
                res.http_response_time.push((this.http_response_time[i] + m.http_response_time[i]) / 2);
                res.ws_size_in_per_second.push((this.ws_size_in_per_second[i] + m.ws_size_in_per_second[i]) / 2);
                res.ws_size_out_per_second.push((this.ws_size_out_per_second[i] + m.ws_size_out_per_second[i]) / 2);
                res.ws_chunk_in_per_second.push((this.ws_chunk_in_per_second[i] + m.ws_chunk_in_per_second[i]) / 2);
                res.ws_chunk_out_per_second.push((this.ws_chunk_out_per_second[i] + m.ws_chunk_out_per_second[i]) / 2);
            }
            return res;
        } else { // Caso en que concatenemos con métricas vacías
            return m;
        }
    }
}
export class NormalMetrics extends Metrics {
    cpu: Array<number>;
    mem: Array<number>;
    net_in: Array<number>;
    net_out: Array<number>;
    rpm: Array<number>;
    res: Array<number>;
    constructor() {
        super();
        this.cpu = [];
        this.mem = [];
        this.net_in = [];
        this.net_out = [];
        this.rpm = []; // Request Per Minute
        this.res = []; // Response time
    }

    addValues(time: Date, cpu: number, mem: number, netIn: number, netOut: number, rpm: number, res: number) {
        this.time.push(time);
        this.cpu.push(cpu);
        this.mem.push(mem);
        this.net_in.push(netIn);
        this.net_out.push(netOut);
        this.rpm.push(rpm);
        this.res.push(res);
    }

    concat(m: NormalMetrics) {
        super.concat(m);
        this.cpu = this.cpu.concat(m.cpu);
        this.mem = this.mem.concat(m.mem);
        this.net_in = this.net_in.concat(m.net_in);
        this.net_out = this.net_out.concat(m.net_out);
        this.rpm = this.rpm.concat(m.rpm);
        this.res = this.res.concat(m.res);
    }

    groupValues(m: NormalMetrics) {
        if (this.time.length > 0) {
            let res: NormalMetrics = new NormalMetrics();
            res.time = this.time;
            let i;
            for (i = 0; i < res.time.length; i++) {
                res.cpu.push((this.cpu[i] + m.cpu[i]) / 2);
                res.mem.push((this.mem[i] + m.mem[i]) / 2);
                res.net_in.push((this.net_in[i] + m.net_in[i]) / 2);
                res.net_out.push((this.net_out[i] + m.net_out[i]) / 2);
                res.rpm.push(this.rpm[i] + m.rpm[i]); // En el caso de peticiones por minuto sumamos y no sacamos la media
                res.res.push((this.res[i] + m.res[i]) / 2);
            }
            return res;
        } else { // Caso en que concatenemos con métricas vacías
            return m;
        }
    }
}

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


export class Instance {

    cnid: string;
    publicIp: string;
    privateIp: string;
    arrangement: Arrangement;
    volumes: { [key: string]: string; };
    ports: { [key: string]: string; };
    state: State;
    metrics: Metrics;

    constructor(cnid: string, publicIp: string, privateIp: string, arrangement: Arrangement, volumes?: { [key: string]: string; }, ports?: { [key: string]: string; }) {
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
                this.state = State.CONNECTED;
                break;
            case false:
                this.state = State.DISCONNECTED;
                break;
            default:
                this.state = State.ON_PROGRESS;
        }
    }

    addNormalMetrics(time: Date, cpu: number, mem: number, netIn: number, netOut: number, rpm: number, res: number) {
        if (this.metrics === undefined) this.metrics = new NormalMetrics();
        (<NormalMetrics>this.metrics).addValues(time, cpu, mem, netIn, netOut, rpm, res);
    }

    addEntryPointMetrics(time: Date, timestamp_init: number, timestamp_end: number, elapsed_msec: number, http_request_per_second: number, http_errors_per_second: number, http_size_in_per_second: number, http_size_out_per_second: number, http_chunk_in_per_second: number, http_chunk_out_per_second: number, http_response_time: number, ws_size_in_per_second: number, ws_size_out_per_second: number, ws_chunk_in_per_second: number, ws_chunk_out_per_second: number) {
        if (this.metrics === undefined) this.metrics = new EntryPointMetrics();
        (<EntryPointMetrics>this.metrics).addValues(time, timestamp_init, timestamp_end, elapsed_msec, http_request_per_second, http_errors_per_second, http_size_in_per_second, http_size_out_per_second, http_chunk_in_per_second, http_chunk_out_per_second, http_response_time, ws_size_in_per_second, ws_size_out_per_second, ws_chunk_in_per_second, ws_chunk_out_per_second);
    }

    concatNormalMetrics(m: NormalMetrics) {
        if (this.metrics === undefined) this.metrics = new NormalMetrics();
        (<NormalMetrics>this.metrics).concat(m);
    }
    concatEntryPointMetrics(m: EntryPointMetrics) {
        if (this.metrics === undefined) this.metrics = new EntryPointMetrics();
        (<EntryPointMetrics>this.metrics).concat(m);
    }
}

/*
    Describe la unión entre deployments
*/
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

export class DeploymentRol {
    cpu: number;
    memory: number;
    ioperf: number;
    iopsintensive: boolean;
    bandwidth: number;
    resilence: number;
    instanceList: { [instanceId: string]: Instance };
    constructor(cpu: number, memory: number, ioperf: number, iopsintensive: boolean, bandwidth: number, resilence: number, instanceList: { [instanceId: string]: Instance }) {
        this.cpu = cpu;
        this.memory = memory;
        this.ioperf = ioperf;
        this.iopsintensive = iopsintensive;
        this.bandwidth = bandwidth;
        this.resilence = resilence;
        this.instanceList = instanceList;
    };

    instances = () => {
        let counter: number = 0;
        for (let key in this.instanceList) {
            counter++;
        }
        return counter;
    }
}

export class Deployment {
    name: string; // nombre amistoso para el usuario
    serviceId: string; // servicio que define el despliegue
    resourcesConfig: { [resource: string]: any }; // encaja cómo llama el servicio a las resources con la definición real de las resources
    parameters: any;
    roles: { [rolName: string]: DeploymentRol };
    website: Array<string>;
    constructor(name: string, serviceId: string, resourcesConfig: { [resource: string]: any }, parameters: any, roles: { [rolName: string]: DeploymentRol }, website: Array<string>) {
        this.name = name;
        this.serviceId = serviceId;
        this.resourcesConfig = resourcesConfig;
        this.parameters = parameters;
        this.roles = roles;
        this.website = website;
    }
}

export class Resource {
    realName: string;
    parameters: Object;
    constructor(realName: string, parameters: Object) {
        this.realName = realName;
        this.parameters = parameters;
    }
}


export class ServiceRol {
    component: string;
    resources: { [resourceId: string]: string };
    parameters: Array<string>;
    constructor(component: string, resources: { [resourceId: string]: string }, parameters: Array<string>) {
        this.component = component;
        this.resources = resources;
        this.parameters = parameters;

    }
}

export class Channel {
    type: string;
    protocol: string;
    connectedTo: Array<{
        channelName: string;
        rolName?: string;
    }>;
    constructor(type: string, protocol: string, connectedTo: Array<{ channelName: string; rolName?: string; }>) {
        this.type = type;
        this.protocol = protocol;
        this.connectedTo = connectedTo;
    }
}

export class Component {
    runtime: string;
    resourcesConfig: { [resourceName: string]: string }; // El dato almacenado finalmente es el parametro tipo del manifiesto del componente
    parameters: Object;
    proChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    constructor(runtime: string, resourcesConfig: { [resourceName: string]: string }, parameters: Object, proChannels: { [channelId: string]: Channel }, reqChannels: { [channelId: string]: Channel }) {
        this.runtime = runtime;
        this.resourcesConfig = resourcesConfig;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
    }
}

export class Service {
    name: string;
    resources: Array<string>;
    parameters: Array<string>;
    roles: { [rolId: string]: ServiceRol };
    proChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    components: Array<string>;
    constructor(name: string, resources: Array<string>, parameters: Array<string>, roles: { [rolId: string]: ServiceRol }, proChannels: { [channelId: string]: Channel }, reqChannels: { [channelId: string]: Channel }, components: Array<string>) {
        this.name = name;
        this.resources = resources;
        this.parameters = parameters;
        this.roles = roles;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
        this.components = components;
    }
}

export class Webdomain {
    url: string;
    state: State;
    constructor(url: string, state: State) {
        this.url = url;
        this.state = state;
    }
}

/* CLASES INDEPENDIENTES */
export class FabElement {
    name: string;
    to: string;
    constructor(name: string, to: string) {
        this.name = name;
        this.to = to;
    }
}