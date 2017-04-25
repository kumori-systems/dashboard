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
    name: string;
    service: string;
    roles: {
        [key: string]: {
            instances: {
                [key: string]: {
                    id: string,
                    privateIp: string,
                    publicIp: string,
                    arrangement: {
                        failurezones: number,
                        bandwidth: number,
                        memory: number,
                        cpu: number,
                        maxinstances: number,
                        __instances: number,
                        __cpu: number,
                        __memory: number,
                        __ioperf: number,
                        __iopsintensive: boolean,
                        __bandwidth: number,
                        __resilience: number,
                        mininstances: number
                    }
                }
            },
            configuration: {
                // La configuración no es correcta. Hay roles que tienen otras configuraciones distintas,
                // pero no consigo sacar un patrón.
                // tipo any?
                config: {
                    planner: {
                        domain: string,
                        port: number,
                        address: string
                    },
                    measureBuffer: {
                        maxsize: number
                    },
                    metricStorage: [
                        {
                            topics: string[],
                            transport: {
                                'http-port': number,
                                'http-host': string
                            },
                            type: string
                        }
                    ],
                    restapi: {
                        bodySizeLimit: string,
                        saveMeasures: boolean
                    }
                }
            },
            entrypoint: {
                instancespath: boolean,
                domain: string,
                sslonly: boolean,
                secrets: any
            }
        }
    };
}

function auxFunction() {
    const promesa = new Promise(function (resolve, reject) {
        resolve({ response: 'respuesta', body: 'cuerpo' });
    });
    return promesa;
}

// TODO: poner esta función con la llamada correspondiente
function getDeployments(): Promise<{ deploymentList: Deployment[] }> {
    return auxFunction().then(function ({ response, body }) {
        let deploymentList: Deployment[] = [];

        // TODO: parsear los deployments
        // console.log('La respuesta es: ' + JSON.stringify(response));
        // console.log('El cuerpo es: ' + JSON.stringify(body));

        deploymentList.push({
            name: 'slap://eslap.cloud/deployments/20170310_072206/7c6c6f67',
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
        });
        return { deploymentList: deploymentList };
    });
};

export { Deployment, getDeployments };


/*
    "success": true,
    "message": "SUCCESSFULLY PROCESSED DEPLOYMENT INFO.",
    "data": {
        "slap://eslap.cloud/deployments/20170310_072206/7c6c6f67":{
            "service": "eslap://eslap.cloud/services/monitor/1_0_0",
            "roles": {
                "monitor": {
                    "instances": {
                        "eslap.cloud_monitor_5": {
                            "id": "f93fdb65-a1cf-44aa-87cd-0460908db1dc",
                            "privateIp": "10.1.0.36",
                            "publicIp": "192.168.187.159",
                            "arrangement": {
                                "failurezones": 1,
                                "bandwidth": 1,
                                "memory": 1,
                                "cpu": 1,
                                "maxinstances": 1,
                                "__instances": 1,
                                "__cpu": 1,
                                "__memory": 1,
                                "__ioperf": 1,
                                "__iopsintensive": false,
                                "__bandwidth": 1,
                                "__resilience": 1,
                                "mininstances": 1
                            }
                        }
                    },
                    "configuration": {
                        "config": {
                            "planner": {
                                "domain": "stamp-nightly.osdmz.iti.es",
                                "port": 80,
                                "address": "10.1.0.37"
                            },
                            "measureBuffer": {
                                "maxsize": 1000000
                            },
                            "metricStorage": [
                                {
                                    "topics": ["measures", "metrics"],
                                    "transport": { "http-port": 9004, "http-host": "10.1.2.35" },
                                    "type": "http"
                                }, {
                                    "topics": ["measures", "metrics"],
                                    "transport": { "http-port": 28778, "http-host": "10.1.2.35" },
                                    "type": "httpLogstash"
                                }
                            ],
                            "restapi": { "bodySizeLimit": "50mb", "saveMeasures": true }
                        }
                    }
                }
            }
        },
        "slap://eslap.cloud/deployments/20170310_072204/d2f94d6d": {
            "service": "eslap://eslap.cloud/services/http/inbound/1_0_0",
            "roles": {
                "sep": {
                    "instances": {
                        "eslap.cloud_sep_4": {
                            "id": "f93fdb65-a1cf-44aa-87cd-0460908db1dc",
                            "privateIp": "10.1.0.36",
                            "publicIp": "192.168.187.159",
                            "arrangement": {
                                "failurezones": 1,
                                "bandwidth": 1,
                                "memory": 1,
                                "cpu": 1,
                                "maxinstances": 1,
                                "__instances": 1,
                                "__cpu": 1,
                                "__memory": 1,
                                "__ioperf": 1,
                                "__iopsintensive": false,
                                "__bandwidth": 1,
                                "__resilience": 1,
                                "mininstances": 1
                            }
                        }
                    },
                    "entrypoint": {
                        "instancespath": false,
                        "domain": "monitor-nightly.osdmz.iti.es",
                        "sslonly": false,
                        "secrets": {}
                     }
                    }
                }
            },
            "slap://eslap.cloud/deployments/20170310_072201/b2d43b30": {
                "service": "eslap://eslap.cloud/services/http/inbound/1_0_0",
                "roles": {
                    "sep": {
                        "instances": {
                            "eslap.cloud_sep_3": {
                                "id": "f93fdb65-a1cf-44aa-87cd-0460908db1dc",
                                "privateIp": "10.1.0.36",
                                "publicIp": "192.168.187.159",
                                "arrangement": {
                                    "failurezones": 1,
                                    "bandwidth": 1,
                                    "memory": 1,
                                    "cpu": 1,
                                    "maxinstances": 1,
                                    "__instances": 1,
                                    "__cpu": 1,
                                    "__memory": 1,
                                    "__ioperf": 1,
                                    "__iopsintensive": false,
                                    "__bandwidth": 1,
                                    "__resilience": 1,
                                    "mininstances": 1
                                }
                            }
                        },
                        "entrypoint": {
                            "instancespath": false,
                            "domain": "admission-nightly.osdmz.iti.es",
                            "sslonly": false,
                            "secrets": {}
                        }
                    }
                }
            },
            "slap://eslap.cloud/deployments/20170310_072159/da88b8fa": {
                "service": "eslap://eslap.cloud/services/http/inbound/1_0_0",
                "roles": {
                    "sep": {
                        "instances": {
                            "eslap.cloud_sep_2": {
                                "id": "f93fdb65-a1cf-44aa-87cd-0460908db1dc",
                                "privateIp": "10.1.0.36",
                                "publicIp": "192.168.187.159",
                                "arrangement": {
                                    "failurezones": 1,
                                    "bandwidth": 1,
                                    "memory": 1,
                                    "cpu": 1,
                                    "maxinstances": 1,
                                    "__instances": 1,
                                    "__cpu": 1,
                                    "__memory": 1,
                                    "__ioperf": 1,
                                    "__iopsintensive": false,
                                    "__bandwidth": 1,
                                    "__resilience": 1,
                                    "mininstances": 1
                                }
                            }
                        },
                        "entrypoint": {
                            "instancespath": false,
                            "domain": "acs-nightly.osdmz.iti.es",
                            "sslonly": false,
                            "secrets": {}
                        }
                    }
                }
            },
            "slap://eslap.cloud/deployments/20170310_072157/d0307831": {
                "service": "eslap://eslap.cloud/services/admission/1_0_0",
                "roles":{
                    "admission": {
                        "instances": {
                            "eslap.cloud_admission_1": {
                                "id": "f93fdb65-a1cf-44aa-87cd-0460908db1dc",
                                "privateIp": "10.1.0.36",
                                "publicIp": "192.168.187.159",
                                "arrangement": {
                                    "failurezones": 1,
                                    "bandwidth": 1,
                                    "memory": 2,
                                    "cpu": 1,
                                    "maxinstances": 1,
                                    "__instances": 1,
                                    "__cpu": 1,
                                    "__memory": 2,
                                    "__ioperf": 2,
                                    "__iopsintensive": true,
                                    "__bandwidth": 1,
                                    "__resilience": 1,
                                    "mininstances": 1
                                }
                            }
                        },
                        "configuration": {
                            "config": {
                                "domains": {
                                    "random": {
                                        "sufixNumbers": 4,
                                        "words": 2,
                                        "join": "-",
                                        "prefix": ""
                                    },
                                    "refDomain": "osdmz.iti.es"
                                },
                                "server": {
                                    "port": 8080
                                },
                                "planner": {
                                    "plannerDomain": "stamp-nightly.osdmz.iti.es",
                                    "mockPlanner": false,
                                    "addresses": ["10.1.0.37"]
                                },
                                "manifestRepository": {
                                    "config": {
                                        "localImageStore": {
                                            "imageFilename": "manifest.json",
                                            "path": "/slap/storage/local"
                                        },
                                        "remoteImageStore": {
                                            "imageFilename": "manifest.json",
                                            "path": "ubuntu@10.1.2.35:/home/ubuntu/slap/storage/remote"
                                        }
                                    },
                                    "type": "rsync"
                                },
                                "imageFetcher": {
                                    "config": {
                                        "localImageStore": {
                                            "imageFilename": "image.tgz",
                                            "path": "/slap/storage/local"
                                        },
                                        "remoteImageStore": {
                                            "imageFilename": "image.tgz",
                                            "path": "ubuntu@10.1.2.35:/home/ubuntu/slap/storage/remote"
                                        }
                                    },
                                    "type": "blob"
                                },
                                "acs": {
                                    "anonymous-user": {
                                        "roles": ["ADMIN"],
                                        "id": "admin-eslap@iti.es"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "slap://eslap.cloud/deployments/20170310_072154/5e14d569": {
                "service": "eslap://eslap.cloud/services/acs/1_0_0",
                "roles": {
                    "acs": {
                        "instances": {
                            "eslap.cloud_acs_0": {
                                "id": "f93fdb65-a1cf-44aa-87cd-0460908db1dc",
                                "privateIp": "10.1.0.36",
                                "publicIp": "192.168.187.159",
                                "arrangement": {
                                    "failurezones": 1,
                                    "bandwidth": 1,
                                    "memory": 1,
                                    "cpu": 1,
                                    "maxinstances": 1,
                                    "__instances": 1,
                                    "__cpu": 1,
                                    "__memory": 1,
                                    "__ioperf": 1,
                                    "__iopsintensive": false,
                                    "__bandwidth": 1,
                                    "__resilience": 1,
                                    "mininstances": 1
                                }
                            }
                        },
                        "configuration": {
                            "config": {}
                        }
                    }
                }
            }
        }*/

