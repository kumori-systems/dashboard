import { AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent, EcloudEventType } from 'admission-client';
import { AcsClient as EcloudAcsClient } from 'acs-client';
import { ADMISSION_URI, ACS_URI } from './config';
import { EventEmitter, Listener } from 'typed-event-emitter';
import * as utils from './utils';

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
                        console.info('Metrics event received: ' + event.strName);
                        // Metrics event type handler function
                        break;
                    default:
                        console.error('Non espected ecloud event type: ' + event.strType + '/' + event.strName);
                }
            });

            this.admission.onError((error: any) => {
                console.error('Error received from admission-client: ' + JSON.stringify(error));
            });

            this.admission.init().then(() => {
                this.emit(this.onLogin, user.name);
            });
        });
    }
    getDeploymentList() {
        this.admission.findDeployments().then((deploymentList) => {
            for (let deploymentId in deploymentList) {
                this.emit(this.onAddDeployment, deploymentId, utils.transformEcloudDeploymentToDeployment(deploymentList[deploymentId]));
            }
        });
    }
    getRegisteredElements() {
        this.admission.findStorage().then((registeredElements) => {
            for (let i = 0; i < registeredElements.length; i++) {
                this.getElementInfo(registeredElements[i]);
            }
        });
    }

    undeployDeployment(deploymentURN: string): void {
        this.admission.undeploy(deploymentURN);
    }

    getElementInfo(uri: string) {
        return this.admission.getStorageManifest(uri).then((element) => {
            switch (uri.split('/')[3]) {
                case 'runtime':
                case 'runtimes':
                    this.emit(
                        this.onAddRuntime,
                        uri,
                        utils.transformManifestToRuntime(element));
                    break;
                case 'service':
                case 'services':
                    this.emit(
                        this.onAddService,
                        uri,
                        utils.transformManifestToService(element));
                    break;
                case 'component':
                case 'components':
                    this.emit(this.onAddComponent,
                        uri,
                        utils.transformManifestToComponent(element));
                    break;
                case 'resource':
                case 'resources':
                    this.emit(
                        this.onAddResource,
                        uri,
                        utils.transformManifestToResource(element)
                    );
                    break;
                default:
                    console.info('Case not covered', uri, element);
            }
        });
    }

    createNewHTTPENtrypoint(params: any) {
        console.info('Enviada la petición para crear un nuevo HTTPEntrypoint: ' + JSON.stringify(params));
    }

    addDeployment(params) {
        console.log('Creando un nuevo deployment con los parámetros: ' + JSON.stringify(params));
    }

    aplyChangesToDeployment(changes) {
        console.log('Intentando aplicar cambios al deployment: ' + JSON.stringify(changes));
    }

    // @param elementId: Elemento o lista de elementos
    deleteElement(elementId) {
        console.log('Enviamos mensaje para eliminar: ' + JSON.stringify(elementId));
    }

    // @param elementId: Elemento o lista de elementos
    downloadManifest(elementId) {
        console.log('Descargando el manifiesto de: ' + JSON.stringify(elementId));
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