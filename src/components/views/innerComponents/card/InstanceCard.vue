<template>
    <div class="tile is-horizontal">
        <div class="tile is-vertical">
            <div class="content" id="instancecontent">
                <i class="state" v-bind:class="state" aria-hidden="true"></i>
                <span class="title">{{instanceId}}</span>
                <span>{{instanceMem}} MEM</span>
                <span>{{instanceCPU}} CPU</span>
                <span>{{instanceNet}} NET</span>
                <span>
                    <span>&#160;</span>
                    <input type="checkbox" id="killInstance" v-on:click="killInstanceChange" v-model="killInstance">
                    <label for="killInstance">kill instance</label>
                </span>
    
            </div>
        </div>
        <div class="is-child is-pulled-right box instance-chart">
            <chart v-bind:chartData="instanceChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="300"></chart>
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
        'chart': Chart
    }
})
export default class Card extends Vue {
    deploymentId: string = this.deploymentId;
    rolId: string = this.rolId;
    instanceId: string = this.instanceId;
    killInstance: boolean = false;
    chartOptions = ChartOptions;

    mounted() {
        this.$watch('clear', function (value) {
            if (value == true) {
                this.killInstance = false;
            }
        })
    }

    get state(): string {
        switch (this.$store.getters.getDeploymentRolInstanceState(this.deploymentId, this.rolId, this.instanceId)) {
            case Deployment.Rol.Instance.State.CONNECTED:
                return 'fa fa-check-circle';
            case Deployment.Rol.Instance.State.DISCONNECTED:
                return 'fa fa-exclamation-circle';
            case Deployment.Rol.Instance.State.ON_PROGRESS:
                return 'fa fa-exclamation-triangle';
            default:
                console.error('InstanceCard received a non-covered instance state');
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
        // Los datos a representar son distintos si los servicios son entrypoints
        if (this.$store.getters.getIsEntryPoint(this.deploymentId)) {
            let metrics: Deployment.Rol.Instance.EntryPointMetrics = this.$store.getters.getDeploymentRolInstanceChartData(this.deploymentId, this.rolId, this.instanceId);
            return {
                labels: metrics.time,
                datasets: [
                    {
                        label: 'timestamp_init',
                        backgroundColor: '#1fc8db',
                        borderColor: '#1fc8db',
                        fill: false,
                        data: metrics.timestamp_init
                    },
                    {
                        label: 'timestamp_end',
                        backgroundColor: '#fce473',
                        borderColor: '#fce473',
                        fill: false,
                        data: metrics.timestamp_end
                    },
                    {
                        label: 'elapsed_msec',
                        backgroundColor: '#42afe3',
                        borderColor: '#42afe3',
                        fill: false,
                        data: metrics.elapsed_msec
                    },
                    {
                        label: 'http_request_per_second',
                        backgroundColor: '#42afe3',
                        borderColor: '#42afe3',
                        fill: false,
                        data: metrics.http_request_per_second
                    },
                    {
                        label: 'http_errors_per_second',
                        backgroundColor: '#ed6c63',
                        borderColor: '#ed6c63',
                        fill: false,
                        data: metrics.http_errors_per_second
                    },
                    {
                        label: 'http_size_in_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.http_size_in_per_second
                    },
                    {
                        label: 'http_size_out_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.http_size_out_per_second
                    },
                    {
                        label: 'http_response_time',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.http_response_time
                    },
                    {
                        label: 'ws_size_in_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.ws_size_in_per_second
                    },
                    {
                        label: 'ws_size_out_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.ws_size_out_per_second
                    },
                    {
                        label: 'ws_chunk_in_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.ws_chunk_in_per_second
                    },
                    {
                        label: 'ws_chunk_out_per_second',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.ws_chunk_out_per_second
                    }
                ]

            };
        }
        else {
            let metrics: Deployment.Rol.Instance.CommonMetrics = this.$store.getters.getDeploymentRolInstanceChartData(this.deploymentId, this.rolId, this.instanceId);
            return {
                labels: metrics.time,
                datasets: [
                    {
                        label: 'CPU',
                        backgroundColor: '#1fc8db',
                        borderColor: '#1fc8db',
                        fill: false,
                        data: metrics.cpu
                    },
                    {
                        label: 'MEM',
                        backgroundColor: '#fce473',
                        borderColor: '#fce473',
                        fill: false,
                        data: metrics.mem
                    },
                    {
                        label: 'NET_IN',
                        backgroundColor: '#42afe3',
                        borderColor: '#42afe3',
                        fill: false,
                        data: metrics.net_in
                    },
                    {
                        label: 'NET_OUT',
                        backgroundColor: '#42afe3',
                        borderColor: '#42afe3',
                        fill: false,
                        data: metrics.net_out
                    },
                    {
                        label: 'RPM',
                        backgroundColor: '#ed6c63',
                        borderColor: '#ed6c63',
                        fill: false,
                        data: metrics.rpm
                    },
                    {
                        label: 'RES',
                        backgroundColor: '#97cd76',
                        borderColor: '#97cd76',
                        fill: false,
                        data: metrics.res
                    }
                ]

            };
        }

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
    height: 400px;
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

a {
    padding-left: 10px;
}
</style>

