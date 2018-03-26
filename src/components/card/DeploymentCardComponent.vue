<template>
  <v-flex xs12 sm4 class="mb-4">

    <!-- Card's background represents the deployment's state -->
    <v-card style="max-width:350px; min-height:300px;" v-bind:class="stateColor" v-bind:to="deployment._path">

      <!-- Card title: Deployment name -->
      <v-card-title  primary-title class="headline pb-0">

        <v-icon class="ma-1" v-if="deployment instanceof HTTPEntryPoint">language</v-icon>
        <v-icon class="ma-1" v-if="deployment instanceof HTTPEntryPoint && hasCertificate">https</v-icon>

        <v-tooltip bottom>
          <span dark slot="activator">{{ deployment.name | truncateRight(18) }}</span>
          <span>{{ deployment.name }}</span>
        </v-tooltip>

        <v-spacer></v-spacer>

        <v-icon class="ma-1" v-if="state!=='unknown'" v-bind:id="state">{{ state }}</v-icon>
        <v-progress-circular v-else indeterminate color="light-blue lighten-4"></v-progress-circular>

      </v-card-title>

      <!-- Card body: Deployment stats -->
      <v-container class="pt-0">

        <!-- Flexible content allows good resize -->
        <v-flex>

          <!-- List of deployment's properties -->
          <v-list class="pt-0" v-bind:class="stateColor">

            <!-- Roles -->
            <template>
              <v-list-tile v-for="(rol, urn) in deployment.roles" v-bind:key="urn" tag="div">
                <v-list-tile-content>
                  <v-list-tile-title>{{ urn }}</v-list-tile-title>
                </v-list-tile-content>
                <v-card-actions>{{ rol.actualInstances }}</v-card-actions>
              </v-list-tile>
            </template>

            <!-- Persistent Volumes -->
            <template v-if="deploymentPersistentVolumes.length > 0">
              <v-list-tile v-for="(vol, index) in deploymentPersistentVolumes" v-bind:key="index" tag="div">
                <v-card-actions>
                  <v-icon class="indigo--text">storage</v-icon>
                </v-card-actions>
                <v-list-tile-title>
                  <v-tooltip bottom>
                    <div dark slot="activator">
                      <v-layout>
                        <v-flex xs6>{{ vol.name | truncateRight(15) }}</v-flex>
                        <v-flex xs6>{{ vol.size }} GB</v-flex>
                      </v-layout>
                    </div>
                    <span>{{ vol._urn }}</span>
                  </v-tooltip>
                </v-list-tile-title>
              </v-list-tile>
            </template>
            

             <!-- Volatile Volumes -->
            <template v-if="deploymentVolatileVolumes.length > 0">
              <v-list-tile v-for="(vol, index) in deploymentVolatileVolumes" v-bind:key="index" tag="div">
                <v-card-actions>
                  <v-icon class="orange--text text--lighten-2">storage</v-icon>
                </v-card-actions>
                <v-list-tile-title>
                  <v-layout>
                    <v-flex xs6>{{ vol.name | truncateRight(15) }}</v-flex>
                    <v-flex xs6>{{ vol.size }} GB</v-flex>
                  </v-layout>
                  <span>{{ vol._urn }}</span>
                </v-list-tile-title>
              </v-list-tile>
            </template>
            
            <!-- Links -->
            <template>

              <!-- Links are calculated with channel connections -->
              <div v-for="(channConnections, channName) in deployment.channels" v-bind:key="channName">
              <v-list-tile  v-for="(conn, index) in channConnections" v-bind:key="index" tag="div">
                <v-list-tile-title>{{ deployments[conn.destinyDeploymentId].name }}</v-list-tile-title>
              </v-list-tile>
              </div>

            </template>

            <!-- Websites -->
            <template v-if="deployment instanceof HTTPEntryPoint">
              <v-list-tile v-for="(web, index) in deployment.websites" v-bind:key="index" tag="div">
                <v-list-tile-title class="text-xs-center">
                  <a v-if="hasCertificate" v-bind:href="'https://' + web">{{ web }}</a>
                  <a v-else v-bind:href="'http://' + web">{{ web }}</a>
                </v-list-tile-title>
              </v-list-tile>
            </template>

          </v-list>

        </v-flex>

      </v-container>

    </v-card>

  </v-flex>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import {
  Certificate,
  Deployment,
  HTTPEntryPoint,
  PersistentVolume,
  VolatileVolume,
  Resource,
  Service
} from "../../store/stampstate/classes";
import SSGetters from "../../store/stampstate/getters";

import { utils } from "../../api";

@VueClassComponent({
  name: "deployment-card",
  props: {
    deploymentURN: { required: true, type: String }
  },
  filters: {
    truncateRight: function(text: string, value: number) {
      if (text.length < value) return text;
      return text.substring(0, value) + "...";
    },
    truncateLeft: function(text: string, value: number) {
      if (text) {
        if (text.length < value) return text;
        return text.substring(text.length - value, text.length);
      }
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
export default class Card extends Vue {
  /** Just a reference to the HTTPEntrypoint class. */
  HTTPEntryPoint = HTTPEntryPoint;

  /** The URN of the deployment represented by this card. */
  deploymentURN = this.deploymentURN;

  get deployment() {
    return this.deployments[this.deploymentURN];
  }

  get deployments() {
    return (<SSGetters>this.$store.getters).deployments;
  }

  get hasCertificate(): boolean {
    let res: boolean = false;
    for (let resource in this.deployment.resources) {
      if (
        this.$store.getters.certificates[this.deployment.resources[resource]]
      ) {
        res = true;
      }
    }
    return res;
  }

  get deploymentPersistentVolumes(): PersistentVolume[] {
    let res: PersistentVolume[] = [];
    let ser: Service = <Service>this.$store.getters.services[
      this.deployment.service
    ];
    if (ser) {
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
    }
    return res;
  }

  get deploymentVolatileVolumes(): VolatileVolume[] {
    let res: VolatileVolume[] = [];
    let ser: Service = <Service>this.$store.getters.services[
      this.deployment.service
    ];
    if (ser) {
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
    }

    return res;
  }

  get stateColor() {
    let res: string = "light-blue";
    switch (this.deployment.state) {
      case Deployment.Role.STATE.DANGER:
        res = "red";
        break;
      case Deployment.Role.STATE.WARNING:
        res = "yellow";
        break;
      case Deployment.Role.STATE.SUCCESS:
        res = "green";
        break;
      default: // Deployment.Role.STATE.UNKOWN
      // Value is already set as default
    }
    return res + " lighten-2";
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
        res = "unknown";
    }

    return res;
  }
}
</script>
<style lang="scss" scoped>
$color_green: #81c784;
$color_yellow: #fff176;
$color_red: #e57373ed;
$color_grey: #e0e0e0;
$color_blue: #64b5f6;
$icon_size: 40px;

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
  color: $color_grey;
  font-size: $icon_size;
}

#info {
  color: $color_blue;
  font-size: $icon_size;
}

#info_link {
  text-decoration: none;
}
</style>