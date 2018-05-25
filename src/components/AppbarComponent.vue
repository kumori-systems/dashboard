<template>
  <v-toolbar class="elevation-1" fixed clipped-left app>

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
    <v-menu offset-y v-model="showAlarmMenu">

      <v-badge class="mr-3" slot="activator" overlap color="error">
        <span slot="badge" v-if="alarms.length > 0">{{ alarms.length }}</span>
        <v-icon large color="grey lighten-1" v-on:click="notificationClicked">notifications</v-icon>
      </v-badge>

      <v-list v-if="alarms.length > 0">
        <v-list-tile v-for="(alarm, index) in alarms" v-bind:key="index">
          <v-card-actions>
            <v-icon color="error">error</v-icon>
          </v-card-actions>
          <v-list-tile-content v-on:click="toAlarmsAndLogs">
            {{ alarm.title }}
          </v-list-tile-content>
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
        <v-list-tile to="/userSettings">
          <v-list-tile-title>Settings</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-on:click="signOut">
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
  showAlarmMenu: boolean = false;
  clickedNotificationIcon: boolean = false;

  watcher;
  lastNotification: Notification = null;

  mounted() {
    this.watcher = this.$watch("showAlarmMenu", function(value) {
      if (value) {
        setTimeout(() => {
          if (!this.clickedNotificationIcon) {
            this.showAlarmMenu = false;
          }
        }, 3000);
      }else{
        this.clickedNotificationIcon = false;
      }
    });
  }

  beforeDestroy() {
    this.watcher(); // Finishes the watcher
  }

  notificationClicked(value) {
    this.clickedNotificationIcon = true;
  }

  /** Gets the user authenticated in the system. */
  get user(): User {
    return ((<PSGetters>this.$store.getters).user as any) as User;
  }

  /** Obtains a list of notifications with level error not readed by the user. */
  get alarms(): Notification[] {
    let res: Notification[] = (((<PSGetters>this.$store.getters)
      .notifications as any) as Notification[]).filter(
      (item, index, arrayfun) => {
        return item.level === Notification.LEVEL.ERROR && !item.readed;
      }
    );
    if (res.length > 0 && this.lastNotification !== res[res.length - 1]) {
      this.showAlarmMenu = true;
      this.lastNotification = res[res.length - 1];
    }
    return res;
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
  signOut() {
    this.$store.dispatch("signOut");
  }

  /** Changes the actual view to alarmsAndLogs view */
  toAlarmsAndLogs() {
    this.$router.push("/alarmsAndLogs");
  }
}
</script>