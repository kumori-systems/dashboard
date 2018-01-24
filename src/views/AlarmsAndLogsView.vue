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
          <td v-bind:class="props.item.level" width=20px></td>
          <td class="text-xs-left">
            {{ props.item.time.getMonth() + 1 }}-{{ props.item.time.getDate() }}-{{ props.item.time.getFullYear() }}
            {{ props.item.time.getHours() }}:{{ props.item.time.getMinutes() }}
          </td>
          <td class="text-xs-left">{{ props.item.title }}</td>
          <td class="text-xs-left">{{ props.item.text }}</td>
          <td class="text-xs-right">
            <v-btn color="blue darken-1" flat v-on:click="showLogInfoDialog(props.item.data)">
              <v-icon>info</v-icon>
            </v-btn>
            </td>
        </template>

      </v-data-table>

    </v-container>

      <v-dialog v-model="logInfoDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline">Log info</v-card-title>
          <v-card-text>
            <v-flex ma-1 xs12>{{ data | jsonparsing }}</v-flex>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat="flat" v-on:click.native="logInfoDialog = false">Done</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import { Notification } from "../store/pagestate/classes";

@VueClassComponent({
  name: "alarms-and-logs-view",
  filters: {
    jsonparsing: function(text: string) {
      while (text.indexOf(",") >= 0){
        text = text.replace(",", () => "%2C");
      }

      while (text.indexOf("%2C") >= 0){
        text = text.replace("%2C", () => ",\n");
      }

      return text;
    }
  }
})
export default class AlarmsAndLogsView extends Vue {
  logInfoDialog: boolean = false;
  data: string = "";
  search: string = "";
  headers: any[] = [
    {
      text: "",
      align: "left",
      sortable: false,
      value: "time"
    },
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

  showLogInfoDialog(data: string) {
    this.data = data;
    this.logInfoDialog = true;
  }
}
</script>