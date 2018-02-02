/**
 * Clausure of the function which gives the identifier of the background action
 */
let getBrackgroundActionId = (() => {
  let counter: number = 0;
  return () => {
    return 'ba_' + counter++;
  };
})();
/**
 * Action executed in the background and eventually solved. Be carefull when
 * creating or editing this object, thus a wrong value can produce unexpected
 * malfunctions.
 */
export class BackgroundAction {

  /** <string> Unique id representing the action. */
  readonly id: string;

  /** <BackgroundAction.TYPE> Defines the kind of background action. */
  readonly type: BackgroundAction.TYPE;

  /**
   * <BackgroundAction.State> Marks if the action is waiting, on process or has
   * finished. Can't be null
   */
  state: BackgroundAction.STATE = BackgroundAction.STATE.ON_PROCESS;

  /**
   * <string> Detailed information of the BackgroundAction.
   */
  details: string = null;

  /**
   * Action executed in the background and enventually solved. The default state
   * is waiting, and should be changed when processing the action, and again
   * when the action is finished.
   * @param name <string> Readable action name. Cant be undefined or null and
   * length must be higher than 0.
   */
  constructor(type: BackgroundAction.TYPE, details?: string) {

    // Assign the background type
    if (!type) {
      throw new Error('A type is required to create a BackgroundAction');
    }
    this.type = type;

    // Assign the id
    this.id = getBrackgroundActionId();

    if (details) this.details = details;

  }
}
export module BackgroundAction {
  /** Marks if the action is on process or has finished. */
  export enum STATE { ON_PROCESS, FAIL, SUCCESS };

  /** Marks the background action type. */
  export enum TYPE {
    LOGIN = 'login',
    DEPLOY_SERVICE = 'deploy service',
    UNDEPLOY_SERVICE = 'undeploy service',
    SCALE_SERVICE = 'scale service',
    REGISTER_BUNDLE = 'register bundle',
    REGISTER_DOMAIN = 'register domain',
    UNREGISTER_DOMAIN = 'unregister domain',
    UNREGISTER_RUNTIME = 'unregister runtime',
    UNREGISTER_COMPONENT = 'unregister component',
    UNREGISTER_SERVICE = 'unregister service',
    LINK_SERVICES = 'link services',
    UNLINK_SERVICES = 'unlink services',
    LOADING_DATA = 'loading data'
  }
}