<template>
  <!-- Flexible content allows good resize: MarginAll size_eXtraSmall, size_SMall, size_MeDium, size_LarGe, size_eXtraLarge -->
  <v-flex ma-1 xs12 sm6 md5 lg5 xl3>
    <!-- Card's background represents the deployment's state -->
    <v-card>
      <!-- Card title: Deployment name -->
      <v-card-title primary-title class="headline" v-bind:class="stateColor">   
        {{ deployment.name }}
      <v-spacer></v-spacer>

      <v-tooltip bottom>
        <span dark slot="activator">{{ deployment._uri | truncateLeft(8)}}</span>
        <span>{{deployment._uri}}</span>
      </v-tooltip>
  
    </v-card-title>

    <!-- Card body: Deployment stats -->
    <v-container>

        <!-- Flexible content allows good resize -->
        <v-flex>
          <!-- List of deployment's properties -->
          <v-list two-line>

            <!-- Service -->
            <template>
              <v-subheader>
                <strong>DATE</strong>
                <v-spacer></v-spacer>
                <v-icon class="ma-1" v-bind:id="state">{{ state }}</v-icon>
                </v-subheader>
                <v-list-tile tag="div">
                  <v-card-actions>
                    <v-icon></v-icon>
                  </v-card-actions>
                  <v-list-tile-title>
                    {{ deployment._uri |day }}-{{ deployment._uri |month }}-{{ deployment._uri |year }}  {{ deployment._uri |hour }}:{{ deployment._uri |min }}
                  </v-list-tile-title>
                </v-list-tile>
            </template>

            <!-- Service -->
            <template>
              <v-subheader><strong>SERVICE</strong></v-subheader>
              <v-list-tile tag="div">
                <v-card-actions>
                  <v-icon></v-icon>
                </v-card-actions>
                <v-list-tile-title>
                  <v-tooltip bottom>
                    <span dark slot="activator">  {{ deployment.service }}</span>
                    <span>{{deployment.service}}</span>
                  </v-tooltip>
                </v-list-tile-title>
              </v-list-tile>
            </template>

            <!-- Roles -->
            <template>
              <v-subheader><strong>ROLES</strong></v-subheader>
              <v-list-tile v-for="(rol, uri) in deployment.roles" v-bind:key="uri" tag="div">
                <v-card-actions>
                  <v-icon></v-icon>
                </v-card-actions>
                <v-list-tile-content>
                  <v-list-tile-title>{{ uri }}</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <v-tooltip bottom>
                      <span dark slot="activator">{{ rol.component }}</span>
                      <span>{{rol.component}}</span>
                    </v-tooltip>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-card-actions>{{ rol.actualInstances }}</v-card-actions>
              </v-list-tile>
            </template>

            <!-- Links -->
            <template v-if="deployment.links.length > 0">
              <v-subheader><strong>LINKS</strong></v-subheader>
              <v-list-tile v-for="(link, index) in deployment.links" v-bind:key="index" tag="div">
                <v-card-actions>
                  <v-icon></v-icon>
                </v-card-actions>
                <v-list-tile-title>
                  {{ findDeployment(link.toDeployment).name }}
                </v-list-tile-title>
              </v-list-tile>
            </template>

            <!-- Volumes -->
            <template v-if="false && !isHTTPEntryPoint">
                <v-subheader><strong>VOLUMES</strong></v-subheader>
                <!--<div v-if="deployment.volumes !== null && deployment.volumes.length>0"><div v-for="(volume, index) in deployment.volumes" v-bind:key="index" class="tile"><i class="fa fa-circle"></i><div>{{volume}}</div></div></div>-->
            </template>

            <!-- Websites -->
            <template v-if="isHTTPEntryPoint">
              <v-subheader><strong>WEBSITES</strong></v-subheader>
              <v-list-tile v-for="(web, index) in deployment.websites" v-bind:key="index" tag="div">
                <v-card-actions>
                  <v-icon></v-icon>
                </v-card-actions>
                <v-list-tile-title>
                  <a v-bind:href="'http://' + web">{{ web }}</a>
                </v-list-tile-title>
              </v-list-tile>
            </template>

          </v-list>
          <v-layout>
            <v-spacer></v-spacer>
              <router-link id="info_link" v-bind:to="deployment._path">
                <v-icon id="info">info</v-icon>
              </router-link>
          </v-layout>
        </v-flex>
      </v-container>
    </v-card>
  </v-flex>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { Deployment, HTTPEntryPoint } from "../../store/stampstate/classes";
import SSGetters from "../../store/stampstate/getters";

@VueClassComponent({
  name: "deployment-card",
  props: {
    deploymentURI: { required: true, type: String }
  },
  filters: {
    truncateRight: function(text: string, value: number) {
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
  /** <string> Deployment represented in this card. */
  deploymentURI: string = this.deploymentURI;

  get deployment(): Deployment {
    return (((<SSGetters>this.$store.getters).deployment as any) as (
      deploymentURI: string
    ) => Deployment)(this.deploymentURI);
  }

  get findDeployment(): (deploymentURI: string) => Deployment {
    return (deploymentURI: string): Deployment => {
      return (((<SSGetters>this.$store.getters).deployment as any) as (
        deploymentURI: string
      ) => Deployment)(deploymentURI);
    };
  }

  get isHTTPEntryPoint(): boolean {
    return this.deployment instanceof HTTPEntryPoint;
  }

  get stateColor() {
    let res: string = "grey";
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
        res = "help";
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

#help {
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