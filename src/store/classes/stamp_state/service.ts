import StampElement from './stampelement';
export class Service implements StampElement {
    uri: string;
    name: string;
    resources: { [resourceId: string]: string };
    parameters: any;
    roles: { [rolId: string]: Service.Rol };
    proChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    owner: string;
    version: string;
    constructor(uri: string, resources: { [resourceId: string]: string }, parameters: any, roles: { [rolId: string]: Service.Rol }, proChannels: { [channelId: string]: Service.Rol.Channel }, reqChannels: { [channelId: string]: Service.Rol.Channel }) {
        this.uri = uri;
        let splitted: Array<string> = this.uri.split('/');
        this.owner = splitted[2];
        this.name = splitted[4];
        for (let i = 5; i < splitted.length - 1; i++) {
            this.name += '.' + splitted[i];
        }
        this.version = splitted[splitted.length - 1];

        this.resources = resources;
        this.parameters = parameters;
        this.roles = roles;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
    }
}

export module Service {
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
    export module Rol {
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
    }

}