import { BackgroundAction, Notification, User } from './classes';

/**
 * This page's state.
 */
export default class State {
  user: User;
  notifications: Notification[];
  pendingBackgroundActions: { [type: string]: BackgroundAction[] };
  finishedBackgroundActions: BackgroundAction[];
  constructor() {
    this.user = null;
    this.notifications = [];
    this.pendingBackgroundActions = {
      [BackgroundAction.TYPE.LOGIN]: [],
      [BackgroundAction.TYPE.REGISTER_DOMAIN]: [],
      [BackgroundAction.TYPE.DEPLOY_SERVICE]: [],
      [BackgroundAction.TYPE.UNDEPLOY_SERVICE]: [],
      [BackgroundAction.TYPE.SCALE_SERVICE]: [],
      [BackgroundAction.TYPE.LINK_SERVICES]: [],
      [BackgroundAction.TYPE.UNLINK_SERVICES]: [],
      [BackgroundAction.TYPE.REGISTER_BUNDLE]: [],
      [BackgroundAction.TYPE.UNREGISTER_COMPONENT]: [],
      [BackgroundAction.TYPE.UNREGISTER_RUNTIME]: [],
      [BackgroundAction.TYPE.UNREGISTER_SERVICE]: [],
      [BackgroundAction.TYPE.LOADING_DATA]: [],
    };
    this.finishedBackgroundActions = [];
  }
}