<template>
  <v-card>
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Alarms &amp; logs</h3>

    </v-card-title>

    <!-- Divides different sections of the view -->
    <v-divider></v-divider>

    <v-container>
      <v-layout>

        <!-- Level filter -->
        <v-flex xs12 md2 lg2>
          <v-select label="Minimum log level" v-model="selectedLogLevel" v-bind:items="logLevels"></v-select>
        </v-flex>

        <v-spacer></v-spacer>
        
        <!-- Search filter -->
        <v-flex xs12 md4 lg4>
          <v-text-field label="Search" v-model="search" prepend-icon="search">
          </v-text-field>
        </v-flex>

      </v-layout>

      <v-data-table v-bind:headers="headers" v-bind:items="logs" hide-actions  v-bind:search="search">

        <template slot="items" scope="props">
          <td v-bind:class="props.item.level" width=20px></td>
          <td class="text-xs-left">
            {{ props.item.time.getDate() }}-{{ props.item.time.getMonth() + 1 }}-{{ props.item.time.getFullYear() }}
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

      <div class="text-xs-center">
        <v-pagination v-if="numPages>1" v-bind:length="numPages" v-model="actualPage"></v-pagination>
      </div>

    </v-container>

    <v-dialog v-model="logInfoDialog" max-width="800px">
      <v-card>
        <v-card-title class="headline">Log info</v-card-title>
        <v-card-text>
          <v-flex ma-1 xs12><pre>{{ data }}</pre></v-flex>
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

const NUM_ITEMS_PER_PAGE = 20;

@VueClassComponent({
  name: "alarms-and-logs-view"
})
export default class AlarmsAndLogsView extends Vue {
  logLevels: string[] = ["Debug", "Info", "Warning", "Error"];
  selectedLogLevel: string = "Debug";
  numPages: number = 1;
  actualPage: number = 1;
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
      sortable: true,
      value: "time"
    },
    {
      text: "Title",
      align: "left",
      sortable: true,
      value: "title"
    },
    {
      text: "Text",
      align: "left",
      sortable: true,
      value: "text"
    }
  ];

  get logs() {
    let logs: Notification[] = this.$store.getters.notifications;

    // Switch the page
    this.numPages = logs.length / NUM_ITEMS_PER_PAGE;

    // logs.

    return logs
      .slice(
        (this.actualPage-1) * NUM_ITEMS_PER_PAGE,
        (this.actualPage-1) * NUM_ITEMS_PER_PAGE + NUM_ITEMS_PER_PAGE
      )
      .filter((n, index, arrayfun) => {
        switch (this.selectedLogLevel) {
          case "Info":
            return (
              n.level === Notification.LEVEL.INFO ||
              n.level === Notification.LEVEL.WARNING ||
              n.level === Notification.LEVEL.ERROR
            );

          case "Warning":
            return (
              n.level === Notification.LEVEL.WARNING ||
              n.level === Notification.LEVEL.ERROR
            );
          case "Error":
            return n.level === Notification.LEVEL.ERROR;

          default:
            return true;
        }
      }, this);
  }

  showLogInfoDialog(data: string) {
    this.data = data;
    this.logInfoDialog = true;
  }
}
</script>