<template>
    <div class="card">
        <i class="fa fa-circle" v-bind:class="state" aria-hidden="true"></i>
        <span class="title">{{instanceId}}</span> {{instanceMem}} MEM {{instanceCPU}} CPU {{instanceNet}} NET
        <input type="checkbox" id="killInstance">
        <label for="killInstance">kill instance</label>
        <chart v-bind:type="'line'" v-bind:data="instanceChartData" v-bind:options="instanceChartOptions" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';
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
    instanceChartOptions = {
        tooltips: { mode: 'label' },
        showLines: true,
        spanGaps: false,
    };

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