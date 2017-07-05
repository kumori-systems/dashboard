// Import Vue and the component being tested
import Vue from 'vue';

// Impor vuex
import store from '../../../src/store';
import { Help } from '../../../src/components';
import { expect } from 'chai';

describe('Help.vue', () => {
  it('Content should be correctly rendered', () => {
    const vm = new Help();
    vm.$store = {
      state: {},
      getters: {},
      replaceState: () => { },
      dispatch: () => { return null; },
      commit: () => { },
      subscribe: () => { return null; },
      watch: () => { return null; },
      registerModule: () => { return null; },
      unregisterModule: () => { return null; },
      hotUpdate: () => { return null; }
    };
    vm.$mount();

    expect(vm.$el.querySelector('.help-view').textContent)
      .to.equal('Help');

    /*
    let resultFromMyMethod = (<any>vm).mymethod();
    expect(resultFromMyMethod).to.equal('ok');
    */
  });
});