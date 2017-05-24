<template>
    <div>
        <p>
            Service:
            <select v-model="selectedService">
                <option disabled value="">Please select one</option>
                <option v-for="service in serviceList">{{service}}</option>
            </select>
            <button>Deploy</button>
        </p>
        <p>
            Name:
            <input v-model="deploymentName" placeholder="Deployment name">
        </p>
        <p v-if="serviceRolList.length>0">
            Roles
            <div v-for="rol, index in serviceRolList" v-bind:key="rol">
                {{rol}} MEM
                <input v-model.number="rolMem[index]" type="number"> CPU
                <input v-model.number="rolCPU[index]" type="number"> NET
                <input v-model.number="rolNet[index]" type="number">
    
                <p>
                    Instances
                    <input v-model.number="rolInstances[index]" type="number"> Resilence
                    <input v-model.number="rolResilence[index]" type="number">
                </p>
            </div>
        </p>
        <p v-if="serviceChannelList.length>0">
            Channels
            PROVIDES
            <div v-for="channel, index in serviceProChannelList" v-bind:key="channel">
                {{channel}}
            </div>
            REQUIRES
            <div v-for="channel, index in serviceReqChannelList" v-bind:key="channel">
                {{channel}}
            </div>
        </p>
        <p v-if="serviceConfigurationList.length>0">
            Configuration
            <div v-for="configuration, index in serviceConfigurationList" v-bind:key="configuration">
                {{configuration}}
            </div>
        </p>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, DeploymentRol } from '../../store/classes';

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

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }

    get serviceList() {
        return this.$store.getters.getWebServiceList;
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


    get serviceChannelList(): Array<string> {

        // TODO: ME HE QUEDADO POR AQUÍ!!!
        /*
        CREO QUE ES MEJOR SEPARAR LA PARTE VISUAL EN DOS TIPOS; PROVIDES Y REQUIRED


        Tendré que unir los canales que proveen de este deployment con canales que requieren de otro deployment.
        De la misma forma, tendré que unir canales que requieren de este deployment con canales que proveen de otro deployment.
        
        */



        return this.$store.getters.getServiceRoles(this.selectedService);
    }

    get serviceConfigurationList(): Array<string> {
        return ['b'];
    }
}
</script>
