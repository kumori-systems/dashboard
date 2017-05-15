export enum state { NORMAL, WARNING, ERROR };

export class Deployment {
    id: string;
    name: string;
    service: string;
    roles: Array<Rol>;
    website: string;
    links: Array<Link>;
    constructor(id: string, name: string, service: string, roles: Array<Rol>, website: string, links: Array<Link>) {
        this.id = id;
        this.name = name;
        this.service = service;
        this.roles = roles;
        this.website = website;
        this.links = links;
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

    constructor(name: string, definitionURN: string, runtime: string, instances: Array<Instance>, arrangement: Arrangement) {
        this.name = name;
        this.definitionURN = definitionURN;
        this.runtime = runtime;
        this.instances = instances;
        this.arrangement = arrangement;
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

export class Instance {
    name: string;
    volumes: Array<Volume>;
    constructor(name: string, volumes: Array<Volume>) {
        this.name = name;
        this.volumes = volumes;
    }
}

export class Volume {
    name: string;
    type: string;
    num: number;
    constructor(name: string, type: string, num: number) {
        this.name = name;
        this.type = type;
        this.num = num;
    }
}