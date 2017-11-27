<template>
    <v-layout id="signin-view">
        <!-- Flexible content allows good resize: MarginAll size_eXtraSmall, size_SMall, size_MeDium, size_LarGe, size_eXtraLarge -->
        <v-flex xs12 sm6 offset-sm3 md4 offset-md4 lg4 offset-lg4 xl2 offset-xl5 v-on:keyup.enter="signIn" wrap>
            <v-card>
                <v-card-media src="/static/logo_text.png" height="100px" contain></v-card-media>
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline">Sign in</h3>
                        <p class="subheading grey--text">to continue to Ecloud's dashboard</p>
                    </div>
                </v-card-title>
                <v-card-text>
                    <div>
                        <v-text-field v-model="userName" v-bind:disabled="loading" prepend-icon="person" label="Enter your User" autofocus></v-text-field>
                        <v-text-field v-model="userPassword" v-bind:disabled="loading" prepend-icon="lock" label="Enter your password" min="1" v-bind:append-icon="viewPassword ? 'visibility' : 'visibility_off'" v-bind:append-icon-cb="() => (viewPassword = !viewPassword)" :type="viewPassword ? 'text' : 'password'"></v-text-field>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <span class="ma-3" v-bind:class="friendlyMessageClass">{{ friendlyMessage }}</span>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" flat v-bind:loading="loading" class="primary--text ma-3" v-bind:disabled="loading" v-on:click="signIn">
                        Continue
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import PSGetters from "./../store/pagestate/getters";
import { BackgroundAction } from "../store/pagestate/classes";

@VueClassComponent({
  name: "sign-in-view"
})
export default class SignInView extends Vue {
  /** <string> User's id. */
  userName: string = "";

  /** <string> User's password. */
  userPassword: string = "";

  /** <boolean> Enables the visibility of the password. */
  viewPassword: boolean = false;

  /**
     * Returns true if there is a background process running.
     * @returns <boolean> true  if there is a background process running.
     */
  get loading(): Boolean {
    return ((<PSGetters>this.$store.getters).loading as any) as Boolean;
  }

  /**
     * Gets the last BackgroundAction. If no BackgroundAction is found a new
     * null BackgrounAction is returned.
     * @return <BackgroundAction> Background process.
     */
  get lastAction(): BackgroundAction {
    return ((<PSGetters>this.$store.getters)
      .lastAction as any) as BackgroundAction;
  }

  /**
     * Obtains the friendly message to know the state or result of the
     * background action in process.
     * @return <string> text explaining the action or the result of the action.
     */
  get friendlyMessage(): string {
    let res: string = "";
    try {
      res = this.lastAction.details;
    } finally {
      return res;
    }
  }

  /**
     * Returns the color of the text depending on the state of the action in
     * background process.
     * @return <string> color to mark info text or danger text.
     */
  get friendlyMessageClass() {
    let res: string = "";
    try {
      switch ((this.lastAction.state as any) as BackgroundAction.State) {
        case BackgroundAction.State.FAIL:
          res = "red--text";
          break;
        default:
          res = "blue--text";
      }
    } finally {
      return res;
    }
  }

  /**
     * Function to sign in to the system.
     */
  signIn() {
    this.$store.dispatch("signin", {
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
</style>