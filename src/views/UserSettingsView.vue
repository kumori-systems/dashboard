<template>
  <v-card id="user-settings-view">
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
      <p>Avatar: {{ user.avatar}}</p>
      <p>Id: {{ user.id }}</p>
      <p>Token</p>
      <p class="ml-3">access token: {{ user.token.accessToken }}</p>
      <p class="ml-3">time-to-live: {{ user.token.expiresIn }}</p>
      <p class="ml-3">refresh token: {{ user.token.refreshToken }}</p>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import { User } from "../store/pagestate/classes";

@VueClassComponent({
  name: "user-settings-view"
})
export default class UserSettingsView extends Vue {
  /** Obtains the authentified user in the system. */
  get user(): User {
    return this.$store.getters.user;
  }

  cancel() {
    this.$router.go(-1);
  }
}
</script>