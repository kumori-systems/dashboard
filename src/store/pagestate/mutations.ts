import Vue from 'vue';
import Vuex from 'vuex';

import { BackgroundAction, User } from './classes';
import State from './state';


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
   * User signs out of the service.
   */
  signOut = (state: State): void => {
    state.user = new User();
  }

  /**
   * Adds a background action to the state.
   * @param payload <BackgroundAction>
   * @description The action will start as pending and will be eventually
   * solved.
   */
  addBackgroundAction = (state: State, ba: BackgroundAction): void => {
    state.backgroundActions.push(ba);
    state.pendingActions++;
  }

  /**
   * Changes the state of an action from 'waiting' to 'on process' and updates
   * the details.
   * @requires payload <{ 'id': string, 'details': string }>
   */
  processingBackgroundAction = (state: State, payload: {
    'id': string,
    'details': string
  }): void => {
    let i = state.backgroundActions
      .findIndex(action => { return action.id === payload.id; });
    state.backgroundActions[i].state = BackgroundAction.State.ON_PROCESS;
    state.backgroundActions[i].details = payload.details;
  }


  /**
   * Replaces the action for the same action with the new state. The action can
   * only finish with a SUCCESS or FAIL state. When an action finishes it's
   * removed from pending actions.
   * @requires payload <{'id': string,'state': BackgroundAction.State,
   * 'details': string}>
   */
  finishBackgroundAction = (state: State, payload: {
    'id': string, 'state': BackgroundAction.State, 'details': string
  }): void => {
    if (payload.state !== BackgroundAction.State.SUCCESS &&
      payload.state !== BackgroundAction.State.FAIL)
      throw new Error('When finishing an action the state has to be SUCCESS or'
        + 'FAIL. \nstate:' + payload.state);

    // Update the properties in the state
    let i = state.backgroundActions
      .findIndex(action => { return action.id === payload.id; });
    state.backgroundActions[i].state = payload.state;
    state.backgroundActions[i].details = payload.details;

    state.pendingActions--;
  }

  /**
   * Sets if the navigation panel should be shown.
   * @requires payload <boolean>
   */
  showNavigation = (state: State, payload: boolean): void => {
    state.navigation.show = payload;
  }

};