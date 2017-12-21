<template>
  <v-card>
    <v-card-title primary-title class="grey lighten-3">

      <!-- Role state -->
      <v-icon v-bind:id="state">{{ state }}</v-icon>

      <!-- Role name -->
      <span class="headline">Role: {{ role.name }}</span>
      
      
      <v-flex xs1></v-flex>
      Instances
      <!-- Role num instances -->         
      <v-btn-toggle class="grey lighten-3">
        <v-btn flat v-on:click="lessInstances">
          <v-icon>remove</v-icon>
        </v-btn>
      </v-btn-toggle>
      {{ localNumInstances }}
      <v-btn-toggle class="grey lighten-3">
        <v-btn flat v-on:click="moreInstances">
          <v-icon>add</v-icon>
        </v-btn>
      </v-btn-toggle>

      </v-flex>
      
      
    </v-card-title>
  
    <v-container fluid class="grey lighten-3">

      <!-- Role info -->
      <v-layout wrap>
       <v-flex ma-1 xs12 sm6 md5 lg5 xl3>
          
          <!-- Component uri -->
          <v-layout>
            <v-flex ma-1 xs12>
              <p v-if="!component">
                <span class="subheading">Component:</span> retrieving info..</p>
              <p v-else><span class="subheading">Component:</span> {{ component._uri }}</p>
            </v-flex>
          </v-layout>

          <!-- Component runtime -->
          <v-layout>
            <v-flex ma-1 xs12>
              <p v-if="!component"><span class="subheading">Runtime:</span> retrieving info..</p>
              <p v-else><span class="subheading">Runtime:</span> {{ component.runtime }}</p>
            </v-flex>
          </v-layout>
        
          <!-- Role arrangement -->
          <v-layout>
            <v-flex ma-1 xs12>
              <p>{{ role.memory }} <span class="subheading">MEM</span> {{ role.cpu }} <span class="subheading">CPU</span> {{ role.bandwidth }} <span class="subheading">NET</span></p>
            </v-flex>
          </v-layout>
        
          <!-- Role channels -->
          <v-layout>
            <v-flex ma-1 xs12>
              <span class="subheading">Channels:</span>
              <div>{{ role.id | roleChannels(service) }}</div>
            </v-flex>
          </v-layout>

        </v-flex>

        <v-spacer></v-spacer>
        
        <!-- Role chart -->
        <v-flex ma-1 xs12 sm6 md5 lg5 xl4>
          <role-chart-component class="role-chart" v-bind:chartData="rolChartData" v-bind:options="chartOptions"
            v-bind:width="800" v-bind:height="400"></role-chart-component>
        </v-flex>

      </v-layout>
      
      <!-- Role instances -->
      <v-layout wrap v-if="service">
        <v-flex ma-1 xs12 sm12 md12 lg12 xl12>
          <v-expansion-panel expand>
            <v-expansion-panel-content>
              <div slot="header">Instances</div>
                <instance-card-component v-for="(instanceContent, instanceId) in role.instances" v-bind:key="instanceId" v-bind:instance="instanceContent"
                  v-bind:instanceMetrics="instanceMetrics" v-on:killInstanceChange="handleKillInstanceChange" v-bind:clear="onClearHandler">
                </instance-card-component>
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

import { ChartComponentOptions, ChartComponentUtils } from "../index";
import {
  Connector,
  Deployment,
  Service,
  Channel,
  Metric
} from "../../store/stampstate/classes";

/* Theese components are loaded separatedly to avoid recursivity problems. */
import InstanceCardComponent from "./InstanceCardComponent.vue";
import ChartComponent from "./../chart";

@VueClassComponent({
  name: "role-card-component",
  components: {
    "role-chart-component": ChartComponent,
    "instance-card-component": InstanceCardComponent
  },
  props: {
    role: { required: true },
    service: { required: true },
    /**  Clear changes when user cancels. */
    clear: { required: true, type: Boolean },
    /** Role and instance metrics. */
    roleMetrics: { required: true }
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
  localNumInstances: number = this.role.actualInstances;
  roleMetrics = this.roleMetrics;
  service: Service = this.service;
  chartOptions = ChartComponentOptions;

  get onClearHandler() {
    if (this.$props.clear) {
      this.localNumInstances = this.role.actualInstances;
      this.$emit("clearedRol");
    }
    return this.$props.clear;
  }

  get onRoleMetricsUpdate() {
    let res: {
      data: Metric[];
      instances: { [instanceId: string]: Metric }[];
    } = {
      data: [],
      instances: []
    };

    for (let i in this.roleMetrics) {
      res.data.push(this.roleMetrics[i][this.role.name].data);
      res.instances.push(this.roleMetrics[i][this.role.name].instances);
    }
    return res;
  }

  get rolChartData() {
    return ChartComponentUtils.prepareData(this.onRoleMetricsUpdate.data);
  }

  get instanceMetrics() {
    return this.onRoleMetricsUpdate.instances;
  }

  get state(): string {
    let res: string;
    switch (this.role.state) {
      case Deployment.Role.STATE.SUCCESS:
        res = "check_circle";
        break;
      case Deployment.Role.STATE.DANGER:
        res = "error";
        break;
      case Deployment.Role.STATE.WARNING:
        res = "warning";
        break;
      default:
        res = "help";
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

  lessInstances() {
    if (this.localNumInstances > 0) {
      this.localNumInstances--;
      this.$emit("numInstancesChange", [
        this.role.name,
        this.localNumInstances
      ]);
    }
  }

  moreInstances() {
    this.localNumInstances++;
    this.$emit("numInstancesChange", [this.role.name, this.localNumInstances]);
  }
}
</script>
<style lang="scss" scoped>
$color_green: #81c784;
$color_yellow: #fff176;
$color_red: #e57373ed;
$color_grey: #e0e0e0;
$icon_size: 60px;
#check_circle {
  color: $color_green;
  font-size: $icon_size;
}

#warning {
  color: $color_yellow;
  font-size: $icon_size;
}

#error {
  color: $color_red;
  font-size: $icon_size;
}

#help {
  color: $color_grey;
  font-size: $icon_size;
}
</style>