<!--
  Component which represents a new domain view.
-->
<template>
  <v-form v-model="valid" ref="form">
    <v-card style="max-width:1300px">
      <v-card-title>

        <!-- View title -->
        <h3 class="headline mb-0">Domains</h3>

        <!-- Applies spaces between elements -->
        <v-spacer></v-spacer>

        <!-- View actions -->
        <v-card-actions>

          <!-- Add domain button -->
          <v-btn outline class="elevation-0" v-on:click="submit" v-bind:disabled="!valid">
            <span>Add domain</span>
            <v-icon right>domain</v-icon>
          </v-btn>
          
          <!-- Cancels the action -->
          <v-btn flat v-on:click="cancel">Cancel</v-btn>

        </v-card-actions>
      </v-card-title>
      <v-container>

        <!-- URL input-->
        <v-flex xs12 md6>
          <v-text-field label="New domain" v-model="newDomain" v-bind:rules="[v => !!v && v.length > 0 || 'A name is required']" required></v-text-field>
        </v-flex>

           <v-layout>
          <v-flex xs4>
          <v-text-field label="Domain urn" v-model="domainURN"
            v-bind:rules="[(v) => !!v || 'An urn is required',
            (v)=> checkURN(v) || 'Invalid URN. Format eslap://namespace/resources/vhost/mydomain/1_0_0' ]" required>
          </v-text-field>
          </v-flex>
        </v-layout>

      </v-container>
    </v-card>
  </v-form>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";


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
  name: "add-domain-view"
})
export default class AddDomainView extends Vue {

  /** Name of the new domain. */
  newDomain: string = null;

  /** URN of the component contaning the new domain. */
  domainURN: string = "eslap://<name_space>/resources/vhost/<element_urn>/<number>_<number>_<number>";

  /** Marks if the component is valid or not. */
  valid: boolean = false;

  /** Method to submit the new domain. */
  submit() {
    this.$store.dispatch("addDomain", {
      urn: this.domainURN,
      domain: this.newDomain
    });
    this.$router.push("/domains");
  }

  /** Checks the urn of the component. */
  checkURN(value: string) {
    return RegExp(
      "^eslap://\\w+(.\\w)*/resource(s)?/vhost/(\\w+/)+\\d+_\\d+_\\d+(_\\d+)?$"
    ).test(value);
  }

  /** Cancels the creation of a new domain. */
  cancel() {
    this.$router.go(-1);
  }
}
</script>