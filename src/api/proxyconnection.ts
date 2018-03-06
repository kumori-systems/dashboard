import {
  AcsClient as EcloudAcsClient, AcsUser as EcloudAcsUser
} from 'acs-client';
import {
  AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent,
  Deployment as EcloudDeployment, DeploymentInstanceInfo, DeploymentList,
  EcloudEventName, EcloudEventType, Endpoint, FileStream,
  ReconfigDeploymentModification, RegistrationResult,
  ScalingDeploymentModification
} from 'admission-client';

import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { EventEmitter, Listener } from 'typed-event-emitter';

import { Notification, User } from '../store/pagestate/classes';
import {
  BooleanParameter, Certificate, Channel, Component, Connector, DependedChannel,
  Deployment, Domain, ECloudElement, HTTPEntryPoint, IntegerParameter,
  JsonParameter, ListParameter, LoadBalancerConnector, NumberParameter,
  Parameter, PersistentVolume, ProvidedChannel, PublishSubscribeConnector,
  Resource, Runtime, Service, StringParameter, VolatileVolume, Volume
} from '../store/stampstate/classes';


import { ACS_URL, ADMISSION_URL } from './config.js';
import * as utils from './utils';


/**
 * This class connects with the platform and transform messages into
 * recognizable events for the page.
 */
export class ProxyConnection extends EventEmitter {

  /** Instance of this class. Implemented with SINGLETON PATTERN. */
  private static _instance: ProxyConnection;

  /** Client library for Admission. */
  private admission: EcloudAdmissionClient;

  /** Client library for ACS. */
  private acs: EcloudAcsClient;

  /** The user tries to sign-in to the ECloud environment. */
  public onSignIn: Function;

  /** The user tries to refresh the already taken token. */
  public onRefreshToken: Function;

  /** Notification of deployment added. */
  public onDeploy: Function;

  /** Notification of deployment removed. */
  public onUndeploy: Function;

  /** Notification of instance added. */
  public onAddInstance: Function;

  /** Notification of service added. */
  public onAddService: Function;

  /** Notification of component added. */
  public onAddComponent: Function;

  /** Notification of runtime added. */
  public onAddRuntime: Function;

  /** Notification of domain added. */
  public onAddDomain: Function;

  /** Notification of certificate added. */
  public onAddCertificate: Function;

  /** Notification of persistent volume added. */
  public onAddPersistentVolume: Function;

  /** Notification of volatile volume added. */
  public onAddVolatileVolume: Function;

  /** Notification of service metrics added. */
  public onAddServiceMetrics: Function;

  /** Notification of volume metrics added. */
  public onAddVolumeMetrics: Function;

  /** Notification of link added. */
  public onLink: Function;

  /** Notification of link removed. */
  public onUnlink: Function;

  /** Notification of added notification. */
  public onAddNotification: Function;

  /** Notification of forced sign-out. */
  public onMustSignOut: Function;

  /** List of requested elements to avoid make multiple calls. */
  private requestedElements: string[];

  /**
   * This class connects with the platform and transform messages into
   * recognizable events for the page.
   */
  private constructor() {

    super();
    this.onAddComponent =
      this.registerEvent<(componentId: string, component: Component) => void>();
    this.onDeploy = this.registerEvent<(
      DeploymentURN: string, deployment: Deployment
    ) => void>();
    this.onAddInstance = this.registerEvent<(
      DeploymentURN: string, rolId: string, instanceId: string,
      instance: Deployment.Role.Instance
    ) => void>();
    this.onAddServiceMetrics = this.registerEvent<(value) => any>();
    this.onAddVolumeMetrics = this.registerEvent<(value) => any>();
    this.onAddCertificate = this.registerEvent<(
      resourceId: string, resource: Certificate
    ) => void>();
    this.onAddDomain = this.registerEvent<(
      resourceId: string, resource: Domain
    ) => void>();
    this.onAddPersistentVolume = this.registerEvent<(
      resourceId: string, resource: PersistentVolume
    ) => void>();
    this.onAddVolatileVolume = this.registerEvent<(
      resourceId: string, resource: VolatileVolume
    ) => void>();
    this.onAddRuntime = this.registerEvent<(
      runtimeId: string, runtime: Runtime
    ) => void>();
    this.onAddService = this.registerEvent<(
      serviceId: string, service: Service
    ) => void>();
    this.onSignIn = this.registerEvent<(
      username: string, userpassword: string
    ) => EcloudAcsUser>();
    this.onUndeploy = this.registerEvent<(deploymentURN: string) => void>();
    this.onLink = this.registerEvent<(
      params: {
        deploymentOne: string, channelOne: string, deploymentTwo: string,
        channelTwo: string
      }
    ) => void>();
    this.onUnlink = this.registerEvent<(
      params: {
        deploymentOne: string, channelOne: string, deploymentTwo: string,
        channelTwo: string
      }
    ) => void>();
    this.onAddNotification = this.registerEvent<(
      notification: Notification
    ) => void>();
    this.onMustSignOut = this.registerEvent<(
      notification: Notification
    ) => void>();
    this.onRefreshToken = this.registerEvent<(token) => void>();
    this.requestedElements = [];

  }

  /**
   * Obtains an instance of this class.
   */
  static get instance(): ProxyConnection {
    if (!ProxyConnection._instance) {
      ProxyConnection._instance = new ProxyConnection();
    }
    return ProxyConnection._instance;
  }
  /**
   * No modification to the instance is allowed.
   */
  static set instance(ints: ProxyConnection) {
    // This won't change anything doesn't mattter what
  }

  /* GENERIC */

  /**
   * Closes the authenticated connections to the stamp.
   */
  signOut(): void {

    this.admission.close();

    this.admission = null;
    this.acs = null;
    ProxyConnection._instance = null;

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
    this.acs = new EcloudAcsClient(ACS_URL);
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

        this.admission = new EcloudAdmissionClient(ADMISSION_URL,
          user.token.accessToken);

        this.admission.onConnected(() => {
          console.info('Successfully connected to the platform');
        });

        this.admission.onEcloudEvent((event: EcloudEvent) => {

          switch (event.type) {
            case EcloudEventType.service:
              switch (event.name) {
                case EcloudEventName.deploying:

                  // Depending on the service, it's created a deployment or an
                  // entrypoint

                  if (utils.isServiceEntrypoint(event.entity['serviceApp'])) {
                    // Entrypoint deployment
                    this.emit(
                      this.onDeploy, // Method
                      event.entity['service'], // DeploymentURN
                      new HTTPEntryPoint(
                        event.entity['service'], // URN
                        null, // parameters
                        null, // roles
                        null, // resourcesConfig
                        null, // links
                      ) // Deployment
                    );
                  }
                  else { // Common deployment
                    this.emit(
                      this.onDeploy, // Method
                      event.entity['service'], // DeploymentURN
                      new Deployment(
                        event.entity['service'], // URN
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
                  if (utils.isServiceEntrypoint(event.entity['serviceApp'])) {
                    this.emit(
                      this.onDeploy, // Method
                      event.entity['service'], // DeploymentURN
                      new HTTPEntryPoint(
                        event.entity['service'], // URN
                        null, // parameters
                        roles, // roles
                        null, // resourcesConfig
                        null, // links
                      ) // Deployment
                    );
                  }
                  else {
                    this.emit(
                      this.onDeploy, // Method
                      event.entity['service'], // DeploymentURN
                      new Deployment(
                        event.entity['service'], // URN
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
                  this.emit(this.onUndeploy, event.entity['service']);
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
              console.error('Not espected ecloud event type: ' + event.strType
                + '/' + event.strName);
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
                    null, // resources
                    null // ports
                  ); // Instance
                  this.emit(
                    this.onAddInstance, // Method
                    event.entity['service'], // DeploymentURN
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
                  this.emit(
                    this.onAddServiceMetrics,
                    this.transformEcloudEventDataToServiceMetrics(event)
                  );
                  break;
                case EcloudEventName.volume:
                  this.emit(
                    this.onAddVolumeMetrics,
                    this.transformEcloudEventDataToVolumeMetrics(event)
                  );
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
   * Obtains the registered resources in the stamp.
   */
  getResources(): Promise<any> {

    return this.admission.getResources().then((registeredResources) => {

      for (let registeredResIndex in registeredResources) {
        switch (
        utils.getResourceType(registeredResources[registeredResIndex].type)
        ) {
          case Resource.RESOURCE_TYPE.CERTIFICATE:
            this.emit(
              this.onAddCertificate,
              registeredResIndex,
              new Certificate(
                registeredResIndex, // urn
                registeredResources[registeredResIndex].parameters.key, // key
                registeredResources[registeredResIndex].parameters.cert, // cert
                registeredResources[registeredResIndex].deployment // UsedBy
              )
            );
            break;

          case Resource.RESOURCE_TYPE.DOMAIN:
            this.emit(
              this.onAddDomain,
              registeredResIndex,
              new Domain(
                registeredResIndex, // urn
                registeredResources[registeredResIndex].parameters.vhost, // url
                Domain.STATE.SUCCESS, // State
                registeredResources[registeredResIndex].deployment // UsedBy
              )
            );
            break;

          case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
            let persistentVolumeItems: {
              [key: string]: PersistentVolume.Instance
            } = {};
            for (
              let perVolIns in registeredResources[registeredResIndex].items
            ) {
              persistentVolumeItems[perVolIns] =
                new PersistentVolume.Instance(
                  perVolIns, // id
                  registeredResources[registeredResIndex].name, // name
                  registeredResIndex, // definitionURN
                  null, // associatedRole
                  registeredResources[registeredResIndex].items[perVolIns]
                    .instanceId, // associatedInstance
                  registeredResources[registeredResIndex].items[perVolIns]
                    .usage // usage
                );
            }
            this.emit(
              this.onAddPersistentVolume,
              registeredResIndex,
              new PersistentVolume(
                registeredResIndex, // id
                registeredResources[registeredResIndex].name, // name
                registeredResources[registeredResIndex].parameters.size, // size
                persistentVolumeItems, // items
                null, // associatedRole
                // filesystem
                registeredResources[registeredResIndex].parameters.filesystem,
                registeredResources[registeredResIndex].deployment // usedBy
              )
            );
            break;

          case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:
            let volatileVolumeItems: {
              [key: string]: VolatileVolume.Instance
            } = {};
            for (
              let volVolIns in registeredResources[registeredResIndex].items
            ) {
              volatileVolumeItems[volVolIns] =
                new VolatileVolume.Instance(
                  volVolIns, // id
                  registeredResources[registeredResIndex].name, // name
                  registeredResIndex, // definitionURN
                  null, // associatedRole
                  registeredResources[registeredResIndex].items[volVolIns]
                    .instanceId, // associatedInstance
                  registeredResources[registeredResIndex].items[volVolIns]
                    .usage // usage
                );
            }
            this.emit(
              this.onAddVolatileVolume,
              registeredResIndex,
              new VolatileVolume(
                registeredResIndex, // id
                registeredResources[registeredResIndex].name, // name
                registeredResources[registeredResIndex].parameters.size, // size
                volatileVolumeItems, // items
                // filesystem
                registeredResources[registeredResIndex].parameters.filesystem,
                null, // associated role
                registeredResources[registeredResIndex].deployment // usedBy
              )
            );
            break;

          default:
            throw new Error(
              'Unrecognized resource \'' + registeredResIndex + '\''
            );
        }
      }
    });

  }

  /**
   * Obtains all registered elements in the stamp.
   */
  getRegisteredElements(): Promise<any> {

    return this.admission.findStorage().then((registeredElements) => {

      for (let i = 0; i < registeredElements.length; i++) {

        switch (utils.getElementType(registeredElements[i])) {

          case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:

            this.emit(this.onAddRuntime, registeredElements[i], undefined);
            break;

          case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:

            this.emit(this.onAddService, registeredElements[i], undefined);
            break;

          case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:

            this.emit(this.onAddComponent, registeredElements[i], undefined);
            break;

          case ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE:

            switch (utils.getResourceType(registeredElements[i])) {
              case Resource.RESOURCE_TYPE.CERTIFICATE:
                this.emit(
                  this.onAddCertificate, registeredElements[i], undefined
                );
                break;
              case Resource.RESOURCE_TYPE.DOMAIN:
                this.emit(
                  this.onAddDomain, registeredElements[i], undefined
                );
                break;
              case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
                this.emit(
                  this.onAddPersistentVolume, registeredElements[i], undefined
                );
                break;
              case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:
                this.emit(
                  this.onAddVolatileVolume, registeredElements[i], undefined
                );
                break;
              default:
                throw new Error(
                  'Unknown resource type ' + registeredElements[i]
                );
            }
            break;

          default:

            throw new Error('Unkown element: ' + registeredElements[i]);
        }
      }
    });

  }

  /**
   * Obtains detailed info from a element.
   * @param urn 
   */
  getElementInfo(urn: string): Promise<any> {

    // Retrieves the information from the stamp
    return Promise.resolve().then(() => {

      let res: Promise<any>;
      if (this.requestedElements.indexOf(urn) < 0) {
        this.requestedElements.push(urn);
        res = this.admission.getStorageManifest(urn);
      } else {
        res = Promise.reject(new Error('Duplicated request'));
      }
      return res;

    }).then((element) => {
      let ecloudElement: ECloudElement;

      switch (utils.getElementType(element.spec)) {
        case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
          try {
            ecloudElement = this.transformManifestToRuntime(element);
            this.emit(
              this.onAddRuntime, urn, ecloudElement);
          } catch (err) {
            console.error(err);
            this.emit(
              this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized runtime params', 'Unrecognized runtime params',
                JSON.stringify(element, null, 4)
              )
            );
          }
          break;

        case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
          try {
            ecloudElement = this.transformManifestToService(element);
            this.emit(this.onAddService, urn, ecloudElement);


            let promiseArray: Promise<any>[] = [];
            for (let role in (<Service>ecloudElement).roles) {
              promiseArray.push(
                this.getElementInfo((<Service>ecloudElement).roles[role]
                  .component
                )
              );
            }
            return Promise.all(promiseArray);

          } catch (err) {
            console.error(err);
            this.emit(
              this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized service params', 'Unrecognized service params',
                JSON.stringify(element, null, 4)
              )
            );
          }
          break;

        case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
          try {
            ecloudElement = this.transformManifestToComponent(element);
            this.emit(
              this.onAddComponent, urn, ecloudElement
            );
            return this.getElementInfo((<Component>ecloudElement).runtime);
          } catch (err) {
            console.error(err);
            this.emit(
              this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized component params',
                'Unrecognized component params',
                JSON.stringify(element, null, 4)
              )
            );
          }
          break;

        case ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE:
          ecloudElement = this.transformManifestToResource(element);
          switch ((<Resource>ecloudElement)._resource_type) {
            case Resource.RESOURCE_TYPE.CERTIFICATE:
              this.emit(
                this.onAddCertificate, urn, (<Resource>ecloudElement)
              );
              break;
            case Resource.RESOURCE_TYPE.DOMAIN:
              this.emit(this.onAddDomain, urn, (<Domain>ecloudElement));
              break;
            case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
              this.emit(
                this.onAddPersistentVolume, urn, (<Resource>ecloudElement)
              );
              break;
            case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:
              this.emit(
                this.onAddVolatileVolume, urn, (<Resource>ecloudElement)
              );
              break;
            default:
              this.emit(
                this.onAddNotification,
                new Notification(Notification.LEVEL.WARNING,
                  'Unrecognized resource',
                  'Unrecognized resource',
                  JSON.stringify(element, null, 4)
                )
              );
          }
          break;
        default:
          return Promise.reject(
            new Error('Element \'' + element.spec + '\' not covered')
          );
      }
      return Promise.resolve();

    });

  }

  addNewBundle(file: File): Promise<any> {
    return this.sendBundle(file)
      .then((registrationResult) => {

        for (let successful in registrationResult.successful) {

          let urn: string = (<string>registrationResult.successful[successful])
            .substring(20);

          switch (utils.getElementType(urn)) {
            case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
            case ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE:
            case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
            case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
              this.getElementInfo(urn).catch((err: Error) => {
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
      for (let DeploymentURN in deploymentList) {
        let deployment: Deployment =
          this.transformEcloudDeploymentToDeployment(
            deploymentList[DeploymentURN] // Deployment
          );

        this.emit(this.onDeploy, DeploymentURN, deployment);

        promiseArray.push(this.getElementInfo(deployment.service)
          .catch((err) => {
            return err;
          }));
      }

      return Promise.all(promiseArray)
        .then((values) => { })
        .catch(err => console.debug('Catched', err))
        .then(() => { });
    });
    return pro;

  }

  getDeployment(urn: string): Promise<any> {

    return this.admission.findDeployments(urn).then((deploymentList) => {
      for (let DeploymentURN in deploymentList) {

        let deployment: Deployment =
          this.transformEcloudDeploymentToDeployment(
            deploymentList[DeploymentURN] // Deployment
          );

        this.emit(this.onDeploy, DeploymentURN, deployment);
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
  deploy(deployment: Deployment): Promise<DeploymentList> {

    return this.admission.deploy(new FileStream(new Blob([
      JSON.stringify(this.transformDeploymentToManifest(deployment))
    ])));

  }

  aplyChangesToDeployment(
    DeploymentURN: string, roleNumInstances: { [rolId: string]: number },
    killInstances: { [rolid: string]: { [instanceId: string]: boolean } }
  ): Promise<any> {

    let modification = new ScalingDeploymentModification();
    modification.deploymentURN = DeploymentURN;
    modification.scaling = roleNumInstances;

    return this.admission.modifyDeployment(modification).then(() => {
      this.admission.findDeployments(DeploymentURN).then((deploymentList) => {
        for (let DeploymentURN in deploymentList) {
          let deployment: Deployment =
            this.transformEcloudDeploymentToDeployment(
              deploymentList[DeploymentURN] // Deployment
            );

          this.emit(this.onDeploy, DeploymentURN, deployment);

        }
      });
    });
  }

  /* RESOURCES */
  addDomain(urn: string, webdomain: string): Promise<any> {
    let zip = new JSZip();
    zip.file(
      'Manifest.json',
      JSON.stringify(this.transformDomainToManifest(urn, webdomain))
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
      let urn = (<RegistrationResult>value).successful[0].split(' ')[2];
      let res: Resource = this.transformManifestToResource({
        'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0',
        'name': urn,
        'parameters': {
          'vhost': webdomain
        }
      });

      this.emit(this.onAddDomain, urn, res);

      this.emit(this.onAddNotification,
        new Notification(Notification.LEVEL.INFO,
          'Registered domain',
          'Correclty registered domain' + webdomain,
          JSON.stringify(value, null, 4)
        )
      );

    });
  }

  addPersistentVolume(urn: string, filesystem: Volume.FILESYSTEM, size: number):
    Promise<any> {

    let zip = new JSZip();
    zip.file(
      'Manifest.json',
      JSON.stringify(
        this.transformPersistentVolumeToManifest(urn, filesystem, size)
      )
      + '\n'
    );

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

      let urn = (<RegistrationResult>value).successful[0].split(' ')[2];
      let res: PersistentVolume = new PersistentVolume(
        urn, null, size, null, null, filesystem, null
      );

      this.emit(this.onAddPersistentVolume, urn, res);

      this.emit(this.onAddNotification,
        new Notification(Notification.LEVEL.INFO,
          'Registered persistent volume',
          'Correclty registered persistent volume' + urn,
          JSON.stringify(value, null, 4)
        )
      );

    });
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


  /**
   * Transforms the library class Ecloud Deployment to a local Deployment.
   * @param emitter <ProxyConnection> Emmiter to send notifications of events.
   * @param ecloudDeployment <EcloudDeployment> Deployment represented in the
   *  ecloud deployment class.
   */
  private transformEcloudDeploymentToDeployment(
    ecloudDeployment: EcloudDeployment
  ): Deployment {

    let resources: { [resource: string]: string } = {};
    let roles: { [rolId: string]: Deployment.Role } = {};

    // This must before be added to their respective resources
    let resourceInstances: Volume.Instance[] = [];

    // For each role
    for (let rolId in ecloudDeployment.roles) {
      let roleResources: {} = {};

      let instances: { [instanceId: string]: Deployment.Role.Instance } = {};

      for (let instanceId in ecloudDeployment.roles[rolId].instances) {
        let instanceResources: {} = {};

        if (
          ecloudDeployment.roles[rolId].instances[instanceId].configuration &&
          ecloudDeployment.roles[rolId].instances[instanceId].configuration
            .resources
        ) {
          for (
            let res in ecloudDeployment.roles[rolId].instances[instanceId]
              .configuration.resources
          ) {

            switch (utils.getResourceType(ecloudDeployment.roles[rolId]
              .instances[instanceId].configuration.resources[res].type)) {

              case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
                let volInst: PersistentVolume.Instance =
                  new PersistentVolume.Instance(
                    ecloudDeployment.roles[rolId].instances[instanceId]
                      .configuration.resources[res].parameters.id, // id
                    res, // volume name
                    // definition URN
                    ecloudDeployment.resources[res].resource.name,
                    rolId, // associated role
                    instanceId, // associated instance
                    null // usage
                  );

                instanceResources[res] = volInst;

                resourceInstances.push(volInst);

                break;

              case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:

                let volatileVolInst: VolatileVolume.Instance =
                  new VolatileVolume.Instance(
                    ecloudDeployment.roles[rolId].instances[instanceId]
                      .configuration.resources[res].parameters.id, // id
                    res, // volume name,
                    ecloudDeployment.roles[rolId].instances[instanceId]
                      .configuration.resources[res].name,
                    rolId, // associated role
                    instanceId, // associated instance
                    ecloudDeployment.roles[rolId].instances[instanceId]
                      .configuration.resources[res].parameters.filesystem
                  );

                instanceResources[res] = volatileVolInst;

                resourceInstances.push(volatileVolInst);

                break;

              default:

                console.warn('Not expected resource \'%s\' inside instance',
                  res,
                  ecloudDeployment.roles[rolId].instances[instanceId]
                    .configuration.resources[res]
                );

            }
          }
        }

        instances[instanceId] = new Deployment.Role.Instance(
          instanceId,
          ecloudDeployment.roles[rolId].instances[instanceId].connected ?
            Deployment.Role.Instance.STATE.CONNECTED :
            ecloudDeployment.roles[rolId].instances[instanceId]
              .connected === false ?
              Deployment.Role.Instance.STATE.DISCONNECTED :
              Deployment.Role.Instance.STATE.UNKOWN,
          ecloudDeployment.roles[rolId].instances[instanceId].arrangement.cpu,
          ecloudDeployment.roles[rolId].instances[instanceId].arrangement
            .memory,
          ecloudDeployment.roles[rolId].instances[instanceId].arrangement
            .bandwith,
          instanceResources,
          ecloudDeployment.roles[rolId].instances[instanceId].ports
        );

      }

      roles[rolId] = new Deployment.Role(
        rolId, // name
        ecloudDeployment.roles[rolId].component, // component
        {
          ...ecloudDeployment.roles[rolId].configuration,
          ...ecloudDeployment.roles[rolId].entrypoint
        }, // configuration
        ecloudDeployment.roles[rolId].arrangement.cpu, // cpu
        ecloudDeployment.roles[rolId].arrangement.memory, // memory
        ecloudDeployment.roles[rolId].arrangement.ioperf, // ioperf
        // iopsintensive
        ecloudDeployment.roles[rolId].arrangement.iopsintensive,
        ecloudDeployment.roles[rolId].arrangement.bandwidth, // bandwith
        ecloudDeployment.roles[rolId].arrangement.resilience, // resilience
        instances, // instances
        ecloudDeployment.roles[rolId].arrangement.mininstances, // mininstances
        ecloudDeployment.roles[rolId].arrangement.maxinstances // maxinstances
      );
    }

    for (let res in ecloudDeployment.resources) {

      switch (utils.getResourceType(ecloudDeployment.resources[res].type)) {
        case Resource.RESOURCE_TYPE.CERTIFICATE:
          // Ther's actually a bug in which deployments with no certificates
          // return a resource with null parameters
          if (ecloudDeployment.resources[res].resource.parameters) {
            resources[res] = ecloudDeployment.resources[res].resource.parameters
              .name;

            this.emit(
              this.onAddCertificate,
              ecloudDeployment.resources[res].resource.name,
              new Certificate(
                ecloudDeployment.resources[res].resource.parameters.name, // urn
                ecloudDeployment.resources[res].resource.parameters.content
                  .key, // key
                ecloudDeployment.resources[res].resource.parameters.content
                  .cert, // certificate
                ecloudDeployment.urn // usedBy
              )
            );
          }
          break;

        case Resource.RESOURCE_TYPE.DOMAIN:
          resources[res] = ecloudDeployment.resources[res].resource.name;
          this.emit(
            this.onAddDomain,
            ecloudDeployment.resources[res].resource.name,
            new Domain(
              ecloudDeployment.resources[res].resource.name, // urn
              // domain
              ecloudDeployment.resources[res].resource.parameters.vhost,
              Domain.STATE.SUCCESS, // state
              ecloudDeployment.urn // usedBy
            )
          );
          break;

        case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
          resources[res] = ecloudDeployment.resources[res].resource.name;

          let persistentItems: {
            [persitentVolInstance: string]: PersistentVolume.Instance
          } = {};
          for (let resInstIndex in resourceInstances) {
            if (resourceInstances[resInstIndex].volumeName === res) {
              persistentItems[resourceInstances[resInstIndex].id] =
                resourceInstances[resInstIndex];
            }
          }

          this.emit(
            this.onAddPersistentVolume,
            ecloudDeployment.resources[res].resource.name,
            new PersistentVolume(
              ecloudDeployment.resources[res].resource.name, // urn
              res, // name
              ecloudDeployment.resources[res].resource.parameters.size, // size
              persistentItems, // items
              null, // associated role
              ecloudDeployment.resources[res].resource.parameters.filesystem
              || Volume.FILESYSTEM.XFS, // filesystem
              ecloudDeployment.urn // usedBy
            )
          );
          break;

        case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:
          let volatileItems: {
            [volatileVolInstance: string]: VolatileVolume.Instance
          } = {};

          /* There is a problem in which the identifier of the volume must be
          taken from the instances and not from the volume in the deployment
          definition */
          let volumeURN: string;


          for (let resInstIndex in resourceInstances) {
            if (resourceInstances[resInstIndex].volumeName === res) {
              volatileItems[resourceInstances[resInstIndex].id] =
                resourceInstances[resInstIndex];

              volumeURN =
                volatileItems[resourceInstances[resInstIndex].id]._urn;
            }
          }

          resources[res] = volumeURN;

          // Due to the identifier, volatile volumes can't be added when getting
          // the info of a deployment and must be added in a different call
          this.emit(
            this.onAddVolatileVolume,
            volumeURN,
            new VolatileVolume(
              res, // name
              volumeURN, // id
              ecloudDeployment.resources[res].resource.parameters.size, // size
              volatileItems, // items
              // filesystem
              ecloudDeployment.resources[res].resource.parameters.filesystem,
              null, // associated role
              ecloudDeployment.urn // usedBy
            )
          );
          break;

        default:
          throw new Error('Resource not following structure \'' + res + '\' ' +
            ecloudDeployment.resources[res]
          );
      }
    }

    let parameters: any = {};

    let channels: {
      [originChannel: string]: {
        destinyChannelId: string,
        destinyDeploymentId: string
      }[]
    } = {};

    for (let originChannel in ecloudDeployment.links) {
      for (let destinyDeploymentId in ecloudDeployment.links[originChannel]) {
        for (
          let destinyChannel in
          ecloudDeployment.links[originChannel][destinyDeploymentId]
        ) {
          if (!channels[originChannel]) {
            channels[originChannel] = [];
          }
          channels[originChannel].push({
            'destinyChannelId': destinyChannel,
            'destinyDeploymentId': destinyDeploymentId
          });
        }
      }
    }

    let res: Deployment = null;


    if (utils.isServiceEntrypoint(ecloudDeployment.service)) {
      res = new HTTPEntryPoint(
        ecloudDeployment.urn, // urn
        parameters, // parameters: any
        roles, // roles: { [rolName: string]: DeploymentRol }
        resources, // resources: { [resource: string]: Resource }
        channels // channels
      );
    } else {
      res = new Deployment(
        ecloudDeployment.urn, // urn
        (<any>ecloudDeployment).name, // name: string
        parameters, // parameters: any
        ecloudDeployment.service, // serviceId: string
        roles, // roles: { [rolName: string]: DeploymentRol }
        resources, // resources: { [resource: string]: Resource }
        channels // channels
      );
    }

    return res;
  }



  private transformManifestToService(manifest: {
    spec: string,
    name: string,
    configuration: {
      resources: Array<{ name: string, type: string }>,
      parameters: Array<{ name: string, type: string }>
    },
    roles: [{
      name: string,
      component: string,
      resources: {},
      parameters: {}
    }],
    channels: {
      requires: Array<any>,
      provides: [{
        name: string,
        type: string,
        protocol: string
      }]
    },
    connectors: [{
      type: string,
      depended: [{
        role: string,
        endpoint: string,
      }],
      provided: [{
        role: string,
        endpoint: string
      }]
    }]
  }): Service {

    // Collecting service resources
    let resources: { [resourceId: string]: string } = {};
    for (let i = 0; i < manifest.configuration.resources.length; i++) {
      resources[manifest.configuration.resources[i].name] =
        manifest.configuration.resources[i].type;
    }

    // Collecting service parameters
    let parameters: { [parameter: string]: Parameter } = {};
    for (let paramIndex in manifest.configuration.parameters) {
      let par: Parameter;
      switch (manifest.configuration.parameters[paramIndex].type) {
        case 'eslap://eslap.cloud/parameter/boolean/1_0_0':
          par = new BooleanParameter();
          break;
        case 'eslap://eslap.cloud/parameter/integer/1_0_0':
          par = new IntegerParameter();
          break;
        case 'eslap://eslap.cloud/parameter/json/1_0_0':
          par = new JsonParameter();
          break;
        case 'eslap://eslap.cloud/parameter/list/1_0_0':
          par = new ListParameter();
          break;
        case 'eslap://eslap.cloud/parameter/number/1_0_0':
          par = new NumberParameter();
          break;
        case 'eslap://eslap.cloud/parameter/string/1_0_0':
          par = new StringParameter();
          break;
        default:
          console.error('Parameter type not recognized: ',
            manifest.configuration.parameters[paramIndex].type);
      }
      parameters[manifest.configuration.parameters[paramIndex].name] = par;
    }

    // Collecting service roles
    let roles: { [rolId: string]: Service.Role } = {};
    for (let i = 0; i < manifest.roles.length; i++) {
      roles[manifest.roles[i].name] = new Service.Role(
        manifest.roles[i].component, // component
        manifest.roles[i].parameters, // parameters
        manifest.roles[i].resources // resources
      );
    }

    // Collecting service provided channels
    let proChannels: { [channelId: string]: ProvidedChannel } = {};
    for (let i = 0; i < manifest.channels.provides.length; i++) {
      let res: ProvidedChannel;
      switch (manifest.channels.provides[i].type) {
        case 'eslap://eslap.cloud/channel/request/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.REQUEST, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.REPLY, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/send/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.SEND, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/receive/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.RECEIVE, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/duplex/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.DUPLEX, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case ' eslap://eslap.cloud/endpoint/request/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        case ' eslap://eslap.cloud/endpoint/reply/1_0_0':
          res = new ProvidedChannel(
            manifest.channels.provides[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
            manifest.channels.provides[i].protocol // protocol
          );
          break;
        default:
          console.error('Not expected channel type: %s',
            manifest.channels.provides[i].type);
      };
      proChannels[manifest.channels.provides[i].name] = res;
    }

    // Collectinc service depended channels
    let depChannels: { [channelId: string]: DependedChannel } = {};
    for (let i = 0; i < manifest.channels.requires.length; i++) {
      let res: DependedChannel;

      switch (manifest.channels.requires[i].type) {
        case 'eslap://eslap.cloud/channel/request/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.REQUEST, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/reply/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.REPLY, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/send/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.SEND, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/receive/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.RECEIVE, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/channel/duplex/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.DUPLEX, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/request/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
          res = new DependedChannel(
            manifest.channels.requires[i].name, // name
            Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
            manifest.channels.requires[i].protocol // protocol
          );
          break;
        default:
          console.error('Not expected channel type: %s',
            manifest.channels.requires[i].type);
      };
      depChannels[manifest.channels.requires[i].name] = res;
    }

    // Collecting service connectors
    let connectors: Array<Connector> = [];
    for (let conn in manifest.connectors) {
      let res: Connector;
      switch (manifest.connectors[conn].type) {
        case 'eslap://eslap.cloud/connector/loadbalancer/1_0_0':
          res = new LoadBalancerConnector(
            manifest.connectors[conn].provided, // provided
            manifest.connectors[conn].depended // depended
          );
          break;
        case 'eslap://eslap.cloud/connector/pubsub/1_0_0':
          res = new PublishSubscribeConnector(
            manifest.connectors[conn].provided, // provided
            manifest.connectors[conn].depended // depended
          );
          break;
        case 'eslap://eslap.cloud/connector/complete/1_0_0':
          res = new PublishSubscribeConnector(
            manifest.connectors[conn].provided, // provided
            manifest.connectors[conn].depended // depended
          );
          break;
        default:
          console.error('Not expected connector type: %s',
            manifest.connectors[conn].type);
      }
      connectors.push(res);
    }

    // Creating the service
    return new Service(
      manifest.name, // urn:string
      resources, // resources: Array<string>
      parameters, // {[parameter:string]: Parameter}
      roles, // roles: { [roleId: string]: Service.Role }
      proChannels, // proChannels: { [channelId: string]: Service.Role.Channel }
      depChannels, // reqChannels: { [channelId: string]: Service.Role.Channel }
      connectors
    );
  }

  private transformManifestToComponent(manifest: {
    code: string,
    profile: object,
    configuration: {
      parameters: [{
        type: string,
        name: string
      }],
      resources: [{
        name: string,
        type: string
      }]
    },
    channels: {
      requires: [{
        protocol: string,
        type: string,
        name: string
      }],
      provides: [{
        protocol: string,
        type: string,
        name: string
      }]
    },
    runtime: string,
    name: string,
    spec: string,
    codelocator: string
  }): Component {

    let resources: { [resourceName: string]: string } = {};
    if (manifest.configuration.resources)
      for (let i = 0; i < manifest.configuration.resources.length; i++) {
        resources[manifest.configuration.resources[i].name] =
          manifest.configuration.resources[i].type;
      }

    let proChannels: { [channelId: string]: Channel } = {};
    if (manifest.channels && manifest.channels.provides)
      for (let i = 0; i < manifest.channels.provides.length; i++) {
        let res: Channel;
        switch (manifest.channels.provides[i].type) {
          case 'eslap://eslap.cloud/channel/request/1_0_0':
            res = new ProvidedChannel(
              manifest.channels.provides[i].name, // name
              Channel.CHANNEL_TYPE.REQUEST, // type
              manifest.channels.provides[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/reply/1_0_0':
            res = new ProvidedChannel(
              manifest.channels.provides[i].name, // name
              Channel.CHANNEL_TYPE.REPLY, // type
              manifest.channels.provides[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/send/1_0_0':
            res = new ProvidedChannel(
              manifest.channels.provides[i].name, // name
              Channel.CHANNEL_TYPE.SEND, // type
              manifest.channels.provides[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/receive/1_0_0':
            res = new ProvidedChannel(
              manifest.channels.provides[i].name, // name
              Channel.CHANNEL_TYPE.RECEIVE, // type
              manifest.channels.provides[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/duplex/1_0_0':
            res = new ProvidedChannel(
              manifest.channels.provides[i].name, // name
              Channel.CHANNEL_TYPE.DUPLEX, // type
              manifest.channels.provides[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/endpoint/request/1_0_0':
            res = new ProvidedChannel(
              manifest.channels.provides[i].name, // name
              Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
              manifest.channels.provides[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
            res = new ProvidedChannel(
              manifest.channels.provides[i].name, // name
              Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
              manifest.channels.provides[i].protocol // protocol
            );
            break;
          default:
            console.error('Not expected channel type: %s',
              manifest.channels.provides[i].type);
        };

        proChannels[manifest.channels.provides[i].name] = res;
      }

    let depChannels: { [channelId: string]: Channel } = {};
    if (manifest.channels && manifest.channels.requires)
      for (let i = 0; i < manifest.channels.requires.length; i++) {
        let res: DependedChannel;

        switch (manifest.channels.requires[i].type) {
          case 'eslap://eslap.cloud/channel/request/1_0_0':
            res = new DependedChannel(
              manifest.channels.requires[i].name, // name
              Channel.CHANNEL_TYPE.REQUEST, // type
              manifest.channels.requires[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/reply/1_0_0':
            res = new DependedChannel(
              manifest.channels.requires[i].name, // name
              Channel.CHANNEL_TYPE.REPLY, // type
              manifest.channels.requires[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/send/1_0_0':
            res = new DependedChannel(
              manifest.channels.requires[i].name, // name
              Channel.CHANNEL_TYPE.SEND, // type
              manifest.channels.requires[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/receive/1_0_0':
            res = new DependedChannel(
              manifest.channels.requires[i].name, // name
              Channel.CHANNEL_TYPE.RECEIVE, // type
              manifest.channels.requires[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/channel/duplex/1_0_0':
            res = new DependedChannel(
              manifest.channels.requires[i].name, // name
              Channel.CHANNEL_TYPE.DUPLEX, // type
              manifest.channels.requires[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/endpoint/request/1_0_0':
            res = new DependedChannel(
              manifest.channels.requires[i].name, // name
              Channel.CHANNEL_TYPE.ENDPOINT_REQUEST, // type
              manifest.channels.requires[i].protocol // protocol
            );
            break;
          case 'eslap://eslap.cloud/endpoint/reply/1_0_0':
            res = new DependedChannel(
              manifest.channels.requires[i].name, // name
              Channel.CHANNEL_TYPE.ENDPOINT_REPLY, // type
              manifest.channels.requires[i].protocol // protocol
            );
            break;
          default:
            console.error('Not expected channel type: %s',
              manifest.channels.requires[i].type);
        };
        depChannels[manifest.channels.requires[i].name] = res;
      }

    return new Component(
      manifest.name, // urn: string
      manifest.runtime, // runtime: string
      resources, // resourcesConfig: { [resourceName: string]: string }
      manifest.configuration.parameters, // parameters: object
      proChannels, // proChannels: { [channelId: string]: Service.Role.Channel }
      depChannels // depChannels: { [channelId: string]: Service.Role.Channel }
    );
  }

  private transformManifestToResource(manifest: {
    spec: string, name: string, parameters: any
  }): Resource {
    let res: Resource = null;
    switch (utils.getResourceType(manifest.spec)) {
      case Resource.RESOURCE_TYPE.DOMAIN:

        res = new Domain(
          manifest.name, // urn
          manifest.parameters.vhost, // url
          Domain.STATE.SUCCESS, // state
          null // usedBy
        );

        break;
      case Resource.RESOURCE_TYPE.CERTIFICATE:

        res = new Certificate(
          manifest.name, // urn
          manifest.parameters.content.key, // key
          manifest.parameters.content.cert, // certificate
          null // usedBy
        );

        break;
      case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:

        res = new PersistentVolume(
          manifest.name, // volume urn
          null, // name
          manifest.parameters.size, // size
          null, // items
          null, // associated role
          manifest.parameters.fileSystem, // filesystem
          null // usedBy
        );

        break;
      default:
        console.error(
          'Not expected resource type when translating a manifest',
          manifest.spec
        );
    }
    return res;
  }

  private transformManifestToRuntime(manifest: {
    spec: string,
    name: string,
    derived: {
      from: string
    },
    sourcedir: string,
    entrypoint: string,
    metadata: {
      description: string,
      os_name: string,
      os_version: string,
      os_release: string,
      software: {
        [key: string]: any
      }
    }
  }): Runtime {
    return new Runtime(manifest.name);
  }

  private transformEcloudEventDataToServiceMetrics(
    ecloudEvent: EcloudEvent
  ): {
      [deploymentId: string]: {
        'data': {
          [property: string]: number | string
        },
        'roles': {
          [rolId: string]: {
            'data': {
              [property: string]: number | string
            },
            'instances': {
              [instanceId: string]: {
                [property: string]: number | string | object
              }

            }
          }
        }
      }
    } {

    let res: {
      [deploymentId: string]: {
        'data': {
          [property: string]: number | string
        },
        'roles': {
          [rolId: string]: {
            'data': {
              [property: string]: number | string
            },
            'instances': {
              [instanceId: string]: {
                [property: string]: number | string | object
              }

            }
          }
        }
      }
    } = {};

    // Deployment initialization
    res[ecloudEvent.data.deploymentUrn] = { 'data': {}, 'roles': {} };

    // Obtaining deployment data
    for (let property in ecloudEvent.data.data) {
      res[ecloudEvent.data.deploymentUrn].data[property] =
        ecloudEvent.data.data[property].mean;
    }
    res[ecloudEvent.data.deploymentUrn].data['timestamp']
      = ecloudEvent.timestamp;

    // Role initialization
    for (let rolId in ecloudEvent.data.roles) {
      res[ecloudEvent.data.deploymentUrn].roles[rolId] = {
        'data': {}, 'instances': {}
      };

      // Obtaining role data
      for (let property in ecloudEvent.data.roles[rolId].data) {
        res[ecloudEvent.data.deploymentUrn].roles[rolId].data[property] =
          ecloudEvent.data.roles[rolId].data[property].mean;
      }
      res[ecloudEvent.data.deploymentUrn].roles[rolId].data['timestamp'] =
        ecloudEvent.timestamp;

      // Obtaining instance data
      for (let instanceId in ecloudEvent.data.roles[rolId].instances) {
        res[ecloudEvent.data.deploymentUrn].roles[rolId]
          .instances[instanceId] = {};
        for (let property in ecloudEvent.data.roles[rolId]
          .instances[instanceId]) {

          if (property === 'volumes') { // This instance has got a volume

            if (
              !res[ecloudEvent.data.deploymentUrn].roles[rolId]
                .instances[instanceId]['volumes']
            ) {

              res[ecloudEvent.data.deploymentUrn].roles[rolId]
                .instances[instanceId]['volumes'] = {};

            }

            for (let volumeId in ecloudEvent.data.roles[rolId]
              .instances[instanceId]['volumes']) {

              if (
                !res[ecloudEvent.data.deploymentUrn].roles[rolId]
                  .instances[instanceId]['volumes'][volumeId]
              ) {

                res[ecloudEvent.data.deploymentUrn].roles[rolId]
                  .instances[instanceId]['volumes'][volumeId] = {};

              }

              for (
                let prop in ecloudEvent.data.roles[rolId]
                  .instances[instanceId]['volumes'][volumeId]
              ) {

                res[ecloudEvent.data.deploymentUrn].roles[rolId]
                  .instances[instanceId]['volumes'][volumeId][prop] =
                  ecloudEvent.data.roles[rolId]
                    .instances[instanceId]['volumes'][volumeId][prop].mean;

              }
            }

          }

          res[ecloudEvent.data.deploymentUrn].roles[rolId]
            .instances[instanceId][property]
            = ecloudEvent.data.roles[rolId]
              .instances[instanceId][property].mean;
        }
        res[ecloudEvent.data.deploymentUrn].roles[rolId]
          .instances[instanceId]['timestamp'] = ecloudEvent.timestamp;
      }
    }

    return res;
  }

  private transformEcloudEventDataToVolumeMetrics(
    ecloudEvent: EcloudEvent
  ): {
      [itemId: string]: {
        [property: string]: string | number
      }
    } {

    let res: {
      [itemId: string]: {
        'timestamp': string,
        'free': number,
        'total': number,
        'usage': number,
        'used': number
      }
    } = {};

    res[ecloudEvent.data.item] = {
      'timestamp': null,
      'free': -1,
      'total': -1,
      'usage': -1,
      'used': -1
    };

    for (let property in ecloudEvent.data.data) {
      res[ecloudEvent.data.item][property]
        = ecloudEvent.data.data[property].mean;
    }
    res[ecloudEvent.data.item]['timestamp'] = ecloudEvent.timestamp;

    return res;
  }

  private transformDeploymentToManifest(deployment: Deployment): Object {

    let manifestRoles = {};

    for (let rolId in deployment.roles) {
      manifestRoles[rolId] = {};
      manifestRoles[rolId].resources = {};
      manifestRoles[rolId].resources['__mininstances'] =
        (<Deployment.Role>deployment.roles[rolId]).minInstances;
      manifestRoles[rolId].resources['__maxinstances'] =
        (<Deployment.Role>deployment.roles[rolId]).maxInstances;
      manifestRoles[rolId].resources['__instances'] =
        (<Deployment.Role>deployment.roles[rolId]).actualInstances;
      manifestRoles[rolId].resources['__cpu'] =
        (<Deployment.Role>deployment.roles[rolId]).cpu;
      manifestRoles[rolId].resources['__memory'] =
        (<Deployment.Role>deployment.roles[rolId]).memory;
      manifestRoles[rolId].resources['__ioperf'] =
        (<Deployment.Role>deployment.roles[rolId]).ioperf;
      manifestRoles[rolId].resources['__iopsintensive'] =
        (<Deployment.Role>deployment.roles[rolId]).iopsintensive;
      manifestRoles[rolId].resources['__bandwidth'] =
        (<Deployment.Role>deployment.roles[rolId]).bandwidth;
      manifestRoles[rolId].resources['__resilience'] =
        (<Deployment.Role>deployment.roles[rolId]).resilience;
    }

    return {
      'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
      'servicename': deployment.service,
      'nickname': deployment.name,
      'interconnection': true,
      'configuration': {
        'resources': deployment.resources,
        'parameters': deployment.parameters
      },
      'roles': manifestRoles
    };
  }

  private transformDomainToManifest(urn: string, domain: string): Object {

    return {
      spec: 'eslap://eslap.cloud/resource/vhost/1_0_0',
      name: urn,
      parameters: {
        vhost: domain
      }
    };

  }

  private transformPersistentVolumeToManifest(
    urn: string, filesystem: Volume.FILESYSTEM, size: number
  ): Object {

    return {
      spec: 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
      name: urn,
      parameters: {
        filesystem,
        size
      }
    };

  }

};