<template>
  <v-toolbar color="white" light flat fixed clipped-left app dense>

    <!-- Corporative logo -->
    <v-toolbar-title>
      <img src="/static/logo_text.png" alt="kumori systems" height="35px">
    </v-toolbar-title>
      
    <!-- Separator -->
    <v-spacer></v-spacer>

    <!-- Bell icon -->
    <v-btn icon>
      <v-icon>notifications</v-icon>
    </v-btn>

    <!-- User's avatar -->
    <v-avatar size="35px" class="mr-1">
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

    <!-- Extension form the toolbar -->
    <v-toolbar light flat color="white" slot="extension" dense>
      <v-spacer></v-spacer>
      
      <v-checkbox label="Show Entrypoints" v-model="showEntrypoints"></v-checkbox>
      <v-btn outline>
        add entrypoint<v-icon right>language</v-icon>
      </v-btn>
      <v-btn outline>
        add deployment<v-icon right>cloud</v-icon>
      </v-btn>
    </v-toolbar>

  </v-toolbar>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import PSGetters from "../store/pagestate/getters";
import { User, Notification } from "../store/pagestate/classes";

@VueClassComponent({
  name: "appbar-component",
  components: {}
})
export default class AppbarComponent extends Vue {
  showEntrypoints: boolean = true;
  /** Gets the user authenticated in the system */
  get user(): User {
    return ((<PSGetters>this.$store.getters).user as any) as User;
  }

  /** Signs out the user from the system */
  signout() {
    this.$store.dispatch("signout");
  }
}
</script>