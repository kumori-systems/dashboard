<!--
  Component for overview.
-->
<template>  
  <v-card id="overview-view" class="mybackground">
    
    <v-card-title class="mybackground">

        <!-- View title -->
        <h3 class="headline mb-0">Overview</h3>

        <!-- Applies spaces between elements -->
        <v-spacer></v-spacer>

        <!-- View actions -->
        <v-card-actions>
          
          <!-- Add Deployment -->
          <v-btn outline to="/addDeployment">
            <span>Add Common Deployment</span>
            <v-icon right>cloud</v-icon>
          </v-btn>

          <!-- Add Entrypoint -->
          <v-btn outline to="/addHTTPEntrypoint">
            <span>Add Entrypoint</span>
            <v-icon right>language</v-icon>
          </v-btn>

        </v-card-actions>

      </v-card-title>

    <!-- Divides the content of the card-->
    <v-divider></v-divider>

    <!-- View actions on deployments -->
    <v-card-actions class="mybackground">

      <!-- Show all, entrypoint or common deployment -->
      <v-btn-toggle mandatory v-model="show" class="elevation-0">

        <!-- Show all -->
        <v-btn flat value="all">
          <span>All</span>
        </v-btn>

        <!-- Show only common deployments -->
        <v-btn flat value="deployments">
          <span>Common Deployments</span>
          <v-icon>cloud</v-icon>
        </v-btn>

        <!-- Show only entrypoints -->
        <v-btn flat value="entrypoints">
          <span>Entrypoints</span>
          <v-icon>language</v-icon>      
        </v-btn>

      </v-btn-toggle>

    </v-card-actions>

    <!-- The view changes depending on if we've got deployed services or not-->
    <v-container fluid v-if="Object.keys(deployments).length > 0" class="mybackground">
        
      <!-- EntryPoint Deployments -->
      <v-layout wrap v-if="show==='all' || show==='entrypoints'">
        <deployment-card-component v-for="urn in orderedDeploymentURN" v-if="isEntrypoint(deployments[urn])" v-bind:key="urn" v-bind:deploymentURN="urn"></deployment-card-component>
      </v-layout>

      <!-- Common Deployments -->
      <v-layout wrap v-if="show==='all' || show==='deployments'">
        <deployment-card-component v-for="urn in orderedDeploymentURN" v-if="!isEntrypoint(deployments[urn])" v-bind:key="urn" v-bind:deploymentURN="urn"></deployment-card-component>
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
  name: "OverviewView",
  components: {
    "deployment-card-component": DeploymentCardComponent
  }
})
export default class OverviewView extends Vue {
  /** Show All, Entrypoints or Common Deployments */
  show: string = "all";

  /**
   * Obtains all deployments stored in the state.
   * @return <{ [urn: string]: Deployment }> all deployments stored in the
   * state.
   */
  get deployments(): { [urn: string]: Deployment } {
    return ((<SSGetters>this.$store.getters).deployments as any) as {
      [urn: string]: Deployment;
    };
  }

  /**
   * Gets the deployment URNs ordered by deployment name.
   * @return <string[]> array with deployment urns ordered by deployment name
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