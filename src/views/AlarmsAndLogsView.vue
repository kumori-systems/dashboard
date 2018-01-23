<template>
  <v-card>
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Alarms &amp; logs</h3>
     
      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Search -->
        
        <v-text-field label="Search" v-model="search" prepend-icon="search">
        </v-text-field>
        
      </v-card-actions>

    </v-card-title>
    <v-container>

      <v-data-table v-bind:headers="headers" v-bind:items="logs" hide-actions  v-bind:search="search">

        <template slot="items" scope="props">
          <td class="text-xs-left">
            {{ props.item.time.getMonth() + 1 }}-{{ props.item.time.getDate() }}-{{ props.item.time.getFullYear() }}
            {{ props.item.time.getHours() }}:{{ props.item.time.getMinutes() }}
          </td>
          <td class="text-xs-left">{{ props.item.title }}</td>
          <td class="text-xs-left">{{ props.item.text }}</td>
        </template>

      </v-data-table>

    </v-container>

  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import { Notification } from "../store/pagestate/classes";

@VueClassComponent({
  name: "alarms-and-logs-view"
})
export default class AlarmsAndLogsView extends Vue {
  search: string = "";
  headers: any[] = [
    {
      text: "Date",
      align: "left",
      sortable: false,
      value: "time"
    },
    {
      text: "Title",
      align: "left",
      sortable: false,
      value: "title"
    },
    {
      text: "Text",
      align: "left",
      sortable: false,
      value: "text"
    }
  ];

  get logs() {
    return this.$store.getters.notifications;
  }
}
</script>