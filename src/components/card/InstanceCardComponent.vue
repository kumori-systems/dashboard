<template>
 <v-container fluid>
    <v-layout wrap>
      
      <!-- Instance name -->
      <v-flex ma-1 xs12 sm5 md5 lg5 xl3>
        <v-icon v-bind:id="state" v-if="state!=='unknown'">{{ state }}</v-icon>
        <v-progress-circular v-else indeterminate color="light-blue lighten-4"></v-progress-circular>
        <span class="title">{{ instance.cnid }}</span>
      </v-flex>

    </v-layout>
    <v-layout wrap>
      
      <!-- Instance arrangement -->
      <v-flex ma-1 xs12 sm6 md5 lg5 xl3>

        <v-layout>
          <span class="ma-1">MEM {{ instance.memory }}</span>
          <span class="ma-1">CPU {{ instance.cpu }}</span>
          <span class="ma-1">NET {{ instance.bandwidth }}</span>
        </v-layout>

        <!--
        <v-layout>
          <v-checkbox v-model="killInstance" label="kill instance" disabled/>
        </v-layout>
        -->

        <v-list three-line>
          <v-list-tile v-for="(vol, index) in instanceVolumes" v-bind:key="index" tag="div">

              <!-- A persistent volume -->
              <v-list-tile-content v-if="isPersistentVolumeInstance(vol)" >
                <v-list-tile-title>

                  <v-badge
                    overlap
                    bottom
                    color=null>

                    <v-icon v-if="persistentVolumes[vol._urn].size >= 90" slot="badge" color="error">error</v-icon>
                    <v-icon v-else-if="persistentVolumes[vol._urn].size >= 75" slot="badge" color="warning">warning</v-icon>

                    <v-icon color="grey lighten-1">storage</v-icon>

                  </v-badge>

                  {{ vol.id }}

                
                   
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-layout>
                  <v-flex xs12 class="ml-1">
                  <span>{{ persistentVolumes[vol._urn].filesystem }}</span>
                  <span>{{ persistentVolumes[vol._urn].size }} GB</span>
                  </v-flex>
                  
                  <v-flex xs6>
                  <span>Used: {{
                    volumeMetrics[vol.id]
                    && volumeMetrics[vol.id].length > 0?
                    volumeMetrics[vol.id][volumeMetrics[vol.id].length - 1].usage + '%'
                    : '..' }}
                  </span>
                  </v-flex>
                  
                  </v-layout>

                  
                </v-list-tile-sub-title>
              </v-list-tile-content>
              
              <v-list-tile-content v-else-if="isVolatileVolumeInstance(vol)">

                <!-- A volatile volume -->
                <v-list-tile-title>
                  
                  <v-badge
                    overlap
                    bottom
                    color=null>

                    <v-icon v-if="volatileVolumes[vol._urn].size >= 90" slot="badge" color="error">error</v-icon>
                    <v-icon v-else-if="volatileVolumes[vol._urn].size >= 75" slot="badge" color="warning">warning</v-icon>

                    <v-icon color="grey lighten-1">sd_storage</v-icon>
                  
                  </v-badge>

                {{ vol.id }}

                </v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-layout>
                  <v-flex xs6 class="ml-1">
                    <span>{{ volatileVolumes[vol._urn].filesystem }}</span>
                    <span>{{ volatileVolumes[vol._urn].size }} GB</span>
                  </v-flex>
                  <v-flex xs6>
                  <span>Used: {{
                    volumeMetrics[vol.id]
                    && volumeMetrics[vol.id].length > 0?
                    volumeMetrics[vol.id][volumeMetrics[vol.id].length - 1].usage + '%'
                    : '..' }}
                  </span>
                  </v-flex>
                  </v-layout>
                </v-list-tile-sub-title>
              </v-list-tile-content>
            
          </v-list-tile>
        </v-list>
      </v-flex>
      
      <!-- Applies spaces between components -->
      <v-spacer></v-spacer>

      <!-- Instance chart data -->
      <v-flex ma-1 xs12 sm6 md5 lg5 xl4>
        <chart-component v-bind:chartData="instanceChartData.data" v-bind:options="ChartOptions" v-bind:width="800" v-bind:height="600"></chart-component>
      </v-flex>

    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

// Components
import { utils } from "../../api";
import { ChartComponentOptions, ChartComponentUtils } from "../index";
import {
  Deployment,
  PersistentVolume,
  Volume,
  VolatileVolume
} from "../../store/stampstate/classes";
import SSGetters from "../../store/stampstate/getters";
import ChartComponent from "./../chart";


@VueClassComponent({
  name: "instance-card-component",
  props: {
    instance: { required: true },
    instanceMetrics: { required: true },
    volumeMetrics: { required: true },
    persistentVolumes: { required: true },
    volatileVolumes: { required: true }
  },
  components: {
    "chart-component": ChartComponent
  }
})
export default class InstanceCardComponent extends Vue {
  instance: Deployment.Role.Instance = this.instance;
  killInstance: boolean = false;
  instanceMetrics = this.instanceMetrics;
  persistentVolumes = this.persistentVolumes;
  volatileVolumes = this.volatileVolumes;
  volumeMetrics = this.volumeMetrics;

  /** Obtains the volumes associated to this instance. */
  get instanceVolumes(): any {
    let res: any = [];
    if (this.instance.resources) {
      for (let vol in this.instance.resources) {
        res.push(this.instance.resources[vol]);
      }
    }
    return res;
  }

  /**
   * This has been done to avoid using watchers. This is just a way of applying
   * some computation to format metrics in a way the chart understands them.
   */
  get onInstanceMetricsUpdate() {
    let res: {
      data: { [property: string]: number | string | object }[];
    } = {
      data: []
    };

    // Adding instance metrics
    for (let i in this.instanceMetrics) {
      res.data.push(this.instanceMetrics[i][this.instance.cnid]);
    }

    // Adding volume metrics
    let localVolumeInstances = this.instanceVolumes;
    for (let i in localVolumeInstances) {
      for (let m in this.volumeMetrics[localVolumeInstances[i].id]) {
        res.data.push({
          volumes: {
            [localVolumeInstances[i].id]: this.volumeMetrics[
              localVolumeInstances[i].id
            ][m]
          }
        });
      }
    }

    return res;
  }

  get instanceChartData() {
    return ChartComponentUtils.prepareInstanceData(
      this.onInstanceMetricsUpdate
    );
  }

  get state(): string {
    let res: string;
    switch (this.instance.state) {
      case Deployment.Role.Instance.STATE.CONNECTED:
        res = "check_circle";
        break;
      case Deployment.Role.Instance.STATE.DISCONNECTED:
        res = "error";
        break;
      default:
        res = "unknown";
    }
    return res;
  }

  get ChartOptions() {
    return ChartComponentOptions;
  }

  /**
   * Sends a notification to the superiour component to be aware of a change
   * in the value of kill instances
   */
  killInstanceChange() {
    this.$emit("killInstanceChange", [this.instance.cnid, this.killInstance]);
  }

  /**
   * Clears the temporal state
   */
  clearHandler() {
    this.killInstance = false;
  }

  isPersistentVolumeInstance(vol:Volume.Instance){
    return utils.isPersistentVolumeInstance(vol);
  }

  isVolatileVolumeInstance(vol: Volume.Instance){
    return utils.isVolatileVolumeInstance(vol);
  }

}
</script>
<style lang="scss" scoped>
$color_unkown: #bdbdbd;
$color_error: #ff5252;
$color_info: #2196f3;
$color_success: #4caf50;
$color_warning: #ffc107;
$icon_size: 30px;
$radius: 5px;

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