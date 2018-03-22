<template>
  <v-layout id="signin-view">

    <!-- Resizes the view -->
    <v-flex class="mt-5" xs12 sm8 offset-sm2 v-on:keyup.enter="signIn" wrap>
        
        <!-- Signin form view -->
        <v-card class="elevation-10" v-if="!loading">
          
          <!-- Card body-->
          <v-card-text>

            <v-layout>

              <v-flex xs6 wrap>

                <!-- Logo image -->
                <v-card-media class="mt-4 mb-4" src="/static/logo_text.png" height="100px" contain></v-card-media>

                <p class="subheading grey--text pt-4">
                  Kumori's PAAS provides the best experience for your applications and services.
                </p>

                <p class="subheading grey--text">
                  Join now and enjoy our welcome offers.
                </p>

              </v-flex>
              <v-flex xs6 wrap>
              
                <!-- Card title -->
                <h3 class="headline">Sign in</h3>
                <v-divider></v-divider>

                <v-form ref="form" class="mt-4">

                  <!-- Username text field -->
                  <v-text-field autocomplete="username" v-model="userName" v-bind:disabled="loading" prepend-icon="person" label="Enter your User" autofocus></v-text-field>
                  
                  <!-- Current password text field -->
                  <v-text-field autocomplete="current-password" v-model="userPassword" v-bind:disabled="loading" prepend-icon="lock" label="Enter your password" min="1" v-bind:append-icon="viewPassword ? 'visibility' : 'visibility_off'" v-bind:append-icon-cb="() => (viewPassword = !viewPassword)" :type="viewPassword ? 'text' : 'password'"></v-text-field>                
                  
                  <!-- Card actions -->
                  <v-card-actions>                    
                  
                    <!-- Friendly result message -->
                    <span class="ma-3" v-bind:class="friendlyMessageClass">{{ friendlyMessage }}</span>
                  
                    <!-- Adds space between components -->
                    <v-spacer></v-spacer>
                  
                    <!-- Main button -->
                    <v-btn color="primary" flat v-bind:loading="loading" class="primary--text ma-3" v-bind:disabled="loading" v-on:click="signIn">
                      Continue
                    </v-btn>
                  
                  </v-card-actions>

                </v-form>

              </v-flex>

            </v-layout>

          </v-card-text>

          <!-- Sign in with google -->
          <v-layout>

            <v-spacer></v-spacer>

            <a class="ma-3" v-bind:href="googleOauthURN">

              <img src="/static/btn_google_signin_light_normal_web.png">

            </a>

          </v-layout>

        </v-card>

        <!-- Loading view -->
        <v-card class="elevation-10" v-else>

          <!-- Logo image -->
          <v-card-media src="/static/logo_text.png" height="100px" contain></v-card-media>

          <!-- Card title -->
          <v-card-title primary-title>

              <h3 class="headline">Accessing Ecloud Dashboard</h3>

              <div>

                <v-btn color="primary" flat loading></v-btn>
                <span class="ma-3" v-bind:class="friendlyMessageClass">{{ friendlyMessage }}</span>
                
              </div>
              
          </v-card-title>

        </v-card>

    </v-flex>

  </v-layout>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import PSGetters from "./../store/pagestate/getters";
import { BackgroundAction } from "../store/pagestate/classes";
import urlencode from "urlencode";

import { config } from "../api";

@VueClassComponent({
  name: "sign-in-view"
})
export default class SignInView extends Vue {
  /** <boolean> Says if there is a process loading the user. */
  loading: boolean = false;

  /** <string> Just to set the color of the friendly message. */
  friendlyMessageClass: string = "";

  /** <string> User's id. */
  userName: string = "";

  /** <string> User's password. */
  userPassword: string = "";

  /** <boolean> Enables the visibility of the password. */
  viewPassword: boolean = false;

  /** <string> URL where the browser is redirected to procceed to google's oauth. */
  googleOauthURN: string = null;

  /** Mounted hook. */
  mounted() {
    // Set redirection path for google oauth
    this.googleOauthURN =
      config.ACS_URL +
      "/auth/google?redirectOnSuccessUrl=" +
      urlencode(location.origin + "/#/overview") +
      "&redirectOnFailureUrl=" +
      urlencode(location.origin + "/#/overview");
  }

  /**
   * Obtains the friendly message to know the state or result of the
   * background action in process.
   * @return <string> text explaining the action or the result of the action.
   */
  get friendlyMessage(): string {
    let pendingActions: {
      [type: number]: BackgroundAction[];
    } = ((<PSGetters>this.$store.getters).pendingBackgroundActions as any) as {
      [type: number]: BackgroundAction[];
    };

    let finishedActions: BackgroundAction[] = ((<PSGetters>this.$store.getters)
      .finishedBackgroundActions as any) as BackgroundAction[];

    if (pendingActions[BackgroundAction.TYPE.LOADING_DATA].length > 0) {
      this.friendlyMessageClass = "blue--text";
      this.loading = true;
      return pendingActions[BackgroundAction.TYPE.LOADING_DATA][0].details;
    } else if (pendingActions[BackgroundAction.TYPE.SIGNIN].length > 0) {
      this.friendlyMessageClass = "blue--text";
      this.loading = true;
      return pendingActions[BackgroundAction.TYPE.SIGNIN][0].details;
    } else if (finishedActions.length > 0) {
      if (
        finishedActions[finishedActions.length - 1].state ===
        BackgroundAction.STATE.SUCCESS
      ) {
        this.friendlyMessageClass = "blue--text";
        this.loading = true;
      } else if (
        finishedActions[finishedActions.length - 1].state ===
        BackgroundAction.STATE.FAIL
      ) {
        this.friendlyMessageClass = "red--text";
        this.loading = false;
      }
      return finishedActions[finishedActions.length - 1].details;
    }

    return "";
  }

  /**
   * Function to sign in to the system.
   */
  signIn() {
    this.$store.dispatch("signIn", {
      username: this.userName,
      userpassword: this.userPassword
    });
  }
}
</script>
<style>
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

#googleoauth {
  text-decoration: initial;
}

#signin-view {
  background: #d1406b;
}
</style>