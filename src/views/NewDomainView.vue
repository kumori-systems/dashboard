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

@VueClassComponent({
  name: "add-domain-view"
})
export default class AddDomainView extends Vue {
  newDomain: string = null;
  domainURN: string = "eslap://<name_space>/resources/vhost/<element_urn>/<number>_<number>_<number>";
  valid: boolean = false;

  submit() {
    this.$store.dispatch("addDomain", {
      urn: this.domainURN,
      domain: this.newDomain
    });
    this.$router.push("/domains");
  }

  /*

eslap://a.a/resources/vhost/a/1_0_0

  */

  checkURN(value: string) {
    return RegExp(
      "^eslap://\\w+(.\\w)*/resource(s)?/vhost/(\\w+/)+\\d+_\\d+_\\d+(_\\d+)?$"
    ).test(value);
  }

  cancel() {
    this.$router.go(-1);
  }
}
</script>