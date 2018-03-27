<template>
  <v-card v-bind:id="state">
  <v-container fluid>
    <v-layout wrap>
      
      <!-- Instance name -->
      <v-flex ma-1 xs12>
        <v-progress-circular v-if="state==='unknown'" indeterminate color="light-blue lighten-4"></v-progress-circular>
        <span class="title">{{ instance.cnid }}</span>
      </v-flex>

    </v-layout>
    <v-layout wrap>
      
      <!-- Instance arrangement -->
      <v-flex ma-1 xs12>

        <strong>MEM</strong> {{ instance.memory }}
        <strong>CPU</strong> {{ instance.cpu }}
        <strong>NET</strong> {{ instance.bandwidth }}

      </v-flex>
      <v-flex ma-1 xs12>
        
        <v-list three-line v-bind:id="state" class="mybackground pa-0">
          <v-list-tile v-for="(vol, index) in instanceVolumes" v-bind:key="index" tag="div">
              <!-- A persistent volume -->
              <v-list-tile-content v-if="vol instanceof PersistentVolume.Instance" >
                <v-list-tile-title>
                  <v-icon class="indigo--text">storage</v-icon> {{ vol.id }}
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
              
              <!-- A volatile volume -->
              <v-list-tile-content v-else-if="vol instanceof VolatileVolume.Instance">

                <v-list-tile-title>
                  <v-icon class="orange--text text--lighten-2">storage</v-icon> {{ vol.id }}
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

    </v-layout>
  </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

// Components
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
    clear: { required: true, type: Boolean }, // Used to clean 'kill instances' when changes are canceled
    instanceMetrics: { required: true }
  },
  components: {
    "chart-component": ChartComponent
  }
})
export default class InstanceCardComponent extends Vue {
  instance: Deployment.Role.Instance = this.instance;
  killInstance: boolean = false;
  chartOptions = ChartComponentOptions;
  instanceMetrics = this.instanceMetrics;
  VolatileVolume = VolatileVolume;
  PersistentVolume = PersistentVolume;

  mounted() {
    this.$watch("clear", function(value) {
      if (value === true) {
        this.killInstance = false;
      }
    });
  }

  get persistentVolumes(): { [volURN: string]: PersistentVolume } {
    return ((<SSGetters>this.$store.getters).persistentVolumes as any) as {
      [volURN: string]: PersistentVolume;
    };
  }

  get volatileVolumes(): { [volURN: string]: VolatileVolume } {
    return ((<SSGetters>this.$store.getters).volatileVolumes as any) as {
      [volURN: string]: VolatileVolume;
    };
  }

  get instanceVolumes(): any {
    let res: any = [];
    if (this.instance.resources) {
      for (let vol in this.instance.resources) {
        res.push(this.instance.resources[vol]);
      }
    }
    return res;
  }

  get volumeMetrics(): {
    [volumeInstanceId: string]: {
      [property: string]: number | string;
    }[];
  } {
    return this.$store.getters.volumeMetrics;
  }

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
        res = "good";
        break;
      case Deployment.Role.Instance.STATE.DISCONNECTED:
        res = "error";
        break;
      default:
        res = "unknown";
    }
    return res;
  }

  /**
   * Sends a notification to the superiour component to be aware of a change
   * in the value of kill instances
   */
  killInstanceChange() {
    this.$emit("killInstanceChange", [this.instance.cnid, this.killInstance]);
  }
}
</script>
<style lang="scss" scoped>
$color_green: #81c784;
$color_yellow: #fff176;
$color_red: #e57373ed;
$color_grey: #e0e0e0;
$icon_size: 30px;
$radius: 5px;

#good {
  background: $color_green;
}

#warning {
  background: $color_yellow;
}

#error {
  background: $color_red;
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