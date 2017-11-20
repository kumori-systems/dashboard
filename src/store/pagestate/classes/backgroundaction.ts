// Used as identifier for BackgroundActions
let backgroundActionCounter: number = 0;
/**
 * Action executed in the background and eventually solved. Be carefull when
 * creating or editing this object, thus a wrong value can produce unexpected
 * malfunctions.
 */
export class BackgroundAction {
  /** <string> Unique id representing the action. */
  readonly id: string;
  /** <string> Readable short name. */
  readonly name: string;
  /**
   * <BackgroundAction.State> Marks if the action is waiting, on process or has
   * finished. Can't be null
   */
  state: BackgroundAction.State = BackgroundAction.State.WAITING;
  /**
   * <string> Description message. Used to explain what is the action doing or
   * the result of the action.
   */
  details: string = null;

  /**
   * Action executed in the background and enventually solved. The default state
   * is waiting, and should be changed when processing the action, and again
   * when the action is finished.
   * @param name <string> Readable action name. Cant be undefined or null and
   * length must be higher than 0.
   * @param details <string> Description message. Used to explain what is the
   * action doing or the result of the action.
   */
  constructor(name: string, details?: string) {
    if (!name || name.length === 0)
      throw new Error('Invalid name for BackgroundAction: ' + name);
    this.name = name;
    if (details) this.details = details;
    this.id = 'ba_' + ++backgroundActionCounter;
  }
}
export module BackgroundAction {
  /** Marks if the action is blocked, on process or has finished */
  export enum State {
    FAIL = 'fail', ON_PROCESS = 'on_process', SUCCESS = 'success',
    WAITING = 'waiting'
  };
}