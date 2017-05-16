<template>
    <div>
        <router-view v-if="route" />
        <div v-else>
            <input type="checkbox" id="hideEntryPoints" v-model="hideEntrypoints" />
            <label for="hideEntryPoints" v-on:click="hideEntrypoints(null)"> Hide HTTP entrypoints</label>
    
            <div class="tile" v-for="deployment in deploymentList">
                <deployment-card v-bind:key="deployment" v-bind:deploymentId="deployment" v-if="!shouldHide(deployment)" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

// Componentes
import DeploymentCard from './../innerComponents/DeploymentCard.vue';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { Deployment, FabElement } from '../../store/classes';

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
    get route(): boolean {
        if (this.$route.name === 'OVERVIEW') {
            let fabElementsList: Array<FabElement> = [];
            fabElementsList.push(new FabElement('Deploy a new HTTP Entrypoint', 'newHTTPEntrypoint'));
            fabElementsList.push(new FabElement('Deploy a new Web Service', 'newWebService'));
            fabElementsList.push(new FabElement('Deploy a new Web Service (advanced mode)', 'newWebServiceAdvanced'));
            this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
            return false;
        }

        return true;
    }
    get deploymentList(): Array<string> {
        return this.$store.getters.getDeploymentList;
    }

    get shouldHide(): Function {
        return function (deploymentId): boolean {
            if (!this.hideEntrypoints) return false;
            return this.$store.getters.getIsEntryPoint(deploymentId);
        }
    }

    get hideEntrypoints(): boolean {
        return this.$store.getters.getHideEntrypoints;
    }

    set hideEntrypoints({ }) {
        this.$store.dispatch('hideEntrypoints', {});
    }
}
</script>