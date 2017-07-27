<template>
    <div>
        <router-view v-if="route"></router-view>
        <div v-else-if="deploymentList.length > 0">
            <checkbox-input v-model="hideEntrypoints"> Hide HTTP entrypoints</checkbox-input>
    
            <div class="tile is-vertical is-ancestor">
                <div class="tile is-parent" v-for="(deployment, index) in deploymentList" v-bind:key="index" v-if="index%2===0">
                    <deployment-card class="deployment-card" v-bind:deploymentId="deployment" v-if="!shouldHide(deployment)"></deployment-card>
                    <deployment-card class="deployment-card" v-bind:deploymentId="deploymentList[index+1]" v-if="deploymentList[index+1] && !shouldHide(deployment)"></deployment-card>
                </div>
            </div>
    
        </div>
        <div v-else>
            <!-- No deployment found -->
            Start making some deployments!
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

// Componentes
import DeploymentCard from './innerComponents/card/DeploymentCard.vue';
import CheckboxInput from './innerComponents/input/CheckboxInput.vue'
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { Deployment, FabElement } from '../../store/classes';

@Component({
    name: 'Overview',
    components: {
        'deployment-card': DeploymentCard,
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'checkbox-input': CheckboxInput
    }
})
export default class Overview extends Vue {
    hideEntrypoints: boolean = false;

    get route(): boolean {
        if (this.$route.name === 'Overview') {
            let fabElementsList: Array<FabElement> = [];
            fabElementsList.push(new FabElement('Add Entrypoint', 'newHTTPEntrypoint'));
            fabElementsList.push(new FabElement('Add Service Deployment', 'newService'));
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
}
</script>