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

import { User } from '../store/pagestate/classes';
import {
  Certificate, Component, Deployment, Domain, ECloudElement, HTTPEntryPoint,
  Resource, Runtime, Service, Volume
} from '../store/stampstate/classes';

import { Notification } from '../store/pagestate/classes';

import {
  PersistentVolume, VolatileVolume
} from '../store/stampstate/classes/resource';
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
    this.onDeploy =
      this.registerEvent<(DeploymentURN: string,
        deployment: Deployment) => void>();
    this.onAddInstance =
      this.registerEvent<(DeploymentURN: string, rolId: string,
        instanceId: string, instance: Deployment.Role.Instance) => void>();
    this.onAddServiceMetrics = this.registerEvent<(value) => any>();
    this.onAddVolumeMetrics = this.registerEvent<(value) => any>();
    this.onAddCertificate =
      this.registerEvent<(resourceId: string, resource: Certificate) => void>();
    this.onAddDomain =
      this.registerEvent<(resourceId: string, resource: Domain) => void>();
    this.onAddPersistentVolume =
      this.registerEvent
        <(resourceId: string, resource: PersistentVolume) => void>();
    this.onAddVolatileVolume =
      this.registerEvent
        <(resourceId: string, resource: VolatileVolume) => void>();
    this.onAddRuntime =
      this.registerEvent<(resourceId: string, resource: Resource) => void>();
    this.registerEvent<(runtimeId: string, runtime: Runtime) => void>();
    this.onAddService =
      this.registerEvent<(serviceId: string, service: Service) => void>();
    this.onSignIn =
      this.registerEvent<(username: string,
        userpassword: string) => EcloudAcsUser>();
    this.onUndeploy =
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

          /* console.warn('Event under development: %s / %s event received:',
            event.strType, event.strName, event); */

          // const timeStart = performance.now();

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
                    null, // volumes
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
                    utils.transformEcloudEventDataToServiceMetrics(event)
                  );
                  break;
                case EcloudEventName.volume:
                  this.emit(
                    this.onAddVolumeMetrics,
                    utils.transformEcloudEventDataToVolumeMetrics(event)
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
              registeredResources[registeredResIndex],
              undefined // TODO this case still needs some study
            );
            break;

          case Resource.RESOURCE_TYPE.DOMAIN:
            this.emit(
              this.onAddDomain,
              registeredResources[registeredResIndex],
              undefined // TODO this case still needs some study
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

      let res: Promise<any> = Promise.resolve();

      switch (utils.getElementType(urn)) {
        case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
          let runtime: Runtime;
          try {
            runtime = utils.transformManifestToRuntime(element);
            this.emit(this.onAddRuntime, urn, runtime);
          } catch (error) {
            this.emit(this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized runtime params', 'Unrecognized runtime params',
                JSON.stringify(element, null, 4)
              )
            );
          }

          break;

        case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
          let ser: Service;
          try {
            ser = utils.transformManifestToService(element);
            this.emit(this.onAddService, urn, ser);
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

        case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
          let comp: Component;
          try {
            comp = utils.transformManifestToComponent(element);
            this.emit(this.onAddComponent, urn, comp);

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

        case ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE:
          let resource: Resource;
          try {
            resource = utils.transformManifestToResource(element);
            switch (utils.getResourceType(resource._resource_type)) {
              case Resource.RESOURCE_TYPE.CERTIFICATE:
                this.emit(this.onAddCertificate, urn, resource);
                break;
              case Resource.RESOURCE_TYPE.DOMAIN:
                this.emit(this.onAddDomain, urn, resource);
                break;
              case Resource.RESOURCE_TYPE.PERSISTENT_VOLUME:
                this.emit(this.onAddPersistentVolume, urn, resource);
                break;
              case Resource.RESOURCE_TYPE.VOLATILE_VOLUME:
                this.emit(this.onAddVolatileVolume, urn, resource);
                break;
              default:
                throw new Error('Unrecognized resource' + resource);
            }

          } catch (error) {
            this.emit(this.onAddNotification,
              new Notification(Notification.LEVEL.WARNING,
                'Unrecognized resource',
                'Unrecognized resource',
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
          utils.transformEcloudDeploymentToDeployment(
            this, // Requires an event emitter
            deploymentList[DeploymentURN]
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
          utils.transformEcloudDeploymentToDeployment(
            this, // Requiers an EventEmitter
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
      JSON.stringify(utils.transformDeploymentToManifest(deployment))
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
            utils.transformEcloudDeploymentToDeployment(
              this, // Requires an EventEmitter
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
      JSON.stringify(utils.transformDomainToManifest(urn, webdomain))
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
      let res: Resource = utils.transformManifestToResource({
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

  addVolume(urn: string, filesystem: Volume.FILESYSTEM, size: number):
    Promise<any> {

    let manifest = utils.transformVolumeToManifest(urn, filesystem, size);

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