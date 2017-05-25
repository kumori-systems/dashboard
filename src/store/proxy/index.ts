import { State, Deployment, Link, DeploymentRol, Runtime, Channel, Instance, Resource, Component, Service, ServiceRol } from './../classes';

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
        let linkList: Array<Link> = [];
        let serviceList: { [serviceId: string]: Service } = {};
        let componentList: { [componentid: string]: Component } = {};
        let resourcesList: { [resourceId: string]: Resource } = {};
        let runtimeList: { [runtimeId: string]: Runtime } = {};

        // Por la forma en la que obtenemos el estado, lo recorreremos por deployments
        for (let deploymentId in parsedBody.tcState.deployedServices) {
            // Primero resolvemos todo lo referente al servicio de un deployment

            // Comprobamos que no existe ya el servicio en la lista de servicios
            let serviceId = parsedBody.tcState.deployedServices[deploymentId].manifest.service.name;

            let version = parsedBody.tcState.deployedServices[deploymentId].manifest.versions['http://eslap.cloud/manifest/deployment/1_0_0'];
            if (!serviceList[serviceId]) { // Si no está definido lo añadimos
                let serviceName: string = 'ServiceName[' + serviceId + ']';
                let serviceResources: Array<string> = []; // Las resources las encontramos dentro de la versión 1
                for (let resourceIndex in version.resources) {
                    serviceResources.push(resourceIndex);
                    resourcesList[resourceIndex] = new Resource(
                        version.resources[resourceIndex].resource.name,
                        version.resources[resourceIndex].resource.parameters
                    );
                    console.log('NEW resource(' + resourceIndex
                        + '):\nname: ' + resourcesList[resourceIndex].realName
                        + '\nparameters: ' + JSON.stringify(resourcesList[resourceIndex].parameters));
                }
                let serviceParameters: Array<string> = version.configuration.parameters;
                let serviceRoles: { [rolId: string]: ServiceRol } = {};

                for (let rolIndex in version.service.roles) {
                    serviceRoles[version.service.roles[rolIndex].name] = new ServiceRol(
                        version.service.roles[rolIndex].component,
                        version.service.roles[rolIndex].resources, // Viene con el formato que vamos a utilizar
                        version.service.roles[rolIndex].parameters,
                    );
                    console.log('NEW rol(' + version.service.roles[rolIndex].name
                        + '):\ncomponent: ' + serviceRoles[version.service.roles[rolIndex].name].component
                        + '\nresources: ' + JSON.stringify(serviceRoles[version.service.roles[rolIndex].name].resources)
                        + '\nparameters: ' + JSON.stringify(serviceRoles[version.service.roles[rolIndex].name].parameters));
                }

                let serviceProChannels: { [channelId: string]: Channel } = {};
                for (let proChannelIndex in version.service.channels.provides) {
                    let channelId = version.service.channels.provides[proChannelIndex].name;
                    // Buscamos las conexiones del canal
                    let connections: Array<{ channelName: string, rolName?: string }> = [];

                    let connectorList = version.service.connectors;

                    for (let connectorIndex in connectorList) {
                        let dependedConector = connectorList[connectorIndex].depended.find(dependedConnector => { return dependedConnector.endpoint === channelId; });

                        if (dependedConector !== undefined) {

                            for (let providedConnectorIndex in connectorList[connectorIndex].provided)
                                connections.push({
                                    channelName: connectorList[connectorIndex].provided[providedConnectorIndex].endpoint,
                                    rolName: connectorList[connectorIndex].provided[providedConnectorIndex].role,
                                });
                        }

                    }

                    // Añadimos el canal
                    serviceProChannels[channelId] = new Channel(
                        version.service.channels.provides[proChannelIndex].type,
                        version.service.channels.provides[proChannelIndex].protocol,
                        connections
                    );

                    console.log('NEW service-proChannel(' + channelId
                        + '):\ntype: ' + serviceProChannels[channelId].type
                        + '):\nprotocol: ' + serviceProChannels[channelId].protocol
                        + '):\nconnectedTo: ' + JSON.stringify(serviceProChannels[channelId].connectedTo)
                    );
                }

                let serviceReqChannels: { [channelId: string]: Channel } = {};
                for (let reqChannelIndex in version.service.channels.requires) {
                    let channelId = version.service.channels.requires[reqChannelIndex].name;
                    // Buscamos las conexiones del canal
                    let connections: Array<{ channelName: string, rolName?: string }> = [];
                    let connectorList = version.service.connectors;
                    for (let connectorIndex in connectorList) {
                        let providedConector = connectorList[connectorIndex].provided.find(providedConnector => { return providedConnector.endpoint === channelId; });

                        if (providedConector !== undefined) {
                            for (let dependedConnectorIndex in connectorList[connectorIndex].depended)
                                connections.push({
                                    channelName: connectorList[connectorIndex].depended[dependedConnectorIndex].endpoint,
                                    rolName: connectorList[connectorIndex].depended[dependedConnectorIndex].role,
                                });
                        }

                    }

                    // Añadimos el canal
                    serviceReqChannels[channelId] = new Channel(
                        version.service.channels.requires[reqChannelIndex].type,
                        version.service.channels.requires[reqChannelIndex].protocol,
                        connections
                    );

                    console.log('NEW service-reqChannel(' + channelId
                        + '):\ntype: ' + serviceReqChannels[channelId].type
                        + '):\nprotocol: ' + serviceReqChannels[channelId].protocol
                        + '):\nconnectedTo: ' + JSON.stringify(serviceReqChannels[channelId].connectedTo)
                    );

                }

                let serviceComponents: { [componentId: string]: Component } = {};
                let components = version.components;

                for (let componentIndex in components) {
                    // Resources
                    let componentResources: { [resourceName: string]: string } = {};
                    for (let componentResourceIndex in components[componentIndex].configuration.resources) {
                        componentResources[components[componentIndex].configuration.resources[componentResourceIndex].name] = components[componentIndex].configuration.resources[componentResourceIndex].type;
                    }

                    // Provide channels
                    let proChannels: { [channelId: string]: Channel } = {};

                    for (let proChannelIndex in components[componentIndex].provided) {
                        // Buscamos las conexiones del canal
                        let channelId = components[componentIndex].provided[proChannelIndex].name;
                        let connections: Array<{ channelName: string, rolName?: string }> = [];
                        let connectorList = version.service.connectors.provided.filter(connector => { return connector.provided.endpoint === channelId; });
                        for (let connectorIndex in connectorList) {
                            connections.push({
                                channelName: connectorList[connectorIndex].provided.endpoint,
                                rolName: connectorList[connectorIndex].provided.role,
                            });
                        }
                        // Añadimos el canal
                        proChannels[channelId] = new Channel(
                            components[componentIndex].channels.provides[proChannelIndex].type,
                            components[componentIndex].channels.provides[proChannelIndex].protocol,
                            connections
                        );
                        console.log('NEW component-proChannel(' + channelId
                            + '):\ntype: ' + proChannels[channelId].type
                            + '):\nprotocol: ' + proChannels[channelId].protocol
                            + '):\nconnectedTo: ' + JSON.stringify(proChannels[channelId].connectedTo)
                        );
                    }
                    // Require channels
                    let reqChannels: { [channelId: string]: Channel } = {};
                    for (let reqChannelIndex in components[componentIndex].channels.requires) {
                        // Buscamos las conexiones del canal
                        let channelId = components[componentIndex].channels.requires[reqChannelIndex].name;
                        let connections: Array<{ channelName: string, rolName?: string }> = [];
                        let connectorList = version.service.connectors;
                        for (let connectorIndex in connectorList) {
                            connections.push({
                                channelName: connectorList[connectorIndex].depended.endpoint,
                                rolName: connectorList[connectorIndex].depended.role,
                            });
                        }
                        // Añadimos el canal
                        proChannels[channelId] = new Channel(
                            components[componentIndex].channels.requires[reqChannelIndex].type,
                            components[componentIndex].channels.requires[reqChannelIndex].protocol,
                            connections
                        );
                        console.log('NEW component-reqChannel(' + channelId
                            + '):\ntype: ' + proChannels[channelId].type
                            + '):\nprotocol: ' + proChannels[channelId].protocol
                            + '):\nconnectedTo: ' + JSON.stringify(proChannels[channelId].connectedTo)
                        );
                    }

                    serviceComponents[componentIndex] = new Component(
                        components[componentIndex].runtime,
                        componentResources,
                        components[componentIndex].configuration.parameters,
                        proChannels,
                        reqChannels);

                    console.log('NEW component created (' + componentIndex
                        + '):\nruntime: ' + serviceComponents[componentIndex].runtime
                        + '\nresources: ' + JSON.stringify(serviceComponents[componentIndex].resourcesConfig)
                        + '\nparameters: ' + serviceComponents[componentIndex].parameters
                        + '\nproChannels: ' + serviceComponents[componentIndex].proChannels
                        + '\nreqChannels: ' + serviceComponents[componentIndex].reqChannels);
                }

                serviceList[serviceId] = new Service(serviceName, serviceResources, serviceParameters, serviceRoles, serviceProChannels, serviceReqChannels, serviceComponents);
                console.log('NEW service created (' + serviceId
                    + '):\nresources: ' + JSON.stringify(serviceList[serviceId].resources)
                    + '\nparameters: ' + JSON.stringify(serviceList[serviceId].parameters)
                    + '\nroles: ' + serviceList[serviceId].roles
                    + '\nproChannels: ' + serviceList[serviceId].proChannels
                    + '\nreqChannels: ' + serviceList[serviceId].reqChannels
                    + '\ncomponents: ' + JSON.stringify(serviceList[serviceId].components)
                );
            }// En este punto el servicio ya está en la lista de servicios

            // Ahora resolvemos todo lo referente al deployment
            let deploymentName: string = 'DeploymentNAME';
            let deploymentServiceId: string = serviceId;

            let deploymentResourcesConfig: { [resource: string]: any } = {};

            console.log('DE DONDE VAMOS A OBTENER LOS DATOS ES: ' + JSON.stringify(parsedBody.tcState.deployedServices[deploymentId].manifest.resources));
            for (let resourceId in parsedBody.tcState.deployedServices[deploymentId].manifest.resources) {
                deploymentResourcesConfig[resourceId] = parsedBody.tcState.deployedServices[deploymentId].manifest.resources[resourceId].resource;
            }

            let deploymentParameters: Array<string> = [];
            let deploymentRoles: { [rolName: string]: DeploymentRol } = {};
            for (let rolId in version.roles) {
                let instanceList: { [instanceId: string]: Instance } = {};

                for (let instanceId in parsedBody.tcState.deployedServices[deploymentId].instanceList) {
                    if (parsedBody.tcState.deployedServices[deploymentId].instanceList[instanceId].component ===
                        serviceList[serviceId].roles[rolId].component
                    )
                        instanceList[instanceId] = new Instance(parsedBody.tcState.deployedServices[deploymentId].instanceList[instanceId].connected);
                }
                deploymentRoles[rolId] = new DeploymentRol(
                    version.roles[rolId].resources.__instances,
                    version.roles[rolId].resources.__cpu,
                    version.roles[rolId].resources.__memory,
                    version.roles[rolId].resources.__ioperf,
                    version.roles[rolId].resources.__iopsintensive,
                    version.roles[rolId].resources.__bandwith,
                    version.roles[rolId].resources.__resilence,
                    instanceList
                );
            }

            let deploymentWebsite: string = null;
            if (parsedBody.tcState.deployedServices[deploymentId].manifest.servicename === 'eslap://eslap.cloud/services/http/inbound/1_0_0') { // Si es un http inbound él mismo tiene el website
                deploymentWebsite = parsedBody.tcState.deployedServices[deploymentId].manifest['components-resources'].__service.vhost.resource.parameters.vhost;
            }

            deploymentList[deploymentId] = new Deployment(deploymentName, deploymentServiceId, deploymentResourcesConfig, deploymentParameters, deploymentRoles, deploymentWebsite);

            console.log('NEW deployment created (' + deploymentId
                + '):\nname: ' + deploymentList[deploymentId].name
                + '\nservice: ' + deploymentList[deploymentId].serviceId
                + '\nresourcesConfig: ' + JSON.stringify(deploymentList[deploymentId].resourcesConfig)
                + '\nparameters: ' + deploymentList[deploymentId].parameters
                + '\nroles: ' + deploymentList[deploymentId].roles
                + '\nwebsite: ' + deploymentList[deploymentId].website
            );
        }


        // Resolvemos linkList, que es lo más fácil de este mundo
        linkList = parsedBody.tcState.linkedServices;
        console.log('Links in the state: ' + JSON.stringify(linkList));

        // Gestión de errores de conexión
        // TODO: hay que comprobar los valores de cuando se lanza un error y de cuándo no se lanzan
        let error = null;
        if (response === error) {
            Promise.reject(new Error('Error de conexión al intentar obtener estado: ' + response));
        }

        return {
            'deploymentList': deploymentList,
            'serviceList': serviceList,
            'componentList': componentList,
            'resourcesList': resourcesList,
            'linkList': linkList,
            'runtimeList': runtimeList
        };
    });
}

export function undeployDeployment(deploymentId: string): void {
    console.log('INFO: Realizamos undeploy de: ' + deploymentId);
}
let registeredElements = require('./registeredElements.json');
export function getRegisteredElements() {
    return auxFunction().then(function ({ response, body }) {
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

let ejemploObtencionManifiesto = require('./ejemplo-obtencion-manifiesto.json');
export function getManifest(uri: string) {
    return auxFunction().then(function ({ response, body }) {
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
                console.log('NEW component received (' + elementIndex
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
                console.log('NEW resource received(' + elementIndex
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
    return auxFunction().then(function ({ response, body }) {
        console.log('Enviada la petición para crear un nuevo HTTPEntrypoint: ' + JSON.stringify(params));
    });
}