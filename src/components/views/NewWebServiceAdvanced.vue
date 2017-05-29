<template>
    <div>
        <p>
            SERVICE:
            <select v-model="selectedService">
                <option disabled value="">Please select one</option>
                <option v-for="service in serviceList">{{service}}</option>
            </select>
            <button v-on:click="createNewDeployment" v-bind:disabled="!allSelected">Deploy</button>
        </p>
        <p v-if="selectedService !=null">
            NAME:
            <input v-model="deploymentName" placeholder="Deployment name">
        </p>
        <p v-if="serviceRolList.length > 0">
            ROLES
            <div v-for="rol, index in serviceRolList" v-bind:key="rol">
                {{rol}}
                <div class="inner-content">
                    MEM
                    <input v-model.number="rolMem[index]" type="number"> CPU
                    <input v-model.number="rolCPU[index]" type="number"> NET
                    <input v-model.number="rolNet[index]" type="number">
    
                    <p>
                        Instances
                        <input v-model.number="rolInstances[index]" type="number"> Resilence
                        <input v-model.number="rolResilence[index]" type="number">
                    </p>
                </div>
            </div>
        </p>
        <p v-if="serviceProChannelList.length>0">
            CHANNELS PROVIDES
            <div class="inner-content" v-for="channel, index in serviceProChannelList" v-bind:key="channel">
                {{channel}} ->
                <select v-model="selectedRequiredChannel[index]">
                    <option disabled value="">Please select one</option>
                    <option v-for="requiredChannel in totalRequiredDeploymentChannels">{{requiredChannel}}</option>
                </select>
            </div>
        </p>
        <p v-if="serviceReqChannelList.length>0">
            CHANNELS REQUIRES
            <div class="inner-content" v-for="channel, index in serviceReqChannelList" v-bind:key="channel">
                {{channel}}
                <- <select v-model="selectedProvidedChannel[index]">
                    <option disabled value="">Please select one</option>
                    <option v-for="providedChannel in totalProvidedDeploymentChannels">{{providedChannel}}</option>
                    </select>
            </div>
        </p>
        <div v-if="selectedService!=null">
            <p>CONFIGURATION</p>
            <div v-if="serviceResourcesList.length>0">
    
                <div v-for="resource, index in serviceResourcesList" v-bind:key="resource">
                    {{resource}}
    
                    <select v-model="selectedResourceConfig[index]">
                        <option disabled value="">Please select one</option>
                        <option v-for="resourceConfig in totalResourceConfig(resource)">{{resourceConfig}}</option>
                    </select>
    
                    <p class="inner-content">
                        <textarea v-model="resourceConfig[index]" placeholder="text/json"></textarea>
                    </p>
                    </select>
                </div>
    
            </div>
    
            {{selectedService}}config:
            <p class="inner-content">
                <textarea v-model="serviceConfig" placeholder="text/json"></textarea>
            </p>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, DeploymentRol, Resource } from '../../store/classes';

@Component({
    name: 'new-webservice-advanced'
})
export default class NewWebServiceAdvanced extends Vue {
    selectedService: string = null;
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
    }

    get serviceList() {
        return this.$store.getters.getNoEPServiceNameList;
    }

    get serviceRolList(): Array<string> {
        let rolList: Array<string> = this.$store.getters.getServiceRoles(this.selectedService);
        this.rolMem = new Array<number>(rolList.length);
        this.rolCPU = new Array<number>(rolList.length);
        this.rolNet = new Array<number>(rolList.length);
        this.rolInstances = new Array<number>(rolList.length);
        this.rolResilence = new Array<number>(rolList.length);
        return rolList;
    }


    get serviceProChannelList(): Array<string> {
        return this.$store.getters.getServiceProChannels(this.selectedService);
    }
    get serviceReqChannelList(): Array<string> {
        return this.$store.getters.getServiceReqChannels(this.selectedService);
    }

    get serviceResourcesList(): Array<string> {
        let resourceList = this.$store.getters.getServiceResources(this.selectedService);
        this.resourceConfig = new Array<string>()
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

        if (this.selectedService === undefined) return false;
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
        // Tenemos que reorganizar los roles
        // Organizamos la configuracion
        let config = {};
        for (let resourceIndex in this.serviceResourcesList) {
            config[this.serviceResourcesList[resourceIndex]] = this.resourceConfig[resourceIndex];
        }

        let roles = {};

        for (let rolIndex in this.serviceRolList) {
            roles[this.serviceRolList[rolIndex]] = new DeploymentRol(
                this.rolInstances[rolIndex],
                this.rolCPU[rolIndex],
                this.rolMem[rolIndex],
                0, //ioperf
                false,//iopsensitive
                this.rolNet[rolIndex],
                this.rolResilence[rolIndex],
                {}
            );
        }


        let website = "";
        this.$store.dispatch('createNewDeployment', {
            deployment: new Deployment(
                this.deploymentName,
                this.selectedService,
                config,
                this.serviceConfig,
                roles,
                website
            )
        });
    }
}
</script>
