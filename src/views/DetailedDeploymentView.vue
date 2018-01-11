<template>
  <v-card>
    <v-card-title>
      
      <!-- View title-->
      <h3 class="headline mb-0">{{ deployment.name }}</h3>
        
        <!-- Applies a space between elements -->
        <v-spacer></v-spacer>
        
        <!-- Deployment actions -->
        <v-card-actions>
          <v-btn class="elevation-0" color="error" v-on:click="showUndeployModal">Undeploy</v-btn>
          <v-btn class="elevation-0" color="warning" v-bind:disabled="!haveChanges" v-on:click="applyChanges">Apply changes</v-btn>
          <v-btn outline v-bind:disabled="!haveChanges" v-on:click="cancelChanges">Cancel</v-btn>
        </v-card-actions>
      
    </v-card-title>
    
    <!-- Divides the swections of the card -->
    <v-divider></v-divider>

    <!-- Main content of the view-->
    <v-container fluid id="deployment-item-view">
      <!-- Deployment general info -->
      <v-container fluid id="deployment-item-view">
        <v-layout wrap>

          <!-- Deployment state -->
          <v-flex ma-1 xs1 sm1 md1 lg1 xl1>
            <v-icon v-bind:id="state" v-if="state!=='unknown'">{{ state }}</v-icon>
            <v-progress-circular v-else indeterminate color="light-blue lighten-4"></v-progress-circular>
          </v-flex>

          <!-- Detailed info -->
          <v-flex ma-1 xs12 sm6 md5 lg5 xl3>

            <!-- Deployment uri -->
            <v-layout wrap>
              <v-flex ma-1 xs12>
                <span class="subheading">URN</span><p>{{ deployment._uri }}</p>
              </v-flex>
            </v-layout>

            <!-- Deployment creation date -->
            <v-layout wrap>
              <v-flex ma-1 xs12>
                <span class="subheading">Date</span>
                <p>{{ deployment._uri | day }}-{{ deployment._uri | month }}-{{ deployment._uri | year }}  {{ deployment._uri | hour }}:{{ deployment._uri | min }}</p>
              </v-flex>
            </v-layout>

            <!-- Deployment service -->
            <v-layout wrap>
              <v-flex ma-1 xs12>
                <span class="subheading">Service</span>
                <p>{{ deployment.service }}</p>
              </v-flex>
            </v-layout>

            <!-- Deployment links -->
            <v-layout wrap>
            
                <span class="subheading">Connections</span>
                
                <!-- Link table representation -->
                <table>

                  <!-- Heders-->
                  <tr>
                    <th>From</th>
                    <th>To</th>
                  </tr>

                  <!-- Provided Channels -->
                  <tr v-for="(conn, name) in service.providedChannels" v-bind:key="name">
                    <th><v-chip color="amber lighten-4">{{ name }}</v-chip></th>
                    <th>
                      <v-select
                        v-model="serviceNewProvidedConnections[name]"
                        v-bind:items="totalDependedDeploymentChannels(service, name)"
                        multiple chips v-on:input="handleInput" return-object autocomplete>

                        <!-- Chips config-->
                        <template slot="selection" scope="items">
                          <v-chip
                            @input="items.parent.selectItem(items.item)"
                             close color="indigo lighten-4">
                            {{ items.item.text }}
                          </v-chip>
                        </template>
                        
                      </v-select>
                    </th>
                  </tr>

                  <!-- Depended channels -->
                  <tr v-for="(conn, name) in service.dependedChannels" v-bind:key="name">
                    <th>
                      <v-select
                        v-model="serviceNewDependedConnections[name]"
                        v-bind:items="totalProvidedDeploymentChannels(service, name)"
                        multiple chips v-on:input="handleInput" return-object autocomplete>
                  
                         <!-- Chips config-->
                        <template slot="selection" scope="items">
                          <v-chip 
                            @input="items.parent.selectItem(items.item)"
                            close color="indigo lighten-4">
                            {{ items.item.text }}
                          </v-chip>
                        </template>
                  
                      </v-select>
                    </th>
                    <th><v-chip color="amber lighten-4">{{ name }}</v-chip></th>
                  </tr>

                </table>
              
            </v-layout>

          </v-flex>

          <!-- Applies space between elements -->
          <v-spacer></v-spacer>

          <!-- Deployment chart -->
          <v-flex ma-1 xs12 sm6 md5 lg5 xl4>
            <deployment-chart-component class="deployment-chart" v-bind:chartData="deploymentChartData"
              v-bind:options="chartOptions" v-bind:width="800" v-bind:height="600">
            </deployment-chart-component>
          </v-flex>

        </v-layout>

         
      </v-container>

      <!-- Deployment roles -->
      <v-layout wrap>
        <v-flex ma-1 xs12 sm12 md12 lg12 xl12>
          <role-card-component v-for="(rolContent, rolId) in deployment.roles"
          v-bind:key="rolId" v-bind:role="rolContent" v-bind:service="service"
          v-bind:roleMetrics="deploymentMetrics.roles"
          v-on:killInstanceChange="handleKillInstanceChange"
          v-on:numInstancesChange="handleNumInstancesChange"
          v-bind:clear="clear" v-on:clearedRol="clear=false"></role-card-component>
        </v-flex>
      </v-layout>

      <!-- Undeploy dialog -->
      <v-dialog v-model="undeployElementDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline">Undeploy?</v-card-title>
          <v-card-text>
            This action <strong>CAN'T BE UNDONE</strong> and will
            undeploy {{ deployment.name }}.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat="flat" @click.native="undeploy">Undeploy</v-btn>
            <v-btn flat="flat" @click.native="undeployElementDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </v-card>
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
import { Channel, Deployment, Service } from "../store/stampstate/classes";

import SSGetters from "../store/stampstate/getters";

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

  /* // No longer needed because it's loaded on user's load
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
    
  }
  */

  get deployment(): Deployment {
    return ((<SSGetters>this.$store.getters).deploymentFromPath as Function)(
      this.$route.path
    );
  }

  /** Required to obtain additional information of a role. */
  get service(): Service {
    let ser: Service = ((<SSGetters>this.$store.getters).service as Function)(
      this.deployment.service
    );
    if (!ser) {
      this.$store.dispatch("getElementInfo", this.deployment.service);
    } else {
      this.cancelChanges();
      this.loadDeploymentConnections(this.deployment, ser);
    }

    return ser;
  }

  /** Dep */
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
        res = "unknown";
    }
    return res;
  }

  /*
  get searchDeployment(): (uri: string) => Deployment {
    return (uri: string) => {
      return this.$store.getters.deployment(uri);
    };
  }
  */

  get deploymentMetrics(): {
    data: {
      [property: string]: number | string;
    }[];
    roles: {
      [roleId: string]: {
        data: {
          [property: string]: number | string;
        };
        instances: {
          [instanceId: string]: {
            [property: string]: number | string;
          };
        };
      };
    }[];
  } {
    let metrics: {
      data: {
        [property: string]: number | string;
      };
      roles: {
        [rolId: string]: {
          data: {
            [property: string]: number | string;
          };
          instances: {
            [instanceId: string]: {
              [property: string]: number | string;
            };
          };
        };
      };
    }[] = this.$store.getters.metrics(this.deployment._uri);

    let res: {
      data: {
        [property: string]: number | string;
      }[];
      roles: {
        [roleId: string]: {
          data: {
            [property: string]: number | string;
          };
          instances: {
            [instanceId: string]: {
              [property: string]: number | string;
            };
          };
        };
      }[];
    } = {
      data: [],
      roles: []
    };

    for (let i in metrics) {
      res.data.push(metrics[i].data);
      res.roles.push(metrics[i].roles);
    }

    return res;
  }

  get deploymentChartData(): { labels: string[]; datasets: any[] } {
    return ChartComponentUtils.prepareData(this.deploymentMetrics.data);
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

      // Clean links
      for (let chan in this.serviceNewDependedConnections) {
        this.serviceNewDependedConnections[chan] = [];
      }
      for (let chan in this.serviceNewProvidedConnections) {
        this.serviceNewProvidedConnections[chan] = [];
      }

      this.clear = true;
      this.haveChanges = false;
    }
  }

  loadDeploymentConnections(dep: Deployment, ser: Service) {
    if (dep && ser) {
      for (let chann in dep.channels) {
        for (let conn in dep.channels[chann]) {
          let element = {
            value: JSON.stringify({
              deployment: dep.channels[chann][conn].destinyDeploymentId,
              channel: dep.channels[chann][conn].destinyChannelId
            }),
            text: dep.name + " ~ " + chann
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
            if (
              this.serviceNewProvidedConnections[chann].indexOf(element) === -1
            )
              this.serviceNewProvidedConnections[chann].push(element);
          }
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
    if (this.instanceKill[tempRol] === undefined) {
      this.instanceKill[tempRol] = {};
    }
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

#unknown {
  font-size: $icon_size;
}
</style>