import {
  AcsClient as EcloudAcsClient, AcsUser as EcloudAcsUser
} from 'acs-client';
import {
  AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent,
  EcloudEventName, EcloudEventType, Endpoint, FileStream,
  ReconfigDeploymentModification,
  RegistrationResult, ScalingDeploymentModification
} from 'admission-client';


import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { EventEmitter, Listener } from 'typed-event-emitter';

import {
  User
} from '../store/pagestate/classes';
import {
  Certificate, Component, Deployment, Domain, HTTPEntryPoint, Resource, Runtime,
  Service, Volume
} from '../store/stampstate/classes';
import { ACS_URI, ADMISSION_URI } from './config.js';
import {
  ElementType, getElementType, getResourceType, isServiceEntrypoint,
  ResourceType, transformDeploymentToManifest, transformDomainToManifest,
  transformEcloudDeploymentToDeployment, transformEcloudEventDataToMetrics,
  transformManifestToComponent, transformManifestToResource,
  transformManifestToRuntime, transformManifestToService
} from './utils';

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
  public onRemoveDeployment: Function;
  public onAddService: Function;
  public onRemoveService: Function;
  public onAddComponent: Function;
  public onRemoveComponent: Function;
  public onAddRuntime: Function;
  public onRemoveRuntime: Function;
  public onAddResource: Function;
  public onRemoveResource: Function;
  public onAddMetrics: Function;
  public onLink: Function;
  public onUnlink: Function;

  private requestedElements: string[];


  // Constructor
  constructor() {
    super();
    this.onAddComponent =
      this.registerEvent<(componentId: string, component: Component) => any>();
    this.onAddDeployment =
      this.registerEvent<(deploymentId: string,
        deployment: Deployment) => any>();
    this.onAddInstance =
      this.registerEvent<(deploymentId: string, rolId: string,
        instanceId: string, instance: Deployment.Role.Instance) => any>();
    this.onAddMetrics = this.registerEvent<(value) => any>();
    this.onAddResource =
      this.registerEvent<(resourceId: string, resource: Resource) => any>();
    this.onAddRuntime =
      this.registerEvent<(runtimeId: string, runtime: Runtime) => any>();
    this.onAddService =
      this.registerEvent<(serviceId: string, service: Service) => any>();
    this.onLogin =
      this.registerEvent<(username: string,
        userpassword: string) => EcloudAcsUser>();
    this.onModifyDeployment = this.registerEvent<(value) => any>();
    this.onRemoveComponent =
      this.registerEvent<(componentURN: string) => void>();
    this.onRemoveDeployment =
      this.registerEvent<(deploymentURN: string) => void>();
    this.onRemoveService = this.registerEvent<(serviceURN: string) => void>();
    this.onRemoveRuntime = this.registerEvent<(runtimeURN: string) => void>();
    this.onRemoveResource = this.registerEvent<(resourceURN: string) => void>();
    this.onLink = this.registerEvent<(value) => any>();
    this.onUnlink = this.registerEvent<(value) => any>();

    this.requestedElements = [];
  }

  /* GENERIC */

  /**
   * Login authentifies the user and redirects all events received from the
   * stamp.
   * If the user has got a token, that means it was authenticated in any other
   * way
   * @param username User's name
   * @param password User's password
   * @param userId User's id
   * @param token User's token
   */
  login(username: string, password: string, userId?: string, token?: {
    accessToken: string, expiresIn: number, refreshToken: string,
    tokenType: string
  }) {
    let signin:
      Promise<User>;
    if (!token) {
      this.acs = new EcloudAcsClient(ACS_URI);

      // User needs authentication
      signin = this.acs.login(username, password)
        .then((acsToken) => {

          return new User(acsToken.user.id, acsToken.user.name,
            User.State.AUTHENTICATED, acsToken);

        });

    } else {
      // Already authenticated user
      signin = Promise.resolve<User>(
        new User(userId, username, User.State.AUTHENTICATED, token));

    }

    return Promise.resolve()
      .then(() => signin)
      .then((user) => {

        this.admission = new EcloudAdmissionClient(ADMISSION_URI,
          user.token.accessToken);

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

                  if (isServiceEntrypoint(event.entity['serviceApp'])) {
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
                  if (isServiceEntrypoint(event.entity['serviceApp'])) {
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
                  this.getDeployment(event.entity['service']);
                  break;
                case EcloudEventName.undeployed:
                  this.emit(this.onRemoveDeployment, event.entity['service']);
                  break;
                case EcloudEventName.link:
                  this.emit(this.onLink, {
                    'deploymentOne': event.data.endpoints[0].deployment,
                    'channelOne': event.data.endpoints[0].channel,
                    'deploymentTwo': event.data.endpoints[1].deployment,
                    'channelTwo': event.data.endpoints[1].channel
                  });
                  break;
                case EcloudEventName.unlink:
                  this.emit(this.onUnlink, {
                    'deploymentOne': event.data.endpoints[0].deployment,
                    'channelOne': event.data.endpoints[0].channel,
                    'deploymentTwo': event.data.endpoints[1].deployment,
                    'channelTwo': event.data.endpoints[1].channel
                  });
                  break;
                case EcloudEventName.scale:
                case EcloudEventName.status:
                  console.warn('Event under development');
                case EcloudEventName.undeploying:
                  break;
                default:
                  console.error('Not espected ecloud event name: '
                    + event.strType + '/' + event.strName);
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
                    transformEcloudEventDataToMetrics(event));
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
          console.debug('Event handler took %dms for %s:%s',
            totalTime, event.strType, event.strName);
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
        switch (getElementType(registeredElements[i])) {
          case ElementType.runtime:
            this.emit(
              this.onAddRuntime,
              registeredElements[i],
              undefined
            );
            break;
          case ElementType.service:
            this.emit(
              this.onAddService,
              registeredElements[i],
              undefined
            );
            break;
          case ElementType.component:
            this.emit(this.onAddComponent,
              registeredElements[i],
              undefined
            );
            break;
          case ElementType.resource:
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
  getElementInfo(uri: string): Promise<any> {
    return Promise.resolve().then(() => {
      let res: Promise<any>;
      if (this.requestedElements.indexOf(uri) < 0) {
        this.requestedElements.push(uri);
        res = this.admission.getStorageManifest(uri);
      } else {
        res = Promise.reject({ 'msg': 'Request already done', 'code': '001' });
      }
      return res;
    }).then((element) => {
      let res: Promise<any> = Promise.resolve();

      switch (getElementType(uri)) {
        case ElementType.runtime:
          this.emit(
            this.onAddRuntime,
            uri,
            transformManifestToRuntime(element));
          break;

        case ElementType.service:
          let ser = transformManifestToService(element);
          this.emit(this.onAddService, uri, ser);

          let promiseArray: Promise<any>[] = [];
          for (let role in ser.roles) {
            res = res.then(() => {
              return this.getElementInfo(ser.roles[role].component);
            });
          }
          break;

        case ElementType.component:
          let comp = transformManifestToComponent(element);
          this.emit(this.onAddComponent, uri, comp);

          res = res.then(() => {
            return this.getElementInfo(comp.runtime);
          });

          break;

        case ElementType.resource:
          this.emit(
            this.onAddResource,
            uri,
            transformManifestToResource(element)
          );
          break;

        default:
          res = Promise.reject({ 'msg': 'Element not covered', 'code': '002' });
      }

      return res;
    });
  }

  addNewBundle(file: File) {
    this.sendBundle(file).then((registrationResult) => {

      console.debug('The result of the registration is', registrationResult);
      /* // When registering a persisten volume
      {
        errors: [],
        links:undefined,
        successful:[
          "Registered element: eslap://volumesexample.examples.ecloud/
          resources/volumes/persistent"
        ],
        testToken:undefined,
        tests:undefined
      }
      */
      /*
      // When registering dashboard parametros
      {
        errors:[],
        links:undefined,
        successful:[
          "Registered element: eslap://eslap.cloud/components/dashboard/0_0_1",
          "Registered element: eslap://eslap.cloud/services/dashboard/0_0_2"
        ],
      testToken:undefined,
      tests:undefined
      }
      */

      // this.emit(this.onAddResource, uri, res);
    });
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
  getDeploymentList(): Promise<any> {
    let pro: Promise<any> = this.admission.findDeployments();
    pro = pro.then((deploymentList) => {
      let promiseArray: Promise<any>[] = [];
      for (let deploymentId in deploymentList) {
        let deployment: Deployment =
          transformEcloudDeploymentToDeployment(deploymentList[deploymentId]);

        for (let resource in deployment.resourcesConfig) {
          // There are actually two certificates which dont have the same
          // structure

          if (deployment.resourcesConfig[resource].name) {
            switch (getResourceType(deployment.resourcesConfig[resource]
              .name)) {
              case ResourceType.certificate:
                this.emit(
                  this.onAddResource,
                  deployment.resourcesConfig[resource].name,
                  new Certificate(
                    deployment.resourcesConfig[resource].name,
                    [deployment._uri]
                  )
                );
                break;
              case ResourceType.domain:
                this.emit(
                  this.onAddResource,
                  deployment.resourcesConfig[resource].name,
                  new Domain(
                    deployment.resourcesConfig[resource].name,
                    deployment.resourcesConfig[resource].parameters.vhost,
                    Domain.STATE.SUCCESS,
                    [deployment._uri]
                  )
                );
                break;
              case ResourceType.volume:
                this.emit(
                  this.onAddResource,
                  deployment.resourcesConfig[resource].name,
                  new Volume(
                    deployment.resourcesConfig[resource].name,
                    [deployment._uri]
                  )
                );
                break;
              default:
                console.error('Unkown resource type: %s', resource);
            }
          }
          else {
            console.warn('unrecognized resource %s structure at %s',
              resource, deployment._uri);
          }
        }

        this.emit(this.onAddDeployment, deploymentId, deployment);

        promiseArray.push(this.getElementInfo(deployment.service)
          .catch((err) => {
            return err;
          }));
      }

      return Promise.all(promiseArray)
        .then((values) => { })
        .catch(err => console.log('Catch', err))
        .then(() => { });
    });
    return pro;
  }

  getDeployment(uri: string) {
    this.admission.findDeployments(uri).then((deploymentList) => {
      for (let deploymentId in deploymentList) {

        let deployment: Deployment = transformEcloudDeploymentToDeployment(
          deploymentList[deploymentId]);


        for (let resource in deployment.resourcesConfig) {
          // There are actually two certificates which dont have the same
          // structure

          if (deployment.resourcesConfig[resource].name) {
            switch (
            getResourceType(deployment.resourcesConfig[resource].name)
            ) {
              case ResourceType.certificate:
                this.emit(
                  this.onAddResource,
                  deployment.resourcesConfig[resource].name,
                  new Certificate(
                    deployment.resourcesConfig[resource].name,
                    [deployment._uri]
                  )
                );
                break;
              case ResourceType.domain:
                this.emit(
                  this.onAddResource,
                  deployment.resourcesConfig[resource].name,
                  new Domain(
                    deployment.resourcesConfig[resource].name,
                    deployment.resourcesConfig[resource].parameters.vhost,
                    Domain.STATE.SUCCESS,
                    [deployment._uri]
                  )
                );
                break;
              case ResourceType.volume:
                this.emit(
                  this.onAddResource,
                  deployment.resourcesConfig[resource].name,
                  new Volume(
                    deployment.resourcesConfig[resource].name,
                    [deployment._uri]
                  )
                );
                break;
              default:
                console.error('Unkown resource type: %s', resource);
            }
          }
          else {
            console.warn('unrecognized resource %s structure at %s',
              resource, deployment._uri);
          }
        }
        this.emit(this.onAddDeployment, deploymentId, deployment);
      }
    });
  }

  undeployDeployment(deploymentURN: string) {
    return this.admission.undeploy(deploymentURN);
  }

  addDeployment(deployment: Deployment) {

    return this.admission.deploy(new FileStream(new Blob([
      JSON.stringify(transformDeploymentToManifest(deployment))
    ])));
  }

  aplyChangesToDeployment(deploymentId: string,
    roleNumInstances: { [rolId: string]: number },
    killInstances: { [rolid: string]: { [instanceId: string]: boolean } }) {

    let modification = new ScalingDeploymentModification();
    modification.deploymentURN = deploymentId;
    modification.scaling = roleNumInstances;

    return this.admission.modifyDeployment(modification).then(() => {
      this.admission.findDeployments(deploymentId).then((deploymentList) => {
        for (let deploymentId in deploymentList) {
          let deployment: Deployment =
            transformEcloudDeploymentToDeployment(deploymentList[deploymentId]);

          for (let resource in deployment.resourcesConfig) {
            // There are actually two certificates which dont have the same
            // structure
            if (deployment.resourcesConfig[resource].resource.name) {
              switch (getResourceType(deployment.resourcesConfig[resource]
                .resource.name)) {
                case ResourceType.certificate:
                  this.emit(
                    this.onAddResource,
                    deployment.resourcesConfig[resource].resource.name,
                    new Certificate(
                      deployment.resourcesConfig[resource].resource.name,
                      [deployment._uri]
                    )
                  );
                  break;
                case ResourceType.domain:
                  this.emit(
                    this.onAddResource,
                    deployment.resourcesConfig[resource].resource.name,
                    new Domain(
                      deployment.resourcesConfig[resource].resource.name,
                      deployment.resourcesConfig[resource].resource.parameters
                        .vhost,
                      Domain.STATE.SUCCESS,
                      [deployment._uri]
                    )
                  );
                  break;
                case ResourceType.volume:
                  this.emit(
                    this.onAddResource,
                    deployment.resourcesConfig[resource].resource.name,
                    new Volume(
                      deployment.resourcesConfig[resource].resource.name,
                      [deployment._uri]
                    )
                  );
                  break;
                default:
                  console.error('Unkown resource type: %s', resource);
              }
            }
            else {
              console.warn('unrecognized resource %s structure at %s', resource,
                deployment._uri);
            }
          }

          this.emit(this.onAddDeployment, deploymentId, deployment);

        }
      });
    });
  }

  /* RESOURCES */
  addDomain(webdomain: string) {
    const manifest = transformDomainToManifest(webdomain);
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
          let res = transformManifestToResource({
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

  link({ deploymentOne, channelOne, deploymentTwo, channelTwo }) {
    this.admission.linkDeployments([
      new Endpoint(deploymentOne, channelOne),
      new Endpoint(deploymentTwo, channelTwo)
    ]);
  }

  unlink({ deploymentOne, channelOne, deploymentTwo, channelTwo }) {
    this.admission.unlinkDeployments([
      new Endpoint(deploymentOne, channelOne),
      new Endpoint(deploymentTwo, channelTwo)
    ]);
  }

  private sendBundle(file: File) {
    return this.admission.sendBundle(new FileStream(file))
      .catch((error) => {
        console.error('Error uploading a bundle', error);
      });
  }
};

export const connection: ProxyConnection = new ProxyConnection();