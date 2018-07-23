<!--
  This component represents a role inside the detailed deployment view.
-->
<template>
  <v-card light>
    <v-card-title primary-title class="grey lighten-3">

      <!-- Role state -->
      <v-icon v-bind:id="state"  v-if="state!=='unknown'">{{ state }}</v-icon>
      <v-progress-circular v-else indeterminate color="light-blue lighten-4"></v-progress-circular>

      <!-- Role name -->
      <span class="headline">Role: {{ role.name }}</span>

      <!-- Gives space between elements -->
      <v-flex xs1></v-flex>

      <!-- Num instances selector -->
      <template>

        <span>Instances&nbsp;</span>
        
        <v-btn
          v-if="editing"
          flat
          icon
          class="pa-0 ma-0 black--text"
          v-on:click="lessInstances">

          <v-icon >remove</v-icon>

        </v-btn>

        {{ localNumInstances }}

        <v-btn
          v-if="editing"
          flat
          icon
          class="pa-0 ma-0 blue--text text--lighten-1"
          v-on:click="moreInstances">

          <v-icon>add</v-icon>

        </v-btn>

        of {{maxNumInstances}}

      </template>

    </v-card-title>
  
    <v-container
      fluid
      class="grey lighten-3">

      <!-- Role info -->
      <v-layout wrap>

        <v-flex xs12 sm6 md5 lg5 xl3>

          <!-- Component urn -->
          <v-layout v-if="!component">
            <strong>Component:</strong>&nbsp;retrieving info..
          </v-layout>
          <v-layout v-else>
            <strong>Component:</strong>&nbsp;{{ component._urn }}
          </v-layout>

          <!-- Component runtime -->
          <v-layout v-if="!component">
            <strong>Runtime:</strong>&nbsp;retrieving info..
          </v-layout>
          <v-layout v-else>
            <strong>Runtime:</strong>&nbsp;{{ component.runtime }}
          </v-layout>

          <!-- Role channels -->
          <v-layout>
            <v-flex xs12>
              <strong>Channels:</strong>
              <v-layout v-for="(channel, index) in roleChannels(service, role.name)" v-bind:key="index">
                <div v-for="(pro, index) in channel.provided" v-bind:key="index">
                  <v-chip color="lime darken-1 white--text" @input="pro">
                    <span v-if="pro.role">{{ pro.role }} ~</span>
                    <span v-else>Service ~</span>
                    <span v-if="pro.endpoint">&nbsp;{{ pro.endpoint }}</span>
                  </v-chip>
                </div>
                <div v-for="(dep, index) in channel.depended" v-bind:key="index">
                  <v-chip color="light-blue lighten-1 white--text" @input="dep">
                    <span v-if="dep.role">{{ dep.role }} ~</span>
                    <span v-else>Service ~</span>
                    <span v-if="dep.endpoint">&nbsp;{{ dep.endpoint }}</span>
                  </v-chip>
                </div>
              </v-layout>
            </v-flex>
          </v-layout>

          <!-- Role arrangement -->
          <v-layout>
            <span class="ma-1"><strong>MEM</strong> {{ role.memory }}</span>
            <span class="ma-1"><strong>CPU</strong> {{ role.cpu }}</span>
            <span class="ma-1"><strong>NET</strong> {{ role.bandwidth }}</span>
          </v-layout>

        </v-flex>

        <!-- Applies space between elements -->
        <v-spacer></v-spacer>

        <!-- Role chart -->
        <v-flex xs12 sm6 md5 lg5 xl4>
          <role-chart-component
            class="role-chart"
            v-bind:chartData="roleChartData.data"
            v-bind:options="chartOptions"
            v-bind:width="800"
            v-bind:height="600">
          </role-chart-component>
        </v-flex>

      </v-layout>

      <!-- Role instances -->
       <v-layout wrap v-if="service">
        <v-flex xs12 sm12 md12 lg12 xl12>
          <v-expansion-panel expand>
            <v-expansion-panel-content>

              <div slot="header">Instances</div>

              <instance-card-component
                v-for="(instanceContent, instanceId) in role.instances"
                v-bind:key="instanceId"
                v-bind:instance="instanceContent"
                v-bind:instanceMetrics="roleChartData.instances"
                v-bind:volumeMetrics="volumeMetrics"
                v-bind:persistentVolumes="persistentVolumes"
                v-bind:volatileVolumes="volatileVolumes"
                v-on:killInstanceChange="handleKillInstanceChange"/>

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
  Channel
} from "../../store/stampstate/classes";

/*
  Theese components are loaded separatedly to avoid recursivity troubles. Maybe
  solved in a newer vue version.
*/
import InstanceCardComponent from "./InstanceCardComponent.vue";
import ChartComponent from "./../chart";
import { isNumber } from "util";

/*
  This is a decorator and it's used because typescript doesn't implement all
  required properties of a vue component.

  All properties of the typescript class will be compiled as vue data.
  All methods inside the class will be compiled as computed properties (get, set
  methods)
  or common methods (non-get, non-set).
  There are special methods like mounted, created or destroy which are part of
  the vue lifecycle and will be rendered as special lifecycle methods.
*/
@VueClassComponent({
  name: "role-card-component",
  components: {
    "role-chart-component": ChartComponent,
    "instance-card-component": InstanceCardComponent
  },
  props: {
    role: { required: true },
    service: { required: true },
    /** Role and instance metrics. */
    roleMetrics: { required: true },
    volumeMetrics: { required: true },
    persistentVolumes: { required: true },
    volatileVolumes: { required: true },
    editing: { required: true }
  }
})
export default class RoleCardComponent extends Vue {
  
  /** Role represented in this component. */
  role: Deployment.Role = this.role;

  /** Service of the deployment. */
  service: Service = this.service;

  /** Role metrics. */
  roleMetrics = this.roleMetrics;

  /** Metrics of the volumes of this role. */
  volumeMetrics = this.volumeMetrics;

  /** Persistent volumes of this role. */
  persistentVolumes = this.persistentVolumes;

  /** Volatile volumes of this role. */
  volatileVolumes = this.volatileVolumes;

  /** Marks if the user is in edit mode. */
  editing: boolean = this.editing;

  /** Private way of storing the number of instances. */
  _localNumInstances: number = 1;

  /** Property which stores all watchers associated to this component. */
  unwatch: Function[] = [];

  /** Event cicle mounted. Stores all watchers. */
  mounted() {
    this.unwatch.push(
      // Watches for editing changes
      this.$watch("editing", val => {
        if (val) {
          this.localNumInstances = this.role.actualInstances;
        }
      })
    );
  }

  /** Event cicle before destroy. Removes all watchers. */
  beforeDestroy() {
    // Removes all watchers
    for (let i in this.unwatch) {
      this.unwatch[i]();
    }
  }

  /**
   * Obtains the number of instances. Depending if the edit mode is on, the data
   * will be obtained from different places.
   */
  get localNumInstances(): number {
    let res: number = this.role.actualInstances;
    if (this.editing) {
      res = (<any>this.$data)._localNumInstances;
    }
    return res;
  }

  /**
   * Sets the instances. This will only be called from edit mode.
   */
  set localNumInstances(val: number) {
    (<any>this.$data)._localNumInstances = val;
  }

  /** Obtains the maximum number of instances. */
  get maxNumInstances(): number {
    return this.role.maxInstances;
  }

  /**
   * This is a way to avoid a watcher on role metrics. It will make
   * some computations before giving the data to the chart component.
   */
  get onRoleMetricsUpdate() {
    let res: {
      data: { [property: string]: number | string }[];
      instances: {
        [instanceId: string]: { [property: string]: number | string };
      }[];
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

  /**
   * Passes the data to the chart component.
   */
  get roleChartData() {
    return ChartComponentUtils.prepareRoleData(this.onRoleMetricsUpdate);
  }

  /**
   * Obtains the state of the role.
   */
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
        res = "unknown";
    }
    return res;
  }

  /**
   * Obtains the component of the role
   */
  get component() {
    let res;
    if (this.service) {
      res = this.$store.getters.components[
        this.service.roles[this.role.name].component
      ];
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
   * This is the only way of passing a vue-external imported code to
   * vue-internal code.
   */
  get chartOptions() {
    return ChartComponentOptions;
  }

  /**
   * Obtains the channels related to this code.
   */
  get roleChannels() {
    return (service: Service, roleId: string) => {
      let res: Connector[] = [];
      if (roleId && service && service.connectors) {
        res = service.connectors.filter(conn => {
          return (
            conn.depended.find(dep => {
              return dep.role === roleId;
            }) ||
            conn.provided.find(pro => {
              return pro.role === roleId;
            })
          );
        });
      }
      return res;
    };
  }

  /**
   * Handles a change in kill instances on children components.
   */
  handleKillInstanceChange(payload) {
    this.$emit("killInstanceChange", [this.role.name, ...payload]);
  }

  /**
   * Removes one instance from the local instances counter. Only in edit mode.
   */
  lessInstances() {
    if (this.localNumInstances > this.role.minInstances) {
      this.localNumInstances--;
      this.$emit("numInstancesChange", [
        this.role.name,
        this.localNumInstances
      ]);
    }
  }

  /**
   * Adds one instance to the local instances counter. Only in edit mode.
   */
  moreInstances() {
    if (this.localNumInstances < this.role.maxInstances) {
      this.localNumInstances++;
      this.$emit("numInstancesChange", [
        this.role.name,
        this.localNumInstances
      ]);
    }
  }
}
</script>
<style lang="scss" scoped>
$color_unkown: #bdbdbd;
$color_error: #ff5252;
$color_info: #2196f3;
$color_success: #4caf50;
$color_warning: #ffc107;
$icon_size: 40px;

#check_circle {
  color: $color_success;
  font-size: $icon_size;
}

#warning {
  color: $color_warning;
  font-size: $icon_size;
}

#error {
  color: $color_error;
  font-size: $icon_size;
}

#unknown {
  font-size: $icon_size;
}

#btn__content::before {
  padding: 0px;
  margin: 0px;
}
</style>