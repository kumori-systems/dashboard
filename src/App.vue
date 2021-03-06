<!--
  This is the main vue file. This mounts all the vue structure.
-->
<template>
  <v-app dark class="kumori-background">
    <template v-if="user && user.state === User.State.AUTHENTICATED">
      
      <!-- Left menu -->
      <navigation-component></navigation-component>

      <!-- Top menu -->
      <appbar-component></appbar-component>

      <!-- Content of the page -->
      <v-content>
        <v-container fluid wrap>
          <router-view :key="$route.fullPath" wrap></router-view>
        </v-container>
      </v-content>

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
import { config } from "./api";

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
  name: "App",
  components: {
    "signin-view": SignInView,
    "appbar-component": AppbarComponent,
    "navigation-component": NavigationComponent
  }
})
export default class App extends Vue {
  
  /** User class. */
  User = User;

  /**
   * Vue lifecycle. Reads the url for query params. This is done because of
   * oauth. In the case params are in the urn, a new user is created and the
   * page tries to authenticate the user in the stamp.
   */
  created() {
    let status = this.$route.query.status;
    if (status && status == "error") {
      // If token in URL and state error
      this.$store.dispatch(
        "addBackgroundAction",
        new BackgroundAction(BackgroundAction.TYPE.SIGNIN)
      );

      this.$store.dispatch("finishBackgroundAction", {
        type: BackgroundAction.TYPE.SIGNIN,
        state: BackgroundAction.STATE.FAIL,
        details: this.$route.query.error
      });
    } else if (status && status == "success") {
      // If token in URL and state success
      localStorage.setItem(
        "user",
        JSON.stringify(
          new User(
            this.$route.query.user_id,
            this.$route.query.user_name,
            User.State.UNAUTHENTICATED,
            new User.Token(
              this.$route.query.access_token,
              parseInt(this.$route.query.ttl),
              this.$route.query.refresh_token,
              this.$route.query.token_type
            )
          )
        )
      );
      
    // Intentamos buscar la direccion de acs en el storage
    let acsURL = localStorage.getItem("acsURL");
    let admissionURL = localStorage.getItem("admissionURL");

    if (!acsURL) {
      localStorage.setItem("acsURL", config.ACS_URI);
    }
    if (!admissionURL) {
      localStorage.setItem("admissionURL", config.ADMISSION_URI);
    }
  
      this.$router.push("/");
    }
  }

  /**
   * If no params are found in the url, then the user is tried to obtain from
   * the local storage. This case happens when a user visited the page before.
   */
  mounted() {
    if (typeof Storage !== "undefined") {
      // Check if there is a token in localStorage
      let unformattedStoredUser: string | User = localStorage.getItem("user");
      if (unformattedStoredUser) {
        unformattedStoredUser = JSON.parse(unformattedStoredUser);
        let storedUser: User = new User(
          (<User>unformattedStoredUser).id,
          (<User>unformattedStoredUser).name,
          null,
          (<User>unformattedStoredUser).token,
          (<User>unformattedStoredUser).avatar
        );

        if (
          User.Token.isTokenAlive(
            new Date(storedUser.token.creationDate),
            storedUser.token.expiresIn
          )
        ) {
          this.$store.dispatch("signIn", {
            username: storedUser.name,
            userpassword: null,
            userid: storedUser.id,
            token: storedUser.token
          });
        } else {
          localStorage.removeItem("user");
        }
      }
    }
  }

  /** Gets user state */
  get user(): User {
    return ((<PSGetters>this.$store.getters).user as any) as User;
  }
}
</script>

<!-- This style is applied to the entire application -->
<style lang="stylus">
@import './stylus/main';
</style>

<style lang="scss">
.kumori-background {
  background: #d1406b;
}
</style>
