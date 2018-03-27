<template>
  <v-app dark id="kumori-dashboard">
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
      this.$router.push("/");
    } else if (typeof Storage !== "undefined") {
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

<style lang="stylus">
@import './stylus/main';
</style>

<style lang="scss">
#kumori-dashboard {
  background: #d1406b;
}
</style>
