export enum state { NORMAL, WARNING, ERROR };

export class Deployment {
    name: string;
    service: string;
    roles: Array<Rol>;
    website: string;
    links: Array<Link>;
    constructor(name: string, service: string, roles: Array<Rol>, website: string, links: Array<Link>) {
        this.name = name;
        this.service = service;
        this.roles = roles;
        this.website = website;
        this.links = links;
    }
}

export class Rol {
    name: string;
    definitionURN: string;
    numInstances: number;
    runtime: string;
    instances: Array<Instance>;
    constructor(name: string, definitionURN: string, numInstances: number, runtime: string, instances: Array<Instance>) {
        this.name = name;
        this.definitionURN = definitionURN;
        this.numInstances = numInstances;
        this.runtime = runtime;
        this.instances = instances;
    }
}

export class Link {
    connectedTo: string;
    constructor(connectedTo: string) {
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