<template>
  <v-form v-model="valid" ref="form">
    <v-container>
      <v-layout>
        <v-flex xs4>
          <v-text-field label="New domain" v-model="newDomain" v-bind:rules="[v => !!v && v.length > 0 || 'A name is required']" required></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-btn v-on:click="submit" v-bind:disabled="!valid">Add</v-btn>
      </v-layout>
    </v-container>
  </v-form>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "add-domain-view"
})
export default class AddDomainView extends Vue {
  newDomain: string = null;
  valid: boolean = false;

  submit() {
    this.$store.dispatch("addNewDomain", this.newDomain);
    this.$router.push("/domains");
  }

}
</script>