<template>
    <div class="card">
        <div class="card-header title">
            <span class="card-header-left">{{rolId}}</span>
            <span class="card-header-right">{{numInstances}}</span>
            <div>
                <button class="fa fa-angle-up button is-small is-primary is-outlined" v-on:click="numInstances = 1" />
                <button class="fa fa-angle-down button is-small is-primary is-outlined" v-on:click="numInstances = -1" />
            </div>
            <i class="fa fa-circle" v-bind:class="state" aria-hidden="true"></i>
        </div>
        <div class="card-body tile inner-content">
            <div class="tile">
                <div class="inner-content">
                    <p>Component: {{componentURN}}</p>
                    <p>Runtime: {{rolRuntime}}</p>
                    <p>
                        {{memNumber}} MEM {{cpuNumber}} CPU {{netNumber}} NET
                    </p>
                    <p v-if="dataVolumesList.length>0">
                        Data Volumes:
                        <div class="inner-content" v-for="dataVolume in dataVolumesList">
                            <i class="fa fa-hdd-o" aria-hidden="true"></i> {{dataVolume}}
                        </div>
                    </p>
                    <div v-if="rolReqConnectedTo.length > 0 || rolProConnectedTo.length > 0">
                        <p>
                            Connected to:
                            <div class="left-padding">
                                <div v-for="connection in rolProConnectedTo">
                                    <div v-for="connectedTo in connection[1].connectedTo">{{connection[0]}} -> {{connectedTo.rolName || 'this'}} ({{connectedTo.channelName}})</div>
                                </div>
                                <div v-for="connection in rolReqConnectedTo">
                                    <div v-for="connectedTo in connection[1].connectedTo">{{connection[0]}} &#60;- {{connectedTo.rolName || 'this'}} ({{connectedTo.channelName}})</div>
                                </div>
                            </div>
                        </p>
                    </div>
                </div>
            </div>
            <div class="is-child is-pulled-right box">
                <chart v-bind:data="rolData" :width="600" :height="300"></chart>
            </div>
    
        </div>
        <collapse>
            <collapse-item title="View instances">
                <instance-card v-for="instance in rolInstances" v-bind:key="instance.name" v-bind:deploymentId="deploymentId" v-bind:rolId="rolId" v-bind:instanceId="instance" v-on:killInstanceChange="handleKillInstanceChange" v-bind:clear="clear" />
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
import Chart from './Chart.js';
import { Channel, State } from '../../store/classes';
import Moment from 'moment';

@Component({
    name: 'rol-card',
    props: {
        deploymentId: { required: true, type: String },
        rolId: { required: true, type: String },
        clear: { required: true, type: Boolean } // Se utiliza para limpiar los cambios cuando se cancelan
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
    localNumInstances: number = -1;

    rolData = {
        labels: [
            Moment().toDate(),
            Moment().add(1, 'd').toDate(),
            Moment().add(2, 'd').toDate(),
            Moment().add(3, 'd').toDate(),
            Moment().add(4, 'd').toDate(),
            Moment().add(5, 'd').toDate()
        ],
        datasets: [
            {
                label: 'CPU',
                backgroundColor: '#1fc8db',
                borderColor: '#1fc8db',
                fill: false,
                data: [10, 20, 30, 40, 50, 60]
            },
            {
                label: 'MEM',
                backgroundColor: '#fce473',
                borderColor: '#fce473',
                fill: false,
                data: [20, 20, 20, 20, 20, 20]
            },
            {
                label: 'NET',
                backgroundColor: '#42afe3',
                borderColor: '#42afe3',
                fill: false,
                data: [5, 30, 5, 30, 5, 30]
            },
            {
                label: 'RPM',
                backgroundColor: '#ed6c63',
                borderColor: '#ed6c63',
                fill: false,
                data: [10, 40, 10, 40, 10, 40]
            },
            {
                label: 'RES',
                backgroundColor: '#97cd76',
                borderColor: '#97cd76',
                fill: false,
                data: [40, 20, 40, 20, 40, 20]
            }
        ]
    };


    mounted() {
        this.$watch('clear', function (value) {
            if (value === true) {
                // Limpiamos el estado temporal
                this.localNumInstances = -1;
                this.$emit('clearedRol');
            }
        });
    }

    get state(): string {
        switch (this.$store.getters.getDeploymentRolState(this.deploymentId, this.rolId)) {
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
    get numInstances(): number {
        // Miramos el número de instáncias local. ¿Está inicializado?
        if (this.localNumInstances < 0) {
            this.localNumInstances = this.$store.getters.getDeploymentRolNumInstances(this.deploymentId, this.rolId);
        }
        return this.localNumInstances;
    }

    set numInstances(x: number) {
        if (this.localNumInstances !== 0 || x != -1) {
            this.localNumInstances += x;
            this.$emit('numInstancesChange', [this.rolId, this.localNumInstances]);
        }

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
    get dataVolumesList() {
        return this.$store.getters.getDeploymentRolVolumeList(this.deploymentId, this.rolId);
    }

    get rolReqConnectedTo(): Array<Channel> {
        return this.$store.getters.getDeploymentRolReqConnectedTo(this.deploymentId, this.rolId);
    }

    get rolProConnectedTo(): Array<Channel> {
        return this.$store.getters.getDeploymentRolProConnectedTo(this.deploymentId, this.rolId);
    }
    /**
     * Éste método sirve para escuchar el evento 'killInstanceChange' de las instáncias y transmitirlo
     * al deployment para que lo almacene en un estado temporal
     */
    handleKillInstanceChange(payload) {
        this.$emit('killInstanceChange', [this.rolId, ...payload]);

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