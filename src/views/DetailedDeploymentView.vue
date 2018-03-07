<template>
  <v-card>
    <v-card-title>
      
      <!-- View title-->
      <h3 class="headline mb-0">
        <span v-if="deployment instanceof HTTPEntryPoint">
          <v-icon class="ma-1">language</v-icon>
          <v-icon class="ma-1" v-if="hasCertificate">https</v-icon>
        </span>
        {{ deployment.name }}
      </h3>
        
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

            <!-- Deployment urn -->
            <v-layout wrap>
              <v-flex ma-1 xs12>
                <span class="subheading">URN</span><p>{{ deployment._urn }}</p>
              </v-flex>
            </v-layout>

            <!-- Deployment creation date -->
            <v-layout wrap>
              <v-flex ma-1 xs12>
                <span class="subheading">Date</span>
                <p>{{ deployment._urn | day }}-{{ deployment._urn | month }}-{{ deployment._urn | year }}  {{ deployment._urn | hour }}:{{ deployment._urn | min }}</p>
              </v-flex>
            </v-layout>

            <!-- Deployment service -->
            <v-layout wrap>
              <v-flex ma-1 xs12>
                <span class="subheading">Service</span>
                <p>{{ deployment.service }}</p>
              </v-flex>
            </v-layout>

            <!-- Persistent Volumes -->
            <template v-if="deploymentPersistentVolumes.length > 0">
              <span class="subheading">Persistent volumes</span>
              <v-list>
                <v-list-tile v-for="(vol, index) in deploymentPersistentVolumes" v-bind:key="index" tag="div">
                  <v-card-actions>
                    <v-icon class="indigo--text">storage</v-icon>
                  </v-card-actions>
                  <v-list-tile-title>
                    <v-tooltip bottom>
                      <div dark slot="activator">
                        <v-layout>
                          <v-flex xs6>{{ vol.name }}</v-flex>
                          <v-flex xs6>{{ vol.size }} GB</v-flex>
                        </v-layout>
                      </div>
                      <span>{{ vol._urn }}</span>
                    </v-tooltip>
                  </v-list-tile-title>
                </v-list-tile>
              </v-list>
            </template>
            
             <!-- Volatile Volumes -->
            <template v-if="deploymentVolatileVolumes.length > 0">
              <span class="subheading">Volatile volumes</span>
              <v-list>
                <v-list-tile v-for="(vol, index) in deploymentVolatileVolumes" v-bind:key="index" tag="div">
                  <v-card-actions>
                    <v-icon class="light-blue--text text--lighten-2">storage</v-icon>
                  </v-card-actions>
                  <v-list-tile-title>

                    <v-layout>
                      <v-flex xs6>{{ vol.name | truncateRight(15) }}</v-flex>
                      <v-flex xs6>{{ vol.size }} GB</v-flex>
                    </v-layout>
                    
                  </v-list-tile-title>
                </v-list-tile>
              </v-list>
            </template>

            <!-- Websites -->
            <v-layout v-if="deployment instanceof HTTPEntryPoint">
              <v-flex ma-1 xs12>
                <span class="subheading">Websites</span>
                <v-list>
                <v-list-tile v-for="(web, index) in deployment.websites" v-bind:key="index">
                  <v-list-tile-title>
                    <a v-if="hasCertificate" v-bind:href="'https://' + web">{{ web }}</a>
                    <a v-else v-bind:href="'http://' + web">{{ web }}</a>
                  </v-list-tile-title>
                </v-list-tile>
                </v-list>
              </v-flex>
            </v-layout>

            <!-- Deployment links -->
            <v-layout wrap>
              <v-flex ma-1 xs12>
                <span class="subheading">Connections</span>
                  
                <!-- Link table representation -->
                <table>

                  <!-- Headers-->
                  <tr>
                    <th>From</th>
                    <th>To</th>
                  </tr>

                  <!-- Provided Channels -->
                  <tr v-for="(conn, name) in service.providedChannels" v-bind:key="name">
                    <th><v-chip color="lime">{{ name }}</v-chip></th>
                    <th>
                      <v-select
                        v-model="serviceNewProvidedConnections[name]"
                        v-bind:items="totalDependedDeploymentChannels(name)"
                        multiple chips v-on:input="handleInput" return-object autocomplete>

                        <!-- Chips config-->
                        <template slot="selection" scope="items">
                          <v-chip
                            @input="items.parent.selectItem(items.item)"
                              close color="light-blue lighten-3">
                            {{ items.item.text }}
                          </v-chip>
                        </template>
                        
                      </v-select>
                    </th>
                  </tr>

                  <!-- Depended channels -->
                  <tr v-for="(conn, name) in service.dependedChannels" v-bind:key="name">
                    <th>
                      <v-select v-model="serviceNewDependedConnections[name]"
                        v-bind:items="totalProvidedDeploymentChannels(name)"
                        multiple chips v-on:input="handleInput" return-object
                        autocomplete>
                  
                        <!-- Chips config-->
                        <template slot="selection" scope="items">
                          <v-chip 
                            @input="items.parent.selectItem(items.item)"
                            close color="light-blue lighten-3">
                            {{ items.item.text }}
                          </v-chip>
                        </template>
                  
                      </v-select>
                    </th>
                    <th><v-chip color="lime">{{ name }}</v-chip></th>
                  </tr>

                </table>
              </v-flex>
            </v-layout>

          </v-flex>

          <!-- Applies space between elements -->
          <v-spacer></v-spacer>

          <!-- Deployment chart -->
          <v-flex ma-1 xs12 sm6 md5 lg5 xl4>
            <deployment-chart-component class="deployment-chart" v-bind:chartData="deploymentMetrics.data"
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
import {
  Certificate,
  Channel,
  Deployment,
  HTTPEntryPoint,
  PersistentVolume,
  Resource,
  Service,
  VolatileVolume
} from "../store/stampstate/classes";
import SSGetters from "../store/stampstate/getters";
import * as utils from "../api/utils";
import { setTimeout } from "timers";

@VueClassComponent({
  name: "detailed-deployment-view",
  components: {
    "role-card-component": RoleCardComponent,
    "deployment-chart-component": ChartComponent
  },
  filters: {
    truncateRight: function(text: string, value: number) {
      if(text.length < value) return text;
      return text.substring(0, value) + "...";
    },
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
  HTTPEntryPoint = HTTPEntryPoint;

  /** Temporary number of instances of a role. **/
  roleNumInstances: { [rolId: string]: number } = {};

  /** Signal to kill instances. */
  instanceKill: { [rolId: string]: { [instanceId: string]: boolean } } = {};

  /** Marks if there are changes to commit. */
  haveChanges: boolean = false;

  /** Marks if the state should be cleared. */
  clear: boolean = false;

  /** Show/Hide dialog undeploy element. */
  undeployElementDialog: boolean = false;

  /** Vue wrapper for the Chart options. */
  chartOptions = ChartComponentOptions;

  /** Temporary depended connections. */
  serviceNewDependedConnections: {
    [channel: string]: { text: string; value: string }[];
  } = {};

  /** Temporary provided connections. */
  serviceNewProvidedConnections: {
    [channel: string]: { text: string; value: string }[];
  } = {};

  unwatch: () => void;

  mounted() {
    this.unwatch = this.$watch("$route.path", val => {
      this.$forceUpdate();
      this.cancelChanges();
    });
  }

  beforeDestroy() {
    this.unwatch();
  }

  /** Obtains the deployment from the storage. */
  get deployment(): Deployment {
    return ((<SSGetters>this.$store.getters).deploymentFromPath as Function)(
      this.$route.path
    );
  }

  get deploymentPersistentVolumes(): PersistentVolume[] {
    let res: PersistentVolume[] = [];
    let ser: Service = <Service>this.$store.getters.service(
      this.deployment.service
    );
    for (let resName in ser.resources) {
      if (
        utils.getResourceType(ser.resources[resName]) ===
        Resource.RESOURCE_TYPE.PERSISTENT_VOLUME
      ) {
        if (this.deployment.resources[resName]) {
          let volumes = this.$store.getters.persistentVolumes;
          if (volumes) {
            res.push(volumes[this.deployment.resources[resName]]);
          }
        }
      }
    }
    return res;
  }

  get deploymentVolatileVolumes(): VolatileVolume[] {
    let res: VolatileVolume[] = [];
    let ser: Service = <Service>this.$store.getters.service(
      this.deployment.service
    );
    for (let resName in ser.resources) {
      if (
        utils.getResourceType(ser.resources[resName]) ===
        Resource.RESOURCE_TYPE.VOLATILE_VOLUME
      ) {
        if (this.deployment.resources[resName]) {
          let volumes = this.$store.getters.volatileVolumes;
          if (volumes) {
            res.push(volumes[this.deployment.resources[resName]]);
          }
        }
      }
    }
    return res;
  }

  /** Required to obtain additional information of a role. */
  get service(): Service {
    let ser: Service = ((<SSGetters>this.$store.getters).service as Function)(
      this.deployment.service
    );
    if (!ser) {
      /* This will be reached when deploying new services with bundles. */
      this.$store.dispatch("getElementInfo", this.deployment.service);
    } else {
      this.loadDeploymentConnections(this.deployment, ser);
    }

    return ser;
  }

  /** Deployment state. */
  get state(): string {
    let res: string = "unknown";
    if (this.deployment) {
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
    }
    return res;
  }

  /** Obtains deployment metrics. */
  get deploymentMetrics(): {
    data: { labels: any[]; datasets: any[] };
    roles: any;
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
    }[] = this.$store.getters.serviceMetrics[this.deployment._urn];

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

    return ChartComponentUtils.prepareDeploymentData(res);
  }

  /** Obtains all provided deployment channels of actual deployed services. */
  get totalProvidedDeploymentChannels() {
    return channel => {
      return this.$store.getters.getTotalProvidedDeploymentChannels(
        this.deployment.service,
        channel
      );
    };
  }

  /** Obtains all depended deployment channels of actual deployed services. */
  get totalDependedDeploymentChannels() {
    return channel => {
      return this.$store.getters.getTotalDependedDeploymentChannels(
        this.deployment._urn,
        this.deployment.service,
        channel
      );
    };
  }

  get hasCertificate() {
    return this.deployment.resources["server_cert"] ? true : false;
  }

  /**
   * Compares the temporary state with the real state and sends to the stamp
   * the differences.
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
            deploymentOne: this.deployment._urn,
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
            deploymentOne: this.deployment._urn,
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
            deploymentOne: this.deployment._urn,
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
        this.roleNumInstances[role] &&
        this.deployment.roles[role].actualInstances !==
          this.roleNumInstances[role]
      ) {
        changedNumInstances = true;
      }
    }

    if (changedNumInstances) {
      // Send changes to the stamp
      this.$store.dispatch("aplyingChangesToDeployment", {
        deploymentURN: this.deployment._urn,
        roleNumInstances: this.roleNumInstances,
        killInstances: this.instanceKill
      });
    }

    // Marc as there are no changes
    this.haveChanges = false;
  }

  cancelChanges(): void {
    this.roleNumInstances = {};
    this.instanceKill = {};

    // Clean links
    this.serviceNewDependedConnections = {};
    this.serviceNewProvidedConnections = {};

    this.clear = true;
    this.haveChanges = false;
  }

  /** Loads service available connections. */
  loadDeploymentConnections(dep: Deployment, ser: Service): void {
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

          // Is a depended or provided channel?
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

  /** Show/Hide undeploy modal. */
  showUndeployModal(): void {
    this.undeployElementDialog = true;
  }

  /** Function called from undeploy modal when confirmation is done. */
  undeploy(): void {
    this.$store.dispatch("undeploy", this.deployment._urn);
    this.$router.push("/overview");
  }

  /** Handles changes in kill instance parameter of role children. */
  handleKillInstanceChange([tempRol, tempInst, value]): void {
    if (this.instanceKill[tempRol] === undefined) {
      this.instanceKill[tempRol] = {};
    }
    this.instanceKill[tempRol][tempInst] = value;
    this.haveChanges = true;
  }

  /** Handles changes in the number of instances of role children. */
  handleNumInstancesChange([tempRol, value]): void {
    this.roleNumInstances[tempRol] = value;
    this.haveChanges = true;
  }

  /** Handles changes in the input event of children components. */
  handleInput(value): void {
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