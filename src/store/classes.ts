export enum State { CONNECTED, DISCONNECTED, ON_PROGRESS };

export class Runtime {
}

export class Metrics {
    time: Array<Date>;
    cpu: Array<number>;
    mem: Array<number>;
    net_in: Array<number>;
    net_out: Array<number>;
    rpm: Array<number>;
    res: Array<number>;

    constructor() {
        this.time = [];
        this.cpu = [];
        this.mem = [];
        this.net_in = [];
        this.net_out = [];
        this.rpm = [];
        this.res = [];
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

    groupValues(m: Metrics) {
        if (this.time.length > 0) {
            let res: Metrics = new Metrics();
            res.time = this.time;
            let i;
            for (i = 0; i < res.time.length; i++) {
                res.cpu.push((this.cpu[i] + m.cpu[i]) / 2);
                res.mem.push((this.mem[i] + m.mem[i]) / 2);
                res.net_in.push((this.net_in[i] + m.net_in[i]) / 2);
                res.net_out.push((this.net_out[i] + m.net_out[i]) / 2);
                res.rpm.push((this.rpm[i] + m.rpm[i]) / 2);
                res.res.push((this.res[i] + m.res[i]) / 2);
            }
            return res;
        } else { // Caso en que concatenemos con métricas vacías
            return m;
        }
    }
}

export class Instance {
    state: State;
    metrics: Metrics = new Metrics();
    constructor(state: boolean) {
        switch (state) {
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
    addMetrics(time: Date, cpu: number, mem: number, netIn: number, netOut: number, rpm: number, res: number) {
        this.metrics.addValues(time, cpu, mem, netIn, netOut, rpm, res);
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
    instances: number;
    cpu: number;
    memory: number;
    ioperf: number;
    iopsintensive: boolean;
    bandwidth: number;
    resilence: number;
    instanceList: { [instanceId: string]: Instance };
    constructor(instances: number, cpu: number, memory: number, ioperf: number, iopsintensive: boolean, bandwidth: number, resilence: number, instanceList: { [instanceId: string]: Instance }) {
        this.instances = instances;
        this.cpu = cpu;
        this.memory = memory;
        this.ioperf = ioperf;
        this.iopsintensive = iopsintensive;
        this.bandwidth = bandwidth;
        this.resilence = resilence;
        this.instanceList = instanceList;
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