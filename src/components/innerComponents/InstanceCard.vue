<template>
    <div class="card">
        <div class="card-header title">
            <div class="card-header-left">{{instanceId}}</div>
            <div class="card-header-right">
                <i class="fa fa-circle" v-bind:class="state" aria-hidden="true"></i>
            </div>
        </div>
        <div class="card-body tile">
            <div class="tile">
                <!-- resources -->
                <span>MEM {{instanceMem}}</span>
                <span>CPU {{instanceCPU}}</span>
                <span>NET {{instanceNet}}</span>
                <!-- kill instance -->
                <button>Kill instance</button>
                <!--chart-->
            </div>
            <div>
                <chart v-bind:type="'line'" v-bind:data="instanceChartData" v-bind:options="instanceChartOptions" />
            </div>
        </div>
        <div class="card-footer" v-if="false" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';

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
        title: {
            text: "Hola mundo"
        },
        showLines: true,
        spanGaps: false,
    };

    get state(): string {
        switch (this.$store.getters.getDeploymentState(this.deploymentId, this.rolId, this.instanceId)) {
            case 0: //NORMAL
                return 'NORMAL_COLOR';
            case 1:
                return 'WARNING_COLOR';
            case 2:
                return 'ERROR_COLOR';
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

.normal {
    background: green;
}

.warning {
    background: yellow;
}

.error {
    background: red;
}
</style>