import { AcsClient as EcloudAcsClient } from 'acs-client';
import {
  AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent,
  EcloudEventName, EcloudEventType, FileStream, ReconfigDeploymentModification,
  RegistrationResult, ScalingDeploymentModification
} from 'admission-client';


import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { EventEmitter, Listener } from 'typed-event-emitter';
import {
  Component, Deployment, HTTPEntryPoint, Resource, Runtime, Service
} from '../store/stampstate/classes';
import { ACS_URI, ADMISSION_URI } from './config.js';
import * as utils from './utils';

/**
 * Esta clase está preparada para lanzar eventos que la página leerá y podrá
 * actuar acorde al evento que lea. Los eventos se lanzan a partir de llamar a
 * los distintos métodos.
 */
class ProxyConnection extends EventEmitter {
  // Atributos
  private admission: EcloudAdmissionClient;
  private acs: EcloudAcsClient;

  // Eventos
  public onLogin: Function;
  public onAddDeployment: Function;
  public onAddInstance: Function;
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

  private requestedElements: string[];

  // Constructor
  constructor() {
    super();
    this.onLogin = this.registerEvent<Function>();
    this.onAddDeployment = this.registerEvent<(deploymentId: string,
      deployment: Deployment) => any>();
    this.onAddInstance = this.registerEvent<(deploymentId: string,
      rolId: string, instanceId: string,
      instance: Deployment.Role.Instance) => any>();
    this.onModifyDeployment = this.registerEvent<(value) => any>();
    this.onRemoveDeploymemt =
      this.registerEvent<(deploymentId: string) => any>();
    this.onAddService =
      this.registerEvent<(serviceId: string, service: Service) => any>();
    this.onRemoveService = this.registerEvent<Function>();
    this.onAddComponent =
      this.registerEvent<(componentId: string, component: Component) => any>();
    this.onRemoveComponent = this.registerEvent<Function>();
    this.onAddRuntime =
      this.registerEvent<(runtimeId: string, runtime: Runtime) => any>();
    this.onRemoveRuntime = this.registerEvent<Function>();
    this.onAddResource =
      this.registerEvent<(resourceId: string, resource: Resource) => any>();
    this.onRemoveResource = this.registerEvent<(resourceId: string) => any>();
    this.onAddMetrics = this.registerEvent<(value) => any>();
    this.requestedElements = [];
  }

  /* GENERIC */

  /**
   * Login authentifies the user and redirects all events received from the
   * stamp.
   * @param username User's name
   * @param password User's password
   */
  login(username: string, password: string) {
    this.acs = new EcloudAcsClient(ACS_URI);
    return this.acs.login(username, password).then(({ accessToken, user }) => {

      this.admission = new EcloudAdmissionClient(ADMISSION_URI, accessToken);

      this.admission.onConnected(() => {
        console.info('Successfully connected to the platform');
      });

      this.admission.onEcloudEvent((event: EcloudEvent) => {
        console.warn('Event under development: %s / %s event received:',
          event.strType, event.strName, event);
        const timeStart = performance.now();
        switch (event.type) {
          case EcloudEventType.service:
            switch (event.name) {
              case EcloudEventName.deploying:

                // Depending on the service, it's created a deployment or an
                // entrypoint

                if (utils.isServiceEntrypoint(event.entity['serviceApp'])) {
                  // Entrypoint deployment
                  this.emit(
                    this.onAddDeployment, // Metodo
                    event.entity['service'], // DeploymentID
                    new HTTPEntryPoint(
                      event.entity['service'], // uri
                      null, // parameters
                      null, // roles
                      null, // resourcesConfig
                      null, // links
                    ) // Deployment
                  );
                }
                else { // Common deployment
                  this.emit(
                    this.onAddDeployment, // Metodo
                    event.entity['service'], // DeploymentID
                    new Deployment(
                      event.entity['service'], // uri
                      null, // name
                      null, // parameters
                      event.entity['serviceApp'], // service
                      null, // roles
                      null, // resourcesConfig
                      null, // links
                    ) // Deployment
                  );
                }

                break;
              case EcloudEventName.deployed:
                let roles: { [rolId: string]: Deployment.Role } = {};
                for (let instance in event.data.instances) {
                  roles[event.data.instances[instance].role] =
                    new Deployment.Role(
                      event.data.instances[instance].role, // name
                      event.data.instances[instance].component, // component
                      null, // configuration
                      null, // cpu
                      null, // memory
                      null, // ioperf
                      null, // iopsintensive
                      null, // bandwidth
                      null, // resilience
                      null, // instanceList
                      null, // mininstances
                      null // maxinstances
                    );
                }
                if (utils.isServiceEntrypoint(event.entity['serviceApp'])) {
                  this.emit(
                    this.onAddDeployment, // Metodo
                    event.entity['service'], // DeploymentID
                    new HTTPEntryPoint(
                      event.entity['service'], // uri
                      null, // parameters
                      roles, // roles
                      null, // resourcesConfig
                      null, // links
                    ) // Deployment
                  );
                }
                else {
                  this.emit(
                    this.onAddDeployment, // Metodo
                    event.entity['service'], // DeploymentID
                    new Deployment(
                      event.entity['service'], // uri
                      null, // name
                      null, // parameters
                      event.entity['serviceApp'], // service
                      roles, // roles
                      null, // resourcesConfig
                      null // links
                    ) // Deployment
                  );
                }

                break;
              case EcloudEventName.undeploying:
                this.emit(this.onRemoveDeploymemt, event.entity['service']);
                break;
              case EcloudEventName.link:
              case EcloudEventName.scale:
              case EcloudEventName.status:
              case EcloudEventName.undeployed:
              case EcloudEventName.unlink:

                // TODO

                break;
              default:
                console.error('Not espected ecloud event name: ' + event.strType
                  + '/' + event.strName);
            }
            break;
          case EcloudEventType.node:
            console.error('Not espected ecloud event type: ' + event.strType +
              '/' + event.strName);
            break;
          case EcloudEventType.instance:
            switch (event.name) {
              case EcloudEventName.status:
                let inst = new Deployment.Role.Instance(
                  event.entity['instance'], // cnid
                  event.data.status === 'connected' ?
                    Deployment.Role.Instance.STATE.CONNECTED :
                    Deployment.Role.Instance.STATE.DISCONNECTED, // state
                  null, // cpu
                  null, // memory
                  null, // bandwidth
                  null, // volumes
                  null // ports
                ); // Instance
                this.emit(
                  this.onAddInstance, // Metodo
                  event.entity['service'], // DeploymentID
                  event.entity['role'], // roleId
                  event.entity['instance'], // instanceId
                  inst
                );
                break;
              case EcloudEventName.realocate:
              case EcloudEventName.restart:
              case EcloudEventName.reconfig:
                // Casos que hay que ignorar sin sacar error
                break;
              default:
                console.error('Not espected ecloud event name: '
                  + event.strType + '/' + event.strName);
            }
            break;
          case EcloudEventType.metrics:
            switch (event.name) {
              case EcloudEventName.service:
                this.emit(this.onAddMetrics,
                  utils.transformEcloudEventDataToMetrics(event));
                break;
              default:
                console.error('Not espected ecloud event name: %s/%s',
                  event.strType, event.strName, event);
            }
            break;
          default:
            console.error('Not espected ecloud event type: %s',
              event.strType, event);
        }
        const timeEnd = performance.now();
        const totalTime = timeEnd - timeStart;
        console.debug('Event handler took %d for %s:%s', totalTime,
          event.strType, event.strName);
      });

      this.admission.onError((error: any) => {
        console.error('Error received from admission-client: '
          + JSON.stringify(error));
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
            console.error('Unkown element: ', registeredElements[i]);
        }
      }
    });
  }

  /**
   * Obtains detailed info from a element.
   * @param uri 
   */
  getElementInfo(uri: string) {
    if (this.requestedElements.indexOf(uri) === -1) {
      this.requestedElements.push(uri);
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
        console.error('Error getting element info.\n element: %s \n error:',
          uri, error);
      });
    }
  }

  addNewBundle(file: File) {
    this.sendBundle(file);
  }

  // @param elementId: Elemento o lista de elementos
  deleteElement(elementId) {
    return this.admission.removeStorage(elementId);
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



  /* DEPLOYMENTS */
  getDeploymentList() {
    return this.admission.findDeployments().then((deploymentList) => {
      for (let deploymentId in deploymentList) {
        this.emit(this.onAddDeployment, deploymentId,
          utils
            .transformEcloudDeploymentToDeployment(deploymentList[deploymentId])
        );
      }
    });
  }

  getDeployment(uri: string) {
    this.admission.findDeployments(uri).then((deploymentList) => {
      for (let deploymentId in deploymentList) {
        this.emit(this.onAddDeployment, deploymentId,
          utils
            .transformEcloudDeploymentToDeployment(deploymentList[deploymentId])
        );
      }

    });


  }

  undeployDeployment(deploymentURN: string) {
    return this.admission.undeploy(deploymentURN).then((value) => {
      this.emit(this.onRemoveDeploymemt, deploymentURN);
    });
  }

  addDeployment(deployment: Deployment) {
    return this.admission.deploy(new FileStream(
      new Blob(
        [JSON.stringify(utils.transformDeploymentToManifest(deployment))]
      )
    ));
  }

  aplyChangesToDeployment(deploymentId: string,
    rolNumInstances: { [rolId: string]: number },
    killInstances: { [rolid: string]: { [instanceId: string]: boolean } }) {

    let modification = new ScalingDeploymentModification();
    modification.deploymentURN = deploymentId;
    modification.scaling = rolNumInstances;
    console.debug('Los cambios que vamos a realizar son:', modification);
    return this.admission.modifyDeployment(modification).then(() => {
      console.debug('Cambios realizados satisfactoriamente');
    });
  }

  /* RESOURCES */
  addDomain(webdomain: string) {
    const manifest = utils.transformDomainToManifest(webdomain);
    let zip = new JSZip();
    let content: string = JSON.stringify(manifest) + '\n';
    zip.file('Manifest.json', content);
    /* var img = zip.folder("images");
    img.file("smile.gif", imgData, { base64: true });
    api:https://stuk.github.io/jszip/documentation/api_jszip/generate_async.html
    type: base64 | binarystring | unit8array | arraybuffer | blob | nodebuffer
    */
    let instance = this;
    zip.generateAsync({
      type: 'arraybuffer', mimeType: 'application/zip', streamFiles: true
    })
      .then((content) => {
        let file = new File([content], 'Bundle.zip', {
          type: 'application/zip'
        });

        instance.sendBundle(file).then((value) => {
          let uri = (<RegistrationResult>value).successful[0].split(' ')[2];
          let res = utils.transformManifestToResource({
            'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0',
            'name': uri,
            'parameters': {
              'vhost': webdomain
            }
          });
          this.emit(this.onAddResource, uri, res);
        }).catch((error) => {
          console.error('Error registering a webdomain', error);
        });
      }).catch((error) => {
        console.error(
          'Error creating a bundle for a webdomain manifest', error
        );
      });
  }

  addDataVolume(params) {
    console.error('Datavolume creation is under development');
  }

  private sendBundle(file: File) {
    return this.admission.sendBundle(new FileStream(file))
      .catch((error) => {
        console.error('Error uploading a bundle', error);
      });
  }
};

export const connection: ProxyConnection = new ProxyConnection();