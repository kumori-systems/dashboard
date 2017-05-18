import { State, Deployment, DeploymentRol, Channel, Instance, Resource, Arrangement, Service, ServiceRol } from './../classes';

// TODO: sustituir esta función por la llamada correspondiente
function auxFunction(): Promise<{ response: string, body: string }> {
    const promesa = new Promise(function (resolve, reject) {
        resolve({ response: 'respuesta', body: 'cuerpo' });
    });
    return promesa;
}

let stampStateExample = require('./tc-state-example.json');

/**
 * Preguntamos por el estado del stamp.
 * Con el estado creamos dos listas;
 * DeploymentList y serviceList
 * Devolvemos un objeto que contenga las dos listas 
 */
export function getStampState() {

    return auxFunction().then(function ({ response, body }) {
        let parsedBody = stampStateExample;
        let deploymentList: { [deploymentId: string]: Deployment } = {};
        let serviceList: { [serviceId: string]: Service } = {};


        // Por la forma en la que obtenemos el estado, lo recorreremos por deployments
        for (let deploymentId in parsedBody.tcState.deployedServices) {

            // Primero resolvemos todo lo referente al servicio de un deployment
            let service = parsedBody.tcState.deployedServices[deploymentId].service;
            // Comprobamos que no existe ya el servicio en la lista de servicios
            let serviceId = service.name;
            if (!serviceList[serviceId]) { // Si no está definido lo añadimos

                let version = parsedBody.tcState.deployedServices[deploymentId].versions['http://eslap.cloud/manifest/deployment/1_0_0'];
                let serviceResources: { [resourceId: string]: Resource } = {}; // Las resources las encontramos dentro de la versión 1
                for (let resourceIndex in version.resources) {
                    serviceResources[resourceIndex] = new Resource(
                        version.resources[resourceIndex].resource.name,
                        version.resources[resourceIndex].resource.parameters
                    );
                }
                let serviceParameters: Array<string> = version.configuration.parameters;
                let serviceRoles: { [rolId: string]: ServiceRol } = {};

                for (let rolIndex in version.service.roles) {
                    serviceRoles[version.service.roles[rolIndex].name] = new ServiceRol(
                        version.service.roles[rolIndex].component,
                        version.service.roles[rolIndex].resources, // Viene con el formato que vamos a utilizar
                        version.service.roles[rolIndex].parameters,
                    );
                }

                let serviceProChannels: { [channelId: string]: Channel };
                for (let reqChannelIndex in version.service.channels.provides) {
                    let channelId = version.service.channels.provides[reqChannelIndex].name;
                    // Buscamos las conexiones del canal
                    let connections: Array<{ channelName: string, rolName?: string }> = [];
                    let connectorList = version.service.connectors.provided.find(connector => { return connector.depended.endpoint === channelId; });
                   for (let connectorIndex in connectorList) {
                        connections.push({
                            channelName: connectorList[connectorIndex].provided.endpoint,
                            rolName: connectorList[connectorIndex].provided.role,
                        });
                    }

                    // Añadimos el canal
                    serviceProChannels[channelId] = new Channel(
                        version.service.channels.provides[reqChannelIndex].type,
                        version.service.channels.provides[reqChannelIndex].protocol,
                        connections
                    );
                }

                let serviceReqChannels: { [channelId: string]: Channel };
                for (let reqChannelIndex in version.service.channels.requires) {
                    // Buscamos las conexiones del canal
                    let channelId = version.service.channels.requires[reqChannelIndex].name;
                    let connections: Array<{ channelName: string, rolName?: string }> = [];
                    let connectorList = version.service.connectors.depended.filter(connector => { return connector.depended.endpoint === channelId; });
                    for (let connectorIndex in connectorList) {
                        connections.push({
                            channelName: connectorList[connectorIndex].depended.endpoint,
                            rolName: connectorList[connectorIndex].depended.role,
                        });
                    }

                    // Añadimos el canal
                    serviceReqChannels[channelId] = new Channel(
                        version.service.channels.requires[reqChannelIndex].type,
                        version.service.channels.requires[reqChannelIndex].protocol,
                        connections
                    );
                }

                serviceList[serviceId] = new Service(serviceResources, serviceParameters, serviceRoles, serviceProChannels, serviceReqChannels);
            }// En este punto el servicio ya está en la lista de servicios

            // Ahora resolvemos todo lo referente al deployment
            let deploymentName: string = 'DeploymentNAME';
            let deploymentServiceId: string = serviceId;
            let deploymentResourcesConfig: { [resource: string]: string };
            let deploymentParameters: Array<string>;
            let deploymentRoles: { [rolName: string]: DeploymentRol };
            let deploymentWebsite: string;
            deploymentList[deploymentId] = new Deployment(deploymentName, deploymentServiceId, deploymentResourcesConfig, deploymentRarameters, deploymentRoles, deploymentWebsite);


        }

        // Gestión de errores de conexión
        // TODO: hay que comprobar los valores de cuando se lanza un error y de cuándo no se lanzan
        let error = null;
        if (response === error) {
            Promise.reject(new Error('Error de conexión al intentar obtener estado: ' + response));
        }

        return { 'deploymentList': deploymentList, 'serviceList': serviceList };
    });
}
export function deploymentRolAddInstance() {
    return auxFunction();
}
export function deploymentRolRemoveInstance() { return auxFunction(); }

export function undeployDeployment(deploymentId: string): void {
    console.log('Realizamos undeploy de: ' + deploymentId);
}