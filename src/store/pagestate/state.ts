import { BackgroundAction, Navigation, Notification, User } from './classes';

/**
 * This page's state.
 */
export default class State {
  user: User;
  notifications: Notification[];
  backgroundActions: BackgroundAction[];
  pendingActions: number;
  navigation: Navigation;
  constructor() {
    this.user = new User();
    this.navigation = new Navigation();
    this.notifications = [
      new Notification('Notification Title', 'Notification Text')
    ];
    this.backgroundActions = [];
    this.pendingActions = 0;
  }
}