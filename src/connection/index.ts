/*
 * Hay un problema al utilizar swagger que no quiero corregir ahora, ya que no se sabe si utilizaré
 * swagger o axios. Congelo todo lo requerido por swagger.
 * Más info en el readme
 */
// import { DefaultApi, Deployment, InlineResponse2001 } from './api';
// import { Deployment } from './api';
// import { ClientResponse } from 'http';
// let api: DefaultApi = new DefaultApi();

class Deployment {
    'service': string;
    roles: {
        [key: string]: {
            instances: {
                [key: string]: {
                    id: string,
                    privateIp: string,
                    publicIp: string,
                    arrangement: {
                        cpu: number,
                        bandwidth: number,
                        failurezones: number,
                        mininstances: number,
                        maxinstances: number
                    }
                }
            }
        }
    };
}

function getDeployments(): Promise<{ deploymentList: Deployment[] }> {
    // let res: Promise<{ deploymentList: Deployment[] }> = api.findDeployments().then(function ({ response, body }) {
    let res = new Promise(function () { return { response: '', body: '' }; });
    res.then(function ({ response, body }) {
        let deploymentList: Deployment[] = null;

        // TODO: parsear los deployments
        console.log('La respuesta es: ' + JSON.stringify(response));
        console.log('El cuerpo es: ' + JSON.stringify(body));

        deploymentList.push({
            'service': 'serviceName',
            roles: {
                'rol1': {
                    'instances': {
                        'instance1': {
                            'id': 'idInstancia1',
                            'privateIp': 'privateIpInstancia1',
                            'publicIp': 'publicIpInstancia1',
                            'arrangement': {
                                'cpu': 1,
                                'bandwidth': 1,
                                'failurezones': 1,
                                'mininstances': 1,
                                'maxinstances': 2
                            }
                        }
                    }
                }
            }
        });

        return { deploymentList: deploymentList };
    });
    return res;
};

export { Deployment, getDeployments };