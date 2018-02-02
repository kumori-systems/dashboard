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
   * @return < User > user
   */
  user = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): User => {
    return state.user;
  }

  /**
   * Gets the list of background actions in the state.
   * @return < { [type: number]: BackgroundAction[] } > background actions.
   */
  pendingBackgroundActions = (
    state?: State, getters?: Getters, rootState?: any, rootGetters?: any
  ): { [type: number]: BackgroundAction[] } => {
    return state.pendingBackgroundActions;
  }


  finishedBackgroundActions = (state?: State, getters?: Getters,
    rootState?: any, rootGetters?: any): BackgroundAction[] => {
    return state.finishedBackgroundActions;
  }

  /**
   * Gets the notifications stored in the state.
   * @return < Notification [] > notifications.
   */
  notifications = (state?: State, getters?: Getters, rootState?: any,
    rootGetters?: any): Notification[] => {
    return state.notifications;
  }

};