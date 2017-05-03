<template>
    <div>
    
        <input type="checkbox" id="hideEntryPoints" v-model="hideEntrypoints" />
        <label for="hideEntryPoints" v-on:click="hideEntrypoints(null)"> Hide HTTP entrypoints</label>
    
        <div class="tile" v-for="deployment, key in deploymentList">
            <deployment-card
                v-bind:key="key"
                v-bind:deploymentId="key"/>
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
    // computed
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