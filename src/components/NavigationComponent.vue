<template>
    <v-navigation-drawer v-model="showNavigation" app persistent enable-resize-watcher>

        <!-- User avatar and options -->
        <v-list three-line>
            <v-list-tile avatar tag="div">
                <v-list-tile-avatar>
                    <img v-bind:src="user.avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>{{ user.name }}</v-list-tile-title>
                    <v-list-tile-sub-title>{{ user.id }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-menu offset-y>
                        <v-btn icon slot="activator">
                            <v-icon>more_vert</v-icon>
                        </v-btn>
                        <v-list>
                            <v-list-tile>
                                <v-list-tile-title>Settings</v-list-tile-title>
                            </v-list-tile>
                            <v-list-tile>
                                <v-list-tile-title>Sign out</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                    <v-spacer></v-spacer>
                    <v-menu offset-y>
                        <v-btn icon slot="activator">
                            <v-icon v-html="notifications.length > 0? 'notifications_active' : 'notifications'"></v-icon>
                        </v-btn>
                        <v-list v-for="(not, i) in notifications" v-bind:key="i">
                            <v-list-tile>
                                <v-list-tile-title>{{ not.title }}</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </v-list-tile-action>
            </v-list-tile>
        </v-list>
        <v-divider></v-divider>

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
    * User properties.
    */
  get user(): User {
    return ((<PSGetters>this.$store.getters).user as any) as User;
  }

  /**
    * Getter for showing or hinding this component.
    */
  get showNavigation(): Boolean {
    return ((<PSGetters>this.$store.getters).showNavigation as any) as boolean;
  }

  /**
    * Setter for showing or hinding this component.
    */
  set showNavigation(value) {
    this.$store.dispatch("showNavigation", value);
  }

  /**
    * Gets user's notifications.
    */
  get notifications(): Notification[] {
    return ((<PSGetters>this.$store.getters)
      .notifications as any) as Notification[];
  }

  /**
    * Items in the navigation component.
    */
  items: NavigationItem[] = [
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

  /**
    * Services deployed to show in the menu.
    */
  get deployedServices(): NavigationItem[] {
    let entrypoint: NavigationItem[] = [];
    let commonDeployments: NavigationItem[] = [];
    let deployments = ((<SSGetters>this.$store.getters).deployments as any) as {
      [uri: string]: Deployment;
    };
    let i: number;
    for (i = 0; i < this.orderedDeploymentURN.length; i++) {
      if (deployments[this.orderedDeploymentURN[i]] instanceof EntryPoint) {
        entrypoint.push(
          new NavigationItem(
            "input",
            deployments[this.orderedDeploymentURN[i]].name,
            deployments[this.orderedDeploymentURN[i]]._path
          )
        );
      } else {
        commonDeployments.push(
          new NavigationItem(
            null,
            deployments[this.orderedDeploymentURN[i]].name,
            deployments[this.orderedDeploymentURN[i]]._path
          )
        );
      }
    }
    return entrypoint.concat(commonDeployments);
  }

  /**
    * Returns all deployment urn ordered by deployment name
    */
  get orderedDeploymentURN(): string[] {
    return this.$store.getters.orderDeploymentsByName;
  }
}
</script>