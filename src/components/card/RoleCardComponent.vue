<template>
  <v-card>
    <v-card-title primary-title class="headline">
      {{ role.name }}
    </v-card-title>
    <v-container fluid>

      <!-- Component uri -->
      <v-layout row wrap>
        <v-flex ma-1 xs12 sm5 md5 lg5 xl3>
          <p v-if="!component">Component: retrieving info..</p>
          <p v-else>Component: {{ component._uri }}</p>

          <!-- Component runtime -->
          <p v-if="!component">Runtime: retrieving info..</p>
          <p v-else>Runtime: {{ component.runtime }}</p>
        
          <!-- Role arrangement -->
          <p>{{ role.memory }} MEM {{ role.cpu }} CPU {{ role.bandwidth }} NET</p>
        
          <!-- Role channels -->        
          Channels: {{ role.id | roleChannels(service) }}
          <!--
          <div v-for="(connection, connectionIndex) in rolConnections" v-bind:key="connectionIndex">
            {{ connection.provided }} -> {{ connection.depended }}
          </div>
          -->
        </v-flex>
        <!-- Role chart -->
       <v-flex ma-1 xs12 sm6 md5 lg5 xl4>  
          <role-chart-component v-bind:chartData="rolChartData" v-bind:options="chartOptions"
          v-bind:width="600" v-bind:height="160"></role-chart-component>
        </v-flex>
      </v-layout>
      

      <!-- Role instances -->
      <v-layout row wrap v-if="service">
        <v-flex ma-1 xs12 sm12 md12 lg12 xl12>
          <v-expansion-panel expand>
            <v-expansion-panel-content v-for="(instance, instanceId)
            in role.instances" v-bind:key="instanceId">
              <div slot="header">Instances</div>
              <v-container fluid>
                <!--
                <i v-bind:class="state" aria-hidden="true"></i>
                  <span class="title">{{ instance.id }}</span>
                <div>{{ instance.memory }} MEM</div>
                <div>{{ instance.cpu }} CPU</div>
                <div>{{ instance.bandwidth }} NET</div>
                
                  <checkbox-input v-bind:disabled="true" id="killinstance" v-model="killInstance" v-on:change="killInstanceChange()"> Kill instance</checkbox-input>
                
                <chart-component v-bind:chartData="instanceChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="160"></chart-component>
               -->
                <instance-card-component v-for="(instanceContent, instanceId) in role.instances" v-bind:key="instanceId" v-bind:instance="instanceContent"
                  v-bind:instanceMetrics="instanceMetrics" v-on:killInstanceChange="handleKillInstanceChange" v-bind:clear="clear">
                </instance-card-component>
                
              </v-container>              
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>
      </v-layout>      
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import {
  InstanceCardComponent,
  ChartComponentOptions,
  ChartComponentUtils
} from "../index";
import {
  Connector,
  Deployment,
  Service,
  Channel,
  Metric
} from "../../store/stampstate/classes";

import { Line, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

/**
 * A change in Vue makes this object not rendered if it's imported. Warning:
 * Unknown custom element: <my-component> - did you register the component
 * correctly? For recursive components, make sure to provide the "name" option.
 * (found in root instance)
 */
const ChartComponent = Vue.component("chart-component", {
  name: "chart-component",
  extends: Line,
  mixins: [reactiveProp],
  props: ["options"],
  mounted() {
    (<any>this).renderChart((<any>this).chartData, (<any>this).options);
  }
});

@VueClassComponent({
  name: "role-card-component",
  components: {
    "role-chart-component": ChartComponent,
    InstanceCardComponent
  },
  props: {
    role: { required: true },
    service: { required: true },
    clear: { required: true, type: Boolean }, // Se utiliza para limpiar los cambios cuando se cancelan
    roleMetrics: { required: true } // Role and Instance metrics
  },
  filters: {
    roleChannels: function(rolId: string, service: Service) {
      if (service && service.connectors)
        return service.connectors.filter(conn => {
          return (
            conn.depended.find(dep => {
              return dep.role === rolId;
            }) ||
            conn.provided.find(pro => {
              return pro.role === rolId;
            })
          );
        });
      return "";
    }
  }
})
export default class RoleCardComponent extends Vue {
  role: Deployment.Role = this.role;
  localNumInstances: number = -1;
  chartOptions = ChartComponentOptions;
  chartUtils = ChartComponentUtils;
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

  get onRoleMetricsUpdate() {
    let res: {
      data: Metric[];
      instances: { [instanceId: string]: Metric }[];
    } = {
      data: [],
      instances: []
    };

    for (let i in this.rolMetrics) {
      res.data.push(this.rolMetrics[i][this.role.name].data);
      res.instances.push(this.rolMetrics[i][this.role.name].instances);
    }
    return res;
  }


  get rolChartData() {
    return this.chartUtils.prepareData(this.onRoleMetricsUpdate.data);
  }

  get instanceMetrics() {
    return this.onRoleMetricsUpdate.instances;
  }

  get state(): string {
    let res: string = "fa ";
    switch (this.role.state) {
      case Deployment.Role.STATE.SUCCESS:
        res += "fa-check-circle";
      case Deployment.Role.STATE.DANGER:
        res += "fa-exclamation-circle";
      case Deployment.Role.STATE.WARNING:
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
        this.service.roles[this.role.name].component
      );
      if (!res) {
        this.$store.dispatch(
          "getElementInfo",
          this.service.roles[this.role.name].component
        );
      }
    }
    return res;
  }

  /**
   * Éste método sirve para escuchar el evento 'killInstanceChange' de las instáncias y transmitirlo
   * al deployment para que lo almacene en un estado temporal
  */
  handleKillInstanceChange(payload) {
    this.$emit("killInstanceChange", [this.role.name, ...payload]);
  }
}
</script>
<style lang="scss" scoped>
.rol-chart {
  width: 800px;
  height: 250;
  margin-right: 30px;
}
</style>