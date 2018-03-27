<template>
  <v-layout id="signin-view">

    <!-- Resizes the view -->
    <v-flex class="mt-5" xs12 sm6 offset-sm3 v-on:keyup.enter="signIn" wrap v-if="!loading">
        
      <!-- Signin form view -->
      <v-card class="elevation-10">
          
        <!-- Card body-->
        <v-card-text class="mybackground">

          <v-layout>

            <v-flex xs6 wrap>

              <!-- Logo image -->
              <v-card-media class="mt-4 mb-4" src="/static/logo_text.png"
                height="100px" contain></v-card-media>

              <p class="subheading grey--text pt-4">
                Kumori's PAAS provides the best experience for your
                applications and services.
              </p>

              <p class="subheading grey--text">
                Join now and enjoy our welcome offers.
              </p>

            </v-flex>
            <v-flex xs6 wrap>

              <v-container>
                  
                <!-- Card title -->
                <h3 class="headline">Sign in</h3>
                <v-divider></v-divider>

                <v-form ref="form" class="mt-4">

                  <!-- Username text field -->
                  <v-text-field autocomplete="username" v-model="userName"
                    v-bind:disabled="loading" prepend-icon="person"
                    label="Enter your User" autofocus></v-text-field>
                    
                  <!-- Current password text field -->
                  <v-text-field autocomplete="current-password"
                    v-model="userPassword" v-bind:disabled="loading"
                    prepend-icon="lock" label="Enter your password" min="1"
                    v-bind:append-icon="viewPassword ? 'visibility' :
                    'visibility_off'" v-bind:append-icon-cb="() =>
                    (viewPassword = !viewPassword)" :type="viewPassword ? 'text'
                    : 'password'"></v-text-field>                
                    
                  <!-- Card actions -->
                  <v-card-actions>                    
                    
                    <!-- Friendly result message -->
                    <span class="ma-3" v-bind:class="friendlyMessageClass">
                      {{ friendlyMessage }}</span>
                  
                    <!-- Adds space between components -->
                    <v-spacer></v-spacer>
                  
                    <!-- Main button -->
                    <v-btn color="primary" flat v-bind:loading="loading"
                      class="primary--text ma-3" v-bind:disabled="loading"
                      v-on:click="signIn">Continue</v-btn>
                    
                  </v-card-actions>
                </v-form>

                <!-- Sign in with google -->
                <v-layout>

                  <v-spacer></v-spacer>

                  <a class="ma-3" v-bind:href="googleOauthURN">

                    <img src="/static/btn_google_signin_light_normal_web.png">

                  </a>

                </v-layout>

              </v-container>

            </v-flex>

          </v-layout>

          <v-btn flat icon v-on:click="showPannel=true"><v-icon>settings</v-icon></v-btn>

        </v-card-text>

      </v-card>

    </v-flex>

    <v-flex class="mt-5" xs12 sm4 offset-sm4 wrap v-else>

        <!-- Loading view -->
        <v-card class="elevation-10" >

          <!-- Card body-->
          <v-card-text class="mybackground">

            <!-- Logo image -->
            <v-card-media src="/static/logo_text.png"
              height="100px" contain></v-card-media>
              
            
            <div class="text-xs-center ma-4">

              <!-- Loading spinner -->
              <v-btn color="info" flat loading></v-btn>

              <!-- Friendly message -->
              <span class="ma-3" v-bind:class="friendlyMessageClass">
                {{ friendlyMessage }}</span>

            </div>

          </v-card-text>

        </v-card>

    </v-flex>
      
      <v-dialog v-model="showPannel" max-width="800px">
        <v-card>
          <v-card-title class="headline">Configuration</v-card-title>
          <v-card-text>
              
              <v-text-field label="acs URL" v-model="acsURL"></v-text-field>
              <v-text-field label="admission URL" v-model="admissionURL"></v-text-field>

          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn outline @click.native="updateConfig">Update</v-btn>
            <v-btn outline @click.native="clearConfig">Clear</v-btn>
            <v-btn flat @click.native="showPannel = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


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

  /** <boolean> Shows the config pannel. */
  showPannel: boolean = false;

  /** <string> acs url. */
  acsURL: string = null;

  /** <string> admission url. */
  admissionURL: string = null;

  /** Mounted hook. */
  mounted() {
    this.loadURLS();

    // Set redirection path for google oauth
    this.googleOauthURN =
      this.acsURL +
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

  loadURLS() {
    // Intentamos buscar la direccion de acs en el storage
    this.acsURL = localStorage.getItem("acsURL");
    this.admissionURL = localStorage.getItem("admissionURL");

    if (!this.acsURL) {
      this.acsURL = config.ACS_URL;
      localStorage.setItem("acsURL", this.acsURL);
    }
    if (!this.admissionURL) {
      this.admissionURL = config.ADMISSION_URL;
      localStorage.setItem("admissionURL", this.admissionURL);
    }
  }

  /**
   * Function to sign in to the system.
   */
  signIn() {
    if (!this.acsURL || !this.admissionURL) this.loadURLS();
    this.$store.dispatch("signIn", {
      username: this.userName,
      userpassword: this.userPassword
    });
  }

  updateConfig() {
    localStorage.setItem("acsURL", this.acsURL);
    localStorage.setItem("admissionURL", this.admissionURL);
    this.showPannel = false;
  }

  clearConfig() {
    this.acsURL = config.ACS_URL;
    localStorage.setItem("acsURL", this.acsURL);
    this.admissionURL = config.ADMISSION_URL;
    localStorage.setItem("admissionURL", this.admissionURL);
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
</style>