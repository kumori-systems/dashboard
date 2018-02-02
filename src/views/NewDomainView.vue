<template>
  <v-form v-model="valid" ref="form">
    <v-card>
      <v-card-title>

        <!-- View title -->
        <h3 class="headline mb-0">Domains</h3>

        <!-- Applies spaces between elements -->
        <v-spacer></v-spacer>

        <!-- View actions -->
        <v-card-actions>

          <!-- Add domain button -->
          <v-btn color="primary" class="elevation-0" v-on:click="submit" v-bind:disabled="!valid">
            <span>Add domain</span>
            <v-icon right>domain</v-icon>
          </v-btn>
          
          <!-- Cancels the action -->
          <v-btn outline to="-1">Cancel</v-btn>

        </v-card-actions>
      </v-card-title>
      <v-container>

        <!-- URL input-->
        <v-flex xs4>
          <v-text-field label="New domain" v-model="newDomain" v-bind:rules="[v => !!v && v.length > 0 || 'A name is required']" required></v-text-field>
        </v-flex>

           <v-layout>
          <v-flex xs4>
          <v-text-field label="Domain uri" v-model="domainURI"
            v-bind:rules="[(v) => !!v || 'An uri is required',
            (v)=> checkUri(v) || 'Invalid URI. Format eslap://namespace/resources/vhost/mydomain/1_0_0' ]" required>
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

@VueClassComponent({
  name: "add-domain-view"
})
export default class AddDomainView extends Vue {
  newDomain: string = null;
  domainURI: string = "eslap://<name_space>/resources/vhost/<element_uri>/<number>_<number>_<number>";
  valid: boolean = false;

  submit() {
    this.$store.dispatch("addNewDomain", {'uri':this.domainURI, 'domain':this.newDomain});
    this.$router.push("/domains");
  }

  checkUri(value: string) {
    // return RegExp("^eslap://(\\w+)/resource(s)?/vhost/(\\w+/)+\\d+_\\d+_\\d+(_\\d+)?$").test(value);
    return RegExp("^eslap://(\\w+)/resource(s)?/vhost/(\\w+/)+\\d+_\\d+_\\d+(_\\d+)?$").test(value);
  }
}
</script>