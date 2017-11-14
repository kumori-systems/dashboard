<template>
    <!-- Flexible content allows good resize: MarginAll size_eXtraSmall, size_SMall, size_MeDium, size_LarGe, size_eXtraLarge -->
    <v-flex ma-1 xs12 sm6 md5 lg5 xl3>
        <!-- The entire card is a link to the deployment's details -->
        <router-link v-bind:to="deployment._path">
            <!-- Card's background represents the deployment's state -->
            <v-card v-bind:class="stateColor">

                <!-- Card title: Deployment name -->
                <v-card-title primary-title class="headline" v-bind:class="stateColor">
                    {{ deployment.name }}
                    <v-spacer></v-spacer>
                    {{ deployment._uri | truncateLeft(8)}}
                </v-card-title>

                <!-- Card body: Deployment stats -->
                <v-container>

                    <!-- Flexible content allows good resize -->
                    <v-flex>

                        <!-- List of deployment's properties -->
                        <v-list two-line v-bind:class="stateColor">

                            <!-- Service -->
                            <template>
                                <v-subheader><strong>SERVICE</strong></v-subheader>
                                <v-list-tile tag="div">
                                  <v-card-actions>
                                        <v-icon></v-icon>
                                    </v-card-actions>
                                    <v-list-tile-title>
                                        {{ deployment.service | truncateLeft(40) }}
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
                                      <v-list-tile-sub-title>{{ rol.component | truncateLeft(28) }}</v-list-tile-sub-title>
                                    </v-list-tile-content>
                                    <v-card-actions>
                                        <span class="grey--text text--darken-2">{{ rol.minInstances }}:</span>
                                        {{ rol.actualInstances }}
                                        <span class="grey--text text--darken-2">:{{ rol.maxInstances }}</span>
                                    </v-card-actions>
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
                                    <v-list-tile-title>{{ web }}</v-list-tile-title>
                                </v-list-tile>
                            </template>

                        </v-list>
                    </v-flex>
                </v-container>
            </v-card>
        </router-link>
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
        return "..." + text.substring(text.length - value, text.length);
      }
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
}
</script>
<style lang="scss" scoped>
a {
  text-decoration: none;
}
</style>