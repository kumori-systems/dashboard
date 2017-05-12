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

export class Rol {
    name: string;
    definitionURN: string;
    runtime: string;
    instances: Array<Instance>;
    constructor(name: string, definitionURN: string, runtime: string, instances: Array<Instance>) {
        this.name = name;
        this.definitionURN = definitionURN;
        this.runtime = runtime;
        this.instances = instances;
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