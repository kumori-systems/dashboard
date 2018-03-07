import Vue from 'vue';
import Vuex from 'vuex';

import { BackgroundAction, Notification, User } from './classes';
import State from './state';

import SSState from '../stampstate/state';

/**
 * Mutations to handle this page's state easier.
 */
export default class Mutations implements Vuex.MutationTree<State> {
  [name: string]: Vuex.Mutation<State>;

  /**
   * User signs into the service.
   * @requires payload <User> user signing into the system.
   */
  signIn = (state: State, u: User): void => {
    state.user = u;
  }

  /**
   * Updates the user token
   */
  refreshToken = (state: State, token: User.Token): void => {
    state.user.token = token;
  }

  /**
   * Clear the local state.
   */
  clearState = (state: State): void => {
    state.user = null;
    state.notifications = [];
    state.pendingBackgroundActions = {
      [BackgroundAction.TYPE.SIGNIN]: [],
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
    state.finishedBackgroundActions = [];
  }

  /**
   * Adds a background action to the state.
   * @param payload <BackgroundAction>
   * @description The action will start as pending and will be eventually
   * solved.
   */
  addBackgroundAction = (state: State, bA: BackgroundAction): void => {
    let newArray = state.pendingBackgroundActions[bA.type];
    newArray.push(bA);
    Vue.set(state.pendingBackgroundActions, bA.type, newArray);
  }

  /**
   * Replaces the action for the same action with the new state. The action can
   * only finish with a SUCCESS or FAIL state. When an action finishes it's
   * removed from pending actions.
   * @requires payload <{'type': BackgroundAction.TYPE,
   * 'state': BackgroundAction.STATE.SUCCESS | BackgroundAction.STATE.FAIL,
   * 'details': string
   * }> Action to be finished, state and detailed info of the resolution.
   */
  finishBackgroundAction = (state: State, payload: {
    'type': BackgroundAction.TYPE,
    'state': BackgroundAction.STATE.SUCCESS | BackgroundAction.STATE.FAIL,
    'details': string
  }): void => {

    let action = state.pendingBackgroundActions[payload.type].shift();
    if (!action) {
      action = new BackgroundAction(payload.type);
    }
    action.state = payload.state;
    if (payload.details) action.details = payload.details;

    state.finishedBackgroundActions.push(action);

  }

  /**
   * Stores a notification in the state.
   */
  addNotification = (state: State, notification: Notification): void => {

    const NOTIFICATION_BUFFER_SIZE: number = 500;
    while (state.notifications.length >= NOTIFICATION_BUFFER_SIZE) {
      state.notifications.shift(); // Removes the oldest notification
    }
    state.notifications.push(notification);
    
  }

  readNotification = (state: State, { time, title }): void => {

    for (let not in state.notifications) {
      if (state.notifications[not].time === time
        && state.notifications[not].title === title) {
        state.notifications[not].readed = true;
      }
    }

  }

};