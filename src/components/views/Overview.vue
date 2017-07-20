<template>
    <div>
        <router-view v-if="route"></router-view>
        <div v-else-if="deploymentList.length > 0">
            <input type="checkbox" v-model="hideEntrypoints"></input>
            <label for="hideEntryPoints"> Hide HTTP entrypoints</label>
            <div class="tile is-4" v-for="(deployment, index) in deploymentList" v-bind:key="index">
                <deployment-card v-bind:deploymentId="deployment" v-if="!shouldHide(deployment)"></deployment-card>
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
    hideEntrypoints: boolean = false;

    created() {
        this.$store.dispatch('getDeploymentList');
    }

    get route(): boolean {
        if (this.$route.name === 'OVERVIEW') {
            let fabElementsList: Array<FabElement> = [];
            fabElementsList.push(new FabElement('Deploy a new HTTP Entrypoint', 'newHTTPEntrypoint'));
            fabElementsList.push(new FabElement('Deploy a new Service', 'newService'));
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