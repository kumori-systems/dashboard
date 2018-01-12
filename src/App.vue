<template>
  <v-app id="kumori-dashboard">
    <template v-if="user.state === User.State.AUTHENTICATED">
      
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
    <template v-else>
      
      <!-- Sign in view -->
      <signin-view></signin-view>

    </template>
  </v-app>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { SignInView } from "./views";
import { AppbarComponent, NavigationComponent } from "./components";
import { User } from "./store/pagestate/classes";
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
  User = User;
  mounted() {
    // Check if there is a token in the url

    console.log("El token almacenado en la query es", this.$route.query.token);

    // Check if the user has been stored in localStorage
    if (typeof Storage !== "undefined") {
      // Stores the item in local storage
      let storedUser: string | User = localStorage.getItem("user");
      if (storedUser) {
        storedUser = JSON.parse(storedUser);

        this.$store.dispatch("signin", {
          username: (<User>storedUser).name,
          userpassword: null,
          userid: (<User>storedUser).id,
          token: (<User>storedUser).token
        });
      }
    }
  }

  /** Gets user state */
  get user(): User {
    return ((<PSGetters>this.$store.getters).user as any) as User;
  }
}
</script>
<style lang="stylus">
@import './stylus/main';
</style>