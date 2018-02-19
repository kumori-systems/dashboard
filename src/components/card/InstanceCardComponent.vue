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
          <v-flex ma-1 xs2>{{ instance.memory }} MEM</v-flex>
          <v-flex ma-1 xs2>{{ instance.cpu }} CPU</v-flex>
          <v-flex ma-1 xs2>{{ instance.bandwidth }} NET</v-flex>
        </v-layout>

        <v-layout>
          <v-checkbox label="kill instance" v-model="killInstance" disabled></v-checkbox>
        </v-layout>

        <v-list-tile v-for="(vol, index) in instanceVolumes" v-bind:key="index" tag="div">

          <v-list-tile-title>
            <div>
              <span dark slot="activator"><v-icon>storage</v-icon> {{ vol.id }}</span>
              <div>Total size: {{ volumes[vol.uri].size }} GB</div>
              <div>Usage: {{
                instanceMetrics.length > 0
                && instanceMetrics[instanceMetrics.length - 1 ][instance.cnid]
                && instanceMetrics[instanceMetrics.length - 1 ][instance.cnid].volumes?
                instanceMetrics[instanceMetrics.length - 1 ][instance.cnid].volumes[vol].usage + ' %'
                : 'loading..' }}</div>
              <div>Filesystem {{ volumes[vol.uri].filesystem }}</div>
            </div>
          </v-list-tile-title>
          
        </v-list-tile>
        
      </v-flex>
      
      <!-- Applies spaces between components -->
      <v-spacer></v-spacer>

      <!-- Instance chart data -->
      <v-flex ma-1 xs12 sm6 md5 lg5 xl4>
        <chart-component v-bind:chartData="instanceChartData.data" v-bind:options="chartOptions" v-bind:width="800" v-bind:height="600"></chart-component>
      </v-flex>

    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

// Components
import { ChartComponentOptions, ChartComponentUtils } from "../index";
import { Deployment, Volume } from "../../store/stampstate/classes";

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

  mounted() {
    this.$watch("clear", function(value) {
      if (value === true) {
        this.killInstance = false;
      }
    });
  }

  get volumes(): { [volURN: string]: Volume } {
    return ((<SSGetters>this.$store.getters).volumes as any) as {
      [volURN: string]: Volume;
    };
  }

  get instanceVolumes(): Volume.Instance[] {
    let res: Volume.Instance[] = [];

    if (this.instance.volumes)
      for (let vol in this.instance.volumes) {
        res.push(this.instance.volumes[vol]);
      }

    return res;
  }

  get onInstanceMetricsUpdate() {
    let res: {
      data: { [property: string]: number | string }[];
    } = {
      data: []
    };
    for (let i in this.instanceMetrics) {
      res.data.push(this.instanceMetrics[i][this.instance.cnid]);
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