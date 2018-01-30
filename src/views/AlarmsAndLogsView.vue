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
        <v-flex xs12 md2>
          <v-select label="Minimum log level" v-model="selectedLogLevel" v-bind:items="logLevels"></v-select>
        </v-flex>

        <!-- Date filter -->
        <v-flex xs12 md6>
          <v-layout>

            <!-- From date picker -->
            <v-flex xs12 md3 class="pl-3">
              <v-menu lazy v-on:close-on-content-click="false" v-model="showFromDateMenu"
                transition="scale-transition" offset-y full-width
                v-on:nudge-right="40" max-width="290px" min-width="290px">
                <v-text-field slot="activator" label="From date"
                  v-model="fromDateFormatted" prepend-icon="event" 
                  @blur="date = parseDate(fromDateFormatted)">
                </v-text-field>
                <v-date-picker v-model="fromDate" no-title scrollable actions
                  @input="fromDateFormatted = formatDate($event)">
                </v-date-picker>
              </v-menu>
            </v-flex>
            
            <!-- From time picker -->
            <v-flex xs12 md3 class="pr-1">
              <v-menu lazy v-model="showFromTimeMenu"
                transition="scale-transition" offset-y full-width
                v-on:nudge-right="40" max-width="290px" min-width="290px">
                <v-text-field slot="activator" label="From time"
                  v-model="fromTime" prepend-icon="query_builder" >
                </v-text-field>
                <v-time-picker v-model="fromTime" format="24hr">
                </v-time-picker>
              </v-menu>
            </v-flex>

            <!-- To date picker -->
            <v-flex xs12 md3  class="pl-1">
              <v-menu lazy v-on:close-on-content-click="false" v-model="showToDateMenu"
                transition="scale-transition" offset-y full-width
                v-on:nudge-right="40" max-width="290px" min-width="290px">
                <v-text-field slot="activator" label="To date"
                  v-model="toDateFormatted" prepend-icon="event" 
                  @blur="date = parseDate(toDateFormatted)">
                </v-text-field>
                <v-date-picker v-model="toDate" no-title scrollable actions
                  @input="toDateFormatted = formatDate($event)">
                </v-date-picker>
              </v-menu>
            </v-flex>
            
            <!-- To time picker -->
            <v-flex xs12 md3  class="pr-3">
              <v-menu lazy v-model="showToTimeMenu"
                transition="scale-transition" offset-y full-width
                v-on:nudge-right="40" max-width="290px" min-width="290px">
                <v-text-field slot="activator" label="To time"
                  v-model="toTime" prepend-icon="query_builder" >
                </v-text-field>
                <v-time-picker v-model="toTime" format="24hr">
                </v-time-picker>
              </v-menu>
            </v-flex>

          </v-layout>
        </v-flex>
        
        <v-spacer></v-spacer>

        <!-- Search filter -->
        <v-flex xs12 md4>
          <v-text-field label="Search" v-model="search" prepend-icon="search">
          </v-text-field>
        </v-flex>

      </v-layout>

      <!-- Log table -->
      <v-data-table v-bind:headers="headers" v-bind:items="logs" hide-actions 
      v-bind:search="search" v-bind:pagination.sync="defaultPagination">

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

    <!-- Detailed info dialog -->
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
  defaultPagination = {
    sortBy: "time",
    descending: true
  };

  /** Table headers. */
  headers: any[] = [
    {
      text: "",
      align: "left",
      sortable: false,
      value: "level"
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

  /** Detailed log dialog. */
  logInfoDialog: boolean = false;

  /** Detailed log data. */
  data: string = "";

  /** Search pattern. */
  search: string = "";

  /** Selectable log levels. */
  logLevels: string[] = ["Debug", "Info", "Warning", "Error"];
  /** Selected minimum log level. */
  selectedLogLevel: string = "Debug";

  /** Total number of pages. */
  numPages: number = 1;
  /** Actual page. */
  actualPage: number = 1;

  /** Show/Hide from date selector. */
  showFromDateMenu: boolean = false;
  /** Show/Hide from time selector. */
  showFromTimeMenu: boolean = false;
  /** Selected from date */
  fromDate: string = null;
  /** Selected from date formatted. */
  fromDateFormatted: string = null;
  /** Selected from time. */
  fromTime: string = null;

  /** Show/Hide to date selector. */
  showToDateMenu: boolean = false;
  /** Show/Hide to time selector. */
  showToTimeMenu: boolean = false;
  /** Selected to date */
  toDate: string = null;
  /** Selected to date formatted. */
  toDateFormatted: string = null;
  /** Selected to time. */
  toTime: string = null;

  get logs() {
    let loglist: Notification[] = this.$store.getters.notifications;

    // Switch the page
    this.numPages = loglist.length / NUM_ITEMS_PER_PAGE;

    loglist = loglist
      .filter((item, index, arrayfun) => {
        // fromDate
        if (this.fromDate && this.fromDate !== "") {
          let date = new Date(this.fromDate);
          return (
            item.time.getFullYear() >= date.getFullYear() &&
            item.time.getMonth() >= date.getMonth() &&
            item.time.getDate() >= date.getDate()
          );
        }
        return true;
      })
      .filter((item, index, arrayfun) => {
        // fromTime
        if (this.fromTime && this.fromTime !== "") {
          let date = this.fromTime.split(":");
          return (
            item.time.getHours() >= parseInt(date[0]) &&
            item.time.getMinutes() >= parseInt(date[1])
          );
        }
        return true;
      })
      .filter((item, index, arrayfun) => {
        // toDate
        if (this.toDate && this.toDate !== "") {
          let date = new Date(this.toDate);
          return (
            item.time.getFullYear() <= date.getFullYear() &&
            item.time.getMonth() <= date.getMonth() &&
            item.time.getDate() <= date.getDate()
          );
        }
        return true;
      })
      .filter((item, index, arrayfun) => {
        // toTime
        if (this.toTime && this.toTime !== "") {
          let date = this.toTime.split(":");
          return (
            item.time.getHours() <= parseInt(date[0]) &&
            item.time.getMinutes() <= parseInt(date[1])
          );
        }
        return true;
      })
      .filter((item, index, arrayfun) => {
        switch (this.selectedLogLevel) {
          case "Info":
            return (
              item.level === Notification.LEVEL.INFO ||
              item.level === Notification.LEVEL.WARNING ||
              item.level === Notification.LEVEL.ERROR
            );

          case "Warning":
            return (
              item.level === Notification.LEVEL.WARNING ||
              item.level === Notification.LEVEL.ERROR
            );
          case "Error":
            return item.level === Notification.LEVEL.ERROR;

          default:
            return true;
        }
      }, this)
      .slice(
        (this.actualPage - 1) * NUM_ITEMS_PER_PAGE,
        (this.actualPage - 1) * NUM_ITEMS_PER_PAGE + NUM_ITEMS_PER_PAGE
      );

    loglist.forEach((item: Notification, index, arrayfun) => {
      if (item.level === Notification.LEVEL.ERROR && !item.readed) {
        this.$store.dispatch("readNotification", {
          time: item.time,
          title: item.title
        });
      }
    });

    return loglist;
  }

  formatDate(date) {
    if (!date) {
      return null;
    }

    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  }

  parseDate(date) {
    if (!date) {
      return null;
    }

    const [day, month, year] = date.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  showLogInfoDialog(data: string) {
    this.data = data;
    this.logInfoDialog = true;
  }
}
</script>