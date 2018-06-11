<template>
  <v-form ref="form" lazy-validation>

    <v-card v-if="deployment" style="max-width:1300px">

      <v-card-title class="mybackground">
        
        <!-- View title-->
        <h3 class="headline mb-0">
          <span v-if="isEntrypoint">
            <v-icon class="ma-1">language</v-icon>
            <v-icon class="ma-1" v-if="hasCertificate">https</v-icon>
          </span>
          {{ deployment.name }}
        </h3>
          
        <!-- Applies a space between elements -->
        <v-spacer></v-spacer>
        
        <!-- Deployment actions -->
        <v-card-actions>

          <!-- Undeploy -->
          <v-btn class="elevation-0" color="error" v-on:click="showUndeployModal">Undeploy</v-btn>

          <!-- Apply changes -->
          <v-btn class="elevation-0" color="warning" v-bind:disabled="!haveChanges" v-on:click="applyChanges">Apply changes</v-btn>

          <!-- Cancel -->
          <v-btn outline v-bind:disabled="!haveChanges" v-on:click="cancelChanges">Cancel</v-btn>

        </v-card-actions>
        
      </v-card-title>
      
      <!-- Divides the swections of the card -->
      <v-divider></v-divider>

      <!-- Main content of the view-->
      <v-container fluid id="deployment-item-view" class="mybackground">

        <!-- Deployment general info -->
        <v-container fluid id="deployment-item-view">
          <v-layout wrap>

            <!-- Deployment state -->
            <v-flex xs1>
              <v-icon v-bind:id="state" v-if="state!=='unknown'">{{ state }}</v-icon>
              <v-progress-circular v-else indeterminate color="light-blue lighten-4"></v-progress-circular>
            </v-flex>

            <!-- Detailed info -->
            <v-flex xs5>

              <!-- Deployment urn -->
              <v-layout wrap>

                <v-flex ma-1 xs12>
                  <strong>URN: </strong>{{ deployment._urn }}
                </v-flex>

                <!-- Deployment creation date -->
                <v-flex ma-1 xs12>
                  <strong>Date: </strong>{{ deploymentDate}}
                </v-flex>

                <!-- Deployment service -->
                <v-flex ma-1 xs12>
                  <strong>Service: </strong>{{ deployment.service }}
                </v-flex>

              </v-layout>

              <!-- Persistent Volumes -->
              <template v-if="deploymentPersistentVolumes.length > 0">
                <strong class="ma-1">Persistent volumes:</strong>
                <v-list class="pa-0">
                  <v-list-tile v-for="(vol, index) in deploymentPersistentVolumes" v-bind:key="index" tag="div" class="mybackground">
                    <v-card-actions>
                      <v-icon>storage</v-icon>
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
                <strong>Volatile volumes:</strong>
                <v-list class="pa-0">
                  <v-list-tile v-for="(vol, index) in deploymentVolatileVolumes" v-bind:key="index" tag="div" class="mybackground">
                    <v-card-actions>
                      <v-icon>sd_card</v-icon>
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
              <v-layout v-if="isEntrypoint">
                <v-flex ma-1 xs12>
                  <strong>Websites:</strong>
                  <v-list class="pa-0">
                  <v-list-tile v-for="(web, index) in deployment.websites" v-bind:key="index" class="mybackground">
                    <v-list-tile-title>
                      <a v-if="hasCertificate" v-bind:href="'https://' + web.url">{{ web.text }}</a>
                      <a v-else v-bind:href="'http://' + web.url">{{ web.text }}</a>
                    </v-list-tile-title>
                  </v-list-tile>
                  </v-list>
                </v-flex>
              </v-layout>

              <!-- Deployment links -->
              <v-layout>
                <v-flex ma-1 xs12>
                  <strong>Connections:</strong>
                    
                  <!-- Link table representation -->
                  <table>

                    <!-- Provided Channels -->
                    <tr v-for="(conn, name) in service.providedChannels" v-bind:key="name">
                      <th><v-chip color="lime darken-1 white--text">{{ name }}</v-chip></th>
                      <th>
                        <v-select
                          v-model="serviceNewProvidedConnections[name]"
                          v-bind:items="totalDependedDeploymentChannels(name)"
                          multiple chips v-on:input="handleInput" autocomplete
                          return-object>

                          <!-- Chips config-->
                          <template slot="selection" scope="items">
                            <v-chip
                              @input="items.parent.selectItem(items.item)"
                                close color="light-blue lighten-1 white--text">
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
                          multiple chips v-on:input="handleInput" autocomplete
                          return-object>
                    
                          <!-- Chips config-->
                          <template slot="selection" scope="items">
                            <v-chip 
                              @input="items.parent.selectItem(items.item)"
                              close color="light-blue lighten-1 white--text">
                              {{ items.item.text }}
                            </v-chip>
                          </template>
                    
                        </v-select>
                      </th>
                      <th><v-chip color="lime darken-1 white--text">{{ name }}</v-chip></th>
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
          <v-flex ma-1 xs12 sm12 md12 lg12 xl12 v-for="(rolContent, roleId) in deployment.roles" v-bind:key="roleId">
            <role-card-component v-bind:role="rolContent" v-bind:service="service"
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
        <!-- This deployment is already undeployed -->
        <v-dialog v-model="noMoreInfoDialog" max-width="600px">
          <v-card>
            <v-card-title class="headline">This service has been undeployed and is not longer available</v-card-title>
            <v-card-text>
              You will be redirected to overview
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              
              <v-btn flat="flat" @click.native="redirectToOverview">I understand</v-btn>

            </v-card-actions>
          </v-card>
        </v-dialog>
  </v-form>
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
  EntryPoint,
  HTTPEntryPoint,
  PersistentVolume,
  Resource,
  Service,
  VolatileVolume
} from "../store/stampstate/classes";
import { Notification } from "../store/pagestate/classes";
import SSGetters from "../store/stampstate/getters";
import { utils } from "../api";
import { setTimeout } from "timers";

@VueClassComponent({
  name: "detailed-deployment-view",
  components: {
    "role-card-component": RoleCardComponent,
    "deployment-chart-component": ChartComponent
  },
  filters: {
    truncateRight: function(text: string, value: number) {
      if (text.length < value) return text;
      return text.substring(0, value) + "...";
    }
  }
})
export default class DetailedDeploymentView extends Vue {
  /**
    This dialog should appear when the deployment which is beeing viewed was
    undeployed (by someone else) and the information is no longer available.
  */
  noMoreInfoDialog: boolean = false;

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

  unwatch = [];

  redirectToOverview() {
    this.noMoreInfoDialog = false;
    this.$router.push("/overview");
  }

  mounted() {
    this.cancelChanges();
    this.unwatch.push(
      // Watches for route changes
      this.$watch("$route.path", val => {
        this.cancelChanges();
        this.clear = true;
        this.haveChanges = false;
      })
    );

    this.unwatch.push(
      // Watches for route changes
      this.$watch("noMoreInfoDialog", val => {
        if (val === false) {
          this.redirectToOverview();
        }
      })
    );
  }

  beforeDestroy() {
    for (let i in this.unwatch) {
      this.unwatch[i]();
    }
  }

  get deploymentDate() {
    let text = this.deployment._urn;

    let year = parseInt(text.split("/")[4].substring(0, 4));

    let month = parseInt(text.split("/")[4].substring(4, 6));

    let date = parseInt(text.split("/")[4].substring(6, 8));

    let hours = parseInt(text.split("/")[4].substring(9, 11));

    let minutes = parseInt(text.split("/")[4].substring(11, 13));

    let myDate = new Date(year, month, date, hours, minutes);

    return (
      myDate.getUTCDate() +
      "-" +
      myDate.getUTCMonth() +
      "-" +
      myDate.getUTCFullYear() +
      " " +
      myDate.getUTCHours() +
      ":" +
      myDate.getUTCMinutes()
    );
  }

  get isEntrypoint() {
    return this.deployment instanceof HTTPEntryPoint;
  }

  /** Obtains the deployment from the storage. */
  get deployment(): Deployment {
    let deployments = (<SSGetters>this.$store.getters).deployments;
    let res: Deployment = null;
    for (let key in deployments) {
      if (deployments[key]._path === this.$route.path) res = deployments[key];
    }
    if (!res) {
      this.noMoreInfoDialog = true;
    }
    return res;
  }

  get deploymentPersistentVolumes(): PersistentVolume[] {
    let res: PersistentVolume[] = [];
    let ser: Service = <Service>this.$store.getters.services[
      this.deployment.service
    ];
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
    let ser: Service = <Service>this.$store.getters.services[
      this.deployment.service
    ];
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
    let ser: Service = (<SSGetters>this.$store.getters).services[
      this.deployment.service
    ];
    if (!ser) {
      // This will be reached when deploying new services with bundles.
      this.$store.dispatch("getElementInfo", this.deployment.service);
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
    return channelId => {
      let sers = this.$store.getters.services;
      let ser: Service = sers[this.deployment.service];
      let type: string = ser.dependedChannels[channelId].type;
      let typeSearched: Channel.CHANNEL_TYPE[] = [];
      switch (type) {
        case Channel.CHANNEL_TYPE.ENDPOINT_REQUEST:
        case Channel.CHANNEL_TYPE.REQUEST:
          typeSearched = [
            Channel.CHANNEL_TYPE.REPLY,
            Channel.CHANNEL_TYPE.ENDPOINT_REPLY
          ];
          break;
        case Channel.CHANNEL_TYPE.ENDPOINT_REPLY:
        case Channel.CHANNEL_TYPE.REPLY:
          typeSearched = [
            Channel.CHANNEL_TYPE.REQUEST,
            Channel.CHANNEL_TYPE.ENDPOINT_REQUEST
          ];

        case Channel.CHANNEL_TYPE.SEND:
          typeSearched = [Channel.CHANNEL_TYPE.RECEIVE];
          break;

        case Channel.CHANNEL_TYPE.RECEIVE:
          typeSearched = [Channel.CHANNEL_TYPE.SEND];
          break;

        default:
          this.$store.dispatch(
            "addNotification",
            new Notification(
              Notification.LEVEL.ERROR,
              "Not expected channel type",
              "Not expected channel type " +
                type +
                " on " +
                ser._urn +
                ":" +
                channelId,
              "Not expected channel type " +
                type +
                " on " +
                ser._urn +
                ":" +
                channelId
            )
          );
      }

      let res: { value: string; text: string }[] = [];

      let deps = this.$store.getters.deployments;

      for (let deploymentId in deps) {
        if (!(deps[deploymentId] instanceof EntryPoint)) {
          let serviceId: string = deps[deploymentId].service;
          if (sers[serviceId]) {
            // if service exists
            for (let providedChannelId in sers[serviceId].providedChannels) {
              if (
                typeSearched.indexOf(
                  sers[serviceId].providedChannels[providedChannelId].type
                ) !== -1
              ) {
                let elem: {
                  value: string;
                  text: string;
                } = {
                  value: JSON.stringify({
                    deployment: deploymentId,
                    channel: providedChannelId
                  }),
                  text: deps[deploymentId].name + " ~ " + providedChannelId
                };

                if (res.indexOf(elem) === -1) res.push(elem);
              }
            }
          }
        }
      }
      return res;
    };
  }

  /** Obtains all depended deployment channels of actual deployed services. */
  get totalDependedDeploymentChannels() {
    return channelId => {
      let sers = this.$store.getters.services;
      let ser = sers[this.deployment.service];
      // Depending on the channel type, the search will be different
      let type: string = ser.providedChannels[channelId].type;
      let typeSearched: Channel.CHANNEL_TYPE[] = [];
      switch (type) {
        case Channel.CHANNEL_TYPE.ENDPOINT_REQUEST:
        case Channel.CHANNEL_TYPE.REQUEST:
          typeSearched = [
            Channel.CHANNEL_TYPE.REPLY,
            Channel.CHANNEL_TYPE.ENDPOINT_REPLY
          ];
          break;
        case Channel.CHANNEL_TYPE.ENDPOINT_REPLY:
        case Channel.CHANNEL_TYPE.REPLY:
          typeSearched = [
            Channel.CHANNEL_TYPE.REQUEST,
            Channel.CHANNEL_TYPE.ENDPOINT_REQUEST
          ];
          break;

        case Channel.CHANNEL_TYPE.SEND:
          typeSearched = [Channel.CHANNEL_TYPE.RECEIVE];
          break;

        case Channel.CHANNEL_TYPE.RECEIVE:
          typeSearched = [Channel.CHANNEL_TYPE.SEND];
          break;

        default:
          this.$store.dispatch(
            "addNotification",
            new Notification(
              Notification.LEVEL.ERROR,
              "Not expected channel type",
              "Not expected channel type " +
                type +
                " on " +
                ser._urn +
                ":" +
                channelId,
              "Not expected channel type " +
                type +
                " on " +
                ser._urn +
                ":" +
                channelId
            )
          );
      }

      let res: { value: string; text: string }[] = [];
      let deps = this.$store.getters.deployments;

      for (let deploymentId in deps) {
        if (
          deps[deploymentId] instanceof HTTPEntryPoint &&
          deps[deploymentId].channels["frontend"] &&
          deps[deploymentId].channels["frontend"].length > 0 &&
          deps[deploymentId].channels["frontend"][0].destinyDeploymentId !==
            this.deployment._urn
        ) {
          // If it's an entrypoint in use, and I'm not using it,
          // it's not in the list of possibles
        } else {
          let serviceId: string = deps[deploymentId].service;
          if (sers[serviceId]) {
            // if service exists
            for (let requiredChannelId in sers[serviceId].dependedChannels) {
              if (
                typeSearched.indexOf(
                  sers[serviceId].dependedChannels[requiredChannelId].type
                ) !== -1
              ) {
                let elem: {
                  value: string;
                  text: string;
                } = {
                  value: JSON.stringify({
                    deployment: deploymentId,
                    channel: requiredChannelId
                  }),
                  text: deps[deploymentId].name + " ~ " + requiredChannelId
                };

                if (res.indexOf(elem) === -1) {
                  res.push(elem);
                }
              }
            }
          }
        }
      }
      return res;
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
    // Remove links
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

    // Add new provided links
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

    // Add new depended links
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

    // If the number of instances has changed, a petition is sent
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
    if (this.$refs.form) {
      (<any>this.$refs.form).reset();
    }

    this.clear = true;
    this.loadDeploymentConnections(this.deployment, this.service);

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
$color_unkown: #bdbdbd;
$color_error: #ff5252;
$color_info: #2196f3;
$color_success: #4caf50;
$color_warning: #ffc107;
$icon_size: 80px;

#check_circle {
  color: $color_success;
  font-size: $icon_size;
}

#warning {
  color: $color_warning;
  font-size: $icon_size;
}

#error {
  color: $color_error;
  font-size: $icon_size;
}

#unknown {
  font-size: $icon_size;
}

input,
th,
td,
table {
  padding: 0px;
}
</style>