export enum state {NORMAL, WARNING, ERROR};
export class Deployment {
    service: string;
    roles: { [key: string]: Rol };
}

export class Rol {
    instances: {
        [key: string]: Instance
    };
    configuration: any;
    entrypoint: {
        instancespath: boolean;
        domain: string;
        sslonly: boolean;
        secrets: any;
    };
}

export class Instance {
    id: string;
    privateIp: string;
    publicIp: string;
    arrangement: {
        failurezones: number;
        bandwidth: number;
        memory: number;
        cpu: number;
        maxinstances: number;
        __instances: number;
        __cpu: number;
        __memory: number;
        __ioperf: number;
        __iopsintensive: boolean;
        __bandwidth: number;
        __resilience: number;
        mininstances: number;
    };
}

// TODO: sustituir esta función por la llamada correspondiente
function auxFunction() {
    const promesa = new Promise(function (resolve, reject) {
        resolve({ response: 'respuesta', body: 'cuerpo' });
    });
    return promesa;
}

export function getDeployments(): Promise<{ [key: string]: Deployment }> {
    return auxFunction().then(function ({ response, body }) {
        let res: { [key: string]: Deployment } = {};


        // TODO: parsear los deployments
        // TODO: hay que tratar los nombres para que no contengan '/' ni :
        res['slap.cloud-deployments-20170310_072206-7c6c6f67'] = {
            service: 'eslap://eslap.cloud/services/monitor/1_0_0',
            roles: {
                monitor: {
                    instances: {
                        'eslap.cloud_monitor_5': {
                            id: 'eslap.cloud_monitor_5',
                            privateIp: '10.1.0.36',
                            publicIp: '192.168.187.159',
                            arrangement: {
                                failurezones: 1,
                                bandwidth: 1,
                                memory: 1,
                                cpu: 1,
                                maxinstances: 1,
                                __instances: 1,
                                __cpu: 1,
                                __memory: 1,
                                __ioperf: 1,
                                __iopsintensive: false,
                                __bandwidth: 1,
                                __resilience: 1,
                                mininstances: 1
                            }
                        }
                    },
                    configuration: {
                        config: {
                            planner: {
                                domain: 'stamp-nightly.osdmz.iti.es',
                                port: 80,
                                address: '10.1.0.37'
                            },
                            measureBuffer: {
                                maxsize: 1000000
                            },
                            metricStorage: [
                                {
                                    topics: ['measures', 'metrics'],
                                    transport: {
                                        'http-port': 9004,
                                        'http-host': '10.1.2.35'
                                    },
                                    type: 'http'
                                },
                                {
                                    topics: [
                                        'measures',
                                        'metrics'
                                    ],
                                    transport: {
                                        'http-port': 28778,
                                        'http-host': '10.1.2.35'
                                    },
                                    type: 'httpLogstash'
                                }
                            ],
                            restapi: {
                                bodySizeLimit: '50mb',
                                saveMeasures: true
                            }
                        }
                    },
                    entrypoint: {
                        instancespath: false,
                        domain: 'monitor-nightly.osdmz.iti.es',
                        sslonly: false,
                        secrets: {}
                    }
                }
            }
        };
        return res;
    });
}

export function addInstance(): Promise<{ state: string }> {
    return auxFunction().then(function ({ response, body }) {
        return { state: 'SUCCESS' };
    });
}

export function removeInstance(): Promise<{ state: string }> {
    return auxFunction().then(function ({ response, body }) {
        return { state: 'SUCCESS' };
    });
}