<template>
  <v-card id="volumes-view">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Volumes</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Cancels the action -->
        <v-btn outline to="/addVolume">Add Volume</v-btn>

      </v-card-actions>

    </v-card-title>
    <v-container>

      <v-data-table v-bind:headers="headers" v-bind:items="volumes" hide-actions>
        <template slot="items" scope="props">
          <td class="text-xs-left">{{ props.item }}</td>
          <td class="text-xs-left">
            <v-btn color="error" icon v-on:click="showDialog(props.item._uri)">
              <v-icon class="white--text">delete_forever</v-icon>
            </v-btn>
          </td>
        </template>
      </v-data-table>

    </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import SSGetters from "../store/stampstate/getters";
import { Volume } from "../store/stampstate/classes";

@VueClassComponent({
  name: "volumes-view"
})
export default class VolumesView extends Vue {

  headers: any[] = [
    {
      text: "Name",
      align: "left",
      sortable: false,
      value: "domain"
    },
    {
      text: "State",
      align: "left",
      sortable: false,
      value: "state"
    },
    {
      text: "Used by",
      align: "left",
      sortable: false,
      value: "usedBy"
    }
  ];

  /** 
   * Obtains the available volumes in the system.
   */
  get volumes(): { [uri: string]: Volume } {
    return ((<SSGetters>this.$store.getters).volumes as any) as {
      [uri: string]: Volume;
    };
  }

}
</script>