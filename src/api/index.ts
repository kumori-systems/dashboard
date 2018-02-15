import {
  AcsClient as EcloudAcsClient, AcsUser as EcloudAcsUser
} from 'acs-client';
import {
  AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent,
  DeploymentInstanceInfo, DeploymentList, EcloudEventName, EcloudEventType,
  Endpoint, FileStream, ReconfigDeploymentModification, RegistrationResult,
  ScalingDeploymentModification
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

import { Notification } from '../store/pagestate/classes';

import { ACS_URI, ADMISSION_URI } from './config.js';
import {
  ElementType, getElementType, getResourceType, isServiceEntrypoint,
  ResourceType, transformDeploymentToManifest, transformDomainToManifest,
  transformEcloudDeploymentToDeployment, transformEcloudEventDataToMetrics,
  transformManifestToComponent, transformManifestToResource,
  transformManifestToRuntime, transformManifestToService,
  transformVolumeToManifest
} from './utils';

/**
   * This class connects with the platform and transform messages into
   * recognizable events for the page.
   */
class ProxyConnection extends EventEmitter {
  // Atributes
  private admission: EcloudAdmissionClient;
  private acs: EcloudAcsClient;

  // Events
  public onSignIn: Function;
  public onRefreshToken: Function;
  public onAddDeployment: Function;
  public onAddInstance: Function;
  public onRemoveDeployment: Function;
  public onAddService: Function;
  public onAddComponent: Function;
  public onAddRuntime: Function;
  public onAddResource: Function;
  public onAddMetrics: Function;
  public onLink: Function;
  public onUnlink: Function;
  public onAddNotification: Function;
  public onMustSignOut: Function;

  private requestedElements: string[];

  /**
   * This class connects with the platform and transform messages into
   * recognizable events for the page.
   */
  constructor() {

    super();
    this.onAddComponent =
      this.registerEvent<(componentId: string, component: Component) => void>();
    this.onAddDeployment =
      this.registerEvent<(deploymentId: string,
        deployment: Deployment) => void>();
    this.onAddInstance =
      this.registerEvent<(deploymentId: string, rolId: string,
        instanceId: string, instance: Deployment.Role.Instance) => void>();
    this.onAddMetrics = this.registerEvent<(value) => any>();
    this.onAddResource =
      this.registerEvent<(resourceId: string, resource: Resource) => void>();
    this.onAddRuntime =
      this.registerEvent<(runtimeId: string, runtime: Runtime) => void>();
    this.onAddService =
      this.registerEvent<(serviceId: string, service: Service) => void>();
    this.onSignIn =
      this.registerEvent<(username: string,
        userpassword: string) => EcloudAcsUser>();
    this.onRemoveDeployment =
      this.registerEvent<(deploymentURN: string) => void>();
    this.onLink = this.registerEvent<(params: {
      deploymentOne: string, channelOne: string, deploymentTwo: string,
      channelTwo: string
    }) => void>();
    this.onUnlink = this.registerEvent<(params: {
      deploymentOne: string, channelOne: string, deploymentTwo: string,
      channelTwo: string
    }) => void>();
    this.onAddNotification =
      this.registerEvent<(notification: Notification) => void>();
    this.onMustSignOut =
      this.registerEvent<(notification: Notification) => void>();
    this.onRefreshToken = this.registerEvent<(token) => void>();
    this.requestedElements = [];

  }

  /* GENERIC */

  /**
   * Closes the authenticated connections to the stamp.
   */
  signOut(): void {

    this.admission.close();

  }

  renewToken(previousToken: User.Token): Promise<User.Token> {

    return this.acs.refreshToken(previousToken.accessToken).catch(
      () => {
        return this.acs.refreshToken(previousToken.accessToken).catch(() => {
          return this.acs.refreshToken(previousToken.accessToken);
        });
      }
    )
      .then((acsToken) => {

        // Updates admission-client token
        this.admission.refreshToken(acsToken.accessToken);

        return new User.Token(
          acsToken.accessToken, acsToken.expiresIn, acsToken.refreshToken,
          acsToken.tokenType
        );
      });

  }

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
  signIn(
    username: string, password: string, userId?: string, token?: User.Token
  ): Promise<any> {

    // ACS will be used in both cases to refresh the token
    this.acs = new EcloudAcsClient(ACS_URI);
    let signIn: Promise<User>;
    if (!token) {

      // User needs authentication
      signIn = this.acs.login(username, password)
        .then((acsToken) => {

          return new User(
            acsToken.user.id, acsToken.user.name, User.State.AUTHENTICATED,
            new User.Token(
              acsToken.accessToken, acsToken.expiresIn, acsToken.refreshToken,
              acsToken.tokenType
            )
          );

        });

    } else {

      // Already authenticated user
      signIn = this.acs.refreshToken(token.accessToken)
        .then((refreshedToken) => {
          return new User(userId, username, User.State.AUTHENTICATED,
            new User.Token(refreshedToken.accessToken, refreshedToken.expiresIn,
              refreshedToken.refreshToken, refreshedToken.tokenType)
          );
        });
    }

    return Promise.resolve()
      .then(() => signIn)
      .then((user: User) => {

        this.admission = new EcloudAdmissionClient(ADMISSION_URI,
          user.token.accessToken);

        this.admission.onConnected(() => {
          console.info('Successfully connected to the platform');
        });

        this.admission.onEcloudEvent((event: EcloudEvent) => {

          /* console.warn('Event under development: %s / %s event received:',
            event.strType, event.strName, event); */

          // const timeStart = performance.now();

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

                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.INFO,
                      'Deploying service',
                      'The service ' + event.entity['serviceApp'] + 'is beeing '
                      + 'deployed as ' + event.entity['service'],
                      JSON.stringify(event, null, 4)
                    )
                  );
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
                      this.onAddDeployment, // Method
                      event.entity['service'], // DeploymentId
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
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.INFO,
                      'Deployed service',
                      'The service ' + event.entity['serviceApp'] + 'has been '
                      + 'deployed as ' + event.entity['service'],
                      JSON.stringify(event, null, 4)
                    )
                  );
                  break;

                case EcloudEventName.undeploying:
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.WARNING,
                      'Undeploying service',
                      'Undeploying service ' + event.entity['service'],
                      JSON.stringify(event, null, 2)
                    )
                  );
                  break;

                case EcloudEventName.undeployed:
                  this.emit(this.onRemoveDeployment, event.entity['service']);
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.WARNING,
                      'Undeployed service',
                      'Undeployed service ' + event.entity['service'],
                      JSON.stringify(event, null, 2)
                    )
                  );
                  break;

                case EcloudEventName.link:
                  this.emit(this.onLink, {
                    'deploymentOne': event.data.endpoints[0].deployment,
                    'channelOne': event.data.endpoints[0].channel,
                    'deploymentTwo': event.data.endpoints[1].deployment,
                    'channelTwo': event.data.endpoints[1].channel
                  });
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.INFO,
                      'Linked services',
                      'Service ' + event.data.endpoints[0].deployment
                      + ':' + event.data.endpoints[0].channel
                      + ' has been linked with '
                      + event.data.endpoints[0].deployment
                      + ':' + event.data.endpoints[0].channel,
                      JSON.stringify(event, null, 4)
                    )
                  );
                  break;

                case EcloudEventName.unlink:
                  this.emit(this.onUnlink, {
                    'deploymentOne': event.data.endpoints[0].deployment,
                    'channelOne': event.data.endpoints[0].channel,
                    'deploymentTwo': event.data.endpoints[1].deployment,
                    'channelTwo': event.data.endpoints[1].channel
                  });
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.WARNING,
                      'Unlinked services',
                      'Services ' + event.data.endpoints[0].deployment
                      + ':' + event.data.endpoints[0].channel
                      + ' has been unlinked from '
                      + event.data.endpoints[0].deployment
                      + ':' + event.data.endpoints[0].channel,
                      JSON.stringify(event, null, 4)
                    )
                  );
                  break;

                case EcloudEventName.scale:
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.INFO,
                      'Scaling service',
                      'Scaling service '
                      + event.entity['service'],
                      JSON.stringify(event, null, 4)
                    )
                  );
                  break;

                case EcloudEventName.status:
                  // Unused event
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

                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.INFO,
                      'Added instance',
                      'Added instance'
                      + 'Instance ' + event.entity['instance']
                      + ' from Role ' + event.entity['role']
                      + ' from Service' + event.entity['service'],
                      JSON.stringify(event, null, 4)
                    )
                  );

                  break;

                case EcloudEventName.realocate:
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.WARNING,
                      'Realocated instance',
                      'Realocated instance'
                      + 'Instance ' + event.entity['instance']
                      + ' from Role ' + event.entity['role']
                      + ' from Service' + event.entity['service'],
                      JSON.stringify(event, null, 4)
                    )
                  );
                  break;

                case EcloudEventName.restart:
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.WARNING,
                      'Restarted instance',
                      'Restarted instance'
                      + 'Instance ' + event.entity['instance']
                      + ' from Role ' + event.entity['role']
                      + ' from Service' + event.entity['service'],
                      JSON.stringify(event, null, 4)
                    )
                  );

                  break;

                case EcloudEventName.reconfig:
                  this.emit(
                    this.onAddNotification,
                    new Notification(Notification.LEVEL.WARNING,
                      'Reconfigured instance',
                      'Reconfigured instance'
                      + 'Instance ' + event.entity['instance']
                      + ' from Role ' + event.entity['role']
                      + ' from Service' + event.entity['service'],
                      JSON.stringify(event, null, 4)
                    )
                  );
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

          /* const timeEnd = performance.now();
          const totalTime = timeEnd - timeStart;
          console.debug('Event handler took %dms for %s:%s',
            totalTime, event.strType, event.strName); */

        });

        this.admission.onDisconnected(() => {

          console.warn('Disconnected from the platform');

        });

        this.admission.onError((error: any) => {
          console.error('Error received from admission-client: ', error);
        });

        return this.admission.init().then(() => user);

      });

  }

  /**
   * Obtains all registered elements in the stamp.
   */
  getRegisteredElements(): Promise<any> {

    return this.admission.findStorage().then((registeredElements) => {

      for (let i = 0; i < registeredElements.length; i++) {

        switch (getElementType(registeredElements[i])) {

          case ElementType.runtime:

            this.emit(this.onAddRuntime, registeredElements[i], undefined);
            break;

          case ElementType.service:

            this.emit(this.onAddService, registeredElements[i], undefined);
            break;

          case ElementType.component:

            this.emit(this.onAddComponent, registeredElements[i], undefined);
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

    // Retrieves the information from the stamp
    return Promise.resolve().then(() => {

      let res: Promise<any>;
      if (this.requestedElements.indexOf(uri) < 0) {
        this.requestedElements.push(uri);
        res = this.admission.getStorageManifest(uri);
      } else {
        res = Promise.reject(new Error('Duplicated request'));
      }
      return res;

    }).then((element) => {

      let res: Promise<any> = Promise.resolve();

      switch (getElementType(uri)) {
        case ElementType.runtime:
          let runtime: Runtime;
          try {
            runtime = transformManifestToRuntime(element);
            this.emit(this.onAddRuntime, uri, runtime);
          } catch (error) {
            this.emit(this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized runtime params', 'Unrecognized runtime params',
                JSON.stringify(element, null, 4)
              )
            );
          }

          break;

        case ElementType.service:
          let ser: Service;
          try {
            ser = transformManifestToService(element);
            this.emit(this.onAddService, uri, ser);
            let promiseArray: Promise<any>[] = [];
            for (let role in ser.roles) {
              res = res.then(() => {
                return this.getElementInfo(ser.roles[role].component);
              });
            }
          } catch (error) {
            this.emit(this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized service params', 'Unrecognized service params',
                JSON.stringify(element, null, 4)
              )
            );
          }
          break;

        case ElementType.component:
          let comp: Component;
          try {
            comp = transformManifestToComponent(element);
            this.emit(this.onAddComponent, uri, comp);

            res = res.then(() => {
              return this.getElementInfo(comp.runtime);
            });
          } catch (error) {
            this.emit(this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized component params',
                'Unrecognized component params',
                JSON.stringify(element, null, 4)
              )
            );
          }
          break;

        case ElementType.resource:
          let resource: Resource;
          try {
            resource = transformManifestToResource(element);
            this.emit(
              this.onAddResource, uri, resource
            );
          } catch (error) {
            this.emit(this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized resource params',
                'Unrecognized resource params',
                JSON.stringify(element, null, 4)
              )
            );
          }
          break;

        default:
          res = Promise.reject(new Error('Element not covered'));
      }

      return res;

    });

  }

  addNewBundle(file: File): Promise<any> {
    return this.sendBundle(file)
      .then((registrationResult) => {

        for (let successful in registrationResult.successful) {

          let uri: string = (<string>registrationResult.successful[successful])
            .substring(20);

          switch (getElementType(uri)) {
            case ElementType.component:
            case ElementType.resource:
            case ElementType.runtime:
            case ElementType.service:
              this.getElementInfo(uri).catch((err: Error) => {
                if (err.message !== 'Duplicated request') console.error(err);
              });
              break;
            default:
            // Other elements have their own event
          }

        }

        if (registrationResult.errors && registrationResult.errors.length > 0) {
          return Promise.reject(
            new Error(JSON.stringify(registrationResult))
          );
        }

        this.emit(
          this.onAddNotification,
          new Notification(Notification.LEVEL.INFO,
            'Registered bundle',
            'Correclty registered bundle',
            JSON.stringify(registrationResult, null, 4)
          )
        );

      });
  }

  /**
   * Removes elements from the stamp.
   * @param elementId <string | string[]> Element or list of elements to remove.
   */
  deleteElement(elementId: string): Promise<any> {

    return this.admission.removeStorage(elementId);

  }

  // @param elementId: Element or element list
  downloadManifest(elementId): Promise<any> {

    // Requests the manifest from the stamp
    return this.admission.getStorageManifest(elementId).then((manifest) => {

      // Stores the manifest in a local file
      FileSaver.saveAs(
        new Blob([
          JSON.stringify(manifest) + '\n'
        ], { type: 'application/json;charset=utf-8' }),
        'Manifest.' + elementId + '.json'
      );

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

        for (let resource in deployment.resources) {
          this.emit(
            this.onAddResource,
            deployment.resources[resource]._uri,
            deployment.resources[resource]
          );
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

  getDeployment(uri: string): Promise<any> {

    return this.admission.findDeployments(uri).then((deploymentList) => {
      for (let deploymentId in deploymentList) {

        let deployment: Deployment = transformEcloudDeploymentToDeployment(
          deploymentList[deploymentId]);


        for (let resource in deployment.resources) {
          this.emit(
            this.onAddResource,
            deployment.resources[resource]._uri,
            deployment.resources[resource]
          );
        }
        this.emit(this.onAddDeployment, deploymentId, deployment);
      }
    });

  }

  /**
   * Undeploys a deployed service from the stamp.
   * @param deploymentURN <string> Deployment identification.
   */
  undeployDeployment(deploymentURN: string): Promise<DeploymentInstanceInfo[]> {

    return this.admission.undeploy(deploymentURN);

  }

  /**
   * Deploys a registered service in the stamp.
   * @param deployment <Deployment> Service with depoying options.
   */
  addDeployment(deployment: Deployment): Promise<DeploymentList> {

    return this.admission.deploy(new FileStream(new Blob([
      JSON.stringify(transformDeploymentToManifest(deployment))
    ])));

  }

  aplyChangesToDeployment(
    deploymentId: string, roleNumInstances: { [rolId: string]: number },
    killInstances: { [rolid: string]: { [instanceId: string]: boolean } }
  ): Promise<any> {

    let modification = new ScalingDeploymentModification();
    modification.deploymentURN = deploymentId;
    modification.scaling = roleNumInstances;

    return this.admission.modifyDeployment(modification).then(() => {
      this.admission.findDeployments(deploymentId).then((deploymentList) => {
        for (let deploymentId in deploymentList) {
          let deployment: Deployment =
            transformEcloudDeploymentToDeployment(deploymentList[deploymentId]);

          for (let resource in deployment.resources) {
            this.emit(
              this.onAddResource, resource, deployment.resources[resource]
            );
          }

          this.emit(this.onAddDeployment, deploymentId, deployment);

        }
      });
    });
  }

  /* RESOURCES */
  addDomain(uri: string, webdomain: string): Promise<any> {
    let zip = new JSZip();
    zip.file(
      'Manifest.json',
      JSON.stringify(transformDomainToManifest(uri, webdomain))
      + '\n'
    );
    /*
     * var img = zip.folder("images");
     * img.file("smile.gif", imgData, { base64: true });
     * api:https://stuk.github.io/jszip/documentation/api_jszip/
     *  generate_async.html
     * type: base64 | binarystring | unit8array | arraybuffer | blob |
     *  nodebuffer
     */

    // Generates the zip asynchronously
    return zip.generateAsync({
      type: 'arraybuffer', mimeType: 'application/zip', streamFiles: true
    }).then((content) => {

      // Sends the bundle to the stamp
      return this.sendBundle(new File([content], 'Bundle.zip', {
        type: 'application/zip'
      }));

    }).then((value) => {

      // If the bundle was successfully registered, the vhost is added to the
      // state
      let uri = (<RegistrationResult>value).successful[0].split(' ')[2];
      let res: Resource = transformManifestToResource({
        'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0',
        'name': uri,
        'parameters': {
          'vhost': webdomain
        }
      });
      this.emit(this.onAddResource, uri, res);

      this.emit(this.onAddNotification,
        new Notification(Notification.LEVEL.INFO,
          'Registered domain',
          'Correclty registered domain' + webdomain,
          JSON.stringify(value, null, 4)
        )
      );

    });
  }

  addVolume(uri: string, filesystem: Volume.FILESYSTEM, size: number):
    Promise<any> {

    let manifest = transformVolumeToManifest(uri, filesystem, size);

    // console.debug('The volume manifest', manifest);

    console.warn('########################################\n'
      + 'Volume creation is under development.\n'
      + 'And nothing will be sended\n'
      + 'MANIFEST:\n'
      + JSON.stringify(manifest) + '\n'
      + '########################################\n'
    );

    return Promise.resolve();
  }

  link({ deploymentOne, channelOne, deploymentTwo, channelTwo }): Promise<any> {
    return this.admission.linkDeployments([
      new Endpoint(deploymentOne, channelOne),
      new Endpoint(deploymentTwo, channelTwo)
    ]);
  }

  unlink(
    { deploymentOne, channelOne, deploymentTwo, channelTwo }
  ): Promise<any> {
    return this.admission.unlinkDeployments([
      new Endpoint(deploymentOne, channelOne),
      new Endpoint(deploymentTwo, channelTwo)
    ]);
  }

  private sendBundle(file: File): Promise<RegistrationResult> {
    return this.admission.sendBundle(new FileStream(file));
  }

};

export const connection: ProxyConnection = new ProxyConnection();