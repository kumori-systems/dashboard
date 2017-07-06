import { assert } from 'chai';
import Vue from 'vue';
import Vuex from 'vuex';
import sinon from 'sinon';
import 'babel-polyfill';
Vue.use(Vuex);

import componentInTest from '../../../src/components/views/DataVolumes.vue';
const componentSelector = '#datavolumes-view';

import { Resource } from '../../../src/store/classes';

describe('DataVolumes.vue', () => {
    let vm, storeActions, storeGetters, constructor;
    
    beforeEach(() => {
        storeGetters = {
            getDataVolumesList: sinon.stub(),
            getIsDataVolumeUsed: sinon.stub(),
            getDeploymentName: sinon.stub(),
            getRolUsingDataVolume: sinon.stub(),
            getNumberOfChunksDataVolume: sinon.stub()
        },
        storeActions = {
            setFabElements: sinon.stub(),
            deleteElement: sinon.stub()
        };
        constructor = Vue.extend({
            template: '<div><comp></comp></div>',
            store: new Vuex.Store({
                state: {},
                getters: storeGetters,
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
    it('getters: getDataVolumesList', () => {
            const actualValue: boolean = storeGetters.getDataVolumesList.calledOnce;
            const expectedValue: boolean = true;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
    });

    describe ('No volumes in dataVolumeList', () => {
        it('getters: getIsDataVolumeUsed', () => {
            const actualValue: boolean = storeGetters.getIsDataVolumeUsed.calledOnce;
            const expectedValue: boolean = false;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
        it('getters: getDeploymentName', () => {
            const actualValue: boolean = storeGetters.getDeploymentName.calledOnce;
            const expectedValue: boolean = false;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
        it('getters: getRolUsingDataVolume', () => {
            const actualValue: boolean = storeGetters.getRolUsingDataVolume.calledOnce;
            const expectedValue: boolean = false;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
        it('getters: getNumberOfChunksDataVolume', () => {
            const actualValue: boolean = storeGetters.getNumberOfChunksDataVolume.calledOnce;
            const expectedValue: boolean = false;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
    });

    describe ('Volumes in dataVolumeList', () => {
        beforeEach(() => {
            storeGetters = {
                getDataVolumesList: sinon.stub().returns([new Resource('eslap://eslap.cloud/resources/volume/acs/persistent', {})]),
                getIsDataVolumeUsed: sinon.stub().returns((arg) => { return  true; }),
                getDeploymentName: sinon.stub().returns((arg) => { return  'Deployment Name'; }),
                getDeploymentUsingDataVolume:sinon.stub().returns((arg) => { return  'deploymentId'; }),
                getRolUsingDataVolume: sinon.stub().returns((arg) => { return  'Rol Name'; }),
                getNumberOfChunksDataVolume: sinon.stub().returns((arg) => { return  1; })
            },
            storeActions = {
                setFabElements: sinon.stub(),
                deleteElement: sinon.stub()
            };
            constructor = Vue.extend({
                template: '<div><comp></comp></div>',
                store: new Vuex.Store({
                    state: {},
                    getters: storeGetters,
                    actions: storeActions
                }),
                components: { 'comp': componentInTest}
            });
            vm = new constructor().$mount();
        });
        it('getters: getIsDataVolumeUsed', () => {
            const actualValue: boolean = storeGetters.getIsDataVolumeUsed.calledOnce;
            const expectedValue: boolean = true;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
        it('getters: getDeploymentName', () => {
            const actualValue: boolean = storeGetters.getDeploymentName.calledOnce;
            const expectedValue: boolean = true;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
        it('getters: getRolUsingDataVolume', () => {
            const actualValue: boolean = storeGetters.getRolUsingDataVolume.calledOnce;
            const expectedValue: boolean = true;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
        it('getters: getNumberOfChunksDataVolume', () => {
            const actualValue: boolean = storeGetters.getNumberOfChunksDataVolume.calledOnce;
            const expectedValue: boolean = true;
            const failMessage: string = 'Incorrect number of function calls';
            assert.equal(actualValue, expectedValue, failMessage);
        });
    });
    
});