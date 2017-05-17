export enum state { NORMAL, WARNING, ERROR };

export class Deployment {
    id: string;
    name: string;
    service: Service;
    roles: Array<Rol>;
    website: string;
    links: Array<Link>;
    constructor(id: string, name: string, service: Service, roles: Array<Rol>, website: string, links: Array<Link>) {
        this.id = id;
        this.name = name;
        this.service = service;
        this.roles = roles;
        this.website = website;
        this.links = links;
    }
}
export class ServiceRol {
    name: string;
    component: string;
    resources: any;
    parameters: any;
    constructor(name: string, component: string, resources: any, parameters: any) {
        this.name = name;
        this.component = component;
        this.resources = resources;
        this.parameters = parameters;
    }
}

export class Service {
    name: string;
    roles: Array<ServiceRol>;
    constructor(name: string, roles: Array<ServiceRol>) {
        this.name = name;
        this.roles = roles;
    }
}

/* TODO: Revisar esta clase cuando se hayan eliminado duplicados */
export class Arrangement {
    failurezones: number;
    bandwidth: number;
    memory: number;
    cpu: number;
    maxinstances: number;
    __instances: number;
    __cpu: number;
    __memory: number;
    __ioperf: number;
    __iopsintensive: boolean;
    __bandwidth: number;
    __resilience: number;
    mininstances: number;
    constructor(failurezones: number, bandwidth: number, memory: number, cpu: number, maxinstances: number, __instances: number, __cpu: number, __memory: number, __ioperf: number, __iopsintensive: boolean, __bandwidth: number, __resilience: number, mininstances: number) {
        this.failurezones = failurezones;
        this.bandwidth = bandwidth;
        this.memory = memory;
        this.cpu = cpu;
        this.maxinstances = maxinstances;
        this.__instances = __instances;
        this.__cpu = cpu;
        this.__memory = __memory;
        this.__ioperf = __ioperf;
        this.__iopsintensive = __iopsintensive;
        this.__bandwidth = bandwidth;
        this.__resilience = __resilience;
        this.mininstances = mininstances;
    }
}

export class Rol {
    name: string;
    definitionURN: string;
    runtime: string;
    instances: Array<Instance>;
    arrangement: Arrangement;
    domain: string;
    links: Array<{ providers: any, dependents: any }>;

    constructor(name: string, definitionURN: string, runtime: string, instances: Array<Instance>, arrangement: Arrangement, domain: string, links: Array<{ providers: any, dependents: any }>) {
        this.name = name;
        this.definitionURN = definitionURN;
        this.runtime = runtime;
        this.instances = instances;
        this.arrangement = arrangement;
        this.domain = domain;
        this.links = links;
    }
}

export class Link {
    connectedTo: string;
    myChannel: string;
    hisChannel: string;
    constructor(myChannel: string, hisChannel: string, connectedTo: string) {
        this.myChannel = myChannel;
        this.hisChannel = hisChannel;
        this.connectedTo = connectedTo;
    }
}
// TODO: Faltan params
export class Instance {
    name: string;
    resources: Array<Resource>;
    constructor(name: string, resources: Array<Resource>) {
        this.name = name;
        this.resources = resources;
    }
}

export class Resource {
    name: string;
    type: string;
    numElements: number;
    configuration: any;
    constructor(name: string, type: string, numElements: number, configuration: any) {
        this.name = name;
        this.type = type;
        this.numElements = numElements;
        this.configuration = configuration;
    }
}

export class FabElement {
    name: string;
    to: string;
    constructor(name: string, to: string) {
        this.name = name;
        this.to = to;
    }
}