<template>
  <v-container fluid>
    <v-layout wrap>
      
      <!-- Instance name -->
      <v-flex ma-1 xs12 sm5 md5 lg5 xl3>
        <v-icon v-bind:id="state">{{ state }}</v-icon>
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
      </v-flex>
      
      <v-spacer></v-spacer>

      <!-- Instance chart data -->
      <v-flex ma-1 xs12 sm6 md5 lg5 xl4>
        <chart-component v-bind:chartData="instanceChartData" v-bind:options="chartOptions" v-bind:width="800" v-bind:height="400"></chart-component>
      </v-flex>

    </v-layout>
  </v-container>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

// Components
import { ChartComponentOptions, ChartComponentUtils } from "../index";
import { Deployment, Metric } from "../../store/stampstate/classes";

import ChartComponent from "./../chart";

@VueClassComponent({
  name: "instance-card-component",
  props: {
    instance: { required: true },
    clear: { required: true, type: Boolean }, // Este parámetro se utiliza para limpiar 'kill Instance' cuando se cancelan los cambios
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

  get onInstanceMetricsUpdate() {
    let res: {
      data: Metric[];
    } = {
      data: []
    };
    for (let i in this.instanceMetrics) {
      res.data.push(this.instanceMetrics[i][this.instance.cnid]);
    }
    return res;
  }

  get instanceChartData() {
    return ChartComponentUtils.prepareData(this.onInstanceMetricsUpdate.data);
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
        res = "help";
    }
    return res;
  }

  /**
     * Éste método se utiliza para enviar una notificación al componente superior para que lea que
     * se ha cambiado el valor de 'kill instance'
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

#help {
  color: $color_grey;
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