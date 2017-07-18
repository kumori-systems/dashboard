import { AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent, EcloudEventType } from 'admission-client';
import { AcsClient as EcloudAcsClient } from 'acs-client';
import { ADMISSION_URI, ACS_URI } from './config';
import { EventEmitter, Listener } from 'typed-event-emitter';
import * as utils from './utils';
import { Deployment } from '../classes';

/**
 * Esta clase está preparada para lanzar eventos que la página leerá y podrá actuar acorde al evento que lea.
 * Los eventos se lanzan a partir de llamar a los distintos métodos.
 */
export class ProxyConnection extends EventEmitter {
    // Atributos
    private admission: EcloudAdmissionClient;
    private acs: EcloudAcsClient;

    // Eventos
    public onLogin: Function;
    public onAddDeployment: Function;
    public onRemoveDeploymemt: Function;
    public onAddService: Function;
    public onRemoveService: Function;
    public onAddComponent: Function;
    public onRemoveComponent: Function;
    public onAddRuntime: Function;
    public onRemoveRuntime: Function;
    public onAddResource: Function;
    public onRemoveResource: Function;
    public onAddMetrics: Function;

    // Constructor
    constructor() {
        super();
        this.onLogin = this.registerEvent<Function>();
        this.onAddDeployment = this.registerEvent<(deploymentId, deployment) => any>();
        this.onRemoveDeploymemt = this.registerEvent<Function>();
        this.onAddService = this.registerEvent<(serviceId, service) => any>();
        this.onRemoveService = this.registerEvent<Function>();
        this.onAddComponent = this.registerEvent<(componentId, component) => any>();
        this.onRemoveComponent = this.registerEvent<Function>();
        this.onAddRuntime = this.registerEvent<(runtimeId, runtime) => any>();
        this.onRemoveRuntime = this.registerEvent<Function>();
        this.onAddResource = this.registerEvent<(resourceId, resource) => any>();
        this.onRemoveResource = this.registerEvent<Function>();
        this.onAddMetrics = this.registerEvent<(value) => any>();
    }
    login(username: string, password: string) {
        this.acs = new EcloudAcsClient(ACS_URI);
        this.acs.login(username, password).then(({ accessToken, user }) => {
            this.admission = new EcloudAdmissionClient(ADMISSION_URI, accessToken);
            // this.admission = new EcloudAdmissionClient(ADMISSION_URI);
            this.admission.onConnected(() => {
                console.info('Successfully connected to admission');
            });
            this.admission.onEcloudEvent((event: EcloudEvent) => {
                console.info('Evento: ', event);
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
                        this.emit(this.onAddMetrics, utils.transformEcloudEventDataToMetrics(event));
                        break;
                    default:
                        console.error('Not espected ecloud event type: ' + event.strType + '/' + event.strName);
                }
            });

            this.admission.onError((error: any) => {
                console.error('Error received from admission-client: ' + JSON.stringify(error));
            });

            this.admission.init().then(() => {
                this.emit(this.onLogin, user.name);
            }).catch((error) => {
                console.error('Error connecting to admission', error);
            });
        }).catch((error) => {
            console.error('Error connecting to acs', error);
        });
    }
    getDeploymentList() {
        this.admission.findDeployments().then((deploymentList) => {
            for (let deploymentId in deploymentList) {
                this.emit(this.onAddDeployment, deploymentId, utils.transformEcloudDeploymentToDeployment(deploymentList[deploymentId]));
            }
        }).catch((error) => {
            console.error('Error getting deployment list', error);
        });
    }
    getRegisteredElements() {
        this.admission.findStorage().then((registeredElements) => {
            for (let i = 0; i < registeredElements.length; i++) {
                this.getElementInfo(registeredElements[i]);
            }
        }).catch((error) => {
            console.error('Error getting registered elements', error);
        });
    }

    undeployDeployment(deploymentURN: string): void {
        this.admission.undeploy(deploymentURN).then((value) => {
            console.log('Tras realizar undeploy admission devuelve', value);
        }).catch((error) => {
            console.error('Error makin undeploy');
        });
    }

    getElementInfo(uri: string) {
        return this.admission.getStorageManifest(uri).then((element) => {
            switch (utils.getElementTipe(element)) {
                case utils.ElementType.runtime:
                    this.emit(
                        this.onAddRuntime,
                        uri,
                        utils.transformManifestToRuntime(element));
                    break;
                case utils.ElementType.service:
                    this.emit(
                        this.onAddService,
                        uri,
                        utils.transformManifestToService(element));
                    break;
                case utils.ElementType.component:
                    this.emit(this.onAddComponent,
                        uri,
                        utils.transformManifestToComponent(element));
                    break;
                case utils.ElementType.resource:
                    this.emit(
                        this.onAddResource,
                        uri,
                        utils.transformManifestToResource(element)
                    );
                    break;
                default:
                    console.info('Case not covered', uri, element);
            }
        }).catch((error) => {
            console.error('Error getting element info', error);
        });
    }

    createNewHTTPENtrypoint(params) {
        this.admission.deploy(utils.transformEntrypointToManifest(
            params.usePlatformGeneratedDomain,
            'http', // Nombre!!
            params.selectedDomain,
            params.selectedCertificate,
            params.acceptTLSSSL,
            params.requireClientCertificates,
            params.instances,
            params.resilence
        )).then((value) => {
            console.log('Después de hacer un deploy de HTTPEntrypoint admission devuelve', value);
        }).catch((error) => {
            console.error('Error creating a new http entrypoint', error);
        });
    }

    addDeployment(params) {
        this.admission.deploy(utils.transformDeploymentToManifest(
            params.name,
            params.website,
            params.service,
            params.serviceConfig,
            params.config,
            params.roles
        )).then((value) => {
            console.log('Después de hacer un deployment de un servicio normal, admission devuelve', value);
        }).catch((error) => {
            console.error('Error creating a service', error);
        });
    }
    aplyChangesToDeployment(changes) {
        console.log('Intentando aplicar cambios al deployment: ' + JSON.stringify(changes));
    }

    // @param elementId: Elemento o lista de elementos
    deleteElement(elementId) {
        this.admission.removeStorage(elementId).then((value) => {
            console.info('La llamada a admission removeStorage nos ha devuelto', value);
        }).then((value) => {
            console.log('Después de enviar una petición de delete Element, admission devuelve', value);
        }).catch((error) => {
            console.error('Error creating a service', error);
        });
    }

    // @param elementId: Elemento o lista de elementos
    downloadManifest(elementId) {
        this.admission.getStorageManifest(elementId).then((value) => {
            console.log('Cuando preguntamos por el storage manifest obtenemos', value);
        }).catch((error) => {
            console.error('Error obtaining a manifest', error);
        });
    }

    addWebdomain(webdomain) {
        console.log('Enviamos un mensaje para AÑADIR el dominio: ' + JSON.stringify(webdomain));
    }

    deleteWebdomain(webdomain) {
        console.log('Enviamos un mensaje para ELIMINAR el dominio: ' + JSON.stringify(webdomain));
    }

    addDataVolume(params) {
        console.log('Enviamos un mensaje para añadir un volúmen de datos con los siguientes parámetros: ' + JSON.stringify(params));
    }

    addNewElement(params) {
        console.log('Enviamos un mensaje para añadir un nuevo elemento. El mensaje contiene: ' + JSON.stringify(params));
    }
};