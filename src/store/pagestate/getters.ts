import Vuex from 'vuex';
import State from './state';

import {
  BackgroundAction, NavigationItem, Notification, User
} from './classes';

/**
 * Getters to handle this page's state easier.
 */
export default class Getters implements Vuex.GetterTree<State, any> {
  [name: string]: Vuex.Getter<State, any>;

  /**
   * Gets the user saved in the state.
   * @return <User>user
   */
  user = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): User => {
    return state.user;
  }

  /**
   * Gets if there are pending background actions.
   * @return <boolean>loading
   */
  loading = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): Boolean => {
    return state.pendingActions > 0;
  }

  /**
   * Gets the last action in background. This can be used to read the state of
   * the action or the details.
   * @return <BackgroundAction>lastAction
   */
  lastAction = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): BackgroundAction => {
    let res: BackgroundAction = null;
    let size: number = state.backgroundActions.length;
    if (size > 0)
      res = state.backgroundActions[size - 1];
    return res;
  }

  /**
   * Gets the notifications stored in the state.
   * @return <Notification[]>notifications
   */
  notifications = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): Notification[] => {
    return state.notifications;
  }
  
};