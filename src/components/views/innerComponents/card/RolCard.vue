<template>
    <div id="rol-card" class="card">
        <div class="card-header">
            <i class="state" v-bind:class="state" aria-hidden="true"></i>
            <span class="title">{{ rol.id }}</span>
            <span class="box is-unselectable">{{ rol.instanceNumber }}</span>
            <div>
                <div class="tile is-vertical">
                    <button class="button is-primary" v-on:click="localNumInstances += 1" disabled>
                        <i class="fa fa-angle-up"></i>
                    </button>
                    <button class="button is-primary is-outlined" v-on:click="localNumInstances += -1" disabled>
                        <i class="fa fa-angle-down"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="card-body tile inner-content">
            <div class="tile">
                <div class="inner-content">
                    <p v-if="component">Component: {{ component.uri }}</p>
                    <p v-else>Component: retrieving info..</p>
                    <p v-if="component">Runtime: {{ component.runtime }}</p>
                    <p v-else>Runtime: retrieving info..</p>
                    <p>
                        {{ rol.memory }} MEM {{ rol.cpu }} CPU {{ rol.bandwidth }} NET
                    </p>
                    <!--
                      Volumes not correctly working
                    <p v-if="service.roles[rol.id].data.length>0">
                        Data Volumes:
                        <div class="inner-content" v-for="(dataVolume, index) in dataVolumesList" v-bind:key="index">
                            <i class="fa fa-hdd-o" aria-hidden="true"></i> {{ dataVolume }}
                        </div>
                    </p>
                    -->
                    <div>
                        <div class="left-padding">
                          <div v-if="service">
                            Channels: {{ rol.id | roleChannels(service.connectors) }}
                            <!--
                            <div v-for="(connection, connectionIndex) in rolConnections" v-bind:key="connectionIndex">
                              {{ connection.provided }} -> {{ connection.depended }}
                            </div>
                            -->
                          </div>
                          <div v-else>
                            Channels: retrieving info..
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
                <instance-card v-for="(instanceContent, instanceIndex) in rol.instanceList" v-bind:key="instanceIndex" v-bind:instance="instanceContent"
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
    rol: { required: true },
    service: { required: true },
    clear: { required: true, type: Boolean }, // Se utiliza para limpiar los cambios cuando se cancelan
    rolMetrics: { required: true } // Role and Instance metrics
  },
  components: {
    collapse: Collapse,
    "collapse-item": CollapseItem,
    "instance-card": InstanceCard,
    chart: Chart
  },
  filters:{
    roleChannels: function(rolId:string, connectors:Service.Connector[]) {
      if(connectors)
      return connectors.filter((conn)=>{
        return conn.depended.find((dep)=>{return dep.role === rolId;})
        ||conn.provided.find((pro)=>{return pro.role === rolId;})
      })
      return '';
    },
  }
})
export default class RolCard extends Vue {
  rol: Deployment.Rol = this.rol;
  localNumInstances: number = -1;
  chartOptions = ChartOptions;
  rolMetrics = this.rolMetrics;
  service: Service = this.service;

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
      res.data.push(this.rolMetrics[i][this.rol.id].data);
      res.instances.push(this.rolMetrics[i][this.rol.id].instances);
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
    switch (this.rol.state) {
      case Deployment.Rol.State.OK:
        res += "fa-check-circle";
      case Deployment.Rol.State.DANGER:
        res += "fa-exclamation-circle";
      case Deployment.Rol.State.WARNING:
        res += "fa-exclamation-triangle";
      default:
        res += "fa-question-circle";
    }
    return res;
  }
  get component() {
    let res;
    if (this.service) {
      res = this.$store.getters.component(
        this.service.roles[this.rol.id].component
      );
      if (!res) {
        this.$store.dispatch("getElementInfo", {
          uri: this.service.roles[this.rol.id].component
        });
      }
    }
    return res;
  }

  /**
   * Éste método sirve para escuchar el evento 'killInstanceChange' de las instáncias y transmitirlo
   * al deployment para que lo almacene en un estado temporal
  */
  handleKillInstanceChange(payload) {
    this.$emit("killInstanceChange", [this.rol.id, ...payload]);
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