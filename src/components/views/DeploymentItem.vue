<template>
    <div>
        <p class="title">{{deploymentId}}</p>
        <p>Service: {{serviceName}}</p>
        <p>Connected to: {{connectedTo}}</p>
        <div class="tile is-parent is-4">
            <chart v-bind:type="'line'" v-bind:data="data" v-bind:options="options"></chart>
        </div>
        <rol-card v-for="rol in roles" v-bind:key="rol.name" state="normal" v-bind:nombre="rol.name" v-bind:numInstancias="rol.numInstances" v-bind:id="rol.id" v-bind:runtime="rol.runtime" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import RolCard from './../innerComponents/RolCard.vue';

import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';

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
    deploymentRoute:string = this.deploymentRoute;
    deploymentId: string="";
    // Correccion de la prop deploymentId
    beforeMount(){
        this.deploymentId = this.$store.getters.getDeploymentIdFromDeploymentRoute('deployments_'+this.deploymentRoute);
    }
    
    data = {
        datasets: [{
            label: 'mylabel',
            backgroundColor: 'green',
            data: [
                { x: 0, y: 2 },
                { x: 1, y: 1 }
            ]
        }, {
            label: 'mylabel2',
            backgroundColor: 'yellow',
            data: [
                { x: 0, y: 1 },
                { x: 1, y: 3 }
            ]
        },
        {
            label: 'mylabel3',
            backgroundColor: 'red',
            data: [
                { x: 0, y: 2.4 },
                { x: 1, y: 1.5 }
            ]
        }]
    };
    options = {
        tooltips: { mode: 'label' },
        title: {
            text: "Hola mundo"
        },
        showLines: true,
        spanGaps: false,
    };

    get roles() {
        console.log('El deploymentId que tenemnos es: ' + this.deploymentId);
        return this.$store.getters.getDeploymentRoles(this.deploymentId);
    }

    get serviceName() {
        return 'My Service Name';
    }
    get connectedTo() {
        return 'My Connected To';
    }
}
</script>
<style lang="scss">

</style>