<template>
    <div id="deployment-item-view">
        <i v-bind:class="state" aria-hidden="true"></i>
        <span class="title">{{deploymentName}}</span>
        <div>
            <button class="button is-danger is-medium" v-on:click="showUndeployModal">UNDEPLOY</button>
            <button v-bind:disabled="!haveChanges" class="button is-success is-medium " v-on:click="applyChanges">APPLY CHANGES</button>
            <button v-bind:disabled="!haveChanges" class="button is-warning is-medium" v-on:click="cancelChanges">CANCEL</button>
        </div>
        <div class="is-parent tile">
            <div class="tile">
                <div>
                    <p>Service: {{deploymentService}}</p>
                    <p v-if="website!=null">
                        Websites:
                        <p class="inner-content" v-for="(web, index) in website" v-bind:key="index">
                            <a v-bind:href=" 'http://'+web ">
                                {{web}}
                            </a>
                        </p>
                    </p>
                    <p v-if="serviceProvideChannels.length>0 || serviceRequireChannels.length>0"> Connected to:
                        <div v-for="(proChannel, index) in serviceProvideChannels" v-bind:key="index" class="inner-content">
                            {{proChannel.fromChannel}} -&gt; {{proChannel.toDeployment}} ({{proChannel.toChannel}})
                        </div>
                        <div v-for="(reqChannel, index) in serviceRequireChannels" v-bind:key="index" class="inner-content">
                            {{reqChannel.fromChannel}} &lt;- {{reqChannel.toDeployment}} ({{reqChannel.toChannel}})
                        </div>
                    </p>
                </div>
            </div>
            <div class="is-child is-pulled-right box deployment-chart">
                <chart v-bind:chartData="deploymentChartData" v-bind:options="chartOptions" v-bind:width="600" v-bind:height="160"></chart>
            </div>
        </div>
        <div>
            <rol-card v-for="(rolId, index) in deploymentRoles" v-bind:key="index" v-bind:deploymentId="deploymentId" v-bind:rolId="rolId" v-bind:rolMetrics="rolMetrics" v-on:killInstanceChange="handleKillInstanceChange" v-on:numInstancesChange="handleNumInstancesChange" v-bind:clear="clear" v-on:clearedRol="clear=false"></rol-card>
        </div>
        <undeploy-modal v-bind:visible="showModal" v-bind:deploymentId="deploymentId" v-bind:deploymentName="deploymentName" v-on:close="showModal=false" v-on:undeploy="handleUndeploy">
            This action will
            <strong>UNDEPLOY</strong> {{deploymentName}} and you will
            <strong>loose all data</strong>
        </undeploy-modal>
    </div>
</template>
<script lang="ts" scoped>
import Vue from "vue";
import Component from "vue-class-component";
import Moment from "moment";

import {
  FabElement,
  Deployment,
  Service,
  Channel,
  Metric
} from "../../store/classes";
import RolCard from "./innerComponents/card/RolCard.vue";
import Chart from "./innerComponents/chart/Chart.js";
import ChartOptions from "./innerComponents/chart/ChartOptions.js";
import { prepareData } from "./innerComponents/chart/Utils.js";
import UndeployModal from "./innerComponents/modal/UndeployModal.vue";

@Component({
  name: "DeploymentItem",
  components: {
    "rol-card": RolCard,
    chart: Chart,
    "undeploy-modal": UndeployModal
  }
})
export default class DeploymentItem extends Vue {
  rolNumInstances: { [rolId: string]: number } = {};
  instanceKill: { [rolId: string]: { [instanceId: string]: boolean } } = {};
  haveChanges: boolean = false;
  clear: boolean = false;
  showModal: boolean = false;
  modalOkCallback: Function = function() {};
  chartOptions = ChartOptions;

  mounted() {
    let fabElementsList: Array<FabElement> = [];
    this.$store.dispatch("setFabElements", {
      fabElementsList: fabElementsList
    });
  }

  get state(): string {
    let res: string = "fa ";
    switch (this.$store.getters.getDeploymentState(this.deploymentId)) {
      case Deployment.State.OK:
        res += "fa-check-circle";
      case Deployment.State.DANGER:
        res += "fa-exclamation-circle";
      case Deployment.State.WARNING:
        res += "fa-exclamation-triangle";
      default:
        res += "fa-question-circle";
    }
    return res;
  }

  get deploymentId() {
    return this.$store.getters.getDeploymentIdFromDeploymentRoute(
      this.$route.path
    );
  }

  get website(): string {
    return this.$store.getters.getDeploymentWebsite(this.deploymentId);
  }

  get deploymentName(): string {
    return this.$store.getters.getDeploymentName(this.deploymentId);
  }

  get isEntrypoint() {
    return this.$store.getters.getIsEntryPoint(this.deploymentId);
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
    ][] = this.$store.getters.deploymentMetricList(this.deploymentId);

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
    // console.debug("Las métricas recien salidas del estado contienen:", res);
    return res;
  }

  get deploymentChartData(): { labels: string[]; datasets: any[] } {
    return prepareData(this.deploymentMetrics.data);
  }

  get rolMetrics(): {
    [roleId: string]: {
      data: Metric;
      instances: { [instanceId: string]: Metric };
    };
  }[] {
    return this.deploymentMetrics.roles;
  }

  get deploymentRoles(): Array<string> {
    return this.$store.getters.getDeploymentRoles(this.deploymentId);
  }

  /* Rol atributes */
  get deploymentService(): string {
    return this.$store.getters.getDeploymentService(this.deploymentId);
  }

  get serviceInfo() {
    if (
      this.$store.getters.getServiceInfo(this.deploymentService) === undefined
    )
      this.$store.dispatch("getElementInfo", { uri: this.deploymentService });
    return null;
  }

  get serviceProvideChannels(): Array<Channel> {
    this.serviceInfo;
    return this.$store.getters.getDeploymentProvideChannels(this.deploymentId);
  }

  get serviceRequireChannels(): Array<Channel> {
    this.serviceInfo;
    return this.$store.getters.getDeploymentRequireChannels(this.deploymentId);
  }

  applyChanges(): void {
    this.haveChanges = false;
    // Enviamos los valores que han cambiado
    //  rolNumInstances
    //  killInstances
    this.$store.dispatch("aplyingChangesToDeployment", {
      deploymentId: this.deploymentId,
      rolNumInstances: this.rolNumInstances,
      killInstances: this.instanceKill
    });

    this.cancelChanges(); // TODO: This won't be needed when the change functionaliti is available
  }

  cancelChanges(): void {
    this.rolNumInstances = {};
    this.instanceKill = {};
    this.clear = true;
    this.haveChanges = false;
  }

  showUndeployModal(): void {
    const deploymentId = this.deploymentId;
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

#deployment-item-view {
  min-width: 84em;
}

.deployment-chart {
  width: 800px;
  height: 250px;
  margin-right: 40px;
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
</style>