<template>
  <v-toolbar class="elevation-1" color="white" fixed clipped-left app>

    <!-- Corporative logo -->
    <v-toolbar-title>
      <img src="/static/logo_text.png" alt="kumori systems" height="40px">
    </v-toolbar-title>
      
    <!-- Separator -->
    <v-spacer></v-spacer>

    <!-- Background actions -->
    <v-menu offset-y open-on-hover>
      <v-badge class="mr-3" bottom slot="activator" overlap color="info">
        <span slot="badge" dark v-if="actions.length > 0">{{ actions.length }}</span>
        <v-icon large color="grey lighten-1">swap_vert</v-icon>
      </v-badge>
      <v-list v-if="actions.length > 0">
        <v-list-tile v-for="(action, index) in actions" v-bind:key="index">
          <v-list-tile-content>{{ action.type }}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>

    <!-- Notifications -->
    <v-menu offset-y>
      <v-badge class="mr-3" slot="activator" overlap color="danger">
        <span slot="badge" dark v-if="alarms.length > 0">{{ alarms.length }}</span>
        <v-icon large color="grey lighten-1">notifications</v-icon>
      </v-badge>
      <v-list v-if="alarms.length > 0">
        <v-list-tile v-for="(alarm, index) in alarms" v-bind:key="index">
          <v-list-tile-content v-on:click="toAlarmsAndLogs">{{ alarm.title }}</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-menu>

    <!-- User's avatar -->
    <v-avatar size="40px" class="mr-1">
      <img v-bind:src="user.avatar" alt="avatar">      
    </v-avatar>

    <!-- User's identification -->
    {{ user.name }}

    <!-- Options -->
    <v-menu offset-y>
      <v-btn icon slot="activator">
        <v-icon>more_vert</v-icon>
      </v-btn>
      <v-list>
        <v-list-tile v-on:click="signout">
          <v-list-tile-title>Sign out</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

  </v-toolbar>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import PSGetters from "../store/pagestate/getters";
import {
  User,
  Notification,
  BackgroundAction
} from "../store/pagestate/classes";

@VueClassComponent({
  name: "appbar-component",
  components: {}
})
export default class AppbarComponent extends Vue {
  /** Gets the user authenticated in the system. */
  get user(): User {
    return ((<PSGetters>this.$store.getters).user as any) as User;
  }

  /** Obtains a list of notifications with level error not readed by the user. */
  get alarms(): Notification[] {
    return (((<PSGetters>this.$store.getters)
      .notifications as any) as Notification[]).filter(
      (item, index, arrayfun) => {
        return (
          (<Notification>item).level === Notification.LEVEL.ERROR &&
          !(<Notification>item).readed
        );
      }
    );
  }

  /** Obtains a list of active background actions. */
  get actions(): BackgroundAction[] {
    let pending = this.$store.getters.pendingBackgroundActions;
    let res: BackgroundAction[] = [];
    for (let key in pending) {
      res = res.concat(pending[key]);
    }
    return res;
  }

  /** Signs out the user from the system */
  signout() {
    this.$store.dispatch("signout");
  }

  /** Changes the actual view to alarmsAndLogs view */
  toAlarmsAndLogs() {
    this.$router.push("alarmsAndLogs");
  }
}
</script>