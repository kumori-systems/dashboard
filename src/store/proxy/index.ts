import { Arrangement, State, Deployment, Link, DeploymentRol, Runtime, Channel, NormalMetrics, EntryPointMetrics, Instance, Resource, Component, Service, ServiceRol } from './../classes';
import moment from 'moment';

export enum CONNECTION_STATE { SUCCESS, ON_PROGRESS, FAIL };


import { AcsClient as EcloudAcsClient } from 'acs-client';
import { AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent, Deployment as EcloudDployment, EcloudEventType } from 'admission-client/dist/src';

import { ADMISSION_URI, ACS_URI } from './config';

// TODO: sustituir esta función por la llamada correspondiente
function auxFunction(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        resolve();
    });
}

let admission: EcloudAdmissionClient;
let acs: EcloudAcsClient;

export function login(username: string, password: string) {
    acs = new EcloudAcsClient(ACS_URI);
    return acs.login(username, password).then(({ accessToken }) => {
        // admission = new EcloudAdmissionClient(ADMISSION_URI, accessToken);
        admission = new EcloudAdmissionClient(ADMISSION_URI);
        admission.onConnected(() => {
            console.info('SUCCESSFULLY connected to admission');
        });

        admission.onEcloudEvent((event: EcloudEvent) => {
            switch (event.type) {
                case EcloudEventType.service:
                    console.info('Service event received: ' + event.strName);
                    // Service event type handler function
                    break;
                case EcloudEventType.node:
                    console.info('Node event received: ' + event.strName);
                    // Node event type handler function
                    break;
                case EcloudEventType.instance:
                    console.info('Instance event received: ' + event.strName);
                    // Instance event type handler function
                    break;
                case EcloudEventType.metrics:
                    console.info('Metrics event received: ' + event.strName);
                    // Metrics event type handler function
                    break;
                default:
                    console.error('Non espected ecloud event type: ' + event.strType + '/' + event.strName);
            }

            console.info('Event should had been processed at this point');
            console.log(JSON.stringify(event, null, 2));
        });

        admission.onError((error: any) => {
            console.error('Error received from admission-client: ' + JSON.stringify(error));
        });

        return admission.init();
    });
}
export function getDeploymentList() {
    return admission.findDeployments().then((deploymentList) => {
        let res: { [deploymentId: string]: Deployment } = {};
        console.log('Admission.findDeployments nos devuelve: ', deploymentList);
        let roles: { [rolId: string]: DeploymentRol };
        let instances: { [instanceId: string]: Instance };
        for (let deploymentId in deploymentList) {
            roles = {};
            for (let rolId in deploymentList[deploymentId].roles) {
                instances = {};
                for (let instanceId in deploymentList[deploymentId].roles[rolId].instances) {
                    instances[instanceId] = new Instance(
                        deploymentList[deploymentId].roles[rolId].instances[instanceId].cnid,
                        deploymentList[deploymentId].roles[rolId].instances[instanceId].publicIp,
                        deploymentList[deploymentId].roles[rolId].instances[instanceId].privateIp,
                        new Arrangement(
                            deploymentList[deploymentId].roles[rolId].instances[instanceId].arrangement.mininstances,
                            deploymentList[deploymentId].roles[rolId].instances[instanceId].arrangement.maxinstances,
                            deploymentList[deploymentId].roles[rolId].instances[instanceId].arrangement.cpu,
                            deploymentList[deploymentId].roles[rolId].instances[instanceId].arrangement.memory,
                            deploymentList[deploymentId].roles[rolId].instances[instanceId].arrangement.bandwith,
                            deploymentList[deploymentId].roles[rolId].instances[instanceId].arrangement.failureZones
                        ),
                        deploymentList[deploymentId].roles[rolId].instances[instanceId].volumes,
                        deploymentList[deploymentId].roles[rolId].instances[instanceId].ports
                    );
                }

                if (deploymentList[deploymentId].roles[rolId].configuration) {
                    roles[rolId] = new DeploymentRol(
                        deploymentList[deploymentId].roles[rolId].configuration.cpu,
                        deploymentList[deploymentId].roles[rolId].configuration.memory,
                        deploymentList[deploymentId].roles[rolId].configuration.ioperf,
                        deploymentList[deploymentId].roles[rolId].configuration.iopsintensive,
                        deploymentList[deploymentId].roles[rolId].configuration.bandwidth,
                        deploymentList[deploymentId].roles[rolId].configuration.resilence,
                        instances
                    );
                } else {
                    roles[rolId] = new DeploymentRol(
                        1,
                        1,
                        1,
                        false,
                        1,
                        1,
                        instances
                    );
                }

            }

            res[deploymentId] = new Deployment(
                deploymentList[deploymentId].urn, // name: string
                deploymentList[deploymentId].service, // serviceId: string
                {}, // resourcesConfig: { [resource: string]: any }
                {}, // parameters: any
                roles, // roles: { [rolName: string]: DeploymentRol }
                null, // website: Array<string>) {
            );
        }
        return res;
    });
};

export function undeployDeployment(deploymentId: string): void {
    console.info('INFO: Realizamos undeploy de: ' + deploymentId);
}

let registeredElements = require('./registered_elements_example.json');
export function getRegisteredElements() {
    return auxFunction().then(function () {
        let parsedBody = registeredElements.data;

        // parsedbody nos devolverá una array de elementos.
        // Lo pasamos a diccionario
        let res: { [id: string]: Object } = {};
        for (let element in parsedBody) {
            res[parsedBody[element]] = null;
        }
        return { 'registeredElements': res };
    });
}

let ejemploObtencionManifiesto = require('./get_manifest_example.json');
export function getManifest(uri: string) {
    return auxFunction().then(function () {
        let parsedBody = ejemploObtencionManifiesto.data;
        // Dependiendo del tipo de elemento, deberíamos de parsearlo como la clase que tenemos internamente
        let element;
        let elementIndex = parsedBody.data.name;
        let splited: Array<string> = (<string>parsedBody.data.spec).split('/');
        switch (splited[3]) {
            case 'components': // Caso en que el elemento por el que hemos preguntado sea un componente
                let resourcesConfig: { [resourceId: string]: string } = {};
                for (let resourceIndex in parsedBody.data.configuration.resources) {
                    resourcesConfig[parsedBody.data.configuration.resources[resourceIndex].name] = parsedBody.data.configuration.resources[resourceIndex].type;
                }
                // Provide channels
                let proChannels: { [channelId: string]: Channel } = {};
                for (let proChannelIndex in parsedBody.data.channels.provides) {
                    let channelId = parsedBody.data.channels.provides[proChannelIndex].name;
                    // Añadimos el canal
                    proChannels[channelId] = new Channel(
                        parsedBody.data.channels.provides[proChannelIndex].type, // tipo
                        parsedBody.data.channels.provides[proChannelIndex].protocol, // protocolo
                        null // conexiones -> Este dato no lo podemos calcular aquí
                    );
                }
                // Require channels
                let reqChannels: { [channelId: string]: Channel } = {};
                for (let reqChannelIndex in parsedBody.data.channels.requires) {
                    let channelId = parsedBody.data.channels.requires[reqChannelIndex].name;
                    // Añadimos el canal
                    reqChannels[channelId] = new Channel(
                        parsedBody.data.channels.requires[reqChannelIndex].type, // tipo
                        parsedBody.data.channels.requires[reqChannelIndex].protocol, // protocolo
                        null // conexiones -> Este dato no lo podemos calcular aquí
                    );
                }

                element = new Component(
                    parsedBody.data.runtime, // runtime
                    resourcesConfig, // resourcesConfig
                    parsedBody.data.configuration.parameters, // parameters
                    proChannels, // proChannels
                    reqChannels // reqChannels
                );
                console.info('NEW component received (' + elementIndex
                    + '):\nruntime: ' + element.runtime
                    + '\nresources: ' + JSON.stringify(element.resourcesConfig)
                    + '\nparameters: ' + element.parameters
                    + '\nproChannels: ' + element.proChannels
                    + '\nreqChannels: ' + element.reqChannels);
                break;
            case 'runtime': // Caso en que el elemento por el que hemos preguntado sea un runtime
                element = null; // TODO: no he visto manifiestos de runtimes por ningún lado
                throw new Error('Error obtaining a runtime..');
            // break;
            case 'resources':
                element = new Resource(
                    parsedBody.data.name,
                    parsedBody.data.parameters
                );
                console.info('NEW resource received(' + elementIndex
                    + '):\nname: ' + element.realName
                    + '\nparameters: ' + element.parameters);
                break;
            case 'services':
                element = null; // TODO: No estoy seguro que haga falta obtener todo el servicio
                throw new Error('Error obtaining a service..');
            // break;
        }

        // parsedbody nos devolverá una array de elementos.
        // Lo pasamos a diccionario
        return [elementIndex, element];
    });
}
export function createNewHTTPENtrypoint(params: {
    'usePlatformGeneratedDomain': boolean,
    'domain': string,
    'accept-tls': boolean,
    'require-client-certificates': boolean,
    'instances': number,
    'resilence': number
}) {
    return auxFunction().then(function () {
        console.info('Enviada la petición para crear un nuevo HTTPEntrypoint: ' + JSON.stringify(params));
    });
}

export function addDeployment(params) {
    console.log('Creando un nuevo deployment con los parámetros: ' + JSON.stringify(params));
}

let ejemploMetricas = require('./metrics_example.json');
export function getMetrics() {
    return auxFunction().then(function () {

        let parsedBody = ejemploMetricas;

        let normalMetrics: {
            [deploymentId: string]: {
                [rolId: string]: {
                    [instanceId: string]: NormalMetrics
                }
            }
        } = {};
        let entryPointMetrics: {
            [deploymentId: string]: {
                [rolId: string]: {
                    [instanceId: string]: EntryPointMetrics
                }
            }
        } = {};

        for (let metricsIndex in parsedBody.metrics) { // Por cada métrica obtenida
            for (let serviceId in parsedBody.metrics[metricsIndex].deployments) { // Recorremos los servicios
                for (let deploymentId in parsedBody.metrics[metricsIndex].deployments[serviceId]) { // Por cada deployment del servicio
                    for (let componentId in parsedBody.metrics[metricsIndex].deployments[serviceId][deploymentId]) { // Por cada componente del deployment
                        for (let rolId in parsedBody.metrics[metricsIndex].deployments[serviceId][deploymentId][componentId]) { // Por cada rol del componente
                            for (let instanceId in parsedBody.metrics[metricsIndex].deployments[serviceId][deploymentId][componentId][rolId]) { // Por cada instáncia del rol
                                if (serviceId.split('/')[5] === 'inbound') { // Si es un inbound
                                    // Si no habíamos instanciado el deployment en el resultado lo hacemos
                                    if (!entryPointMetrics[deploymentId]) entryPointMetrics[deploymentId] = {};
                                    // Si no habíamos instanciado el rol en el resultado lo hacemos
                                    if (!entryPointMetrics[deploymentId][rolId]) entryPointMetrics[deploymentId][rolId] = {};
                                    // Inicializamos el array de la instancia en el resultado
                                    if (!entryPointMetrics[deploymentId][rolId][instanceId]) entryPointMetrics[deploymentId][rolId][instanceId] = new EntryPointMetrics();

                                    entryPointMetrics[deploymentId][rolId][instanceId].addValues(
                                        moment(parsedBody.metrics[metricsIndex].timeinterval.init).toDate(),
                                        1,
                                        2,
                                        3,
                                        4,
                                        5,
                                        6,
                                        7,
                                        8,
                                        9,
                                        10,
                                        11,
                                        12,
                                        13,
                                        14
                                    );

                                    console.info(
                                        'NEW Inbound metric (' + deploymentId + ' ,' + rolId + ' ,' + instanceId
                                        + '):\ntime: ' + entryPointMetrics[deploymentId][rolId][instanceId].time
                                        + '\ntimestamp_init: ' + entryPointMetrics[deploymentId][rolId][instanceId].timestamp_init
                                        + '\ntimestamp_end: ' + entryPointMetrics[deploymentId][rolId][instanceId].timestamp_end
                                        + '\nelapsed_msec: ' + entryPointMetrics[deploymentId][rolId][instanceId].elapsed_msec
                                        + '\nhttp_request_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].http_request_per_second
                                        + '\nhttp_errors_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].http_errors_per_second
                                        + '\nhttp_size_in_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].http_size_in_per_second
                                        + '\nhttp_size_out_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].http_size_out_per_second
                                        + '\nhttp_chunk_in_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].http_chunk_in_per_second
                                        + '\nhttp_chunk_out_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].http_chunk_out_per_second
                                        + '\nhttp_response_time: ' + entryPointMetrics[deploymentId][rolId][instanceId].http_response_time
                                        + '\nws_size_in_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].ws_size_in_per_second
                                        + '\nws_size_out_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].ws_size_out_per_second
                                        + '\nws_chunk_in_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].ws_chunk_in_per_second
                                        + '\nws_chunk_out_per_second: ' + entryPointMetrics[deploymentId][rolId][instanceId].ws_chunk_out_per_second
                                    );
                                } else { // Si no es un inbound (servicio normal)
                                    // Si no habíamos instanciado el deployment en el resultado lo hacemos
                                    if (!normalMetrics[deploymentId]) normalMetrics[deploymentId] = {};
                                    // Si no habíamos instanciado el rol en el resultado lo hacemos
                                    if (!normalMetrics[deploymentId][rolId]) normalMetrics[deploymentId][rolId] = {};
                                    // Inicializamos el array de la instancia en el resultado
                                    if (!normalMetrics[deploymentId][rolId][instanceId]) normalMetrics[deploymentId][rolId][instanceId] = new NormalMetrics();

                                    normalMetrics[deploymentId][rolId][instanceId].addValues(
                                        moment(parsedBody.metrics[metricsIndex].timeinterval.init).toDate(), // Time
                                        Math.round(parsedBody.metrics[metricsIndex].deployments[serviceId][deploymentId][componentId][rolId][instanceId].cpu.mean * 100), // CPU
                                        Math.round(parsedBody.metrics[metricsIndex].deployments[serviceId][deploymentId][componentId][rolId][instanceId].memory.mean), // MEM
                                        Math.round(parsedBody.metrics[metricsIndex].deployments[serviceId][deploymentId][componentId][rolId][instanceId].bandwith_input.mean * 100), // NET_IN
                                        Math.round(parsedBody.metrics[metricsIndex].deployments[serviceId][deploymentId][componentId][rolId][instanceId].bandwith_output.mean * 100), // NET_OUT
                                        0, // RPM
                                        0 // RES
                                    );
                                    console.info(
                                        'NEW Normal metric (' + deploymentId + ' ,' + rolId + ' ,' + instanceId
                                        + '):\ntime: ' + normalMetrics[deploymentId][rolId][instanceId].time
                                        + '\ncpu: ' + normalMetrics[deploymentId][rolId][instanceId].cpu
                                        + '\nmem: ' + normalMetrics[deploymentId][rolId][instanceId].mem
                                        + '\nnet_in: ' + normalMetrics[deploymentId][rolId][instanceId].net_in
                                        + '\nnet_out: ' + normalMetrics[deploymentId][rolId][instanceId].net_out
                                        + '\nrpm: ' + normalMetrics[deploymentId][rolId][instanceId].rpm
                                        + '\nres: ' + normalMetrics[deploymentId][rolId][instanceId].res
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        return { 'entryPointMetrics': entryPointMetrics, 'normalMetrics': normalMetrics };
    });
}

export function aplyChangesToDeployment(changes) {
    console.log('Intentando aplicar cambios al deployment: ' + JSON.stringify(changes));
}

// ElementId puede ser un URN o una lista de URNs
export function deleteElement(elementId) {
    console.log('Enviamos mensaje para eliminar: ' + JSON.stringify(elementId));
}

// ElementId puede ser un URN o una lista de URNs
export function downloadManifest(elementId) {
    console.log('Descargando el manifiesto de: ' + JSON.stringify(elementId));
}
export function addWebdomain(webdomain) {
    console.log('Enviamos un mensaje para AÑADIR el dominio: ' + JSON.stringify(webdomain));
}
export function deleteWebdomain(webdomain) {
    console.log('Enviamos un mensaje para ELIMINAR el dominio: ' + JSON.stringify(webdomain));
}
export function addDataVolume(params) {
    console.log('Enviamos un mensaje para añadir un volúmen de datos con los siguientes parámetros: ' + JSON.stringify(params));
}
export function addNewElement(params) {
    console.log('Enviamos un mensaje para añadir un nuevo elemento. El mensaje contiene: ' + JSON.stringify(params));
}