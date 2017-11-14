<template>
  <v-app v-if="!authenticated">

    <!-- Sign in view -->
    <signin-view></signin-view>

  </v-app>
  <v-app v-else>

    <!-- Left menu -->
    <navigation-component></navigation-component>
    
    <!-- Top menu -->
    <toolbar-component></toolbar-component>

    <!-- Content of the page -->
    <main>
      <v-content>
        <v-container fluid>
          <router-view></router-view>  
        </v-container>
      </v-content>
    </main>

    <!-- Page's footer -->
    <v-footer app>
      <v-spacer></v-spacer>
      <span>&copy; 2017</span>
    </v-footer>

    <!-- Floating Action Button -->
    <fab-component></fab-component>

  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { SignInView } from "./views";
import { NavigationComponent, ToolbarComponent, FABComponent } from "./components";
import PSGetters from "./store/pagestate/getters";

@VueClassComponent({
  name: "App",
  components: {
    "signin-view": SignInView,
    "navigation-component": NavigationComponent,
    "toolbar-component": ToolbarComponent,
    "fab-component":FABComponent
  }
})
export default class App extends Vue {
  /** Get if user is already authenticated */
  get authenticated(): Boolean {
    return ((<PSGetters>this.$store.getters).authenticated as any) as boolean;
  }
}
</script>

<style lang="stylus">
@import './stylus/main';
</style>