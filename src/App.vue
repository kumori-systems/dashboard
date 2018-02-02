<template>
  <v-app id="kumori-dashboard">
    <template v-if="user && user.state === User.State.AUTHENTICATED">
      
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
import { User, BackgroundAction } from "./store/pagestate/classes";
import PSGetters from "./store/pagestate/getters";
import PSActions from "./store/pagestate/actions";

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

    let status = this.$route.query.status;

    if (status && status == "error") {
      //(<PSActions>this.$store.dispatch)

      this.$store.dispatch(
        "addBackgroundAction",
        new BackgroundAction(BackgroundAction.TYPE.LOGIN)
      );

      this.$store.dispatch("finishBackgroundAction", {
        type: BackgroundAction.TYPE.LOGIN,
        state: BackgroundAction.STATE.FAIL,
        details: this.$route.query.error
      });
    }

    if (status && status == "success") {
      sessionStorage.setItem(
        "user",
        JSON.stringify(
          new User(
            this.$route.query.user_id,
            this.$route.query.user_name,
            User.State.UNAUTHENTICATED,
            {
              accessToken: this.$route.query.access_token,
              expiresIn: parseInt(this.$route.query.ttl),
              refreshToken: this.$route.query.refresh_token,
              tokenType: this.$route.query.token_type
            }
          )
        )
      );
      this.$router.push("/");
    }

    // Check if the user has been stored in sessionStorage
    if (typeof Storage !== "undefined") {
      // Stores the item in local storage
      let storedUser: string | User = sessionStorage.getItem("user");
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