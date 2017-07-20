
import { assert } from 'chai';
import Vue from 'vue';
import Vuex from 'vuex';
import sinon from 'sinon';
import 'babel-polyfill';
Vue.use(Vuex);

import componentInTest from '../../../src/components/views/Help.vue';
const componentSelector = '#help-view';

describe('Help.vue', () => {
    let vm, storeActions, constructor;
    
    beforeEach(() => {
        storeActions = {
            setFabElements: sinon.stub()
        };
        constructor = Vue.extend({
            template: '<div><comp></comp></div>',
            store: new Vuex.Store({
                state: {},
                getters: {},
                actions: storeActions
            }),
            components: { 'comp': componentInTest}
        });
        vm = new constructor().$mount();
    });

    it('mounts correctly', () => {
        const actualValue: Element = vm.$el.querySelector(componentSelector);
        const expectedValue: Element = null;
        const failMessage: string = 'Component not mounted';
        assert.notEqual(actualValue, expectedValue, failMessage);
    });
    it('uploads fab elements', () => {
        const actualValue: boolean = storeActions.setFabElements.calledOnce;
        const expectedValue: boolean = true;
        const failMessage: string = 'Incorrect number of function calls';
        assert.equal(actualValue, expectedValue, failMessage);
    });
    it('renders correctly', () => {
        const actualValue = vm.$el.querySelector(componentSelector).textContent;
        const expectedValue: string = 'Help';
        const failMessage: string = 'Component not rendering correctly';
        assert.equal(actualValue, expectedValue, failMessage);
    });
});