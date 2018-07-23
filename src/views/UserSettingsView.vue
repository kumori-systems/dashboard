<!--
  This component represents the user settings view.
-->
<template>
  <v-card id="user-settings-view" style="max-width:1300px">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">{{ user.name }}</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Cancels the action -->
        <v-btn outline v-on:click="cancel">Cancel</v-btn>

      </v-card-actions>
    </v-card-title>
    <v-container> 

      <v-flex xs12 sm10 md10 lg6>
      <v-text-field
        readonly
        id="APItoken"
        prefix="API token"
        single-line
        v-model="userApiToken"
        append-icon="fas fa-clipboard"
        :append-icon-cb="copyToClipboard">
      </v-text-field>
      </v-flex>
        <!--
      <p class="ml-3">API token: {{ user.token.accessToken }}</p>
      -->
    </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import { User } from "../store/pagestate/classes";

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
  name: "user-settings-view"
})
export default class UserSettingsView extends Vue {

  /** Obtains the authentified user in the system. */
  get user(): User {
    return this.$store.getters.user;
  }

  /** This is to return to overview. Is not really a cancel. */
  cancel() {
    this.$router.go(-1);
  }

  /** Obtains the user access token. */
  get userApiToken() {
    return this.user.token.accessToken;
  }

  /** Sets the user access token. Not used. */
  set userApiToken(val) {}

  /** Copies the access token to the clip board. */
  copyToClipboard() {
    /* Get the text field */
    let copyText: HTMLInputElement = document.getElementById(
      "APItoken"
    ) as HTMLInputElement;

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
  }
}
</script>