<template>
    <div>
    
        <input type="checkbox" id="hideEntryPoints" v-model="hideEntrypoints" />
        <label for="hideEntryPoints" v-on:click="hideEntrypoints(null)"> Hide HTTP entrypoints</label>
    
        <div class="tile" v-for="deployment, key in deploymentList">
            <deployment-card
                v-bind:key="deployment.service"
                
                v-bind:state="'normal'"
                v-bind:title="getDeploymentName(key)"
                v-bind:identificador="getDeploymentId(key)"
                v-bind:class="'entrypoint'"
                v-bind:service="deployment.service"
                v-bind:roles="deployment.roles"
                v-bind:website="'mi website'"
                v-bind:links="'mis links'"
                v-bind:volumes="'mis volumenes'"/>
        </div>
    
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

// Componentes
import DeploymentCard from './../innerComponents/DeploymentCard.vue';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { Deployment } from '../../connection';

@Component({
    name: 'Overview',
    components: {
        'deployment-card': DeploymentCard,
        'collapse': Collapse,
        'collapse-item': CollapseItem
    }
})
export default class Overview extends Vue {

    // Methods
    getDeploymentName(deploymentNameId: string): string {
        return deploymentNameId.substring(0, deploymentNameId.lastIndexOf('-'));
    }
    getDeploymentId(deploymentNameId: string): string {
        return deploymentNameId.substring(deploymentNameId.lastIndexOf('-')+1, deploymentNameId.length);
    }


    // computed
    /**
     * Obteniendo lista de deployments
     */
    get deploymentList(): { [key: string]: Deployment } {
        return this.$store.getters.getDeploymentList;
    }

    get hideEntrypoints(): boolean {
        return this.$store.getters.getHideEntrypoints;
    }

    set hideEntrypoints({ }) {
        this.$store.dispatch('hideEntrypoints', {});
    }
}
</script>