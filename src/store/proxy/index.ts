import { Deployment, Rol, Link, Instance, Volume, Arrangement } from './../classes';

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
            let id = deployment;
            let name = 'DeploymentNAME';
            let service = parsedBody.tcState.deployedServices[deployment].manifest.service.name;

            let roles: Array<Rol> = [];
            let website: string = '';
            let links: Array<Link> = [];

            if (parsedBody.tcState.deployedServices[deployment].manifest.servicename === 'eslap://eslap.cloud/services/http/inbound/1_0_0') { // Si es un http inbound él mismo tiene el website
                website = parsedBody.tcState.deployedServices[deployment].manifest['components-resources'].__service.vhost.resource.parameters.vhost;
            } else { // Si no lo és, tiene que mirar en los links cuál es el http inbound correspondiente
                let anyadido: boolean;
                for (let link in parsedBody.tcState.linkedServices) { // TODO: Esto puede ser optimizado
                    anyadido = false;
                    if (parsedBody.tcState.linkedServices[link].deployment1 === deployment) {
                        links.push(new Link(
                            parsedBody.tcState.linkedServices[link].channel1, // my channel
                            parsedBody.tcState.linkedServices[link].channel2, // his channel
                            parsedBody.tcState.linkedServices[link].deployment2 // him
                        ));
                        anyadido = true;
                    } else if (parsedBody.tcState.linkedServices[link].deployment2 === deployment) {
                        links.push(new Link(
                            parsedBody.tcState.linkedServices[link].channel2, // my channel
                            parsedBody.tcState.linkedServices[link].channel1, // his channel
                            parsedBody.tcState.linkedServices[link].deployment1 // him
                        ));
                        anyadido = true;
                    }
                    if (anyadido) { // ¿tenemos website?
                        if (parsedBody.tcState.deployedServices[links[links.length - 1].connectedTo].manifest.servicename === 'eslap://eslap.cloud/services/http/inbound/1_0_0') { // Es un inbound?
                            website = parsedBody.tcState.deployedServices[links[links.length - 1].connectedTo].manifest['components-resources'].__service.vhost.resource.parameters.vhost;
                        }
                    }
                }
            }

            // TODO: Queda lincar el rol con el componente. Aquí se ha asumido que un componente tiene el mismo nombre que el rol
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

                let failurezones: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].failurezones;
                let bandwidth: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].bandwidth;
                let memory: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].memory;
                let cpu: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].cpu;
                let maxinstances: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].maxinstances;
                let __instances: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__instances;
                let __cpu: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__cpu;
                let __memory: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__memory;
                let __ioperf: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__ioperf;
                let __iopsintensive: boolean = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__iopsintensive;
                let __bandwidth: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__bandwidth;
                let __resilience: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].__resilience;
                let mininstances: number = parsedBody.tcState.deployedServices[deployment].manifest.arrangement[rol].mininstances;
                let arrangement = new Arrangement(failurezones, bandwidth, memory, cpu, maxinstances, __instances, __cpu, __memory, __ioperf, __iopsintensive, __bandwidth, __resilience, mininstances);

                let config = parsedBody.tcState.deployedServices[deployment].manifest.versions['http://eslap.cloud/manifest/deployment/1_0_0']['components-configuration'][rol].config;
                let domain;
                for (let index in config) {
                    if (config[index].domain)
                        domain = config[index].domain;
                }


                console.log('New rol (' + name + '):\ndefinitionURN: ' + definitionURN + '\nruntime: ' + runtime + '\ninstances: ' + instances + '\narrangement:' + JSON.stringify(arrangement) + '\ndomain: ' + domain);
                roles.push(new Rol(name, definitionURN, runtime, instances, arrangement, domain));
            }

            console.log('New deployment (' + id + '): \nname: ' + name + '\nservice: ' + service + '\nroles: ' + roles + '\nwebsite: ' + website + '\nlinks: ' + JSON.stringify(links));
            res.push(new Deployment(id, name, service, roles, website, links));
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

export function undeployDeployment(deploymentId: string): void {
    console.log('Realizamos undeploy de: ' + deploymentId);
}