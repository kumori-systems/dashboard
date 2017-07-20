<template>
    <div>
        <table>
            <tr class="tile is-3">
                <th>SERVICE:</th>
                <th>
                    <div class="select">
                        <select v-model="selectedService">
                            <option disabled value="">Please select one</option>
                            <option v-for="(service, index) in serviceList" v-bind:key="index" v-bind:value="service">{{service.name}}</option>
                        </select>
    
                    </div>
                </th>
                <th>
                    <button class="button is-primary" v-on:click="createNewDeployment" v-bind:disabled="!allSelected">Deploy</button>
                </th>
            </tr>
    
            <tr v-if="selectedService && selectedService!==null" class="tile is-3">
                <th>
                    <span>NAME</span>
                </th>
                <th>
                    <input class="input" v-model="deploymentName" placeholder="Deployment name">
                </th>
            </tr>
            <tr v-if="selectedService && selectedService !==null && serviceRolList.length > 0">
                <th>ROLES</th>
            </tr>
            <tr v-if="selectedService &&  selectedService !==null" v-for="(rol, index) in serviceRolList" v-bind:key="index">
                <th>
                    <table>
                        <tr class="tile is-3">
                            <th class="tile is-6">{{rol}}</th>
                            <th class="is-3">
                                <tr>
                                    <th>MEM</th>
                                    <th>
                                        <inputnumber v-bind:value="rolMem[index]" v-bind:numElement="index" v-bind:property="'MEM'" v-on:input="updateInputValue"></inputnumber>
                                    </th>
                                </tr>
                                <tr>
                                    <th>CPU</th>
                                    <th>
                                        <inputnumber v-bind:value="rolCPU[index]" v-bind:numElement="index" v-bind:property="'CPU'" v-on:input="updateInputValue"></inputnumber>
                                    </th>
                                </tr>
                                <tr>
                                    <th>NET</th>
                                    <th>
                                        <inputnumber v-bind:value="rolNet[index]" v-bind:numElement="index" v-bind:property="'NET'" v-on:input="updateInputValue"></inputnumber>
                                    </th>
                                </tr>
    
                                <tr>
                                    <th>Instances</th>
                                    <th>
                                        <inputnumber v-bind:value="rolInstances[index]" v-bind:numElement="index" v-bind:property="'INS'" v-on:input="updateInputValue"></inputnumber>
                                    </th>
                                </tr>
                                <tr>
                                    <th>
                                        <span>Resilence</span>
                                    </th>
                                    <th>
                                        <inputnumber v-bind:value="rolResilence[index]" v-bind:numElement="index" v-bind:property="'RES'" v-on:input="updateInputValue"></inputnumber>
                                    </th>
                                </tr>
                            </th>
                        </tr>
                    </table>
                </th>
            </tr>
            <tr v-if="selectedService &&  selectedService !==null && serviceProChannelList.length>0 || serviceReqChannelList.length>0">
                <th> CHANNELS</th>
            </tr>
            <tr v-if="selectedService && selectedService !==null" v-for="(channel, index) in serviceProChannelList" v-bind:key="index">
                <th>
                    <table class="tile is-6">
                        <tr class="tile is-12">
                            <th class="tile is-2"> {{channel}}</th>
                            <th>-&gt;</th>
                            <th>
                                <div class="select">
                                    <select v-model="selectedRequiredChannel[index]">
                                        <option disabled value="">Please select one</option>
                                        <option v-for="(requiredChannel, index) in totalRequiredDeploymentChannels" v-bind:key="index">{{requiredChannel}}</option>
                                    </select>
                                </div>
                            </th>
                        </tr>
                    </table>
                </th>
            </tr>
            <tr v-if="selectedService && selectedService !==null" v-for="(channel, index) in serviceReqChannelList" v-bind:key="index">
                <th>
                    <table class="tile is-6">
                        <tr class="tile is-12">
                            <th class="tile is-2"> {{channel}} </th>
                            <th>&lt;-</th>
                            <th>
                                <div class="select">
                                    <select v-model="selectedProvidedChannel[index]">
                                        <option disabled value="">Please select one</option>
                                        <option v-for="(providedChannel, index) in totalProvidedDeploymentChannels" v-bind:key="index">{{providedChannel}}</option>
                                    </select>
                                </div>
                            </th>
                        </tr>
                    </table>
                </th>
            </tr>
            <tr v-if="selectedService && selectedService !==null && serviceResourcesList.length>0">
                <th>RESOURCES CONFIGURATION</th>
            </tr>
            <tr v-if="selectedService && selectedService !==null && serviceResourcesList.length>0"" v-for="(resource, index) in serviceResourcesList" v-bind:key="index">
                <th>
                    <table>
                        <tr>
                            <th>{{resource}} </th>
                        </tr>
                        <tr>
                            <th>
                                <div class="select">
                                    <select v-model="selectedResourceConfig[index]" v-bind:disabled="resourceConfig[index]!==undefined && resourceConfig[index].length >0">
                                        <option disabled value="">Please select one</option>
                                        <option v-for="(resourceConfig, index) in totalResourceConfig(resource)" v-bind:key="index">{{resourceConfig}}</option>
                                    </select>
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th class="tile is-6">
                                <textarea class="textarea" v-model="resourceConfig[index]" placeholder="text/json"></textarea>
                            </th>
                        </tr>
                    </table>
                </th>
            </tr>
            <tr v-if="selectedService && selectedService!==null">
                <th>SERVICE '{{selectedService.name}}' CONFIGURATION</th>
            </tr>
            <tr v-if="selectedService && selectedService!==null">
                <th class="tile is-6">
                    <textarea class="textarea" v-model="serviceConfig" placeholder="text/json"></textarea>
                </th>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, Resource } from '../../../../store/classes';
import InputNumber from '../input/InputNumber.vue';

@Component({
    name: 'new-service',
    components: {
        'inputnumber': InputNumber
    }
})
export default class NewService extends Vue {
    selectedService: { id: string, name: string }=null;
    deploymentName: string = null;
    rolMem: Array<number> = [];
    rolCPU: Array<number> = [];
    rolNet: Array<number> = [];
    rolInstances: Array<number> = [];
    rolResilence: Array<number> = [];
    resourceConfig: Array<string> = [];
    serviceConfig: string = null;
    selectedRequiredChannel: Array<string> = [];
    selectedProvidedChannel: Array<string> = [];
    selectedResourceConfig: Array<string> = [];

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
        let serviceId = this.$store.getters.getSelectedService;

        if (serviceId && serviceId !== null){
            
            this.selectedService = {
                id: serviceId,
                name: this.$store.getters.getServiceName(serviceId)
            };
        }
    }

    get serviceList() {
        return this.$store.getters.getNoEPServiceList;
    }

    get serviceRolList(): Array<string> {
        if(!this.selectedService || this.selectedService === null)return [];
        let rolList: Array<string> = this.$store.getters.getServiceRoles(this.selectedService.id);
        this.rolMem = new Array<number>(rolList.length);
        this.rolCPU = new Array<number>(rolList.length);
        this.rolNet = new Array<number>(rolList.length);
        this.rolInstances = new Array<number>(rolList.length);
        this.rolResilence = new Array<number>(rolList.length);
        for (let i = 0; i < rolList.length; i++) {
            this.rolMem[i] = 1;
            this.rolCPU[i] = 1;
            this.rolNet[i] = 1;
            this.rolInstances[i] = 1;
            this.rolResilence[i] = 1;
        }
        return rolList;
    }


    get serviceProChannelList(): Array<string> {
        if(!this.selectedService || this.selectedService === null)return [];
        let res = this.$store.getters.getServiceProChannels(this.selectedService.id);
        this.selectedRequiredChannel = new Array<string>(res.length);
        return res;
    }
    get serviceReqChannelList(): Array<string> {
        if(!this.selectedService || this.selectedService === null)return [];
        let res = this.$store.getters.getServiceReqChannels(this.selectedService.id);
        this.selectedProvidedChannel = new Array<string>(res.length);
        return res;
    }

    get serviceResourcesList(): Array<string> {
        let resourceList = []
        if(this.selectedService && this.selectedService !== null)
            resourceList = this.$store.getters.getServiceResources(this.selectedService.id);
        this.resourceConfig = new Array<string>(resourceList.length);
        return resourceList;
    }

    get totalProvidedDeploymentChannels() {
        return this.$store.getters.getTotalProvidedDeploymentChannels;
    }

    get totalRequiredDeploymentChannels() {
        return this.$store.getters.getTotalRequiredDeploymentChannels;
    }

    get totalResourceConfig() {
        return (resourceId) => { return this.$store.getters.getFreeResource(resourceId); }
    }

    get allSelected() {
        if(!this.selectedService || this.selectedService === null)return false;
        if (this.deploymentName == null || this.deploymentName.length < 1) return false;
        for (let index in this.rolMem) {
            if (this.rolMem[index] === undefined) return false
        }
        for (let index in this.rolCPU) {
            if (this.rolCPU[index] === undefined) return false
        }
        for (let index in this.rolNet) {
            if (this.rolNet[index] === undefined) return false
        }
        for (let index in this.rolInstances) {
            if (this.rolInstances[index] === undefined) return false
        }
        for (let index in this.rolResilence) {
            if (this.rolResilence[index] === undefined) return false
        }
        for (let index in this.resourceConfig) {
            if (this.resourceConfig[index] === undefined) return false
        }
        for (let index in this.selectedRequiredChannel) {
            if (this.selectedRequiredChannel[index] === undefined) return false
        }
        for (let index in this.selectedProvidedChannel) {
            if (this.selectedProvidedChannel[index] === undefined) return false
        }
        return true;
    }

    createNewDeployment() {
        let config = {};
        for (let resourceIndex in this.serviceResourcesList) {
            config[this.serviceResourcesList[resourceIndex]] = this.resourceConfig[resourceIndex];
        }

        let roles = {};
        let instances;
        for (let rolIndex in this.serviceRolList) {

            instances = {};
            for (let counter = 0; counter < this.rolInstances[rolIndex]; counter++) {
                instances[counter] = new Deployment.Rol.Instance(null, null, null, null);
            }

            roles[this.serviceRolList[rolIndex]] = new Deployment.Rol(
                this.rolCPU[rolIndex],
                this.rolMem[rolIndex],
                0, //ioperf
                false,//iopsensitive
                this.rolNet[rolIndex],
                this.rolResilence[rolIndex],
                instances
            );
        }

        let website: Array<string> = [];
        this.$store.dispatch('createNewDeployment',
            {
                'name': this.deploymentName,
                'service': this.selectedService.id,
                'config': config,
                'serviceConfig': this.serviceConfig,
                'roles': roles,
                'domain': website
            }
        );
    }

    updateInputValue(emitedArguments) {
        let numRol: number, propertyType: string, newValue: number;
        [numRol, propertyType, newValue] = emitedArguments;
        switch (propertyType) {
            case 'CPU':
                this.rolCPU[numRol] = newValue
                break;
            case 'MEM':
                this.rolMem[numRol] = newValue
                break;
            case 'NET':
                this.rolNet[numRol] = newValue
                break;
            case 'INS':
                this.rolInstances[numRol] = newValue
                break;
            case 'RES':
                this.rolResilence[numRol] = newValue
                break;
        }
    }
}
</script>
<style lang="scss" scoped>
table {
    border-collapse: collapse;
    border-bottom-width: 0px;
    tr,th {
        border-bottom-width: 0px;
    }
}
</style>