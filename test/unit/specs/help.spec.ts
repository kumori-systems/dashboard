import Vue from 'vue';

import Help from '../../../src/components/views/Help.vue';
import { assert } from 'chai';
describe('Hello.vue', () => {
    it('should render correct contents', () => {
        // surprisingly this test needs to be setup with a template and components param in the vue extend method, WHY??????
        // when running th s test with  following 2 lines it will BREAK:
        // const Constructor = Vue.extend(Hello);
        // const vm = new Constructor().$mount();

        // we can only fix this test by using following 2 lines: 
        const Constructor = Vue.extend({ template: '<div><comp></comp></div>', components: { 'comp': Help } });
        const vm = new Constructor().$mount();

        // const vm = new Help();
        // vm.$mount();

        const actualValue = vm.$el.querySelector('.help h1').textContent;
        const expectedValue = 'Help';
        const failMessage = 'Message explaining the fail';
        assert.equal(actualValue, expectedValue, failMessage);

    });
});