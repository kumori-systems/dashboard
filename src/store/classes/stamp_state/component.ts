import StampElement from './stampelement';
import { Service } from './service';
export default class Component implements StampElement {
    uri: string;
    getOwner(): string {
        return '';
    };
    getName(): string {
        return '';
    };
    runtime: string;
    resourcesConfig: { [resourceName: string]: string }; // El dato almacenado finalmente es el parametro tipo del manifiesto del componente
    parameters: Object;
    proChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    reqChannels: { [channelId: string]: Service.Rol.Channel }; // canal y sus conexiones
    constructor(uri: string, runtime: string, resourcesConfig: { [resourceName: string]: string }, parameters: Object, proChannels: { [channelId: string]: Service.Rol.Channel }, reqChannels: { [channelId: string]: Service.Rol.Channel }) {
        this.uri = uri;
        this.runtime = runtime;
        this.resourcesConfig = resourcesConfig;
        this.proChannels = proChannels;
        this.reqChannels = reqChannels;
    }
}