<!--
  This component represents the detailed deployment view.
 *******************************************************************************
 * README - Gestión de los diferentes estados y modificaciones. Motivado porque
 *   un mismo equipo utiliza el mismo usuario, por lo que tenemos varias
 *   personas realizando cambios con el mismo identificador, de forma
 *   concurrente y con distintas herramientas sobre la plataforma.
 *******************************************************************************
 * 1 - Se muestra el estado de la plataforma.
 * 2 - Se clica sobre 'edit'.
 *    * Se calcula un hash del estado permanente del despliegue => H
 *    * Se crea un estado temporal copia del estado permanente
 * 3 - Se realizan modificaciones.
 *    * Mientras se realizan modificaciones el estado temporal no es actualizado
 *       por los cambios de la plaltaforma
 *    * Visualmente se refleja el estado temporal
 *    * Las modificaciones se guardan en el estado temporal
 * 4.A - Se pulsa en 'apply changes'.
 *    * Se realiza un hash del estado persistente => H'; ¿H = H'?
 *        SI -> Evío de los cambios a la plataforma
 *        NO -> - Advertimos al usuario de que hay conflictos
 *              - Cancelamos los cambios
 * 4.B - Se cancelan los cambios.
 *    * Se descarta H y el estado temporal
 *******************************************************************************
-->
<template>
  <v-form ref="form" lazy-validation>

    <v-card v-if="deployment" style="max-width:1300px">

      <v-card-title class="mybackground">
        
        <!-- View title-->
        <h3 class="headline mb-0">

          <!-- Deployment state -->
          <v-icon v-bind:id="state" v-if="state!=='unknown'">{{ state }}</v-icon>
          <v-progress-circular v-else indeterminate color="light-blue lighten-4"></v-progress-circular>

          <span v-if="isEntrypoint(deployment)">
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

          <!-- Enable edition -->
          <v-btn v-if="!editing" class="elevation-0" v-on:click="prepareEdition" color="warning">Edit</v-btn>

          <!-- Edition options -->
          <template v-else>

            <!-- Apply changes -->
            <v-btn class="elevation-0" v-bind:disabled="!haveChanges" color="warning" v-on:click="applyChanges">Apply changes</v-btn>

            <!-- Cancel -->
            <v-btn outline v-on:click="cancelChanges">Cancel</v-btn>

          </template>

        </v-card-actions>
        
      </v-card-title>
      
      <!-- Divides the swections of the card -->
      <v-divider></v-divider>

      <!-- Main content of the view-->
      <v-container fluid id="deployment-item-view" class="mybackground">

        <!-- Deployment general info -->
        <v-container fluid id="deployment-item-view">

          <v-layout wrap>

            <!-- Detailed info -->
            <v-flex xs12 sm6>

              <v-layout wrap>

                <!-- Deployment urn -->
                <v-flex xs12>
                  <strong>URN: </strong>{{ deployment._urn }}
                </v-flex>

                <!-- Deployment creation date -->
                <v-flex xs12>
                  <strong>Date: </strong>{{ deploymentDate}}
                </v-flex>

                <!-- Deployment service -->
                <v-flex xs12>
                  <strong>Service: </strong>{{ deployment.service }}
                </v-flex>

              </v-layout>

              <!-- Persistent Volumes -->
              <template v-if="deploymentPersistentVolumes.length > 0">
                <strong>Persistent volumes:</strong>
                <v-list class="pa-0">
                  <v-list-tile v-for="(vol, index) in deploymentPersistentVolumes" v-bind:key="index" tag="div" class="mybackground">

                    <v-card-actions>
                      <v-badge
                        overlap
                        bottom
                        color=null
                        v-for="(vol, index) in deploymentPersistentVolumes"
                        v-bind:key="index">

                        <v-icon v-if="volumeUsage(vol) >= 90" slot="badge" color="error">error</v-icon>
                        <v-icon v-else-if="volumeUsage(vol) >= 75" slot="badge" color="warning">warning</v-icon>

                        <v-icon  color="grey lighten-1">storage</v-icon>

                      </v-badge>

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
                  <v-list-tile
                    v-for="(vol, index) in deploymentVolatileVolumes"
                    v-bind:key="index"
                    tag="div"
                    class="mybackground">

                    <v-card-actions>
                      <v-badge
                        overlap
                        bottom
                        color=null
                        v-for="(vol, index) in deploymentVolatileVolumes"
                        v-bind:key="index">

                        <v-icon
                          v-if="volumeUsage(vol) >= 90"
                          slot="badge"
                          color="error">
                          error
                        </v-icon>
                        <v-icon
                          v-else-if="volumeUsage(vol) >= 75"
                          slot="badge"
                          color="warning">
                          warning
                        </v-icon>

                        <v-icon color="grey lighten-1">sd_storage</v-icon>

                      </v-badge>

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
                <v-flex xs12>
                  <strong>Websites:</strong>
                  <template v-if="isEntrypoint(deployment)">
                    <a
                      v-for="(domain, index) in deployment.websites"
                      v-bind:key="index"
                      v-bind:href="hasCertificate? 'https://' + domain.url : 'http://' + domain.url">
                      <span v-if="index!==0">,</span>
                      {{ domain.url }}
                    </a>
                  </template>
                  <a
                    v-else
                    v-for="(domain, index) in linkedDomains"
                    v-bind:key="index"
                    v-bind:href="domain.certificate? 'https://' + domain.web : 'http://' + domain.web">
                    <span v-if="index!==0">,</span>
                    {{ domain.web }}
                  </a>    
                </v-flex>
              </v-layout>

              <!-- Deployment links -->
              <v-layout>
                <v-flex xs12>
                  <strong>Connections:</strong>

                  <!-- Link table representation -->
                  <table>

                    <!-- Provided Channels -->
                    <tr v-for="(conn, name) in service.providedChannels" v-bind:key="name">
                      <th>
                        <v-chip color="lime darken-1 white--text">{{ name }}</v-chip>
                      </th>
                      <th>
                        <v-select
                          v-bind:disabled="!editing"
                          v-bind:value="deploymentProvidedConnections(name)"
                          v-bind:items="totalDependedDeploymentChannels(name)"
                          v-on:change="(val)=>{HandleDeploymentProvidedConnections(name, val)}"
                          autocomplete
                          multiple
                          chips>

                          <!-- Chips config-->
                          <template
                            slot="selection"
                            scope="items">
                            <v-chip
                              @input="items.parent.selectItem(items.item)"
                              v-bind:close="editing"
                              color="light-blue lighten-1 white--text">
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
                          v-bind:disabled="!editing"
                          v-bind:value="deploymentDependedConnections(name)"
                          v-bind:items="totalProvidedDeploymentChannels(name)"
                          v-on:change="(val)=>{HandleDeploymentDependedConnections(name, val)}"
                          autocomplete
                          multiple
                          chips>

                          <!-- Chips config-->
                          <template slot="selection" scope="items">
                            <v-chip 
                              @input="items.parent.selectItem(items.item)"
                              v-bind:close="editing"
                              color="light-blue lighten-1 white--text">
                              {{ items.item.text }}
                            </v-chip>
                          </template>

                        </v-select>
                      </th>
                      <th>
                        <v-chip color="lime darken-1 white--text">{{ name }}</v-chip>
                      </th>
                    </tr>
                  </table>
                </v-flex>
              </v-layout>
                
            </v-flex>

            <!-- Adds space between elements -->
            <v-spacer></v-spacer>

            <!-- Deployment chart -->
            <v-flex xs12 sm5>
              <deployment-chart-component
                class="deployment-chart"
                v-bind:chartData="deploymentMetrics.data"
                v-bind:options="chartOptions"
                v-bind:width="800"
                v-bind:height="600"/>
            </v-flex>

          </v-layout>

        </v-container>

        <!-- Deployment roles -->
        <v-layout wrap>

          <v-flex
            v-for="(rolContent, roleId) in deployment.roles"
            v-bind:key="roleId"
            xs12>

            <role-card-component
              v-bind:role="rolContent"
              v-bind:service="service"
              v-bind:roleMetrics="deploymentMetrics.roles"
              v-bind:volumeMetrics="volumeMetrics"
              v-bind:persistentVolumes="persistentVolumes"
              v-bind:volatileVolumes="volatileVolumes"
              v-bind:editing="editing"
              v-on:killInstanceChange="handleKillInstanceChange"
              v-on:numInstancesChange="handleNumInstancesChange"/>

          </v-flex>

        </v-layout>

      </v-container>
    </v-card>

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

    <!-- Unable to change -->
    <v-dialog v-model="unableToChangeDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">Change conflict</v-card-title>
        <v-card-text>
          The service has changed since you entered in edit mode and the actual
          changes won't be applied
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat="flat" @click.native="unableToChangeDialog = false">accept</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { sha256, Hasher } from "js-sha256";

/*
  This is a decorator and it's used because typescript doesn't implement all
  required properties of a vue component.

  All properties of the typescript class will be compiled as vue data.
  All methods inside the class will be compiled as computed properties (get, set
  methods)
  or common methods (non-get, non-set).
  There are special methods like mounted, created or destroy which are part of
  the vue lifecycle and will be rendered as special lifecycle methods.
*/
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

  /** Vue wrapper for the Chart options. */
  chartOptions = ChartComponentOptions;

  /**
    This dialog should appear when the deployment which is beeing viewed was
    undeployed (by someone else) and the information is no longer available.
  */
  noMoreInfoDialog: boolean = false;

  /** Show/Hide dialog undeploy element. */
  undeployElementDialog: boolean = false;

  /**
   * While the local user was in edition mode something has changed and changes
   * can't be applied.
   */
  unableToChangeDialog: boolean = false;

  /** Marks if there are changes to commit. */
  haveChanges: boolean = false;

  /** Marks if the user is editing the deployment. */
  editing: boolean = false;

  /** Stores a hash of the state before entering in editting mode. */
  temporaryOriginStateHash: Hasher = null;

  /** Temporary stored for editting mode provided links. */
  temporaryProvidedLinks = {};

  /** Temporary stored for editting mode depended links. */
  temporaryDependedLinks = {};

  /** Temporary stored for editting mode role instances. */
  temporaryRoleInstances: { [rolId: string]: number } = {};

  /** Signal to kill instances. */
  instanceKill: { [rolId: string]: { [instanceId: string]: boolean } } = {};

  /** Array of watcher functions. */
  unwatch: Function[] = [];

  /** Vue lifecycle. Adds watchers. */
  mounted() {
    this.cancelChanges();

    this.unwatch.push(
      // Watches for route changes
      this.$watch("$route.path", val => {
        this.cancelChanges();
        this.haveChanges = false;
      })
    );

    this.unwatch.push(
      // Watches for the noMoreInfo dialog
      this.$watch("noMoreInfoDialog", val => {
        // If the dialog is closed, the user is redirected to overview
        if (val === false) {
          this.redirectToOverview();
        }
      })
    );
  }

  /** Vue lifecycle. Removes watchers. */
  beforeDestroy() {
    // Removes all watchers
    for (let i in this.unwatch) {
      this.unwatch[i]();
    }
  }

  /** Obtains all stored deployments. */
  get deployments(): { [deploymentURN: string]: Deployment } {
    return ((<SSGetters>this.$store.getters).deployments as any) as {
      [deploymentURN: string]: Deployment;
    };
  }

  /** Obtains all stored services. */
  get services(): { [serviceURN: string]: Service } {
    return ((<SSGetters>this.$store.getters).services as any) as {
      [serviceName: string]: Service;
    };
  }

  /**
   * Obtains the actual service. Required to obtain additional information of a
   * role.
   */
  get service(): Service {
    let serviceURN = this.deployment.service;
    let ser: Service = this.services[serviceURN];
    if (!ser) {
      // This will be reached when deploying new services with bundles.
      this.$store.dispatch("getElementInfo", serviceURN);
    }
    return ser;
  }

  /** Obtains the deployment from the storage. */
  get deployment(): Deployment {
    let res: Deployment = null;
    let deployments = this.deployments;
    for (let key in deployments) {
      if (deployments[key]._path === this.$route.path) {
        res = deployments[key];
      }
    }
    if (!res) {
      this.noMoreInfoDialog = true;
    }
    return res;
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

  /** Obtains and parses the deployment date from it's urn. */
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

  /** Temporary provided connections. */
  get deploymentProvidedConnections() {
    return channel => {
      let res: { [channel: string]: { text: string; value: string }[] } = {};

      if (this.editing) {
        res = this.temporaryProvidedLinks;
      } else {
        // Obtain provided connections from the service
        for (let chann in this.service.providedChannels) {
          if (!res[chann]) {
            res[chann] = [];
          }

          if (this.deployment.channels[chann]) {
            for (let conn in this.deployment.channels[chann]) {

              // Adds chips with readable text
              res[chann].push({
                text:
                  this.deployments[
                    this.deployment.channels[chann][conn].destinyDeploymentId
                  ].name +
                  " ~ " +
                  this.deployment.channels[chann][conn].destinyChannelId,
                value: JSON.stringify({
                  deployment: this.deployment.channels[chann][conn]
                    .destinyDeploymentId,
                  channel: this.deployment.channels[chann][conn]
                    .destinyChannelId
                })
              });

            }
          }
        }
      }
      return channel ? res[channel] : res;
    };
  }

    /**
   * Sets the deployment provided connections. Here a trick was used because
   * it was the only way to fit with all requirements.
   */
  set deploymentProvidedConnections(val) {
    this.temporaryProvidedLinks [
      (<any>val(1)).channel
      ] =  (<any>val(1)).value;
    this.haveChanges = true;
  }
  /**
   * Obtains deployment depended connections. The result will be different
   * depending if the edit mode is on or off.
   */
  get deploymentDependedConnections() {
    return channel => {

      let res: { [channel: string]: { text: string; value: string }[] } = {};

      if (this.editing) {
        res = this.temporaryDependedLinks;
      } else {
        // Obtain provided connections from the service
        for (let chann in this.service.dependedChannels) {
          if (!res[chann]) {
            res[chann] = [];
          }

          if (this.deployment.channels[chann]) {
            for (let conn in this.deployment.channels[chann]) {

              // Adds chips with readable text
              res[chann].push({
                text:
                  this.deployments[
                    this.deployment.channels[chann][conn].destinyDeploymentId
                  ].name +
                  " ~ " +
                  this.deployment.channels[chann][conn].destinyChannelId,
                value: JSON.stringify({
                  deployment: this.deployment.channels[chann][conn]
                    .destinyDeploymentId,
                  channel: this.deployment.channels[chann][conn]
                    .destinyChannelId
                })
              });

            }
          }
        }
      }
      return channel ? res[channel] : res;
    };
  }

  /**
   * Sets the deployment depended connections. Here a trick was used because
   * it was the only way to fit with all requirements.
   */
  set deploymentDependedConnections(val) {
    this.temporaryDependedLinks[
      (<any>val(1)).channel
      ] =  (<any>val(1)).value;
    this.haveChanges = true;
  }

  /** This is a trick to update links which fits with all requirements. */
  HandleDeploymentDependedConnections(channel, value) {
    this.deploymentDependedConnections = (a)=>{return  {channel:channel, value:value}; };
  }

  /** This is a trick to update links which fits with all requirements. */
  HandleDeploymentProvidedConnections(channel, value) {
    this.deploymentProvidedConnections = (a)=>{return  {channel:channel, value:value}; };
  }

  /** Obtains volume metrics from the storage. */
  get volumeMetrics() {
    return this.$store.getters.volumeMetrics;
  }

  /** Obtains persistent volumes from the storage. */
  get persistentVolumes(): { [volumeURN: string]: PersistentVolume } {
    return this.$store.getters.persistentVolumes;
  }

  /** Obtains volatile volumes from the storage. */
  get volatileVolumes(): { [volumeURN: string]: VolatileVolume } {
    return this.$store.getters.volatileVolumes;
  }

  /** Obtains volume ussage from the storage. */
  get volumeUsage() {
    return volume => {
      let res = -1;
      for (let item in volume.items) {
        if (volume.items[item].usage > res) {
          res = volume.items[item].usage;
        }
      }

      return res;
    };
  }

  /** Obtains persistent volumes related to this deployment. */
  get deploymentPersistentVolumes(): PersistentVolume[] {
    let ser = this.service;
    let volumes = this.persistentVolumes;
    let res: PersistentVolume[] = [];
    for (let resName in ser.resources) {
      if (
        utils.getResourceType(ser.resources[resName]) ===
        Resource.RESOURCE_TYPE.PERSISTENT_VOLUME
      ) {
        if (this.deployment.resources[resName]) {
          res.push(volumes[this.deployment.resources[resName]]);
        }
      }
    }
    return res;
  }

  /** Obtains volatile volumes related to this deployment. */
  get deploymentVolatileVolumes(): VolatileVolume[] {
    let ser = this.service;
    let volumes = this.volatileVolumes;
    let res: VolatileVolume[] = [];
    for (let resName in ser.resources) {
      if (
        utils.getResourceType(ser.resources[resName]) ===
        Resource.RESOURCE_TYPE.VOLATILE_VOLUME
      ) {
        if (this.deployment.resources[resName]) {
          res.push(volumes[this.deployment.resources[resName]]);
        }
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
      let ser: Service = this.service;
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

      let deployments = this.deployments;

      for (let deploymentId in deployments) {
        if (!(deployments[deploymentId] instanceof EntryPoint)) {
          let serviceId: string = deployments[deploymentId].service;
          if (this.services[serviceId]) {
            // if service exists
            for (let providedChannelId in this.services[serviceId]
              .providedChannels) {
              if (
                typeSearched.indexOf(
                  this.services[serviceId].providedChannels[providedChannelId]
                    .type
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
                  text:
                    deployments[deploymentId].name + " ~ " + providedChannelId
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
      let ser = this.service;
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
          if (this.services[serviceId]) {
            // if service exists
            for (let requiredChannelId in this.services[serviceId]
              .dependedChannels) {
              if (
                typeSearched.indexOf(
                  this.services[serviceId].dependedChannels[requiredChannelId]
                    .type
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

  /** Does this deployment have a certificate? */
  get hasCertificate() {
    return this.deployment.resources["server_cert"] ? true : false;
  }

  /**
   * Obtains linked domains. If this deployment is an entrypoint, then it's
   * domains will be returned. If this deployment is not an entrypoint, then
   * links will be followed to see all linked entrypoints with it's respective
   * domains.
   */
  get linkedDomains(): { web: string; certificate: boolean }[] {
    let res: { web: string; certificate: boolean }[] = [];

    for (let chann in this.deployment.channels) {
      for (let conn in this.deployment.channels[chann]) {
        let deployment = this.deployments[
          this.deployment.channels[chann][conn].destinyDeploymentId
        ];

        if (deployment instanceof HTTPEntryPoint) {
          res.push({
            web: (<HTTPEntryPoint>deployment).roles["sep"].configuration.domain,
            certificate:
              Object.keys(
                (<HTTPEntryPoint>deployment).roles["sep"].configuration.secrets
              ).length > 0
          });
        }
      }
    }
    return res;
  }

  /**
   * Prepares the data to the edition mode.
   */
  prepareEdition() {
    // Get the hash value of the actual deployment
    this.temporaryOriginStateHash = sha256.create();
    this.temporaryOriginStateHash.update(JSON.stringify(this.deployment));

    this.temporaryProvidedLinks = this.deploymentProvidedConnections(null);

    this.temporaryDependedLinks = this.deploymentDependedConnections(null);

    this.temporaryRoleInstances = {};

    // Ignores the innitial assignations
    this.haveChanges = false;

    // Setts edditing mode to true
    this.editing = true;
  }

  /**
   * Compares the temporary state with the real state and sends to the stamp
   * the differences.
   */
  applyChanges(): void {
    // Get the hash of the actual state and compare it with the old hash
    let actualHash = sha256.create();
    actualHash.update(JSON.stringify(this.deployment));

    if (actualHash.toString() !== this.temporaryOriginStateHash.toString()) {
      /*
        Changes can't be applied because the hash has changed and that means
        someone has been doing changes in the deployment while the local user
        was in edit mode.
      */
     
     console.error('Changes cant be applied');
     this.unableToChangeDialog = true;

      // @todo Message to the user and cancel changes.
    } else {
      // Remove links
      for (let chann in this.deployment.channels) {
        for (let realConn in this.deployment.channels[chann]) {
          let found = false; // Marks if the connection has been found

          // Search in provided links
          for (let tempConn in this.deploymentProvidedConnections[chann]) {
            if (
              this.deploymentProvidedConnections[chann][tempConn].value ===
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
          for (let tempConn in this.deploymentDependedConnections[chann]) {
            if (
              this.deploymentDependedConnections[chann][tempConn].value ===
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
      for (let chann in this.deploymentProvidedConnections) {
        for (let tempConn in this.deploymentProvidedConnections[chann]) {
          let found = false; // Checks if the connection has been found

          // Search in deployment channels
          for (let realConn in this.deployment.channels[chann]) {
            if (
              this.deploymentProvidedConnections[chann][tempConn].value ===
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
              this.deploymentProvidedConnections[chann][tempConn].value
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
      for (let chann in this.deploymentDependedConnections) {
        for (let tempConn in this.deploymentDependedConnections[chann]) {
          let found = false; // Checks if the connection has been found

          // Search in deployment channels
          for (let realConn in this.deployment.channels[chann]) {
            if (
              this.deploymentDependedConnections[chann][tempConn].value ===
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
              this.deploymentDependedConnections[chann][tempConn].value
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
          this.temporaryRoleInstances[role] &&
          this.deployment.roles[role].actualInstances !==
            this.temporaryRoleInstances[role]
        ) {
          changedNumInstances = true;
        }
      }

      if (changedNumInstances) {
        // Send changes to the stamp
        this.$store.dispatch("aplyingChangesToDeployment", {
          deploymentURN: this.deployment._urn,
          roleNumInstances: this.temporaryRoleInstances,
          killInstances: this.instanceKill
        });
      }
    }

    // Marc as there are no changes
    this.haveChanges = false;
    this.editing = false;
  }

  /**
   * Method called when another used undeployed this deployment and this user
   * has to be redirected to overview.
   */
  redirectToOverview() {
    this.noMoreInfoDialog = false;
    this.$router.push("/overview");
  }

  /**
   * Cancel changes done in edit mode.
   */
  cancelChanges(): void {
    if (this.$refs.form) {
      (<any>this.$refs.form).reset();
    }
    this.haveChanges = false;
    this.editing = false;
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
    this.temporaryRoleInstances[tempRol] = value;
    this.haveChanges = true;
  }

  /**
   * Returns if a given deployment is an instance of entrypoint
   */
  isEntrypoint(deployment: Deployment): boolean {
    return utils.isEntrypoint(deployment);
  }
}
</script>
<style lang="scss" scoped>
$color_unkown: #bdbdbd;
$color_error: #ff5252;
$color_info: #2196f3;
$color_success: #4caf50;
$color_warning: #ffc107;
$icon_size: 50px;

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