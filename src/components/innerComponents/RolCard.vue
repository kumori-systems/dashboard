<template>
    <div class="card">
        <div class="card-header title">
            <span class="card-header-left">{{rolId}}</span>
            <span class="card-header-right">{{numInstances}}</span>
            <button class="fa fa-angle-up fa-lg" v-on:click="numInstances = 1"></button>
            <button class="fa fa-angle-down fa-lg" v-on:click="numInstances = -1"></button>
    
            <i class="fa fa-circle" v-bind:class="state" aria-hidden="true"></i>
    
        </div>
        <div class="card-body tile">
            <div>
                <p>Component: {{componentURN}}</p>
                <p>Runtime: {{rolRuntime}}</p>
                <div>
                    <span>{{memNumber}} MEM</span>
                    <span>{{cpuNumber}} CPU</span>
                    <span>{{netNumber}} NET</span>
                </div>
                <div>Connected to:
    
                    <!--
                        <div class="inner-content" v-for="link in rolConnectedTo">
                            <p class="inner-content" v-if="link.providers[0] && link.dependents[0]">{{link.providers[0].channel}} {{link.providers[0].component}}-> {{link.dependents[0].channel}} {{link.dependents[0].component}}</p>
                            <p class="inner-content" v-if="link.providers[0] && !link.dependents[0]">{{link.providers[0].channel}} {{link.providers[0].component}}</p>
                            <p class="inner-content" v-if="!link.providers[0] && link.dependents[0]">-> {{link.dependents[0].channel}} {{link.dependents[0].component}}</p>
                        </div>
    -->
    
                </div>
            </div>
            <div class="tile is-parent is-4">
                <chart v-bind:type="'line'" v-bind:data="rolChartData" v-bind:options="rolChartOptions"></chart>
            </div>
        </div>
        <collapse>
            <collapse-item title="View instances">
                <instance-card v-for="instance in rolInstances" v-bind:key="instance.name" v-bind:deploymentId="deploymentId" v-bind:rolId="rolId" v-bind:instanceId="instance" />
            </collapse-item>
        </collapse>
        <div class="card-footer" v-if="false"></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import InstanceCard from './InstanceCard.vue';
import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';
import { Channel } from '../../store/classes';

@Component({
    name: 'rol-card',
    props: {
        deploymentId: { required: true, type: String },
        rolId: { required: true, type: String }
    },
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'instance-card': InstanceCard,
        'chart': Chart
    }
})
export default class Card extends Vue {
    deploymentId: string = this.deploymentId;
    rolId: string = this.rolId;

    rolChartOptions: any = {
        tooltips: { mode: 'label' },
        title: {
            text: "Hola mundo"
        },
        showLines: true,
        spanGaps: false,
    };

    get state(): string {
        switch (this.$store.getters.getDeploymentState(this.deploymentId)) {
            case 0:
                return 'CONNECTED_COLOR';
            case 1:
                return 'DISCONNECTED_COLOR';
            case 2:
                return 'ON_PROGRESS_COLOR';
            default:
                return '';
        }
    }
    get numInstances(): number {
        let temporaryState = this.$store.getters.getDeploymetRolTemporaryState(this.deploymentId, this.rolId);
        if (!temporaryState)
            return this.$store.getters.getDeploymentRolNumInstances(this.deploymentId, this.rolId);
        else return temporaryState.numInstances;
    }

    set numInstances(x: number) {
        // Vue no reconoce la llamada a esta función
        /*
                let temporaryState = this.$store.getters.getDeploymetRolTemporaryState(this.deploymentId, this.rolId);
                if (temporaryState)
                    this.$store.dispatch('changeTemporaryState', { deploymentId: this.deploymentId, rolId: this.rolId, numInstances: temporaryState.numInstances + x });
                else
                    this.$store.dispatch('changeTemporaryState', { deploymentId: this.deploymentId, rolId: this.rolId, numInstances: this.numInstances + x });
        */
    }

    get componentURN() {
        return this.$store.getters.getDeploymentRolComponentURN(this.deploymentId, this.rolId);
    }
    get rolRuntime() {
        return this.$store.getters.getDeploymentRolRuntime(this.deploymentId, this.rolId);
    }

    get rolChartData() {
        return this.$store.getters.getDeploymentRolChartData(this.deploymentId, this.rolId);
    }

    get rolInstances() {
        return this.$store.getters.getDeploymentRolInstances(this.deploymentId, this.rolId);
    }

    get memNumber(): number {
        return this.$store.getters.getDeploymentRolMemNumber(this.deploymentId, this.rolId);
    }

    get cpuNumber(): number {
        return this.$store.getters.getDeploymentRolCPUNumber(this.deploymentId, this.rolId);
    }

    get netNumber(): number {
        return this.$store.getters.getDeploymentRolNetNumber(this.deploymentId, this.rolId);
    }

    get rolConnectedTo(): Array<Channel> {
        return this.$store.getters.getDeploymentRolConnectedTo(this.deploymentId, this.rolId);
    }
}
</script>

<style lang="scss">
$padding: 10px;
.card {
    padding: $padding;
    margin: $padding;
}

.title {
    padding: $padding;
}

.card-header-right {
    color: grey;
    padding-left: 10px;
}
</style>