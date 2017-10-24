<template>
    <div id="rol-card" class="card">
        <div class="card-header">
            <i class="state" v-bind:class="state" aria-hidden="true"></i>
            <span class="title">{{ rolId }}</span>
            <span class="box is-unselectable">{{ numInstances }}</span>
            <div>
                <div class="tile is-vertical">
                    <button class="button is-primary" v-on:click="numInstances = 1" disabled>
                        <i class="fa fa-angle-up"></i>
                    </button>
                    <button class="button is-primary is-outlined" v-on:click="numInstances = -1" disabled>
                        <i class="fa fa-angle-down"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body tile inner-content">
            <div class="tile">
                <div class="inner-content">
                    <p>Component: {{ componentURI }}</p>
                    <p>Runtime: {{ rolRuntime }}</p>
                    <p>
                        {{ memNumber }} MEM {{ cpuNumber }} CPU {{ netNumber }} NET
                    </p>
                    <p v-if="dataVolumesList.length>0">
                        Data Volumes:
                        <div class="inner-content" v-for="(dataVolume, index) in dataVolumesList" v-bind:key="index">
                            <i class="fa fa-hdd-o" aria-hidden="true"></i> {{ dataVolume }}
                        </div>
                    </p>
                    <div>
                        <div class="left-padding">
                            Channels connected to 

                            <div v-for="(connection, connectionIndex) in rolConnections" v-bind:key="connectionIndex">
                              {{ connection.provided }} -> {{ connection.depended }}
                            </div>
                           
                        </div>
                        
                    </div>
                </div>
            </div>
            <div>
                <div class="is-child is-pulled-right box rol-chart">
                    <chart v-bind:chartData="rolChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="160"></chart>
                </div>
            </div>
        </div>
        <collapse>
            <collapse-item title="Instances">
                <instance-card v-for="instance in rolInstances" v-bind:key="instance.name" v-bind:deploymentId="deploymentId" v-bind:rolId="rolId" v-bind:instanceId="instance"
                v-bind:instanceMetrics="instanceMetrics" v-on:killInstanceChange="handleKillInstanceChange" v-bind:clear="clear">
                </instance-card>
            </collapse-item>
        </collapse>
        <div class="card-footer" v-if="false"></div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Collapse, Item as CollapseItem } from "vue-bulma-collapse";
import InstanceCard from "./InstanceCard.vue";
import Chart from "../chart/Chart.js";
import { prepareData } from "../chart/Utils.js";
import ChartOptions from "../chart/ChartOptions.js";
import {
  Deployment,
  Service,
  Channel,
  Metric
} from "../../../../store/classes";

@Component({
  name: "rol-card",
  props: {
    deploymentId: { required: true, type: String },
    rolId: { required: true, type: String },
    clear: { required: true, type: Boolean }, // Se utiliza para limpiar los cambios cuando se cancelan
    rolMetrics: { required: true } // Role and Instance metrics
  },
  components: {
    collapse: Collapse,
    "collapse-item": CollapseItem,
    "instance-card": InstanceCard,
    chart: Chart
  }
})
export default class Card extends Vue {
  deploymentId: string = this.deploymentId;
  rolId: string = this.rolId;
  localNumInstances: number = -1;
  chartOptions = ChartOptions;
  rolMetrics = this.rolMetrics;

  mounted() {
    this.$watch("clear", function(value) {
      if (value === true) {
        // Limpiamos el estado temporal
        this.localNumInstances = -1;
        this.$emit("clearedRol");
      }
    });
  }

  get onRolMetricsUpdate() {
    let res: {
      data: Metric[];
      instances: { [instanceId: string]: Metric }[];
    } = {
      data: [],
      instances: []
    };

    for (let i in this.rolMetrics) {
      res.data.push(this.rolMetrics[i][this.rolId].data);
      res.instances.push(this.rolMetrics[i][this.rolId].instances);
    }
    return res;
  }
  get rolChartData() {
    return prepareData(this.onRolMetricsUpdate.data);
  }
  get instanceMetrics() {
    return this.onRolMetricsUpdate.instances;
  }

  get state(): string {
    let res: string = "fa ";
    switch (this.$store.getters.getDeploymentRolState(
      this.deploymentId,
      this.rolId
    )) {
      case Deployment.State.OK:
        res += "fa-check-circle";
      case Deployment.State.DANGER:
        res += "fa-exclamation-circle";
      case Deployment.State.WARNING:
        res += "fa-exclamation-triangle";
      default:
        res += "fa-question-circle";
    }
    return res;
  }
  get numInstances(): number {
    // Miramos el número de instáncias local. ¿Está inicializado?
    if (this.localNumInstances < 0) {
      this.localNumInstances = this.$store.getters.getDeploymentRolNumInstances(
        this.deploymentId,
        this.rolId
      );
    }
    return this.localNumInstances;
  }

  set numInstances(x: number) {
    if (this.localNumInstances !== 0 || x != -1) {
      this.localNumInstances += x;
      this.$emit("numInstancesChange", [this.rolId, this.localNumInstances]);
    }
  }

  get componentURI() {
    let cURI = this.$store.getters.getDeploymentRolComponentURI(
      this.deploymentId,
      this.rolId
    );
    if (
      cURI !== null &&
      this.$store.getters.getComponentInfo(cURI) === undefined
    )
      // If we've got not info for this component we ask for it
      this.$store.dispatch("getElementInfo", { uri: cURI });
    return cURI;
  }
  get rolRuntime() {
    return this.$store.getters.getDeploymentRolRuntime(
      this.deploymentId,
      this.rolId
    );
  }

  get rolInstances() {
    return this.$store.getters.getDeploymentRolInstances(
      this.deploymentId,
      this.rolId
    );
  }

  get memNumber(): number {
    return this.$store.getters.getDeploymentRolMemNumber(
      this.deploymentId,
      this.rolId
    );
  }

  get cpuNumber(): number {
    return this.$store.getters.getDeploymentRolCPUNumber(
      this.deploymentId,
      this.rolId
    );
  }

  get netNumber(): number {
    return this.$store.getters.getDeploymentRolNetNumber(
      this.deploymentId,
      this.rolId
    );
  }
  get dataVolumesList() {
    return this.$store.getters.getDeploymentRolVolumeList(
      this.deploymentId,
      this.rolId
    );
  }

  get rolConnections(): Array<Service.Connector> {
    return this.$store.getters.getDeploymentRolConnections(
      this.deploymentId,
      this.rolId
    );
  }
  /**
     * Éste método sirve para escuchar el evento 'killInstanceChange' de las instáncias y transmitirlo
     * al deployment para que lo almacene en un estado temporal
     */
  handleKillInstanceChange(payload) {
    this.$emit("killInstanceChange", [this.rolId, ...payload]);
  }
}
</script>
<style lang="scss" scoped>
$color_green: #93c47d;
$color_yellow: #f5d164;
$color_red: #ff6666;
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