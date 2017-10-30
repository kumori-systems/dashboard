import StampElement from './stampelement';
import { getElementName, getElementOwner, getElementVersion } from '../../proxy/utils';
export class Channel {
    type: string = null;
    protocol: string = null;
    constructor(type: string, protocol: string) {
        this.type = type;
        this.protocol = protocol;
    }
}

export class Service implements StampElement {
    readonly uri: string;
    name: string;
    resources: { [resourceId: string]: string };
    parameters: any;
    roles: { [rolId: string]: Service.Rol };
    proChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Channel }; // canal y sus conexiones
    owner: string;
    version: string;
    connectors: Array<Service.Connector>;
    constructor(uri: string, resources: { [resourceId: string]: string }, parameters: any, roles: { [rolId: string]: Service.Rol }, proChannels: { [channelId: string]: Channel }, reqChannels: { [channelId: string]: Channel }, connectors: Array<Service.Connector>) {
        this.uri = uri;
        this.owner = getElementOwner(uri);
        this.name = getElementName(uri);
        this.version = getElementVersion(uri);
        this.resources = resources;
        this.parameters = parameters;
        this.roles = roles;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
        this.connectors = connectors;
    }
}

export module Service {
    export class Connector {
        type: string;
        provided: Array<{ endoint: string, role?: string }>;
        depended: Array<{ endoint: string, role?: string }>;
        constructor(type: string, provided: Array<{ endoint: string, role?: string }>, depended: Array<{ endoint: string, role?: string }>) {
            this.type = type;
            this.provided = provided;
            this.depended = depended;
        }
    }
    export class Rol {
        component: string;
        resources: { [resourceId: string]: string };
        parameters: any;
        constructor(component: string, resources: { [resourceId: string]: string }, parameters: any) {
            this.component = component;
            this.resources = resources;
            this.parameters = parameters;
        }
    }
}