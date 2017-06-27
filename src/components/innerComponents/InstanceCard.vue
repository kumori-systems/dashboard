<template>
    <div class="tile is-horizontal">
        <div class="tile is-vertical">
            <div class="content" id="instancecontent">
                <i class="fa fa-circle" v-bind:class="state" aria-hidden="true" />
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
        <div class="is-child is-pulled-right box instanceChart">
            <chart v-bind:data="instanceChartData" v-bind:width="600" v-bind:height="300"></chart>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import Chart from './Chart.js';
import { State, Metrics } from '../../store/classes';
import Moment from 'moment';

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

    mounted() {
        this.$watch('clear', function (value) {
            if (value == true) {
                this.killInstance = false;
            }
        })
    }

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

        let metrics: Metrics = this.$store.getters.getDeploymentRolInstanceChartData(this.deploymentId, this.rolId, this.instanceId);

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
                    label: 'NET',
                    backgroundColor: '#42afe3',
                    borderColor: '#42afe3',
                    fill: false,
                    data: metrics.net_in
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

    /**
     * Éste método se utiliza para enviar una notificación al componente superior para que lea que
     * se ha cambiado el valor de 'kill instance'
     */
    killInstanceChange() {
        this.$emit('killInstanceChange', [this.instanceId, this.killInstance]);
    }
}
</script>
<style lang="scss">
.instanceChart {
    width: 600px;
    height: 300px;
    margin-right: 10px;
}
</style>