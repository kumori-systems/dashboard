import { Deployment as EcloudDeployment, AdmissionEvent as EcloudEvent, EcloudEventType } from 'admission-client';
import { Deployment, Link, Service, Resource, Component, Runtime, Cert, DataVolume, Webdomain } from '../classes';
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
    if (ecloudDeployment.service === 'eslap://eslap.cloud/services/http/inbound/1_0_0'
        && ecloudDeployment.roles['sep']
        && ecloudDeployment.roles['sep'].entrypoint
        && ecloudDeployment.roles['sep'].entrypoint.domain)
        website.push(ecloudDeployment.roles['sep'].entrypoint.domain);

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
            endpoint: string,
        }],
        provided: [{
            role: string,
            endpoint: string
        }]
    }]
}): Service {
    let resources = {};
    for (let i = 0; i < manifest.configuration.resources.length; i++) {
        resources[manifest.configuration.resources[i].name] = manifest.configuration.resources[i].type;
    }
    let components = [];
    let roles = {};
    for (let i = 0; i < manifest.roles.length; i++) {
        roles[manifest.roles[i].name] = new Service.Rol(manifest.roles[i].component, manifest.roles[i].resources, manifest.roles[i].parameters);
        if (components.indexOf(manifest.roles[i].component) === -1) {
            components.push(manifest.roles[i].component);
        }
    }
    let proChannels = {};
    for (let i = 0; i < manifest.channels.provides.length; i++) {
        proChannels[manifest.channels.provides[i].name] = new Service.Rol.Channel(manifest.channels.provides[i].type, manifest.channels.provides[i].protocol, null);
    }
    let reqChannels = {};
    for (let i = 0; i < manifest.channels.requires.length; i++) {
        reqChannels[manifest.channels.requires[i].name] = new Service.Rol.Channel(manifest.channels.requires[i].type, manifest.channels.requires[i].protocol, null);
    }


    return new Service(
        manifest.name, // uri:string
        resources, // resources: Array<string>,
        manifest.configuration.parameters, // parameters: Array<string>,
        roles, // roles: { [rolId: string]: Service.Rol },
        proChannels, // proChannels: { [channelId: string]: Service.Rol.Channel },
        reqChannels // reqChannels: { [channelId: string]: Service.Rol.Channel },
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
        requires: Array<any>,
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
    let resources = {};
    if (manifest.configuration.resources)
        for (let i = 0; i < manifest.configuration.resources.length; i++) {
            resources[manifest.configuration.resources[i].name] = manifest.configuration.resources[i].type;
        }

    let proChannels = {};
    if (manifest.channels && manifest.channels.provides)
        for (let i = 0; i < manifest.channels.provides.length; i++) {
            proChannels[manifest.channels.provides[i].name] = manifest.channels.provides[i].type;
        }

    let reqChannels = {};
    if (manifest.channels && manifest.channels.requires)
        for (let i = 0; i < manifest.channels.requires.length; i++) {
            reqChannels[manifest.channels.requires[i].name] = manifest.channels.requires[i].type;
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
    /*
        {
            'spec':'eslap://eslap.cloud/resource/vhost/1_0_0',
            'name':'eslap://eslap.cloud/resources/vhost/acs',
            'parameters':{
                'vhost':'acs-dame-argo.slap53.iti.es'
            }
        }
    */
    /*    
        {
            'spec':'eslap://eslap.cloud/resource/cert/server/1_0_0',
            'name':'eslap://sampleservicecalculator/resources/cert/server/calccert',
            'parameters':{
                'content':{
                    'cert':'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN2akNDQWFZQ0FRWXdEUVlKS29aSWh2Y05BUUVMQlFBd2dZQXhDekFKQmdOVkJBWVRBbVZ6TVE0d0RBWUQKVlFRSURBVnpjR0ZwYmpFUk1BOEdBMVVFQnd3SWRtRnNaVzVqYVdFeERqQU1CZ05WQkFvTUJXTmhTVlJKTVE4dwpEUVlEVlFRTERBWmpZVk5KUkVreERqQU1CZ05WQkFNTUJXTmhTVlJKTVIwd0d3WUpLb1pJaHZjTkFRa0JGZzVxCmRtRnNaWEp2UUdsMGFTNWxjekFlRncweE5UQTJNRGt4TlRBME1UaGFGdzB5T1RBeU1UVXhOVEEwTVRoYU1FMHgKQ3pBSkJnTlZCQVlUQWtWVE1SRXdEd1lEVlFRSERBaFdZV3hsYm1OcFlURVNNQkFHQTFVRUNnd0pUV2xGYlhCeQpaWE5oTVJjd0ZRWURWUVFEREE1MWJtOHVaVzF3Y21WellTNWxjekNCbnpBTkJna3Foa2lHOXcwQkFRRUZBQU9CCmpRQXdnWWtDZ1lFQTZyUWtDcGNRVkFvREtBbWZFbjlXNTRra0s5WGp4NlJENWhUb21WMXBGQ1V1K2x6U3NML3YKam04dGJBTFJLTlF0YUJTZHdqbldUTW0vTmRHaWM3R0lQaFlDSXFmUEpRN1NiZ1BuOVE1Zit6SVg1NHQzTWdOagpiN2Q2WHF2RFE4ZThPY0oxTnpzUVYrTGUyZXYrZzRuT09xSWF5MktxaWZTTHhPOEU0ZDk3bVcwQ0F3RUFBVEFOCkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQU9PeEt5ckVpZUs3T2h4V1Fkd0pvTXcxSXlrcENJV0I3MW5uTmFCSVEKRStGMmZvWnhPSitRUS8wWktVRFhud2g5ei9Kd2ZDeHRwZ1U3NVFPanV6SGUwaklqUUFmTWxXek1OaHdtekt1NwpyNUs3bmN6RzJRQnNXYm5NYzFnZkNGZzFYa0UrOWtSNVk2RE5zSUV2dW4zMFlMQ2VuN01QREh6cjVuOEJXVE43Cnh2QmlqM0VUOVQ5MFJPeldnNVNGQ0Z3N2xDc1pka1lIejJDYUdpNStmczVManZ2KzJMb2JTODVpVXpMNm5EZWwKT3NBOE5ETUVpTys4OThvQmRnYS9XV0JuYVplMFJQRTVlT25IaTg4VzZhdUk1Y052cVlTSmhLT2tVcjRVLzdMUgpEZGZOOTh0bHRQaWs3WjQveDFsVzJiSnNRTWwxU0RoTlFXVGZpU0Y2czV4d2VnPT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=','key':'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDWGdJQkFBS0JnUURxdENRS2x4QlVDZ01vQ1o4U2YxYm5pU1FyMWVQSHBFUG1GT2laWFdrVUpTNzZYTkt3CnYrK09ieTFzQXRFbzFDMW9GSjNDT2RaTXliODEwYUp6c1lnK0ZnSWlwODhsRHRKdUErZjFEbC83TWhmbmkzY3kKQTJOdnQzcGVxOE5EeDd3NXduVTNPeEJYNHQ3WjYvNkRpYzQ2b2hyTFlxcUo5SXZFN3dUaDMzdVpiUUlEQVFBQgpBb0dCQUw4bStET24xU1NkQXZVWTRQV3Z3SmZTbWlNWmtPcUlYc1NGUXV1bHFHOC8yWU1QRm9uZHlMMjR6c1dwCmhiQTdIc0FtQ2xhbHhHUEY3SFZveDJaeXNRSlFWYWwrT3JPYUJYTHo2TXpBOEZ2VUJMMjZyK0ZMaHU5ZkNrNVMKb2FvODh2cXR6VU1lTDhrQTB0RnMrbTlVbkV4TXVjaXJKUk8vUUlBYWJjT0YvdTRCQWtFQS90bWdsM0J4N3g2NwpCOFhhY0J2UnRGWGJzK2ZwNnBsc2RnOHBSaCs2ck1mckw2QTdaL3lhRWJuWWI2ZmRESUpxelpDN2swaVZRbFR5ClZSZUlsbFRBbndKQkFPdkRQaUd4VnFHVHRyTkFmVUhqQnNqT1BVT3lJK1h5M0xSQUJIUFY1Qis1dUFJMzVUVmQKaDQ5U3A0eU0ySE5xOXAzZlN1QUx0UHQ2cWFXdHFtRmpybk1DUVFDT2ljd2ZSMzRCL3c4ZW50TzQ1bVpZMWJpbgpHK3dpRWFPdk9IV2VTZnJQenBWRk12cG5BOHBzWmFTZmRxVFU3VkN0SHVrNnpGcm5HYm5jUytoU0pKOERBa0I4ClB6YTlOdUk2NE1mR0M5UjNKcGZxdDVYZDJVSEY2NG1Zakt4TUI0cmpsVkorQ01zSXByUE1PbmtHUHl2TEY3SEUKWFdydVMvMGpFdS9ZMm44U09DQTFBa0VBbElPTkZyaU03NzZJMFR0OUM0UTR2T2Y4bzRXQmdJTjhHN05kcWo0aApiUU5JVlJqZkhNSWZwNTEwbTdVNzkzZEZEUU5hOXVGMFFqdG1MdjRtc016anBnPT0KLS0tLS1FTkQgUlNBIFBSSVZBVEUgS0VZLS0tLS0K'
                }
            }
        }
    */
    /*
    {
        'spec':'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
        'name':'eslap://eslap.cloud/resources/volume/acs/persistent',
        'parameters':{
            'size':'10',
            'prefix':'acs-volumes'
        }
    }
    */


    // constructor(uri: string, realName: string, parameters: Object)
    switch (manifest.spec.split('/')[4]) {
        case 'vhost':
            return new Webdomain(
                manifest.name,
                manifest.parameters.vhost,
                Webdomain.State.VALIDATED
            );
        case 'cert':
            return new Cert(
                manifest.name
            );
        case 'volume':
            return new DataVolume(
                manifest.name
            );
        default:
            console.error('Resource type not espected: ', manifest.spec);
    }
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
        roles: {
            [rolId: string]: {
                instances: { [instanceId: string]: Deployment.Metrics },
                data: Deployment.Metrics
            }
        },
        data: Deployment.Metrics
    }
} {
    let res = {};
    let deploymentId = ecloudEvent.data.deploymentUrn;
    res[deploymentId] = {};
    res[deploymentId].roles = {};
    res[deploymentId].data = {};
    let timestamp = ecloudEvent.timestamp;
    for (let rolId in ecloudEvent.data.roles) {
        res[deploymentId].roles[rolId] = {};
        res[deploymentId].roles[rolId].data = {};
        res[deploymentId].roles[rolId].instances = {};

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
    return entrypoints.indexOf(uri) === -1;
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