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
                <p>
                    Connected to:
                    <div v-for="link in links" class="inner-content">
                        {{link.myChannel}} -> {{link.connectedTo}} ({{link.hisChannel}})
                    </div>
                </p>
            </div>
            <div class="tile">
                <chart v-bind:type="'line'" v-bind:data="deploymentChartData" v-bind:options="deploymentChartOptions"></chart>
            </div>
        </div>
        <rol-card v-for="deploymentRol in deploymentRoles" v-bind:key="deploymentRolName(deploymentRol)" v-bind:deploymentId="deploymentId" v-bind:rolId="deploymentRolName(deploymentRol)" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RolCard from './../innerComponents/RolCard.vue';

import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';

import { Link } from '../../store/classes';

@Component({
    name: 'DeploymentItem',
    components: {
        'rol-card': RolCard,
        'chart': Chart
    },
    props: {
        deploymentRoute: { required: true, type: String }
    }
})
export default class DeploymentItem extends Vue {
    deploymentRoute: string = this.deploymentRoute;
    deploymentChartOptions = {};


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
    get deploymentRolName(): Function {
        return function (deploymentRolId: string): string {
            return this.$store.getters.getDeploymentRolName(this.deploymentId, deploymentRolId);
        }
    }

    get deploymentService(): string {
        return this.$store.getters.getDeploymentService(this.deploymentId);
    }
    get links(): Array<Link> {
        return this.$store.getters.getDeploymentLinks(this.deploymentId);
    }
    get state(): string {
        switch (this.$store.getters.getDeploymentState(this.deploymentId)) {
            case 0: //NORMAL
                return 'NORMAL_COLOR';
            case 1:
                return 'WARNING_COLOR';
            case 2:
                return 'ERROR_COLOR';
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