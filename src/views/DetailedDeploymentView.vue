<template>
  <v-container fluid id="deployment-item-view">
    <v-layout row wrap>
      <v-container fluid id="deployment-item-view">
        <v-layout clo row wrap>
          <v-flex ma-1 xs1 sm1 md1 lg1 xl1>
            <v-icon v-bind:id="state">{{ state }}</v-icon>
          </v-flex>

          <v-flex ma-1 xs12 sm6 md5 lg5 xl3>

            <!-- Deployment uri -->
            <v-layout row wrap>
              <v-flex ma-1 xs12>
                <p><span class="subheading">URN:</span> {{ deployment._uri }}</p>
              </v-flex>
            </v-layout>

            <!-- Deployment date -->
            <v-layout row wrap>
              <v-flex ma-1 xs12>
                <p><span class="subheading">Date:</span>
                {{ deployment._uri | day }}-{{ deployment._uri | month }}-{{ deployment._uri | year }}  {{ deployment._uri | hour }}:{{ deployment._uri | min }}
                </p>
              </v-flex>
            </v-layout>

            <!-- Deployment service -->
            <v-layout row wrap>
              <v-flex ma-1 xs12>
                <p><span class="subheading">Service:</span> {{ deployment.service }}</p>
              </v-flex>
            </v-layout>

            <!-- Deployment links -->
            <v-layout row wrap>
              <v-flex ma-1 xs12 v-if="service">

                <template v-if="service">
                  <span class="subheading">Connections:</span>

                  <div v-for="(conn, name) in service.providedChannels" v-bind:key="name">
                    <v-layout>
                      <v-flex ma-1 xs6 md4>{{ name }} -></v-flex>

                      <v-flex ma-1 xs6 md8>
                        <v-select
                          v-bind:items="totalDependedDeploymentChannels(service, name)"
                          v-model="serviceNewProvidedConnections[name]"
                          multiple chips multi-line v-on:input="handleInput"
                          return-object autocomplete>
                        </v-select>
                      </v-flex>

                    </v-layout>
                  </div>

                  <div v-for="(conn, name) in service.dependedChannels" v-bind:key="name">
                    <v-layout>
                      <v-flex ma-1 xs6 md8>
                        <v-select
                          v-bind:items="totalProvidedDeploymentChannels(service, name)"
                          v-model="serviceNewDependedConnections[name]"
                          multiple chips multi-line v-on:input="handleInput"
                          return-object autocomplete>
                        </v-select>
                      </v-flex>
                      <v-flex ma-1 xs6 md4>-> {{ name }}</v-flex>
                    </v-layout>
                  </div>

                </template>

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
  },
  filters: {
    year: function(text: string) {
      return text.split("/")[4].substring(0, 4);
    },
    month: function(text: string, value: number) {
      return text.split("/")[4].substring(4, 6);
    },
    day: function(text: string, value: number) {
      return text.split("/")[4].substring(6, 8);
    },
    hour: function(text: string, value: number) {
      return text.split("/")[4].substring(9, 11);
    },
    min: function(text: string, value: number) {
      return text.split("/")[4].substring(11, 13);
    }
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
  serviceNewDependedConnections: {
    [channel: string]: { text: string; value: string }[];
  } = {};
  serviceNewProvidedConnections: {
    [channel: string]: { text: string; value: string }[];
  } = {};

  mounted() {
    // Retrieve all actually deployed services
    for (let dep in this.$store.getters.deployments) {
      if (
        !this.$store.getters.service(
          this.$store.getters.deployments[dep].service
        )
      ) {
        this.$store.dispatch(
          "getElementInfo",
          this.$store.getters.deployments[dep].service
        );
      }
    }
    this.$watch("$route.path", value => this.cancelChanges());
  }

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
        res = "help";
    }
    return res;
  }

  get deployment(): Deployment {
    return this.$store.getters.deploymentFromPath(this.$route.path);
  }

  get searchDeployment(): (uri: string) => Deployment {
    return (uri: string) => {
      return this.$store.getters.deployment(uri);
    };
  }

  /** Required to obtain additional information of a role. */
  get service(): Service {
    this.serviceNewDependedConnections = {};
    this.serviceNewProvidedConnections = {};
    let ser: Service = this.$store.getters.service(this.deployment.service);
    if (!ser) {
      this.$store.dispatch("getElementInfo", this.deployment.service);
    } else {
      this.loadDeploymentConnections(ser);
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

  get totalProvidedDeploymentChannels() {
    return (service, channel) => {
      return this.$store.getters.getTotalProvidedDeploymentChannels(
        this.deployment.service,
        channel
      );
    };
  }

  get totalDependedDeploymentChannels() {
    return (service, channel) => {
      return this.$store.getters.getTotalDependedDeploymentChannels(
        this.deployment.service,
        channel
      );
    };
  }

  /**
   * Compares the temporary state with the real state and sends to the stamp
   * the differences
   */
  applyChanges(): void {
    /*
    Remove links
    */
    for (let chann in this.deployment.channels) {
      for (let realConn in this.deployment.channels[chann]) {
        let found = false; // Marks if the connection has been found

        // Search in provided links
        for (let tempConn in this.serviceNewProvidedConnections[chann]) {
          if (
            this.serviceNewProvidedConnections[chann][tempConn].value ===
            JSON.stringify({
              deployment: this.deployment.channels[chann][realConn]
                .destinyDeploymentId,
              channel: this.deployment.channels[chann][realConn]
                .destinyChannelId
            })
          ) {
            found = true;
          }
        }

        // Search in depended links
        for (let tempConn in this.serviceNewDependedConnections[chann]) {
          if (
            this.serviceNewDependedConnections[chann][tempConn].value ===
            JSON.stringify({
              deployment: this.deployment.channels[chann][realConn]
                .destinyDeploymentId,
              channel: this.deployment.channels[chann][realConn]
                .destinyChannelId
            })
          ) {
            found = true;
          }
        }

        // If the link haven't been found, the link is erased
        if (!found) {
          this.$store.dispatch("unlink", {
            deploymentOne: this.deployment._uri,
            channelOne: chann,
            deploymentTwo: this.deployment.channels[chann][realConn]
              .destinyDeploymentId,
            channelTwo: this.deployment.channels[chann][realConn]
              .destinyChannelId
          });
        }
      }
    }

    /*
    Add new provided links
    */
    for (let chann in this.serviceNewProvidedConnections) {
      for (let tempConn in this.serviceNewProvidedConnections[chann]) {
        let found = false; // Checks if the connection has been found

        // Search in deployment channels
        for (let realConn in this.deployment.channels[chann]) {
          if (
            this.serviceNewProvidedConnections[chann][tempConn].value ===
            JSON.stringify({
              deployment: this.deployment.channels[chann][realConn]
                .destinyDeploymentId,
              channel: this.deployment.channels[chann][realConn]
                .destinyChannelId
            })
          ) {
            found = true;
          }
        }

        // If the connection haven't been found, a new one is created
        if (!found) {
          let newConnexion: {
            deployment: string;
            channel: string;
          } = JSON.parse(
            this.serviceNewProvidedConnections[chann][tempConn].value
          );

          this.$store.dispatch("link", {
            deploymentOne: this.deployment._uri,
            channelOne: chann,
            deploymentTwo: newConnexion.deployment,
            channelTwo: newConnexion.channel
          });
        }
      }
    }

    /*
    Add new depended links
    */
    for (let chann in this.serviceNewDependedConnections) {
      for (let tempConn in this.serviceNewDependedConnections[chann]) {
        let found = false; // Checks if the connection has been found

        // Search in deployment channels
        for (let realConn in this.deployment.channels[chann]) {
          if (
            this.serviceNewDependedConnections[chann][tempConn].value ===
            JSON.stringify({
              deployment: this.deployment.channels[chann][realConn]
                .destinyDeploymentId,
              channel: this.deployment.channels[chann][realConn]
                .destinyChannelId
            })
          ) {
            found = true;
          }
        }

        // If the connection haven't been found, a new one is created
        if (!found) {
          let newConnexion: {
            deployment: string;
            channel: string;
          } = JSON.parse(
            this.serviceNewDependedConnections[chann][tempConn].value
          );

          this.$store.dispatch("link", {
            deploymentOne: this.deployment._uri,
            channelOne: chann,
            deploymentTwo: newConnexion.deployment,
            channelTwo: newConnexion.channel
          });
        }
      }
    }

    /*
      If the number of instances has changed, a petition is sent
    */
    let changedNumInstances = false;
    for (let role in this.deployment.roles) {
      if (
        this.rolNumInstances[role] &&
        this.deployment.roles[role].actualInstances !==
          this.rolNumInstances[role]
      ) {
        changedNumInstances = true;
      }
    }

    if (changedNumInstances) {
      // Send changes to the stamp
      this.$store.dispatch("aplyingChangesToDeployment", {
        deploymentURN: this.deployment._uri,
        rolNumInstances: this.rolNumInstances,
        killInstances: this.instanceKill
      });
    }
    // Marc as there are no changes
    this.haveChanges = false;
  }

  cancelChanges(): void {
    if (this.haveChanges) {
      this.rolNumInstances = {};
      this.instanceKill = {};
      this.serviceNewDependedConnections = {};
      this.serviceNewProvidedConnections = {};
      this.clear = true;
      this.haveChanges = false;
    }
  }

  loadDeploymentConnections(ser: Service) {
    for (let chann in this.deployment.channels) {
      for (let conn in this.deployment.channels[chann]) {
        let element = {
          value: JSON.stringify({
            deployment: this.deployment.channels[chann][conn]
              .destinyDeploymentId,
            channel: this.deployment.channels[chann][conn].destinyChannelId
          }),
          text: this.deployment.name + " ~ " + chann
        };

        // Es el canal depended o provided?
        if (ser.dependedChannels[chann]) {
          if (!this.serviceNewDependedConnections[chann]) {
            this.serviceNewDependedConnections[chann] = [];
          }
          if (
            this.serviceNewDependedConnections[chann].indexOf(element) === -1
          ) {
            this.serviceNewDependedConnections[chann].push(element);
          }
        }

        if (ser.providedChannels[chann]) {
          if (!this.serviceNewProvidedConnections[chann]) {
            this.serviceNewProvidedConnections[chann] = [];
          }
          if (this.serviceNewProvidedConnections[chann].indexOf(element) === -1)
            this.serviceNewProvidedConnections[chann].push(element);
        }
      }
    }
  }

  showUndeployModal(): void {
    this.undeployElementDialog = true;
  }

  undeploy(): void {
    this.$store.dispatch("undeploy", this.deployment._uri);
    this.$router.push("/overview");
  }

  handleKillInstanceChange([tempRol, tempInst, value]) {
    if (this.instanceKill[tempRol] === undefined)
      this.instanceKill[tempRol] = {};
    this.instanceKill[tempRol][tempInst] = value;
    this.haveChanges = true;
  }

  handleNumInstancesChange([tempRol, value]) {
    this.rolNumInstances[tempRol] = value;
    this.haveChanges = true;
  }

  handleInput(value) {
    if (!this.clear) this.haveChanges = true;
  }
}
</script>
<style lang="scss" scoped>
$color_green: #81c784;
$color_yellow: #fff176;
$color_red: #e57373ed;
$color_grey: #e0e0e0;
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

#help {
  color: $color_grey;
  font-size: $icon_size;
}
</style>