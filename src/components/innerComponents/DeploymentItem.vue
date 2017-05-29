<template>
    <div>
        <span class="title">{{deploymentName}}</span>
        <button v-on:click="applyChanges">APPLY CHANGES</button>
        <button v-on:click="cancelChanges">CANCEL</button>
        <i class="fa fa-circle" v-bind:class="state" aria-hidden="true" />
        <div class="tile">
            <div>
                <p>
                    Service: {{deploymentService}}
                    <button v-on:click="undeploy">UNDEPLOY</button>
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
                <div class="tile">
                    <chart v-bind:data="deploymentChartData"></chart>
                </div>
            </div>
            <rol-card v-for="deploymentRol in deploymentRoles" v-bind:key="deploymentRol" v-bind:deploymentId="deploymentId" v-bind:rolId="deploymentRol" />
        </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RolCard from './../innerComponents/RolCard.vue';

import Chart from './Chart.vue';

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

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }

    get deploymentId() {
        // Gracias a la ruta podemos obtener el id del deployment con el que estamos tratando
        return this.$store.getters.getDeploymentIdFromDeploymentRoute(this.deploymentRoute);

    }

    get deploymentName(): string {
        return this.$store.getters.getDeploymentName(this.deploymentId);
    }

    get deploymentChartData(): Array<any> {
        return this.$store.getters.getDeploymentChartData();
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

    applyChanges(): void {
        // Entramos dentro de cada rol-card, miramos los cambios y los enviamos
    }
    cancelChanges(): void {
        // Entramos dentro de cada rol-card y descartamos los cambios
    }
    undeploy(): void {
        // TODO: Mensaje de confirmación del usuario
        this.$store.dispatch('undeployDeployment', { deploymentId: this.deploymentId });
    }
}
</script>
<style lang="scss">

</style>