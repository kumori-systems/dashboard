<!--
  This component is the small card showed in overview which represents each
  deployment.
-->
<template>
  <v-flex xs12 sm6 md6 lg4 xl3>

    <v-card class="ma-1 grey lighten-3">

      <v-card-title class="corporative_background title" style="white-space: nowrap;">
        {{ deploymentName }}
      </v-card-title>

      <v-divider light></v-divider>

      <!-- List of deployment's properties -->              
      <v-container>
        <div>

          <!-- Deployed date -->
          <div class="black--text">
            {{ deploymentDate }}
          </div>

          <div class="black--text">
            {{ serviceShortName(deployment.service) }}
          </div>
            

          <!-- Deployment sanity -->
          <v-icon
            v-if="state!=='unknown'"
            id="sanity_icon"
            v-bind:class="stateColor">
            {{ state }}
          </v-icon>

          <v-progress-circular
            v-else
            indeterminate
            id="sanity_icon"
            v-bind:class="state"/>

          <!-- Roles -->
          <div
            v-for="(role, urn) in deployment.roles"
            v-bind:key="urn">

            <v-list-tile-content class="black--text">

              <v-list-tile-title class="body-2">
                {{ urn }}
              </v-list-tile-title>

            </v-list-tile-content>

            <v-tooltip bottom>

              <v-progress-linear
                slot="activator"
                buffer-value=100
                :value="roleInstanceUssage(role.actualInstances, role.maxInstances).value"
                :color="roleInstanceUssage(role.actualInstances, role.maxInstances).color"
                buffer/>

              <span>{{role.actualInstances}}/{{role.maxInstances}} Instances</span>

            </v-tooltip>
                
          </div>
          
          <v-layout>

            <v-tooltip v-if="isEntrypoint" bottom>

              <v-icon slot="activator" color="grey lighten-1">language</v-icon>
              <span>is entrypoint</span>

            </v-tooltip>
            <v-tooltip v-if="hasCertificate" bottom>

              <v-icon slot="activator" color="grey lighten-1">https</v-icon>
              <span>has certificates</span>

            </v-tooltip>

            <!-- Persistent volumes -->
            <v-badge
              overlap
              bottom
              color=null
              v-for="(vol, index) in deploymentPersistentVolumes"
              v-bind:key="index">
              
              <v-icon v-if="volumeUsage(vol) >= 90" slot="badge" color="error">error</v-icon>
              <v-icon v-else-if="volumeUsage(vol) >= 75" slot="badge" color="warning">warning</v-icon>
              
              <v-tooltip bottom>
                <v-icon slot="activator" color="grey lighten-1">storage</v-icon>
                <span>Persistent volume {{ volumeUsage(vol) }}% used</span>
              </v-tooltip>

            </v-badge>

            <!-- Volatile volumes -->
            <v-badge
              overlap
              bottom
              color=null
              v-for="(vol, index) in deploymentVolatileVolumes"
              v-bind:key="index">
              
              <v-icon v-if="volumeUsage(vol) >= 90" slot="badge" color="error">error</v-icon>
              <v-icon v-else-if="volumeUsage(vol) >= 75" slot="badge" color="warning">warning</v-icon>

              <v-tooltip bottom>
                <v-icon slot="activator" color="grey lighten-1">sd_storage</v-icon>
                <span>Volatile volume {{ volumeUsage(vol) }}% used</span>
              </v-tooltip>

            </v-badge>

          </v-layout>

          <!-- Websites -->
          <div>

            <template v-if="isEntrypoint">
              <div v-for="(domain, index) in deployment.websites" v-bind:key="index">
                <a
                  v-bind:href="hasCertificate? 'https://' + domain.url : 'http://' + domain.url">
                  {{ domain.url }}
                </a>
              </div>
            </template>
            <template v-else>
              <div
                v-for="(domain, index) in linkedDomains"
                v-bind:key="index">
                <a
                  v-bind:href="domain.certificate? 'https://' + domain.web : 'http://' + domain.web">
                  {{ domain.web }}
                </a>
              </div>
            </template>
            
            
        </div>

          <!-- More info -->
          <v-layout>

            <!-- Links -->
            <div>  
              <v-chip
                v-for="(link, index) in linkList"
                v-bind:key="index"
                color="light-blue lighten-1 white--text">
                {{ trimName(link) }}
              </v-chip>
            </div>

            <v-spacer></v-spacer>

            <router-link
              id="info_link"
              v-bind:to="deployment._path">

              <v-tooltip bottom>

                <v-icon  slot="activator" id="info_icon">info</v-icon>
                <span>info</span>

              </v-tooltip>

            </router-link>

          </v-layout>

        </div>

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
  EntryPoint,
  PersistentVolume,
  VolatileVolume,
  Resource,
  Service,
  HTTPEntryPoint
} from "../../store/stampstate/classes";
import SSGetters from "../../store/stampstate/getters";

import { utils } from "../../api";

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
  name: "deployment-card",
  props: {
    deploymentURN: { required: true, type: String }
  },
  components: {},
  filters: {
    truncateRight: function(text: string, value: number) {
      if (text.length < value) return text;
      return text.substring(0, value) + "...";
    }
  }
})
export default class Card extends Vue {
  /** The URN of the deployment represented by this card. */
  deploymentURN: string = this.deploymentURN;

  /**
   * This variable gets fullfiled each time the window changes it's size with
   * the onResize directive.
   */
  deploymentName: string = null;

  /** Lifecycle point mounted. */
  mounted() {
    this.onResize();
  }

  /** Date when the service was deployed. */
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

  /** Actual deployment. */
  get deployment(): Deployment {
    return this.deployments[this.deploymentURN];
  }

  /** Obtains all deployments stored in the state. */
  get deployments() {
    return (<SSGetters>this.$store.getters).deployments;
  }

  /** Gets if the deployment is an instance of Entrypoint. */
  get isEntrypoint() {
    return this.deployment instanceof EntryPoint;
  }

  /** Obtains the link list of the actual deployment. */
  get linkList() {
    let res: string[] = [];
    for (let chann in this.deployment.channels) {
      for (let conn in this.deployment.channels[chann]) {
        res.push(
          this.deployments[
            this.deployment.channels[chann][conn].destinyDeploymentId
          ].name
        );
      }
    }
    return res;
  }

  /** Shows if the deployment (entrypoint) contains a certificate. */
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

  /** Services stored in the store. */
  get services() {
    return this.$store.getters.services;
  }

  /** Deployment persistent volumes. */
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

  /** Deployment volatile volumes. */
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

  /** Deployment state. */
  get state(): string {
    let res: string = null;
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

  /** Deployment state color. */
  get stateColor() {
    let res: string = null;
    switch (this.state) {
      case "check_circle":
        res = "check_circle";
        break;
      case "error":
        res = "state_error";
        break;
      case "warning":
        res = "state_warning";
        break;
      default:
        res = "unknown";
    }
    return res;
  }

  /**
   * Obtains all domains of this service. If it's an entrypoint then this will
   * return all domains associated with this entrypoint. If this is not an
   * entrypoint, then this will return a list of all domains of the entrypoints
   * linked whith this service.
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

  /** Returns the ussage of a volume. */
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

  /** Returns the short name of a service. */
  serviceShortName(serviceName:string){
    let res = serviceName;
    let i = res.indexOf("services") + 9;
    if(i === -1){
      i = res.indexOf("service") + 8;
    }
    if(i>-1){
      res = res.substring(i);
    }
    return res;
  }

  /** Sets an action to the onResize event. */
  onResize() {
    this.setDeploymentName();
  }

  /**
   * This is done to change the number of letters of the deployment name at the
   * card, thus this version of vuetify doesn't correctly hide the required
   * number of letters when the card component resizes.
   */
  setDeploymentName() {
    this.deploymentName = this.trimName(this.deployment.name);
  }

  /** Trims a string depending on the size view. */
  trimName(name: string): string {
    let res: string = name;
    let breakpointName = (<any>this).$vuetify.breakpoint.name;
    let headerSize = {
      xs: 23,
      sm: 23,
      md: 36,
      lg: 23,
      xl: 29
    };

    if (name.length >= headerSize[breakpointName]) {
      res = name.substr(0, headerSize[breakpointName]) + "..";
    }

    return res;
  }

  /** Obtains the ussage in a percentaje */
  roleInstanceUssage(
    numInstances: number,
    maxInstances: number
  ): { value: number; color: string } {
    let value: number = numInstances * 100 / maxInstances;
    let color: string = "info";

    if (value >= 75 && value < 90) {
      color = "warning";
    } else if (value > 90) {
      color = "error";
    }

    return { value, color };
  }
}
</script>
<style lang="scss" scoped>
$color_unkown: #bdbdbd;
$color_error: #ff5252;
$color_info: #2196f3;
$color_success: #4caf50;
$color_warning: #ffc107;

%icon_size {
  font-size: 35px;
}

.corporative_background {
  background: #d1406b;
}

.check_circle {
  @extend %icon_size;
  color: $color_success;
}

.state_warning {
  @extend %icon_size;
  color: $color_warning;
}

.state_error {
  @extend %icon_size;
  color: $color_error;
}

.info {
  @extend %icon_size;
  color: $color_info;
}

.unknown {
  @extend %icon_size;
  color: $color_unkown;
}

#info_link {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
  text-decoration: none;
}

#info_icon { 
  @extend .info;
}

#sanity_icon {
  position: absolute;
  top: 60px;
  right: 10px;
}
</style>