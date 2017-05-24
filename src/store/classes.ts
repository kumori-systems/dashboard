export enum State { ACTIVE, NO_ACTIVE, ON_PROGRESS };

export class Runtime {
}

export class Instance {
    state: State;
    constructor(state: State) {
        this.state = state;
    }
}

export class DeploymentRol {
    instances: number;
    cpu: number;
    memory: number;
    ioperf: number;
    iopsintensive: boolean;
    bandwith: number;
    resilence: number;
    instanceList: { [instanceId: string]: Instance };
    constructor(instances: number, cpu: number, memory: number, ioperf: number, iopsintensive: boolean, bandwith: number, resilence: number, instanceList: { [instanceId: string]: Instance }) {
        this.instances = instances;
        this.cpu = cpu;
        this.memory = memory;
        this.ioperf = ioperf;
        this.iopsintensive = iopsintensive;
        this.bandwith = bandwith;
        this.resilence = resilence;
        this.instanceList = instanceList;
    }
}

export class Deployment {
    name: string; // nombre amistoso para el usuario
    serviceId: string; // servicio que define el despliegue
    resourcesConfig: { [resource: string]: string }; // encaja cómo llama el servicio a las resources con la definición real de las resources
    parameters: Array<string>;
    roles: { [rolName: string]: DeploymentRol };
    proChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    website: string;
    constructor(name: string, serviceId: string, resourcesConfig: { [resource: string]: string }, parameters: Array<string>, roles: { [rolName: string]: DeploymentRol }, proChannels: { [channelId: string]: Channel }, reqChannels: { [channelId: string]: Channel }, website: string) {
        this.name = name;
        this.serviceId = serviceId;
        this.resourcesConfig = resourcesConfig;
        this.parameters = parameters;
        this.roles = roles;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
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
    resources: { [resourceId: string]: Resource };
    parameters: Array<string>;
    roles: { [rolId: string]: ServiceRol };
    components: { [componentId: string]: Component };
    constructor(resources: { [resourceId: string]: Resource }, parameters: Array<string>, roles: { [rolId: string]: ServiceRol }, components: { [componentId: string]: Component }) {
        this.resources = resources;
        this.parameters = parameters;
        this.roles = roles;
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