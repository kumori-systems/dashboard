<template>
  <div class="maincontent">
    <div class="row">
      <div class="col-xs-3">
        <div class="panel panel-default">
          <div class="panel-heading text-center">Instances by Role</div>
          <div class="panel-body">
            <donut-chart :id="charts.instances.id"
              :data="charts.instances.data"
              :colors="JSON.stringify(charts.instances.colors)"
              :resize="charts.instances.resize">
            </donut-chart>
          </div>
        </div>
      </div>
      <div class="col-xs-3">
        <div class="panel panel-default">
          <div class="panel-heading text-center">CPU by Role</div>
          <div class="panel-body">
            <donut-chart :id="charts.cpu.id" :data="charts.cpu.data"
              :colors="JSON.stringify(charts.cpu.colors)"
              :resize="charts.cpu.resize">
            </donut-chart>
          </div>
        </div>
      </div>
      <div class="col-xs-3" >
        <div class="panel panel-default">
          <div class="panel-heading text-center">Memory by Role</div>
          <div class="panel-body">
            <donut-chart :id="charts.memory.id" :data="charts.memory.data"
              :colors="JSON.stringify(charts.memory.colors)"
              :resize="charts.memory.resize">
            </donut-chart>
          </div>  
        </div>
      </div>
      <div class="col-xs-3" >
        <div class="panel panel-default">
          <div class="panel-heading text-center">Resume</div>
          <div class="panel-body">
            <bar-chart  :id="charts.resume.id"
              :data="charts.resume.data"
              :resize="charts.resume.resize"
              :xkey="charts.resume.xkey"
              :ykeys = "charts.resume.ykeys"
              :grid="charts.resume.grid">
            </bar-chart>
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
    // LineChart, AreaChart
  },

  data() {
    return {};
  },

  computed: {
    charts() {
      return this.$store.state.deploymentState.charts;
    }
  },
  methods: {
    updateRoleName() {
      this.$store.dispatch("updateRoleName", payload);
    },
    updateRoleComp() {
      this.$store.dispatch("updateRoleComp", payload);
    },
    changeBypass() {
      this.$store.dispatch("changeBypass", payload);
    },
    addRole() {
      this.$store.dispatch("addRole", payload);
    },
    updateRoleState() {
      this.$store.dispatch("updateRoleState", payload);
    }
  }
};
</script>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>