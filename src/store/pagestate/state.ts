import { BackgroundAction, Notification, User } from './classes';

/**
 * This page's state.
 */
export default class State {
  user: User;
  notifications: Notification[];
  backgroundActions: BackgroundAction[];
  pendingActions: number;
  constructor() {
    this.user = new User();
    this.notifications = [];
    this.backgroundActions = [];
    this.pendingActions = 0;
  }
}