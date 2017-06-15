<template>
    <div>
        <span class="title">{{deploymentName}}</span>
        <i class="fa fa-circle" v-bind:class="state" aria-hidden="true" />
        <button class="button is-danger is-medium" v-on:click="undeploy">UNDEPLOY</button>
        <button class="button is-success is-medium" v-on:click="applyChanges">APPLY CHANGES</button>
        <button class="button is-warning is-medium" v-on:click="cancelChanges">CANCEL</button>
        <div class="is-parent tile">
            <div class="tile">
                <div>
                    <p>Service: {{deploymentService}}</p>
                    <p v-if="website!=null">
                        Websites:
                        <p class="inner-content" v-for="web in website">
                            <a v-bind:href="'http://'+web">
                                {{web}}
                            </a>
                        </p>
                    </p>
                    <p v-if="serviceProvideChannels.length>0 || serviceRequireChannels.length>0">
                        Connected to:
                        <div v-for="proChannel in serviceProvideChannels" class="inner-content">
                            {{proChannel.myChannel}} -> {{proChannel.toDeployment}} ({{proChannel.toChannel}})
                        </div>
                        <div v-for="reqChannel in serviceRequireChannels" class="inner-content">
                            {{reqChannel.myChannel}}
                            <- {{reqChannel.toDeployment}} ({{reqChannel.toChannel}}) </div>
                    </p>
                    </div>
                </div>
                <div class="is-child is-pulled-right box">
                    <chart v-bind:data="deploymentData" :width="600" :height="300"></chart>
                </div>
            </div>
    
            <rol-card v-for="deploymentRol in deploymentRoles" v-bind:key="deploymentRol" v-bind:deploymentId="deploymentId" v-bind:rolId="deploymentRol" v-on:killInstanceChange="handleKillInstanceChange" v-on:numInstancesChange="handleNumInstancesChange" v-bind:clear="clear" v-on:clearedRol="clear=false" />
        </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RolCard from './../innerComponents/RolCard.vue';

import Chart from './Chart.js';
import Moment from 'moment';

import { Channel, FabElement, State } from '../../store/classes';

@Component({
    name: 'DeploymentItem',
    components: {
        'rol-card': RolCard,
        'chart': Chart
    },
    props: {
        deploymentRoute: { type: String }
    }
})
export default class DeploymentItem extends Vue {
    deploymentRoute: string = this.deploymentRoute;
    rolNumInstances: { [rolId: string]: number } = {};
    instanceKill: { [rolId: string]: { [instanceId: string]: boolean } } = {};
    clear: boolean = false;
    deploymentData = {
        labels: [
            Moment().toDate(),
            Moment().add(1, 'd').toDate(),
            Moment().add(2, 'd').toDate(),
            Moment().add(3, 'd').toDate(),
            Moment().add(4, 'd').toDate(),
            Moment().add(5, 'd').toDate()
        ],
        datasets: [
            {
                label: 'CPU',
                backgroundColor: '#1fc8db',
                borderColor: '#1fc8db',
                fill: false,
                data: [10, 20, 30, 40, 50, 60]
            },
            {
                label: 'MEM',
                backgroundColor: '#fce473',
                borderColor: '#fce473',
                fill: false,
                data: [20, 20, 20, 20, 20, 20]
            },
            {
                label: 'NET',
                backgroundColor: '#42afe3',
                borderColor: '#42afe3',
                fill: false,
                data: [5, 30, 5, 30, 5, 30]
            },
            {
                label: 'RPM',
                backgroundColor: '#ed6c63',
                borderColor: '#ed6c63',
                fill: false,
                data: [10, 40, 10, 40, 10, 40]
            },
            {
                label: 'RES',
                backgroundColor: '#97cd76',
                borderColor: '#97cd76',
                fill: false,
                data: [40, 20, 40, 20, 40, 20]
            }
        ]
    };

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    get state(): string {
        switch (this.$store.getters.getDeploymentState(this.deploymentId)) {
            case State.CONNECTED:
                return 'CONNECTED_COLOR';
            case State.DISCONNECTED:
                return 'DISCONNECTED_COLOR';
            case State.ON_PROGRESS:
                return 'ON_PROGRESS_COLOR';
            default:
                return '';
        }
    }

    get deploymentId() {
        // Gracias a la ruta podemos obtener el id del deployment con el que estamos tratando
        return this.$store.getters.getDeploymentIdFromDeploymentRoute(this.deploymentRoute);

    }
    get website(): string {
        return this.$store.getters.getDeploymentWebsite(this.deploymentId);
    }

    get deploymentName(): string {
        return this.$store.getters.getDeploymentName(this.deploymentId);
    }

    get deploymentChartData(): Array<any> {
        return this.$store.getters.getDeploymentChartData(this.deploymentId);
    }

    get deploymentRoles(): Array<string> {
        return this.$store.getters.getDeploymentRoles(this.deploymentId);
    }

    /* Rol atributes */
    get deploymentService(): string {
        return this.$store.getters.getDeploymentService(this.deploymentId);
    }
    get serviceProvideChannels(): Array<Channel> {
        return this.$store.getters.getDeploymentProvideChannels(this.deploymentId);
    }

    get serviceRequireChannels(): Array<Channel> {
        return this.$store.getters.getDeploymentRequireChannels(this.deploymentId);
    }

    applyChanges(): void {
        // Enviamos los valores que han cambiado
        //  rolNumInstances
        //  killInstances
        this.$store.dispatch('aplyingChangesToDeployment', {
            'deploymentId': this.deploymentId,
            'rolNumInstances': this.rolNumInstances,
            'killInstances': this.instanceKill
        });
    }
    cancelChanges(): void {
        this.rolNumInstances = {};
        this.instanceKill = {};
        this.clear = true;
        // Tenemos que avisar de alguna forma a los hijos de que se han cancelado los cambios
    }
    undeploy(): void {
        // TODO: Mensaje de confirmación del usuario
        this.$store.dispatch('undeployDeployment', { deploymentId: this.deploymentId });
    }

    handleKillInstanceChange(payload) {
        let tempRol, tempInst, value;
        [tempRol, tempInst, value] = payload;
        if (this.instanceKill[tempRol] === undefined)
            this.instanceKill[tempRol] = {};
        this.instanceKill[tempRol][tempInst] = value;
    }
    handleNumInstancesChange(payload) {
        let tempRol, value;
        [tempRol, value] = payload;
        this.rolNumInstances[tempRol] = value;
    }
}
</script>