/**
 * Initial values for the navigation component. This values will be stored in
 * the state.
 */
export class Navigation {
  /** <boolean> Marks if the navigation component must be shown */
  show: boolean = true;
  /**
   * Initial values for the navigation component. This values will be stored in
   * the state.
   * @param show <boolean> Marks if the navigation component must be shown.
   * Default true.
   */
  constructor(show?: boolean, mini?: boolean) {
    if (show) this.show = show;
  }
}