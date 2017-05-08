<template>
    <div>
    
        <input type="checkbox" id="hideEntryPoints" v-model="hideEntrypoints" />
        <label for="hideEntryPoints" v-on:click="hideEntrypoints(null)"> Hide HTTP entrypoints</label>
    
        <div class="tile" v-for="deployment in deploymentList">
            <deployment-card v-bind:key="deployment.name" v-bind:deploymentId="deployment.name" />
        </div>
    
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

// Componentes
import DeploymentCard from './../innerComponents/DeploymentCard.vue';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { Deployment } from '../../store/classes';

@Component({
    name: 'Overview',
    components: {
        'deployment-card': DeploymentCard,
        'collapse': Collapse,
        'collapse-item': CollapseItem
    }
})
export default class Overview extends Vue {
    // computed
    get deploymentList(): Array<string> {
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