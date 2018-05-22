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

          <!-- Deployment sanity -->
            <v-icon
              v-if="state!=='unknown'"
              id="sanity_icon"
              v-bind:class="state">
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

            <v-icon v-if="isEntrypoint" class="ma-1 black--text">language</v-icon>
            
            <v-icon v-if="hasCertificate" class="black--text">https</v-icon>

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
                <v-icon slot="activator" class="indigo--text">storage</v-icon>
                <span>{{ volumeUsage(vol) }}%</span>
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
                <v-icon slot="activator" class="light-blue--text text--lighten-2">storage</v-icon>
                <span>{{ volumeUsage(vol) }}%</span>
              </v-tooltip>

            </v-badge>

          </v-layout>

            <!-- Websites -->
            <div>
              <a
                v-for="(web, index) in deployment.websites"
                v-bind:key="index"
                v-bind:href="hasCertificate? 'https://' + web : 'http://' + web">
                <span v-if="index!==0">,</span>
                {{ web }}
              </a>
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
              id="info_icon"
              v-bind:to="deployment._path">

              <v-icon id="info_link">info</v-icon>

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
  Service
} from "../../store/stampstate/classes";
import SSGetters from "../../store/stampstate/getters";

import { utils } from "../../api";

@VueClassComponent({
  name: "deployment-card",
  props: {
    deploymentURN: { required: true, type: String }
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

  get deployment(): Deployment {
    return this.deployments[this.deploymentURN];
  }

  get deployments() {
    return (<SSGetters>this.$store.getters).deployments;
  }

  get isEntrypoint() {
    return this.deployment instanceof EntryPoint;
  }

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
    console.debug("The list of volatile volumes contains", res);
    return res;
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

  mounted() {
    this.onResize();
  }

  get volumeUsage() {
    return volume => {
      let res = -1;
      for (let item in volume.items){
        if(volume.items[item].usage > res){res = volume.items[item].usage}
      }
       
      return res;
    };
  }

  onResize() {
    this.setDeploymentName();
  }

  setDeploymentName() {
    this.deploymentName = this.trimName(this.deployment.name);
  }

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

.warning {
  @extend %icon_size;
  color: $color_warning;
}

.error {
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

#info_icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

#info_link {
  @extend .info;
  text-decoration: none;
}

#sanity_icon {
  position: absolute;
  top: 60px;
  right: 10px;
}
</style>