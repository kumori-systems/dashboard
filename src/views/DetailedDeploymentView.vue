<template>
   <v-container fluid id="deployment-item-view">    
      <v-layout row wrap>
        <v-container fluid id="deployment-item-view">
          <v-layout clo row wrap>

            <v-flex ma-1 xs1 sm1 md1 lg1 xl1>
              <v-icon v-bind:id="state">{{ state }}</v-icon>
            </v-flex>

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

        <!-- Single delete -->
        <v-dialog v-model="undeployElementDialog" max-width="800px">
          <v-card>
            <v-card-title class="headline">Undeploy?</v-card-title>
            <v-card-text>
              This action <strong>CAN'T BE UNDONE</strong> and will
              undeploy {{deployment.name}}.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" flat="flat" @click.native="undeploy">Undeploy</v-btn>
              <v-btn flat="flat" @click.native="undeployElementDialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


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
  undeployElementDialog: boolean = false;
  modalOkCallback: Function = function() {};
  chartOptions = ChartComponentOptions;

  get state(): string {
    let res: string;
    switch (this.deployment.state) {
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
        res = "replay";
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
    this.undeployElementDialog = true;
  }

  undeploy():void{
    this.$store.dispatch("undeploy", this.deployment._uri);
    this.$router.push("/overview");
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
$icon_size: 80px;

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

#replay {
  color: grey;
  font-size: $icon_size;
}

</style>