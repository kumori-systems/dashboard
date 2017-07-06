import { assert } from 'chai';
import Vue from 'vue';
import Vuex from 'vuex';
import sinon from 'sinon';
import 'babel-polyfill';

Vue.use(Vuex);


import componentInTest from '../../../src/components/views/DataVolumes.vue';
const componentSelector = '#datavolumes-view';

const storeStub = new Vuex.Store({
            state: {},
            getters: {
                getDataVolumesList: sinon.stub(),
                getIsDataVolumeUsed: sinon.stub(),
                getDeploymentName: sinon.stub(),
                getRolUsingDataVolume: sinon.stub(),
                getNumberOfChunksDataVolume: sinon.stub()
            },
            actions: {
                deleteElement: sinon.stub(),
                setFabElements: sinon.stub()
            }
        });


const Constructor = Vue.extend({
    template: '<div><comp></comp></div>',
    store: storeStub,
    components: { 'comp': componentInTest}
});

describe('DataVolumes.vue', () => {
    let vm;

    beforeEach(() => {
        vm = new Constructor().$mount();
    });

    it('mounts correctly', () => {
        const actualValue: Element = vm.$el.querySelector(componentSelector);
        const expectedValue: Element = null;
        const failMessage: string = 'Component not mounted';
        assert.notEqual(actualValue, expectedValue, failMessage);
    });
    it('renders correctly', () => {
        const actualValue = vm.$el.querySelector(componentSelector).textContent;
        const expectedValue: string = 'Data Volumes';
        const failMessage: string = 'Component not rendering correctly';
        assert.equal(actualValue, expectedValue, failMessage);
    });
});