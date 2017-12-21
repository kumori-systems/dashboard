<template>
  <v-app id="kumori-dashboard">
    <template v-if="!authenticated">
      
      <!-- Sign in view -->
      <signin-view></signin-view>

    </template>
    <template v-else>
      
      <!-- Left menu -->
      <navigation-component></navigation-component>

      <!-- Top menu -->
      <appbar-component></appbar-component>

      <!-- Content of the page -->
      <v-content>
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-content>

      <!-- Page's footer -->
      <v-footer app>
        <v-spacer></v-spacer>
        <span>&copy; 2017</span>
      </v-footer>
    </template>

  </v-app>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { SignInView } from "./views";
import {
  AppbarComponent,
  NavigationComponent
} from "./components";
import PSGetters from "./store/pagestate/getters";

@VueClassComponent({
  name: "App",
  components: {
    "signin-view": SignInView,
    "appbar-component": AppbarComponent,
    "navigation-component": NavigationComponent
  }
})
export default class App extends Vue {
  /** Gets if user is already authenticated */
  get authenticated(): Boolean {
    return ((<PSGetters>this.$store.getters).authenticated as any) as boolean;
  }
}
</script>
<style lang="stylus">
@import './stylus/main';
</style>