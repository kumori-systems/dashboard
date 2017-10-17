<template>
    <div class="tile is-horizontal">
        <div class="tile is-vertical">
            <div class="content" id="instancecontent">
                <i class="state" v-bind:class="state" aria-hidden="true"></i>
                <span class="title">{{ instanceId }}</span>
                <div class="tile is-parent">
                    <div>{{ instanceMem }} MEM</div>
                    <div>{{ instanceCPU }} CPU</div>
                    <div>{{ instanceNet }} NET</div>
                    <checkbox-input v-bind:disabled="true" id="killinstance" v-model="killInstance" v-on:change="killInstanceChange()"> Kill instance</checkbox-input>
                </div>
            </div>
        </div>
        <div>
            <div class="is-child is-pulled-right box instance-chart">
                <chart v-bind:chartData="instanceChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="160"></chart>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Moment from 'moment';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import Chart from '../chart/Chart';
import ChartOptions from '../chart/ChartOptions';
import { Deployment } from '../../../../store/classes';
import Checkbox from '../input/CheckboxInput.vue';

@Component({
    name: 'instance-card',
    props: {
        deploymentId: { required: true, type: String },
        rolId: { required: true, type: String },
        instanceId: { required: true, type: String },
        clear: { required: true, type: Boolean } // Este parámetro se utiliza para limpiar 'kill Instance' cuando se cancelan los cambios
    },
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'chart': Chart,
        'checkbox-input': Checkbox
    }
})
export default class Card extends Vue {
    deploymentId: string = this.deploymentId;
    rolId: string = this.rolId;
    instanceId: string = this.instanceId;
    killInstance: boolean = false;
    chartOptions = ChartOptions;

    mounted() {
        this.$watch('clear', function(value) {
            if (value === true) {
                this.killInstance = false;
            }
        })
    }

    get state(): string {
        let res: string = 'fa ';
        switch (this.$store.getters.getDeploymentRolInstanceState(this.deploymentId, this.rolId, this.instanceId)) {
            case Deployment.Rol.Instance.State.CONNECTED:
                res += 'fa-check-circle';
            case Deployment.Rol.Instance.State.DISCONNECTED:
                res += 'fa-exclamation-circle';
            default:
                res += 'fa-question-circle';
        }
        return res;
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
        // return this.$store.getters.getDeploymentRolInstanceChartData(this.deploymentId, this.rolId, this.instanceId);
        return [];
    }

    /**
     * Éste método se utiliza para enviar una notificación al componente superior para que lea que
     * se ha cambiado el valor de 'kill instance'
     */
    killInstanceChange() {
        this.$emit('killInstanceChange', [this.instanceId, this.killInstance]);
    }
}
</script>
<style lang="scss" scoped>
$color_green:#93c47d;
$color_yellow:#f5d164;
$color_red:#ff6666;
$icon_size: 40px;
$radius: 5px;
.instance-chart {
    width: 800px;
    height: 250;
}

.fa-check-circle {
    color: $color_green;
    font-size: $icon_size;
}

.fa-exclamation-triangle {
    color: $color_yellow;
    font-size: $icon_size;
}

.fa-exclamation-circle {
    color: $color_red;
    font-size: $icon_size;
}

.card {
    margin: 10px;
    padding: 2px;
    border-radius: $radius;
}

.card-header {
    border-radius: $radius;
}

.card-body {
    padding: 10px;
}

#killinstance {
    padding-left: 10px;
}

a {
    padding-left: 10px;
}
</style>

