import { Deployment, Rol, Link, Instance, Volume } from './../classes';

// TODO: sustituir esta función por la llamada correspondiente
function auxFunction(): Promise<{ response: string, body: string }> {
    const promesa = new Promise(function (resolve, reject) {
        resolve({ response: 'respuesta', body: 'cuerpo' });
    });
    return promesa;
}

let stampStateExample = require('./tc-state-example.json');

export function getDeploymentList() {
    // Preguntamos por el stampstate, organizamos en deployments y guardamos
    return auxFunction().then(function ({ response, body }) {
        let parsedBody = stampStateExample;
        let res: Array<Deployment> = [];
        for (let deployment in parsedBody.tcState.deployedServices) {
            let name = deployment;
            let service = parsedBody.tcState.deployedServices[deployment].manifest.service.name;
            let roles: Array<Rol> = [];
            let website: string = 'No website defined';
            let links: Array<Link> = [];
            let anyadido: boolean;
            for (let link in parsedBody.tcState.linkedServices) { // TODO: Esto puede ser optimizado
                anyadido = false;
                if (parsedBody.tcState.linkedServices[link].deployment1 === deployment) {
                    links.push(new Link(parsedBody.tcState.linkedServices[link].deployment2));
                    anyadido = true;
                } else if (parsedBody.tcState.linkedServices[link].deployment2 === deployment) {
                    links.push(new Link(parsedBody.tcState.linkedServices[link].deployment1));
                    anyadido = true;
                }
                if (anyadido) { // ¿tenemos website?
                    if (parsedBody.tcState.deployedServices[links[links.length - 1].connectedTo].manifest.servicename === 'eslap://eslap.cloud/services/http/inbound/1_0_0') { // Es un inbound?
                        website = parsedBody.tcState.deployedServices[links[links.length - 1].connectedTo].manifest['components-resources'].__service.vhost.resource.parameters.vhost;
                    }
                }
            }

            for (let rol in parsedBody.tcState.deployedServices[deployment].manifest.arrangement) {
                let name: string = rol;
                let definitionURN: string = parsedBody.tcState.deployedServices[deployment].manifest.service.components[name];
                let numInstances: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__instances;

                let runtime: string;
                for (let index in parsedBody.tcState.deployedServices[deployment].manifest.versions['http://eslap.cloud/manifest/deployment/1_0_0'].runtimes) {
                    runtime = index; // Únicamente debería de haber un runtime
                }

                let instances: Array<Instance> = [];
                for (let instance in parsedBody.tcState.deployedServices[deployment].instanceList) {
                    // Tenemos que comprobar que el componente de la instáncia corresponde al rol
                    let component = rol; // TODO: comprobar los componentes del rol
                    if (parsedBody.tcState.deployedServices[deployment].instanceList[instance].component === component) {
                        let name: string = instance;
                        let volumes: Array<Volume> = [];

                        if (parsedBody.tcState.deployedServices[deployment].manifest['instance-configuration']) {
                            for (let resource in parsedBody.tcState.deployedServices[deployment].manifest['instance-configuration'][instance].resources) {
                                if (parsedBody.tcState.deployedServices[deployment].manifest['instance-configuration'][instance].resources[resource].type.startsWith('eslap://eslap.cloud/resource/volume/')) {
                                    let name = resource;
                                    let type = parsedBody.tcState.deployedServices[deployment].manifest['instance-configuration'][instance].resources[resource].type;
                                    let num = -1;

                                    console.log('New volume (' + name + '):\ntype: ' + type + '\nnumber: ' + num);
                                    volumes.push(new Volume(name, type, num));
                                }
                            }
                        } else {
                            console.log('WARNING: Componente sin instance-configuration: ' + component); // Esto impide que se puedan conocer los vloúmenes
                        }

                        console.log('New instance (' + name + '):\nvolumes: ' + volumes);
                        instances.push(new Instance(name, volumes));
                    }
                }

                console.log('New rol (' + name + '):\ndefinitionURN: ' + definitionURN + '\nnumInstances:' + numInstances + '\nruntime: ' + runtime + '\ninstances: ' + instances);
                roles.push(new Rol(name, definitionURN, numInstances, runtime, instances));
            }

            console.log('New deployment (' + deployment + '): \ndep.service: ' + service + '\ndep.roles: ' + roles + '\nwebsite: ' + website + '\nlinks: ' + JSON.stringify(links));
            res.push(new Deployment(name, service, roles, website, links));
        }

        // Gestión de errores de conexión
        // TODO: hay que comprobar los valores de cuando se lanza un error y de cuándo no se lanzan
        let error = null;
        if (response === error) {
            Promise.reject(new Error('Error de conexión al intentar obtener estado: ' + response));
        }

        return res;
    });
}
export function deploymentRolAddInstance() {
    return auxFunction();
}
export function deploymentRolRemoveInstance() { return auxFunction(); }