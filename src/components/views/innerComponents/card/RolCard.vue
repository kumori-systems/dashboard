<template>
    <div id="rol-card" class="card">
        <div class="card-header">
            <i class="state" v-bind:class="state" aria-hidden="true"></i>
            <span class="title">{{rolId}}</span>
            <span class="box">{{numInstances}}</span>
            <div>
                <div class="tile is-vertical">
                    <button class="button is-primary" v-on:click="numInstances = 1">
                        <i class="fa fa-angle-up"></i>
                    </button>
                    <button class="button is-primary is-outlined" v-on:click="numInstances = -1">
                        <i class="fa fa-angle-down"></i>
                    </button>
                </div>
            </div>
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
                        <div class="inner-content" v-for="(dataVolume, index) in dataVolumesList" v-bind:key="index">
                            <i class="fa fa-hdd-o" aria-hidden="true"></i> {{dataVolume}}
                        </div>
                    </p>
                    <div v-if="rolReqConnectedTo.length > 0 || rolProConnectedTo.length > 0">
                        <p>
                            Connected to:
                            <div class="left-padding">
                                <div v-for="(connection, index) in rolProConnectedTo" v-bind:key="index">
                                    <div v-for="(connectedTo, index) in connection[1].connectedTo" v-bind:key="index">
                                        {{connection[0]}} -> {{connectedTo.rolName || 'this'}} ({{connectedTo.channelName}})
                                    </div>
                                </div>
                                <div v-for="(connection, index) in rolReqConnectedTo" v-bind:key="index">
                                    <div v-for="(connectedTo, index) in connection[1].connectedTo" v-bind:key="index">
                                        {{connection[0]}} &#60;- {{connectedTo.rolName || 'this'}} ({{connectedTo.channelName}})
                                    </div>
                                </div>
                            </div>
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <div class="is-child is-pulled-right box rol-chart">
                    <chart v-bind:chartData="rolChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="150"></chart>
                </div>
            </div>
        </div>    
        <collapse>
            <collapse-item title="Instances">
                <instance-card v-for="instance in rolInstances" v-bind:key="instance.name" v-bind:deploymentId="deploymentId" v-bind:rolId="rolId" v-bind:instanceId="instance" v-on:killInstanceChange="handleKillInstanceChange" v-bind:clear="clear">
                </instance-card>
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
import Chart from '../chart/Chart.js';
import ChartOptions from '../chart/ChartOptions.js';
import { Deployment, Service } from '../../../../store/classes';
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
    chartOptions = ChartOptions;


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
            case Deployment.Rol.Instance.State.CONNECTED:
                return 'fa fa-check-circle';
            case Deployment.Rol.Instance.State.DISCONNECTED:
                return 'fa fa-exclamation-circle';
            case Deployment.Rol.Instance.State.ON_PROGRESS:
                return 'fa fa-exclamation-triangle';
            default:
                console.error('RolCard received a non-covered instance state');
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

    get rolReqConnectedTo(): Array<Service.Rol.Channel> {
        return this.$store.getters.getDeploymentRolReqConnectedTo(this.deploymentId, this.rolId);
    }

    get rolProConnectedTo(): Array<Service.Rol.Channel> {
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
<style lang="scss" scoped>
$color_green:#93c47d;
$color_yellow:#f5d164;
$color_red:#ff6666;
$icon_size: 40px;
$radius: 5px;
#rol-card {
    min-width: 80em;
}

button {
    height: 30px;
    width: 40px;
}

button i {
    font-size: 20px;
}

.rol-chart {
    width: 800px;
    height: 250;
    margin-right: 30px;
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

.state {
    padding: 10px;
}

.card {
    margin: 10px;
    padding: 2px;
    border-radius: $radius;
}

.card-header {
    border-radius: $radius;
}

.card-header .title {
    padding-top: 10px;
    padding-right: 5px;
}

.card-header .box {
    margin-bottom: 0px;
}

.card-body {
    padding: 10px;
}

a {
    padding-left: 10px;
}
</style>
