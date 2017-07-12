
import { AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent, EcloudEventType } from 'admission-client';
import { AcsClient as EcloudAcsClient } from 'acs-client';

import Moment from 'moment';

import { Deployment, Link, Runtime, Resource, Component, Service } from './../classes';
import { ADMISSION_URI, ACS_URI } from './config';

import * as utils from './utils';

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
    /*
    return acs.login(username, password).then(({ accessToken, user }) => {
        console.log('Realizado login con ACS', user, accessToken);
        admission = new EcloudAdmissionClient(ADMISSION_URI, accessToken);
        // admission = new EcloudAdmissionClient(ADMISSION_URI);
    */

    return auxFunction().then(() => {
        let accessToken = 'AAAAAAAAA';
        let user = { name: 'josep' };
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


        return admission.init().then(() => { return user.name; });
    });
}
export function getDeploymentList() {
    return admission.findDeployments().then((deploymentList) => {
        let res: { [deploymentId: string]: Deployment } = {};
        for (let deploymentId in deploymentList) {
            res[deploymentId] = utils.transformEcloudDeploymentToDeployment(deploymentList[deploymentId]);
        }
        return res;
    });
};

/**
 * The purpose of this function is to fullfil the view elements
 */
export function getRegisteredElements() {
    return admission.findStorage().then((registeredElements) => {

        let runtimes: { [runtimeId: string]: Runtime } = {};
        let components: { [componentId: string]: Component } = {};
        let services: { [serviceId: string]: Service } = {};
        let resources: { [resourceId: string]: Resource } = {};

        // Separamos los distintos elementos dependiendo de qué tipo sean
        for (let indice = 0; indice < registeredElements.length; indice++) {
            switch (registeredElements[indice].split('/')[3]) {
                case 'runtime':
                case 'runtimes':
                    runtimes[registeredElements[indice]] = null;
                    break;
                case 'service':
                case 'services':
                    services[registeredElements[indice]] = null;
                    break;
                case 'component':
                case 'components':
                    components[registeredElements[indice]] = null;
                    break;
                case 'resource':
                case 'resources':
                    resources[registeredElements[indice]] = null;
                    break;
                default:
                    console.info('Case not covered', registeredElements[indice]);
            }
        }

        return { runtimes, components, services, resources };
    });
}

export function undeployDeployment(deploymentId: string): void {
    console.info('INFO: Realizamos undeploy de: ' + deploymentId);
}

export function getElementInfo(uri: string) {
    return admission.getStorageManifest(uri);
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

/*
export function getMetrics() {
    return auxFunction().then(function () {

        let parsedBody = ejemploMetricas;

        let normalMetrics: {
            [deploymentId: string]: {
                [rolId: string]: {
                    [instanceId: string]: Deployment.Rol.Instance.CommonMetrics
                }
            }
        } = {};
        let entryPointMetrics: {
            [deploymentId: string]: {
                [rolId: string]: {
                    [instanceId: string]: Deployment.Rol.Instance.EntryPointMetrics
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
                                    if (!entryPointMetrics[deploymentId][rolId][instanceId]) entryPointMetrics[deploymentId][rolId][instanceId] = new Deployment.Rol.Instance.EntryPointMetrics();

                                    entryPointMetrics[deploymentId][rolId][instanceId].addValues(
                                        Moment(parsedBody.metrics[metricsIndex].timeinterval.init).toDate(),
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
                                    if (!normalMetrics[deploymentId][rolId][instanceId]) normalMetrics[deploymentId][rolId][instanceId] = new Deployment.Rol.Instance.CommonMetrics();

                                    normalMetrics[deploymentId][rolId][instanceId].addValues(
                                        Moment(parsedBody.metrics[metricsIndex].timeinterval.init).toDate(), // Time
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
*/

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