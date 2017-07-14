import StampElement from './stampelement';
import { Service } from './service';
export default class Component implements StampElement {
    uri: string;
    owner: string;
    name: string;
    version: string;
    runtime: string;
    resourcesConfig: { [resourceName: string]: string }; // El dato almacenado finalmente es el parametro tipo del manifiesto del componente
    parameters: any;
    proChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    constructor(uri: string, runtime: string, resourcesConfig: { [resourceName: string]: string }, parameters: any, proChannels: { [channelId: string]: Service.Rol.Channel }, reqChannels: { [channelId: string]: Service.Rol.Channel }) {
        this.uri = uri;
        let splitted: Array<string> = this.uri.split('/');
        this.owner = splitted[2];
        this.name = splitted[3];
        for (let i = 4; i < splitted.length - 1; i++) {
            this.name += '.' + splitted[i];
        }
        this.version = splitted[splitted.length - 1];

        this.runtime = runtime;
        this.resourcesConfig = resourcesConfig;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
    }
}