<template>
    <div>
        <p class="title">{{deploymentId}}</p>
        <p>Service: {{deploymentService}}</p>
        <p>
            Connected to:
            <div v-for="link in links" class="inner-content">
                {{link.myChannel}} -> {{link.connectedTo}} ({{link.hisChannel}})
            </div>
        </p>
        <div class="tile is-parent is-4">
            <chart v-bind:type="'line'" v-bind:data="deploymentChartData" v-bind:options="deploymentChartOptions"></chart>
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
    deploymentId: string;

    deploymentChartOptions = {
        tooltips: { mode: 'label' },
        title: {
            text: "Hola mundo"
        },
        showLines: true,
        spanGaps: false,
    };

    beforeMount() {
        // Gracias a la ruta podemos obtener el id del deployment con el que estamos tratando
        this.deploymentId = this.$store.getters.getDeploymentIdFromDeploymentRoute(this.deploymentRoute);
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
}
</script>
<style lang="scss">

</style>