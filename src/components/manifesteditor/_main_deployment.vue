<template>
  <div class="maincontent">
    <div class="row">
      <div class="col-xs-3">
        <div class="panel panel-default">
          <div
            class="panel-heading headline text-center my-background white--text"
          >Instances by Role</div>
          <div class="panel-body my-background">
            <donut-chart 
              :id="charts.instances.id"
              :data="charts.instances.data"
              :colors="JSON.stringify(charts.instances.colors)"
              :resize="charts.instances.resize"
              style="background:white;"/>
          </div>
        </div>
      </div>
      <div class="col-xs-3">
        <div class="panel panel-default">
          <div
            class="panel-heading headline text-center my-background white--text"
          >CPU by Role</div>
          <div class="panel-body my-background">
            <donut-chart
              :id="charts.cpu.id"
              :data="charts.cpu.data"
              :colors="JSON.stringify(charts.cpu.colors)"
              :resize="charts.cpu.resize"
              style="background:white;"/>
          </div>
        </div>
      </div>
      <div class="col-xs-3" >
        <div class="panel panel-default">
          <div 
            class="panel-heading headline text-center my-background white--text"
          >
            Memory by Role
          </div>
          <div class="panel-body my-background">
            <donut-chart
              :id="charts.memory.id"
              :data="charts.memory.data"
              :colors="JSON.stringify(charts.memory.colors)"
              :resize="charts.memory.resize"
              style="background:white;"/>
          </div>  
        </div>
      </div>
      <div class="col-xs-3" >
        <div class="panel panel-default">
          <div
            class="panel-heading headline text-center my-background white--text"
          >Resume</div>
          <div class="panel-body my-background">
            <bar-chart 
              :id="charts.resume.id"
              :data="charts.resume.data"
              :resize="charts.resume.resize"
              :xkey="charts.resume.xkey"
              :ykeys = "charts.resume.ykeys"
              :grid="charts.resume.grid"
              style="background:white;"/>
          </div>  
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Raphael from "raphael/raphael";
global.Raphael = Raphael;
import { DonutChart, BarChart } from "vue-morris";

export default {
  components: {
    DonutChart,
    BarChart
  },
  data() {
    return {};
  },
  computed: {
    charts() {
      return this.$store.state.manifesteditor.deploymentState.charts;
    }
  },
  created() {
    this.$store.dispatch("setDeployCharts");
  }
};
</script>
<!--
  There is a bug in which relative css paths are not correctly solved
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>