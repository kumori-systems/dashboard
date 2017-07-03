<template>
    <div>
        <i v-bind:class="state" aria-hidden="true" />
        <span class="title">{{deploymentName}}</span>
        <button class="button is-danger is-medium" v-on:click="undeploy">UNDEPLOY</button>
        <button v-bind:disabled="!haveChanges" class="button is-success is-medium" v-on:click="applyChanges">APPLY CHANGES</button>
        <button v-bind:disabled="!haveChanges" class="button is-warning is-medium" v-on:click="cancelChanges">CANCEL</button>
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
                <div class="is-child is-pulled-right box deployment-chart">
                    <chart v-bind:chartData="deploymentChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="300"></chart>
                </div>
            </div>
            <rol-card v-for="deploymentRol in deploymentRoles" v-bind:key="deploymentRol" v-bind:deploymentId="deploymentId" v-bind:rolId="deploymentRol" v-on:killInstanceChange="handleKillInstanceChange" v-on:numInstancesChange="handleNumInstancesChange" v-bind:clear="clear" v-on:clearedRol="clear=false" />
            <undeploy v-bind:visible="showModal" v-bind:deploymentId="deploymentId" v-bind:deploymentName="deploymentName" v-on:close="showModal=false">
                This action will
                <strong>UNDEPLOY</strong> {{deploymentName}} and you will
                <strong>loose all data</strong>
            </undeploy>
        </div>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import Moment from 'moment';

import { Channel, FabElement, State, EntryPointMetrics, NormalMetrics } from '../../store/classes';
import RolCard from './innerComponents/card/RolCard.vue';
import Chart from './innerComponents/chart/Chart.js';
import ChartOptions from './innerComponents/chart/ChartOptions.js';
import Undeploy from './innerComponents/modal/Undeploy.vue';

@Component({
    name: 'DeploymentItem',
    components: {
        'rol-card': RolCard,
        'chart': Chart,
        'undeploy': Undeploy
    },
    props: {
        deploymentRoute: { type: String }
    }
})
export default class DeploymentItem extends Vue {
    deploymentRoute: string = this.deploymentRoute;
    rolNumInstances: { [rolId: string]: number } = {};
    instanceKill: { [rolId: string]: { [instanceId: string]: boolean } } = {};
    haveChanges: boolean = false;
    clear: boolean = false;
    showModal: boolean = false;
    modalOkCallback: Function = function () { };
    chartOptions = ChartOptions;

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    get state(): string {
        switch (this.$store.getters.getDeploymentState(this.deploymentId)) {
            case State.CONNECTED:
                return 'fa fa-check-circle';
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

    get isEntrypoint() {
        return this.$store.getters.getIsEntryPoint(this.deploymentId);
    }

    get deploymentChartData(): any {
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
        this.haveChanges = false;
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
        this.haveChanges = false;
    }
    undeploy(): void {
        const deploymentId = this.deploymentId;
        this.modalOkCallback = function () { this.$store.dispatch('undeployDeployment', { 'deploymentId': deploymentId }); }
        this.showModal = true;
    }

    handleKillInstanceChange(payload) {
        this.haveChanges = true;
        let tempRol, tempInst, value;
        [tempRol, tempInst, value] = payload;
        if (this.instanceKill[tempRol] === undefined)
            this.instanceKill[tempRol] = {};
        this.instanceKill[tempRol][tempInst] = value;
    }
    handleNumInstancesChange(payload) {
        this.haveChanges = true;
        let tempRol, value;
        [tempRol, value] = payload;
        this.rolNumInstances[tempRol] = value;
    }
}
</script>
<style lang="scss" scoped>
$color_green:#93c47d;
$color_yellow:#f5d164;
$color_red:#ff6666;
$icon_size: 40px;
.deployment-chart {
    width: 800px;
    height: 400px;
    margin-right: 40px;
}

.fa-check-circle {
    color: $color_green;
    font-size: $icon_size;
}

.fa-exclamation-triangle {
    color: $color_yellow;
    font-size: $icon_size;
}

.fa-exclamation-circle {
    color: $color_red;
    font-size: $icon_size;
}
</style>