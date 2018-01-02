<template>
  <v-navigation-drawer clipped permanent app>
    <!-- Menu items -->
    <v-list dense v-for="(item, i) in items" v-bind:key="i">
      <!-- If item doesn't have children -->
      <v-list-tile v-if="item.children.length==0" v-bind:to="item.path">
        <v-list-tile-action>
          <v-icon>{{item.icon}}</v-icon>
        </v-list-tile-action>
        <v-list-tile-title>{{item.title}}</v-list-tile-title>
      </v-list-tile>

      <!-- If item has children -->
      <v-list-group v-else v-model="item.expanded" v-bind:group="'deployment'" v-bind:to="item.path">
        <v-list-tile slot="item">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon>keyboard_arrow_down</v-icon>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile v-for="(child, j) in item.children" v-bind:key="j" v-bind:to="child.path">
          <v-list-tile-title>{{ child.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { NavigationItem, User, Notification } from "../store/pagestate/classes";
import PSGetters from "../store/pagestate/getters";
import { Deployment, EntryPoint } from "../store/stampstate/classes";
import SSGetters from "../store/stampstate/getters";

@VueClassComponent({
  name: "navigation-component"
})
export default class NavigationComponent extends Vue {
  /**
    * Items in the navigation component.
    */
  get items(): NavigationItem[] {
    return [
      new NavigationItem("dashboard", "Overview", "/overview"),
      new NavigationItem(
        "cloud",
        "Deployed services",
        "deployment",
        this.deployedServices
      ),
      new NavigationItem("widgets", "Elements", "/elements"),
      new NavigationItem("domain", "Domains", "/domains"),
      new NavigationItem("storage", "Data volumes", "/volumes"),
      new NavigationItem("alarm", "Alarms & logs", "/alarmsAndLogs"),
      new NavigationItem("help", "Help", "/help")
    ];
  }

  /**
    * Services deployed to show in the menu.
    */
  get deployedServices(): NavigationItem[] {
    let entrypointDeployments: NavigationItem[] = [];
    let commonDeployments: NavigationItem[] = [];
    let deployments = ((<SSGetters>this.$store.getters).deployments as any) as {
      [uri: string]: Deployment;
    };

    // Gets deployments ordered by some characteristic
    // Actually this characteristic is the name of the deployment
    let orderedDeploymentURN: string[] = ((<SSGetters>this.$store.getters)
      .orderDeploymentsByName as any) as string[];

    let navItem: NavigationItem;
    for (let i: number = 0; i < orderedDeploymentURN.length; i++) {
      // New NavigationItem created
      navItem = new NavigationItem(
        null,
        deployments[orderedDeploymentURN[i]].name,
        deployments[orderedDeploymentURN[i]]._path
      );

      // Assigned to each list depending of if it's entrypoint or not
      if (deployments[orderedDeploymentURN[i]] instanceof EntryPoint) {
        entrypointDeployments.push(navItem);
      } else {
        commonDeployments.push(navItem);
      }
    }

    return entrypointDeployments.concat(commonDeployments);
  }
}
</script>