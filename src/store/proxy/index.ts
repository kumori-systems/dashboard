import { RegistrationResult, ScalingDeploymentModification, FileStream, EcloudEventName, AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent, EcloudEventType } from 'admission-client';
import { AcsClient as EcloudAcsClient } from 'acs-client';

import { EventEmitter, Listener } from 'typed-event-emitter';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import * as utils from './utils';
import { Deployment } from '../classes';

import { ADMISSION_URI, ACS_URI } from '../../../static/config.js';

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
    public onModifyDeployment: Function;
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
        this.onModifyDeployment = this.registerEvent<(value) => any>();
        this.onRemoveDeploymemt = this.registerEvent<(deploymentId) => any>();
        this.onAddService = this.registerEvent<(serviceId, service) => any>();
        this.onRemoveService = this.registerEvent<Function>();
        this.onAddComponent = this.registerEvent<(componentId, component) => any>();
        this.onRemoveComponent = this.registerEvent<Function>();
        this.onAddRuntime = this.registerEvent<(runtimeId, runtime) => any>();
        this.onRemoveRuntime = this.registerEvent<Function>();
        this.onAddResource = this.registerEvent<(resourceId, resource) => any>();
        this.onRemoveResource = this.registerEvent<(resourceId) => any>();
        this.onAddMetrics = this.registerEvent<(value) => any>();
    }

    /* GENERIC */

    /**
     * Login authentifies the user and redirects all events received from the stamp.
     * @param username User's name
     * @param password User's password
     */
    login(username: string, password: string) {
        this.acs = new EcloudAcsClient(ACS_URI);
        return this.acs.login(username, password).then(({ accessToken, user }) => {

            this.admission = new EcloudAdmissionClient(ADMISSION_URI, accessToken);

            this.admission.onConnected(() => {
                console.info('Successfully connected to the service');
            });

            this.admission.onEcloudEvent((event: EcloudEvent) => {
                switch (event.type) {
                    case EcloudEventType.service:
                        switch (event.name) {
                            case EcloudEventName.deployed:
                            case EcloudEventName.deploying:
                            case EcloudEventName.disconnected:
                            case EcloudEventName.link:
                            case EcloudEventName.node:
                            case EcloudEventName.realocate:
                            case EcloudEventName.reconfig:
                            case EcloudEventName.restart:
                            case EcloudEventName.scale:
                            case EcloudEventName.service:
                            case EcloudEventName.status:
                            case EcloudEventName.undeployed:
                            case EcloudEventName.undeploying:
                            case EcloudEventName.unlink:
                                console.warn('Event under development: %s / %s event received: ', event.strType, event.strName, event);
                                break;
                            default:
                                console.error('Not espected ecloud event name: ' + event.strName + '/' + event.strName);
                        }
                        break;
                    case EcloudEventType.node:
                        switch (event.name) {
                            case EcloudEventName.deployed:
                            // this.emit(this.onAddDeployment, deploymentId, utils.transformEcloudDeploymentToDeployment(deploymentList[deploymentId]));
                            case EcloudEventName.deploying:
                            case EcloudEventName.disconnected:
                            case EcloudEventName.link:
                            case EcloudEventName.node:
                            case EcloudEventName.realocate:
                            case EcloudEventName.reconfig:
                            case EcloudEventName.restart:
                            case EcloudEventName.scale:
                            case EcloudEventName.service:
                            case EcloudEventName.status:
                            case EcloudEventName.undeployed:
                            case EcloudEventName.undeploying:
                            case EcloudEventName.unlink:
                                console.warn('Event under development: %s / %s event received: ', event.strType, event.strName, event);
                                break;
                            default:
                                console.error('Not espected ecloud event name: ' + event.strName + '/' + event.strName);
                        }
                        break;
                    case EcloudEventType.instance:
                        switch (event.name) {
                            case EcloudEventName.deployed:
                            case EcloudEventName.deploying:
                            case EcloudEventName.disconnected:
                            case EcloudEventName.link:
                            case EcloudEventName.node:
                            case EcloudEventName.realocate:
                            case EcloudEventName.reconfig:
                            case EcloudEventName.restart:
                            case EcloudEventName.scale:
                            case EcloudEventName.service:
                            case EcloudEventName.status:
                            case EcloudEventName.undeployed:
                            case EcloudEventName.undeploying:
                            case EcloudEventName.unlink:
                                console.warn('Event under development: %s / %s event received: ', event.strType, event.strName, event);
                                break;
                            default:
                                console.error('Not espected ecloud event name: ' + event.strName + '/' + event.strName);
                        }
                        break;
                    case EcloudEventType.metrics:
                        switch (event.name) {
                            case EcloudEventName.service:
                                this.emit(this.onAddMetrics, utils.transformEcloudEventDataToMetrics(event));
                                break;
                            default:
                                console.error('Not espected ecloud event name: %s/%s', event.strType, event.strName, event);
                        }
                        break;
                    default:
                        console.error('Not espected ecloud event type: %s', event.strType, event);
                }
            });

            this.admission.onError((error: any) => {
                console.error('Error received from admission-client: ' + JSON.stringify(error));
            });

            return this.admission.init().then(() => {
                return user;
            });
        });
    }

    /**
     * Obtains all registered elements in th estamp
     */
    getRegisteredElements() {
        return this.admission.findStorage().then((registeredElements) => {
            for (let i = 0; i < registeredElements.length; i++) {
                switch (utils.getElementType(registeredElements[i])) {
                    case utils.ElementType.runtime:
                        this.emit(
                            this.onAddRuntime,
                            registeredElements[i],
                            undefined
                        );
                        break;
                    case utils.ElementType.service:
                        this.emit(
                            this.onAddService,
                            registeredElements[i],
                            undefined
                        );
                        break;
                    case utils.ElementType.component:
                        this.emit(this.onAddComponent,
                            registeredElements[i],
                            undefined
                        );
                        break;
                    case utils.ElementType.resource:
                        this.emit(
                            this.onAddResource,
                            registeredElements[i],
                            undefined
                        );
                        break;
                    default:
                        console.error('Case not covered: ', registeredElements[i]);
                }
            }
        });
    }

    /**
     * Obtains detailed info from a element.
     * @param uri 
     */
    getElementInfo(uri: string) {
        return this.admission.getStorageManifest(uri).then((element) => {
            switch (utils.getElementType(uri)) {
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
                    console.error('Case not covered', uri, element);
            }
        }).catch((error) => {
            console.error('Error getting element info', error);
        });
    }

    /**
     * Adds a new element to the stamp. Elements can be services or resources.
     * @param file 
     */
    addNewElement(file: File) {
        this.sendBundle(file);
    }

    // @param elementId: Elemento o lista de elementos
    deleteElement(elementId) {
        console.error('Delete Element is under development');
    }

    // @param elementId: Elemento o lista de elementos
    downloadManifest(elementId) {
        this.admission.getStorageManifest(elementId).then((manifest) => {
            FileSaver.saveAs(
                new Blob([
                    JSON.stringify(manifest) + '\n'
                ], { type: 'application/json;charset=utf-8' }),
                'Manifest.json'
            );

        }).catch((error) => {
            console.error('Error obtaining a manifest', error);
        });
    }

    private sendBundle(file: File) {
        return this.admission.sendBundle(new FileStream(file))
            .catch((error) => {
                console.error('Error uploading a bundle', error);
            });
    }

    /* DEPLOYMENTS */
    getDeploymentList() {
        return this.admission.findDeployments().then((deploymentList) => {
            for (let deploymentId in deploymentList) {
                this.emit(this.onAddDeployment, deploymentId, utils.transformEcloudDeploymentToDeployment(deploymentList[deploymentId]));
            }
        });
    }

    undeployDeployment(deploymentURN: string) {
        return this.admission.undeploy(deploymentURN).then((value) => {
            this.emit(this.onRemoveDeploymemt, deploymentURN);
        });
    }

    addDeployment(deployment: Deployment) {
        return this.admission.deploy(
            new FileStream(
                new Blob([JSON.stringify(utils.transformDeploymentToManifest(deployment))])
            )
        );
    }

    aplyChangesToDeployment(deploymentId: string, rolNumInstances: { [rolId: string]: number }, killInstances: { [rolid: string]: { [instanceId: string]: boolean } }) {
        console.error('The modification of a deploymet is under development');
    }

    /* RESOURCES */
    addWebdomain(webdomain: string) {
        const manifest = utils.transformWebdomainToManifest(webdomain);
        let zip = new JSZip();
        let content: string = JSON.stringify(manifest) + '\n';
        zip.file('Manifest.json', content);
        // var img = zip.folder("images");
        // img.file("smile.gif", imgData, { base64: true });
        /* api: https://stuk.github.io/jszip/documentation/api_jszip/generate_async.html
        type: base64 | binarystring | unit8array | arraybuffer | blob | nodebuffer
        */
        let instance = this;
        zip.generateAsync({ type: 'arraybuffer', mimeType: 'application/zip', streamFiles: true })
            .then((content) => {
                let file = new File([content], 'Bundle.zip', {
                    type: 'application/zip'
                });

                instance.sendBundle(file).then((value) => {
                    let uri = (<RegistrationResult>value).successful[0].split(' ')[2];
                    let res = utils.transformManifestToResource({
                        spec: 'eslap://eslap.cloud/resource/vhost/1_0_0',
                        name: uri,
                        parameters: {
                            vhost: webdomain
                        }
                    });
                    this.emit(this.onAddResource, uri, res);
                }).catch((error) => {
                    console.error('Error registering a webdomain', error);
                });
            }).catch((error) => {
                console.error('Error creating a bundle for a webdomain manifest', error);
            });
    }

    addDataVolume(params) {
        console.error('Datavolume creation is under development');
    }

};