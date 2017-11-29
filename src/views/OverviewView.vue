<template>
    <v-container fluid id="overview-view">
        <!-- Deployments Found -->
        <v-layout row wrap v-if="numDeployments > 0">
            <deployment-card-component v-for="(deployment, deploymentURI) in deployments" v-bind:key="deploymentURI" v-bind:deploymentURI="deploymentURI"></deployment-card-component>
        </v-layout>

        <!-- No deployments found -->
        <v-layout v-else wrap>
            <!-- Bief tutorial of how recognize a disconnected deployment -->
            <!-- Bief tutorial of how to create a deployment -->
            Start making some deployments
        </v-layout>
    </v-container>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import SSGetters from "../store/stampstate/getters";
import { Deployment } from "../store/stampstate/classes";

import { DeploymentCardComponent } from "../components";

@VueClassComponent({
  name: "OverviewView",
  components: {
    "deployment-card-component": DeploymentCardComponent
  }
})
export default class OverviewView extends Vue {
  /**
     * Obtains actual number of deployments.
     * @return <number> actual number of deployments.
     */
  get numDeployments(): number {
    return ((<SSGetters>this.$store.getters).numDeployments as any) as number;
  }

  /**
     * Obtains all deployments stored in the state.
     * @return <{ [uri: string]: Deployment }> all deployments stored in the state.
     */
  get deployments(): { [uri: string]: Deployment } {
    return ((<SSGetters>this.$store.getters).deployments as any) as {
      [uri: string]: Deployment;
    };
  }
}
</script>