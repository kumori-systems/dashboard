<template>
    <div>
    
        <input type="checkbox" id="hideEntryPoints" v-model="hideEntrypoints" />
        <label for="hideEntryPoints" v-on:click="hideEntrypoints(null)"> Hide HTTP entrypoints</label>
    
        <div class="tile" v-for="deploymentId, index in deploymentList">
            <deployment-card
                v-bind:key="deploymentId"
                v-bind:deploymentId="deploymentId"/>
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
        let res = this.$store.getters.getDeploymentList;
        console.log('lo que nos devuelve la store al pedir la deploymentList es: '+JSON.stringify(res));
        return res;
    }

    get hideEntrypoints(): boolean {
        return this.$store.getters.getHideEntrypoints;
    }

    set hideEntrypoints({ }) {
        this.$store.dispatch('hideEntrypoints', {});
    }
}
</script>