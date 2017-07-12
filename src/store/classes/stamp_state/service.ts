export class Service {
    name: string;
    resources: Array<string>;
    parameters: Array<string>;
    roles: { [rolId: string]: Service.Rol };
    proChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    components: Array<string>;
    constructor(name: string, resources: Array<string>, parameters: Array<string>, roles: { [rolId: string]: Service.Rol }, proChannels: { [channelId: string]: Service.Rol.Channel }, reqChannels: { [channelId: string]: Service.Rol.Channel }, components: Array<string>) {
        this.name = name;
        this.resources = resources;
        this.parameters = parameters;
        this.roles = roles;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
        this.components = components;
    }
}

export module Service {
    export class Rol {
        component: string;
        resources: { [resourceId: string]: string };
        parameters: Array<string>;
        constructor(component: string, resources: { [resourceId: string]: string }, parameters: Array<string>) {
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