import { assert } from 'chai';
import Vue from 'vue';

import componentInTest from '../../../src/components/views/AlarmsAndLogs.vue';
const componentSelector = '#alarmsandlogs-view';

const Constructor = Vue.extend({ template: '<div><comp></comp></div>', components: { 'comp': componentInTest } });
const vm = new Constructor().$mount();

describe('AlarmsAndLogs.vue', () => {
    it('mounts correctly', () => {
        const actualValue: Element = vm.$el.querySelector(componentSelector);
        const expectedValue: Element = null;
        const failMessage: string = 'Component not mounted';
        assert.notEqual(actualValue, expectedValue, failMessage);
    });
    it('renders correctly', () => {
        const actualValue = vm.$el.querySelector(componentSelector).textContent;
        const expectedValue: string = 'Alarms and logs';
        const failMessage: string = 'Component not rendering correctly';
        assert.equal(actualValue, expectedValue, failMessage);
    });
});