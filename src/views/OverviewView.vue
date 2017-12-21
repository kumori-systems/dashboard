<template>  
  <v-card>
    <v-card-actions>
      <v-btn-toggle mandatory v-model="toggle_one" >
        <v-btn flat value="all">
          <span>All</span>
        </v-btn>
        <v-btn flat value="entrypoints">
          <span>Entrypoints</span>
          <v-icon>language</v-icon>      
        </v-btn>
        <v-btn flat value="deployments">
          <span>Common Deployments</span>
          <v-icon>cloud</v-icon>
        </v-btn>
      </v-btn-toggle>
      <v-spacer></v-spacer>
      <v-btn  color="primary" outline>
        <span>Add Common Deployment</span>
        <v-icon right>cloud</v-icon>
      </v-btn>
      <v-btn color="primary" outline>
        <span>Add Entrypoint</span>
        <v-icon right>language</v-icon>
      </v-btn>
    </v-card-actions>
    <v-divider></v-divider>
    <!-- The view changes depending on if we've got deployed services or not-->
    <v-container fluid v-if="numDeployments > 0">
        
      <!-- EntryPoint Deployments -->
      <v-layout row wrap v-if="showEntrypoints">
        <deployment-card-component v-for="uri in orderedDeploymentURN" v-if="isEntrypoint(deployments[uri])" v-bind:key="uri" v-bind:deploymentURI="uri"></deployment-card-component>
      </v-layout>

      <!-- Common Deployments -->
      <v-layout row wrap>
        <deployment-card-component v-for="uri in orderedDeploymentURN" v-if="!isEntrypoint(deployments[uri])" v-bind:key="uri" v-bind:deploymentURI="uri"></deployment-card-component>
      </v-layout>

    </v-container>
    <v-container v-else>

      <!-- No deployments found -->
      Start making some deployments

    </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import SSGetters from "../store/stampstate/getters";
import { Deployment, EntryPoint } from "../store/stampstate/classes";

import { DeploymentCardComponent } from "../components";

@VueClassComponent({
  name: "OverviewView",
  components: {
    "deployment-card-component": DeploymentCardComponent
  }
})
export default class OverviewView extends Vue {
  /** Show/Hide Entrypoints */
  showEntrypoints: boolean = true;
  toggle_one = 'all';

  /**
    * Obtains actual number of deployments.
    * @return <number> actual number of deployments.
    */
  get numDeployments(): number {
    return ((<SSGetters>this.$store.getters).numDeployments as any) as number;
  }

  /**
    * Obtains all deployments stored in the state.
    * @return <{ [uri: string]: Deployment }> all deployments stored in the
    * state.
    */
  get deployments(): { [uri: string]: Deployment } {
    return ((<SSGetters>this.$store.getters).deployments as any) as {
      [uri: string]: Deployment;
    };
  }

  /**
   * Gets the deployment URIs ordered by deployment name.
   * @return <string[]> array with deployment uris ordered by deployment name
   */
  get orderedDeploymentURN(): string[] {
    return ((<SSGetters>this.$store.getters)
      .orderDeploymentsByName as any) as string[];
  }

  /**
   * Checks if a deployment is EntryPoint or not.
   * @return true if entrypoint.
   */
  isEntrypoint(deployment) {
    return deployment instanceof EntryPoint;
  }
}
</script>