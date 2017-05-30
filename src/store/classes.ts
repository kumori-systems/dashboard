export enum State { CONNECTED, DISCONNECTED, ON_PROGRESS };

export class Runtime {
}

export class Instance {
    state: State;
    cpu: Array<number>;
    mem: Array<number>;
    net: Array<number>;
    rpm: Array<number>;
    res: Array<number>;
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
        this.cpu = [];
        this.mem = [];
        this.net = [];
        this.rpm = [];
        this.res = [];
    }
    addCpu(cpu: Array<number>) {
        for (let cpuIndex in cpu) {
            this.cpu.push(cpu[cpuIndex]);
        }
    }
    addMem(mem: Array<number>) {
        for (let memIndex in mem) {
            this.mem.push(mem[memIndex]);
        }
    }
    // La red será una suma de la red de subida y la red de bajada
    addNet(net: Array<number>) {
        for (let netIndex in net) {
            this.net.push(net[netIndex]);
        }
    }
    // Request per minute
    addRpm(rpm: Array<number>) {
        for (let rpmIndex in rpm) {
            this.rpm.push(rpm[rpmIndex]);
        }
    }
    // Response Time
    addRes(res: Array<number>) {
        for (let resIndex in res) {
            this.res.push(res[resIndex]);
        }
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
    website: string;
    constructor(name: string, serviceId: string, resourcesConfig: { [resource: string]: any }, parameters: any, roles: { [rolName: string]: DeploymentRol }, website: string) {
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

/* CLASES INDEPENDIENTES */
export class FabElement {
    name: string;
    to: string;
    constructor(name: string, to: string) {
        this.name = name;
        this.to = to;
    }
}