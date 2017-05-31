<template>
    <div class="tile">
        <div class="content" id="instancecontent">
            <i class="fa fa-circle" v-bind:class="state" aria-hidden="true" />
            <span class="title">{{instanceId}}</span>
            <span>{{instanceMem}} MEM</span>
            <span>{{instanceCPU}} CPU</span>
            <span>{{instanceNet}} NET</span>
            <span>
                <span>&#160;</span>
                <input type="checkbox" id="killInstance">
                <label for="killInstance">kill instance</label>
            </span>
        </div>
        <div class="tile is-child is-4">
            <chart v-bind:data="instanceChartData"></chart>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import Chart from './Chart.vue';
import { State } from '../../store/classes';

@Component({
    name: 'instance-card',
    props: {
        deploymentId: { required: true, type: String },
        rolId: { required: true, type: String },
        instanceId: { required: true, type: String }
    },
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'chart': Chart
    }
})
export default class Card extends Vue {
    deploymentId: string = this.deploymentId;
    rolId: string = this.rolId;
    instanceId: string = this.instanceId;

    get state(): string {
        switch (this.$store.getters.getDeploymentRolInstanceState(this.deploymentId, this.rolId, this.instanceId)) {
            case State.CONNECTED:
                return 'CONNECTED_COLOR';
            case State.DISCONNECTED:
                return 'DISCONNECTED_COLOR';
            case State.ON_PROGRESS:
                return 'ON_PROGRESS_COLOR';
            default:
                return '';
        }
    }

    get instanceMem(): number {
        return this.$store.getters.getDeploymentRolInstanceMem(this.deploymentId, this.rolId, this.instanceId);
    }

    get instanceCPU(): number {
        return this.$store.getters.getDeploymentRolInstanceCPU(this.deploymentId, this.rolId, this.instanceId);
    }

    get instanceNet(): number {
        return this.$store.getters.getDeploymentRolInstanceNet(this.deploymentId, this.rolId, this.instanceId);
    }

    get instanceChartData(): any {
        return this.$store.getters.getDeploymentRolInstanceChartData(this.deploymentId, this.rolId, this.instanceId);
    }
}
</script>
<style lang="scss">
#instancecontent{
    padding-top: 100px;
}
</style>