<template>
   <v-container fluid id="deployment-item-view">
      <v-layout row wrap>
        <!-- Deployment state -->
        <v-flex ma-1 xs1 sm1 md1 lg1 xl1>
          <i v-bind:class="deployment.state" aria-hidden="true"></i>
        </v-flex>
      
        <!-- Deployment name -->
        <!--
          <v-flex ma-1 xs12 sm5 md5 lg5 xl3><span class="headline">{{ deployment.name }}</span></v-flex>
        -->
      
       
      </v-layout>
      
      <v-layout row wrap>
        <v-container fluid id="deployment-item-view">
          <v-layout clo row wrap>
          
            <v-flex ma-1 xs12 sm6 md5 lg5 xl3>

              <!-- Deployment service -->
              <v-layout row wrap>
                <v-flex ma-1 xs12>
                  <p><span class="subheading">Service:</span> {{ deployment.service }}</p>
                </v-flex>
              </v-layout>

              <!-- Deployment links -->
              <v-layout row wrap>
                <v-flex ma-1 xs12 v-if="deployment.links.length > 0"> 
                  <span class="subheading">Links:</span>
                  <div v-for="(link, index) in deployment.links" v-bind:key="index" class="inner-content">
                    {{ link.fromChannel }} ~ {{ searchDeployment(link.toDeployment).name }} ({{ link.toChannel }})
                  </div>
                </v-flex>
              </v-layout>

            </v-flex>

            <v-spacer></v-spacer>

            <v-flex ma-1 xs12 sm6 md5 lg5 xl4>

              <!-- Deployment actions -->
              <v-layout>
                <v-btn color="error" v-on:click="showUndeployModal">Undeploy</v-btn>
                <v-btn color="warning" v-bind:disabled="!haveChanges" 
                  v-on:click="applyChanges">Apply changes</v-btn>
                <v-btn v-bind:disabled="!haveChanges" v-on:click="cancelChanges">Cancel</v-btn>
              </v-layout>

              <!-- Deployment chart -->
                <v-flex ma-1 xs12 sm12 md12 lg12 xl12>
                  <deployment-chart-component class="deployment-chart" v-bind:chartData="deploymentChartData"
                    v-bind:options="chartOptions" v-bind:width="800" v-bind:height="400">
                  </deployment-chart-component>
                </v-flex>

            </v-flex>

          </v-layout>
        </v-container>
      </v-layout>
      

      <!-- Deployment roles -->
      <v-layout row wrap>
        <v-flex ma-1 xs12 sm12 md12 lg12 xl12>
          <role-card-component v-for="(rolContent, rolId) in deployment.roles"
          v-bind:key="rolId" v-bind:role="rolContent" v-bind:service="service" 
          v-bind:roleMetrics="roleMetrics"
          v-on:killInstanceChange="handleKillInstanceChange"
          v-on:numInstancesChange="handleNumInstancesChange"
          v-bind:clear="clear" v-on:clearedRol="clear=false"></role-card-component>
        </v-flex>
      </v-layout>
    </v-container>
</template>
<script lang="ts" scoped>
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import Moment from "moment";

import {
  RoleCardComponent,
  ChartComponent,
  ChartComponentOptions,
  ChartComponentUtils
} from "../components";
import {
  Channel,
  Deployment,
  Metric,
  Service
} from "../store/stampstate/classes";

@VueClassComponent({
  name: "detailed-deployment-view",
  components: {
    "role-card-component": RoleCardComponent,
    "deployment-chart-component": ChartComponent
  }
})
export default class DetailedDeploymentView extends Vue {
  rolNumInstances: { [rolId: string]: number } = {};
  instanceKill: { [rolId: string]: { [instanceId: string]: boolean } } = {};
  haveChanges: boolean = false;
  clear: boolean = false;
  showModal: boolean = false;
  modalOkCallback: Function = function() {};
  chartOptions = ChartComponentOptions;

  get state(): string {
    let res: string = "fa ";
    switch (this.deployment.state) {
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

  get deployment(): Deployment {
    this.cancelChanges();
    return this.$store.getters.deploymentFromPath(this.$route.path);
  }

  get searchDeployment(): (uri: string) => Deployment {
    return (uri: string) => {
      return this.$store.getters.deployment(uri);
    };
  }

  /** Required to obtain additional information of a role. */
  get service(): Service {
    let ser = this.$store.getters.service(this.deployment.service);
    if (!ser) {
      this.$store.dispatch("getElementInfo", this.deployment.service);
    }
    return ser;
  }

  get deploymentMetrics() {
    let metrics: [
      Date,
      {
        data: Metric;
        roles: {
          [roleId: string]: {
            data: Metric;
            instances: { [instanceId: string]: Metric };
          };
        };
      }
    ][] = this.deployment.metrics;

    let res: {
      data: Metric[];
      roles: {
        [roleId: string]: {
          data: Metric;
          instances: { [instanceId: string]: Metric };
        };
      }[];
    } = {
      data: [],
      roles: []
    };

    for (let i in metrics) {
      res.data.push(metrics[i][1].data);
      res.roles.push(metrics[i][1].roles);
    }

    return res;
  }

  get deploymentChartData(): { labels: string[]; datasets: any[] } {
    return ChartComponentUtils.prepareData(this.deploymentMetrics.data);
  }

  get roleMetrics(): {
    [roleId: string]: {
      data: Metric;
      instances: { [instanceId: string]: Metric };
    };
  }[] {
    return this.deploymentMetrics.roles;
  }

  applyChanges(): void {
    this.haveChanges = false;
    // Enviamos los valores que han cambiado
    //  rolNumInstances
    //  killInstances
    this.$store.dispatch("aplyingChangesToDeployment", {
      deploymentId: this.deployment._uri,
      rolNumInstances: this.rolNumInstances,
      killInstances: this.instanceKill
    });

    this.cancelChanges(); // TODO: This won't be needed when the change
    //functionaliti is available
  }

  cancelChanges(): void {
    this.rolNumInstances = {};
    this.instanceKill = {};
    this.clear = true;
    this.haveChanges = false;
  }

  showUndeployModal(): void {
    const deploymentId = this.deployment._uri;
    this.modalOkCallback = function() {
      this.$store.dispatch("undeployDeployment", {
        deploymentId: deploymentId
      });
    };
    this.showModal = true;
  }

  handleUndeploy(payload): void {
    this.$store.dispatch("undeployDeployment", payload);
    this.$router.go(-1);
  }

  handleKillInstanceChange(payload) {
    this.haveChanges = true;
    let tempRol, tempInst, value;
    [tempRol, tempInst, value] = payload;
    if (this.instanceKill[tempRol] === undefined)
      this.instanceKill[tempRol] = {};
    this.instanceKill[tempRol][tempInst] = value;
  }

  handleNumInstancesChange(payload) {
    this.haveChanges = true;
    let tempRol, value;
    [tempRol, value] = payload;
    this.rolNumInstances[tempRol] = value;
  }
}
</script>
<style lang="scss" scoped>
$color_green: #93c47d;
$color_yellow: #f5d164;
$color_red: #ff6666;
$icon_size: 40px;

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
</style>