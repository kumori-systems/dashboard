import { Deployment as EcloudDeployment, AdmissionEvent as EcloudEvent, EcloudEventType } from 'admission-client';
import { Deployment, Link, Service, Resource, Component, Runtime, Cert, DataVolume, Webdomain, Channel } from '../classes';
export function transformEcloudDeploymentToDeployment(ecloudDeployment: EcloudDeployment) {
    let roles: { [rolId: string]: Deployment.Rol } = {};
    let instances: { [instanceId: string]: Deployment.Rol.Instance };

    for (let rolId in ecloudDeployment.roles) {
        instances = {};
        for (let instanceId in ecloudDeployment.roles[rolId].instances) {
            instances[instanceId] = new Deployment.Rol.Instance(
                ecloudDeployment.roles[rolId].instances[instanceId].cnid,
                ecloudDeployment.roles[rolId].instances[instanceId].publicIp,
                ecloudDeployment.roles[rolId].instances[instanceId].privateIp,
                new Deployment.Rol.Instance.Arrangement(
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.mininstances,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.maxinstances,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.cpu,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.memory,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.bandwith,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.failureZones
                ),
                ecloudDeployment.roles[rolId].instances[instanceId].volumes,
                ecloudDeployment.roles[rolId].instances[instanceId].ports
            );
        }

        // TODO ERROR001: Esto debería de resolverse en una actualización de la api
        roles[rolId] = new Deployment.Rol(
            ecloudDeployment.roles[rolId].configuration,
            1, // ecloudDeployment.roles[rolId].arrangement.cpu : number
            1, // ecloudDeployment.roles[rolId].arrangement.memory : number
            1, // ecloudDeployment.roles[rolId].arrangement.ioperf : number
            false, // ecloudDeployment.roles[rolId].arrangement.iopsintensive : boolean
            1, // ecloudDeployment.roles[rolId].arrangement.bandwidth : number
            1, // ecloudDeployment.roles[rolId].arrangement.resilence : number
            instances
        );
    }


    let resourcesConfig: { [resource: string]: any } = {};
    let parameters: any = {};

    let website: Array<string> = [];
    if (
        isServiceEntrypoint(ecloudDeployment.service)
        && ecloudDeployment.roles.sep
        && ecloudDeployment.roles.sep.entrypoint
        && ecloudDeployment.roles.sep.entrypoint.domain
    ) {
        website.push(ecloudDeployment.roles.sep.entrypoint.domain);
    }

    let links: Array<Link> = [];

    for (let firstChannel in ecloudDeployment.links) {
        for (let secondDeployment in ecloudDeployment.links[firstChannel])
            for (let secondChannel in ecloudDeployment.links[firstChannel][secondDeployment])
                links.push(new Link(ecloudDeployment.urn, firstChannel, secondDeployment, secondChannel));
    }

    return new Deployment(
        ecloudDeployment.urn,
        (<any>ecloudDeployment).name || ecloudDeployment.service.split('/')[4] + ecloudDeployment.service.split('/')[5], // name: string
        ecloudDeployment.service, // serviceId: string
        resourcesConfig, // resourcesConfig: { [resource: string]: any }
        parameters, // parameters: any
        roles, // roles: { [rolName: string]: DeploymentRol }
        links,
        website, // website: Array<string>
    );
}
export function transformManifestToService(manifest: {
    spec: string,
    name: string,
    configuration: {
        resources: Array<{ name: string, type: string }>,
        parameters: Array<any>
    },
    roles: [{
        name: string,
        component: string,
        resources: {},
        parameters: {}
    }],
    channels: {
        requires: Array<any>,
        provides: [{
            name: string,
            type: string,
            protocol: string
        }]
    },
    connectors: [{
        type: string,
        depended: [{
            role: string,
            endpoint: string,
        }],
        provided: [{
            role: string,
            endpoint: string
        }]
    }]
}): Service {
    let resources: { [resourceId: string]: string } = {};
    for (let i = 0; i < manifest.configuration.resources.length; i++) {
        resources[manifest.configuration.resources[i].name] = manifest.configuration.resources[i].type;
    }

    let roles: { [rolId: string]: Service.Rol } = {};
    for (let i = 0; i < manifest.roles.length; i++) {
        roles[manifest.roles[i].name] = new Service.Rol(manifest.roles[i].component, manifest.roles[i].resources, manifest.roles[i].parameters);

    }

    let proChannels: { [channelId: string]: Channel } = {};
    for (let i = 0; i < manifest.channels.provides.length; i++) {
        proChannels[manifest.channels.provides[i].name] = new Channel(manifest.channels.provides[i].type, manifest.channels.provides[i].protocol);
    }

    let reqChannels: { [channelId: string]: Channel } = {};
    for (let i = 0; i < manifest.channels.requires.length; i++) {
        reqChannels[manifest.channels.requires[i].name] = new Channel(manifest.channels.requires[i].type, manifest.channels.requires[i].protocol);
    }


    let connectors: Array<Service.Connector> = [];
    for (let conn in manifest.connectors) {
        connectors.push(new Service.Connector(
            manifest.connectors[conn].type,
            manifest.connectors[conn].provided as any as Array<{ endoint: string, role?: string }>,
            manifest.connectors[conn].depended as any as Array<{ endoint: string, role?: string }>
        ));
    }


    return new Service(
        manifest.name, // uri:string
        resources, // resources: Array<string>,
        manifest.configuration.parameters, // parameters: Array<string>,
        roles, // roles: { [rolId: string]: Service.Rol },
        proChannels, // proChannels: { [channelId: string]: Service.Rol.Channel },
        reqChannels, // reqChannels: { [channelId: string]: Service.Rol.Channel },
        connectors
    );
}
export function transformManifestToComponent(manifest: {
    code: string,
    profile: Object,
    configuration: {
        parameters: [{
            type: string,
            name: string
        }],
        resources: [{
            name: string,
            type: string
        }]
    },
    channels: {
        requires: [{
            protocol: string,
            type: string,
            name: string
        }],
        provides: [{
            protocol: string,
            type: string,
            name: string
        }]
    },
    runtime: string,
    name: string,
    spec: string,
    codelocator: string
}): Component {
    let resources: { [resourceName: string]: string } = {};
    if (manifest.configuration.resources)
        for (let i = 0; i < manifest.configuration.resources.length; i++) {
            resources[manifest.configuration.resources[i].name] = manifest.configuration.resources[i].type;
        }

    let proChannels: { [channelId: string]: Channel } = {};
    if (manifest.channels && manifest.channels.provides)
        for (let i = 0; i < manifest.channels.provides.length; i++) {
            proChannels[manifest.channels.provides[i].name] = new Channel(
                manifest.channels.provides[i].type, // type
                manifest.channels.provides[i].protocol // protocol
            );
        }

    let reqChannels: { [channelId: string]: Channel } = {};
    if (manifest.channels && manifest.channels.requires)
        for (let i = 0; i < manifest.channels.requires.length; i++) {
            reqChannels[manifest.channels.provides[i].name] = new Channel(
                manifest.channels.provides[i].type, // type
                manifest.channels.provides[i].protocol // protocol
            );
        }

    return new Component(
        manifest.name, // uri: string
        manifest.runtime, // runtime: string
        resources, // resourcesConfig: { [resourceName: string]: string }
        manifest.configuration.parameters, // parameters: Object
        proChannels, // proChannels: { [channelId: string]: Service.Rol.Channel }
        reqChannels // reqChannels: { [channelId: string]: Service.Rol.Channel }
    );
}
export function transformManifestToResource(manifest: { spec: string, name: string, parameters: any }): Resource {
    let res: Resource = null;
    switch (this.getResourceType(manifest.spec)) {
        case ResourceType.domain:
            res = new Webdomain(
                manifest.name,
                manifest.parameters.vhost,
                Webdomain.State.VALIDATED
            );
            break;
        case ResourceType.cert:
            res = new Cert(
                manifest.name
            );
            break;
        case ResourceType.volume:
            res = new DataVolume(
                manifest.name
            );
            break;
        default:
            console.error('Resource type not espected: ', manifest.spec);
    }
    return res;
}
export function transformManifestToRuntime(manifest: {
    spec: string,
    name: string,
    derived: {
        from: string
    },
    sourcedir: string,
    entrypoint: string,
    metadata: {
        description: string,
        os_name: string,
        os_version: string,
        os_release: string,
        software: {
            [key: string]: any
        }
    }
}): Runtime {
    return new Runtime(manifest.name);
}

export function transformEcloudEventDataToMetrics(ecloudEvent: EcloudEvent): {
    [deploymentId: string]: {
        'data': {
            [property: string]: number | string
        },
        'roles': {
            [rolId: string]: {
                'data': {
                    [property: string]: number | string
                },
                'instances': {
                    [instanceId: string]: {
                        [property: string]: number | string
                    }

                }
            }
        }
    }
} {
    let res: {
        [deploymentId: string]: {
            'data': {
                [property: string]: number | string
            },
            'roles': {
                [rolId: string]: {
                    'data': {
                        [property: string]: number | string
                    },
                    'instances': {
                        [instanceId: string]: {
                            [property: string]: number | string
                        }

                    }
                }
            }
        }
    } = {};
    let deploymentId = ecloudEvent.data.deploymentUrn;
    res[deploymentId] = { 'data': {}, 'roles': {} };
    let timestamp = ecloudEvent.timestamp;
    for (let rolId in ecloudEvent.data.roles) {
        res[deploymentId].roles[rolId] = { 'data': {}, 'instances': {} };

        // Obtenemos los datos de las instáncias
        for (let instanceId in ecloudEvent.data.roles[rolId].instances) {
            res[deploymentId].roles[rolId].instances[instanceId] = {};
            for (let property in ecloudEvent.data.roles[rolId].instances[instanceId]) {
                res[deploymentId].roles[rolId].instances[instanceId][property] = ecloudEvent.data.roles[rolId].instances[instanceId][property].mean;
            }
            res[deploymentId].roles[rolId].instances[instanceId]['timestamp'] = timestamp;
        }

        // Obtenemos los datos de los roles
        for (let property in ecloudEvent.data.roles[rolId].data) {
            res[deploymentId].roles[rolId].data[property] = ecloudEvent.data.roles[rolId].data[property].mean;
        }
        res[deploymentId].roles[rolId].data['timestamp'] = timestamp;
    }
    // Obtenemos los datos de los deployment
    for (let property in ecloudEvent.data.data) {
        res[deploymentId].data[property] = ecloudEvent.data.data[property].mean;
    }
    res[deploymentId].data['timestamp'] = timestamp;

    return res;
}


export enum ElementType { deployment, service, runtime, component, resource }

export function getElementType(uri: string): ElementType {
    let res: ElementType;

    let splitted = uri.split('/');

    let i = 3;

    if (splitted[2] === 'temporary') { i = i + 2; }

    // Obtenemos el tipo. En caso de que sea temprary, el tipo estará 2 huecos desplazado
    switch (splitted[i]) {
        case 'runtimes':
            console.warn('deprecated element type \'runtimes\'');
        case 'runtime':
            res = ElementType.runtime;
            break;
        case 'services':
            res = ElementType.service;
            break;
        case 'components':
            res = ElementType.component;
            break;
        case 'resources':
            res = ElementType.resource;
            break;
        default:
            console.info('Element type not covered', uri);
    }
    return res;
}
export enum ResourceType { volume, cert, domain }

export function getResourceType(uri: string): ResourceType {
    let res: ResourceType;
    let splitted = uri.split('/');
    let i = 4;
    if (splitted[2] === 'temporary') { i = i + 2; }

    // Obtenemos el tipo. En caso de que sea temprary, el tipo estará 2 huecos desplazado
    switch (splitted[i]) {
        case 'volume':
            res = ResourceType.volume;
        case 'cert':
            res = ResourceType.cert;
            break;
        case 'vhost':
            res = ResourceType.domain;
            break;
        default:
            console.info('Resource type not covered', uri);
    }
    return res;
}

export function getElementOwner(uri: string): string {
    return uri.split('/')[2];
}

export function getElementName(uri: string): string {
    let splitted: Array<string> = uri.split('/');
    let name = splitted[4];
    for (let i = 5; i < splitted.length - 1; i++) {
        name += '.' + splitted[i];
    }
    return name;
}

export function getElementVersion(uri: string): string {
    let splitted: Array<string> = uri.split('/');
    return splitted[splitted.length - 1];
}

export function isServiceEntrypoint(uri: string): boolean {
    const entrypoints = ['eslap://eslap.cloud/services/http/inbound/1_0_0'];
    return entrypoints.indexOf(uri) !== -1;
}

export function transformDeploymentToManifest(deployment: Deployment) {
    let manifestRoles = {};

    for (let rolId in deployment.roles) {
        manifestRoles[rolId] = {};
        manifestRoles[rolId].resources = {};
        manifestRoles[rolId].resources['__instances'] = (<Deployment.Rol>deployment.roles[rolId]).instanceNumber;
        manifestRoles[rolId].resources['__cpu'] = (<Deployment.Rol>deployment.roles[rolId]).cpu;
        manifestRoles[rolId].resources['__memory'] = (<Deployment.Rol>deployment.roles[rolId]).memory;
        manifestRoles[rolId].resources['__ioperf'] = (<Deployment.Rol>deployment.roles[rolId]).ioperf;
        manifestRoles[rolId].resources['__iopsintensive'] = (<Deployment.Rol>deployment.roles[rolId]).iopsintensive;
        manifestRoles[rolId].resources['__bandwidth'] = (<Deployment.Rol>deployment.roles[rolId]).bandwidth;
        manifestRoles[rolId].resources['__resilience'] = (<Deployment.Rol>deployment.roles[rolId]).resilience;
    }

    return {
        'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
        'servicename': deployment.serviceId,
        'name': deployment.name,
        'interconnection': true,
        'configuration': {
            'resources': deployment.resourcesConfig,
            'parameters': deployment.parameters
        },
        'roles': manifestRoles
    };
}
export function transformWebdomainToManifest(webdomain: string) {
    console.error('Creado nombre de resource con posibles colisiones: eslap://dashboard/resources/vhost/*');
    return {
        spec: 'eslap://eslap.cloud/resource/vhost/1_0_0',
        name: 'eslap://dashboard/resources/vhost/' + webdomain,
        parameters: {
            vhost: webdomain
        }
    };
}
export function transformDataVolumeToManifest(params) {
    console.error('DataVolume creation is under development');
}