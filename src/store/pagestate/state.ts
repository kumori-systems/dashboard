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
    this.notifications = [
      new Notification('Notification Title', 'Notification Text')
    ];
    this.backgroundActions = [];
    this.pendingActions = 0;
  }
}