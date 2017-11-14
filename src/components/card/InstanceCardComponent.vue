<template>
  <div>  
    <i v-bind:class="state" aria-hidden="true"></i>
    <span class="title">{{ instance.id }}</span>
    <div>
        <div>{{ instance.memory }} MEM</div>
        <div>{{ instance.cpu }} CPU</div>
        <div>{{ instance.bandwidth }} NET</div>
        <!--
        <checkbox-input v-bind:disabled="true" id="killinstance" v-model="killInstance" v-on:change="killInstanceChange()"> Kill instance</checkbox-input>
        -->
    </div>
    <div class="is-child is-pulled-right box instance-chart">
      <chart-component v-bind:chartData="instanceChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="160"></chart-component>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

// Components
import {
  ChartComponent,
  ChartComponentOptions,
  ChartComponentUtils
} from "../index";
import { Deployment, Metric } from "../../store/stampstate/classes";

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
    let res: string = "fa ";
    switch (this.instance.state) {
      case Deployment.Role.Instance.STATE.CONNECTED:
        res += "fa-check-circle";
      case Deployment.Role.Instance.STATE.DISCONNECTED:
        res += "fa-exclamation-circle";
      default:
        res += "fa-question-circle";
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
$color_green: #93c47d;
$color_yellow: #f5d164;
$color_red: #ff6666;
$icon_size: 40px;
$radius: 5px;
.instance-chart {
  width: 800px;
  height: 250;
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