<!--
  This component represents the alarms and log view.
-->
<template>
  <v-card>
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Alarms &amp; logs</h3>

    </v-card-title>

    <!-- Divides different sections of the view -->
    <v-divider></v-divider>

    <v-container fluid>
      <v-layout>

        <!-- Level filter -->
        <v-flex xs12 md1>
          <v-select label="Minimum log level" v-model="selectedLogLevel" v-bind:items="logLevels">
            
            <template slot="selection" scope="items">
              <v-icon v-bind:class="items.item.value+'--text'">stop</v-icon>
              <span v-bind:class="items.item.value+'--text'">{{ items.item.text }}</span>
            </template>
            
             <template slot="item" scope="items">
                <template>
                  <v-list-tile-content v-bind:class="items.item.value+'--text'">
                    <v-list-tile-title>
                      <v-icon v-bind:class="items.item.value+'--text'">stop</v-icon>
                      {{ items.item.text }}
                    </v-list-tile-title>
                  </v-list-tile-content>
                </template>
              </template>
            
          </v-select>
        </v-flex>

        <!-- Date filter -->
        <v-flex xs12 md6>
          <v-layout class="mr-3 ml-3">

            <!-- From date picker -->
            <v-flex xs12 md3>
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
            <v-flex xs12 md3 class="mr-2">
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
            <v-flex xs12 md3 >
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
            <v-flex xs12 md3>
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
      <v-data-table v-bind:headers="headers" v-bind:items="logs" must-sort
        v-bind:rows-per-page-items="rowsPerPageItems" v-bind:search="search"
        v-bind:pagination.sync="pagination">

        <template slot="items" scope="props">
          <td v-bind:class="props.item.level" width=20px></td>
          <td class="text-xs-left">
            {{ props.item.time.getDate() }}-{{ props.item.time.getMonth() + 1 }}-{{ props.item.time.getFullYear() }}
            {{ props.item.time.getHours() }}:{{ props.item.time.getMinutes() | minutesFilter }}
          </td>
          <td class="text-xs-left">{{ props.item.title }}</td>
          <td class="text-xs-left">{{ props.item.text }}</td>
          <td class="text-xs-right">
            <v-btn v-if="props.item.level===Notification.LEVEL.ERROR
            && !props.item.readed" flat v-on:click="markAlarmAsSeen(props.item)">
              <v-tooltip left>

                <v-icon id="warn_icon" slot="activator">visibility</v-icon>
                <span>mark as read</span>

              </v-tooltip>
            </v-btn>
            <v-btn flat v-on:click="showLogInfoDialog(props.item.data)">
              <v-tooltip right>

                <v-icon id="info_icon" slot="activator">info</v-icon>
                <span>info</span>

              </v-tooltip>
            </v-btn>
          </td>
        </template>

      </v-data-table>

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

const NUM_ITEMS_PER_PAGE = 10;

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
  name: "alarms-and-logs-view",
  filters: {
    minutesFilter: function(value) {
      return value < 10 ? "0" + value : value;
    }
  }
})
export default class AlarmsAndLogsView extends Vue {
  
  /**
   * This is just a way of passing a  imported vue-external element inside vue.
   */
  Notification = Notification;

  /** Number of rows per page. */
  rowsPerPageItems = [25, 50, { text: "All", value: -1 }];

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
  logLevels: object[] = [
    {
      text: "Debug",
      value: Notification.LEVEL.DEBUG
    },
    {
      text: "Info",
      value: Notification.LEVEL.INFO
    },
    {
      text: "Warning",
      value: Notification.LEVEL.WARNING
    },
    {
      text: "Error",
      value: Notification.LEVEL.ERROR
    }
  ];

  /** Selected minimum log level. */
  selectedLogLevel: string = "Info";

  pagination = {
    sortBy: "time",
    descending: true
  };

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

  /** Obtains the logs. In the storage logs are stored as notifications. */
  get logs() {
    let loglist: Notification[] = this.$store.getters.notifications;

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
        // log level
        switch (this.selectedLogLevel) {
          case "blue":
            return (
              item.level === Notification.LEVEL.INFO ||
              item.level === Notification.LEVEL.WARNING ||
              item.level === Notification.LEVEL.ERROR
            );

          case "yellow":
            return (
              item.level === Notification.LEVEL.WARNING ||
              item.level === Notification.LEVEL.ERROR
            );
          case "red":
            return item.level === Notification.LEVEL.ERROR;

          default:
            // 'grey'
            return true;
        }
      }, this);

    return loglist;
  }

  /** Formats the date in the spanish way. */
  formatDate(date) {
    if (!date) {
      return null;
    }

    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  }

  /** This is done to match the spanish format date. */
  parseDate(date) {
    if (!date) {
      return null;
    }

    const [day, month, year] = date.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  /* This is the method which shows the log info dialog. */
  showLogInfoDialog(data: string) {
    this.data = data;
    this.logInfoDialog = true;
  }

  /** This is the method to mark an alarm as readed. */
  markAlarmAsSeen(item) {
    this.$store.dispatch("readNotification", {
      time: item.time,
      title: item.title
    });
  }
}
</script>
<style lang="scss" scoped>
$color_unkown: #bdbdbd;
$color_error: #ff5252;
$color_info: #2196f3;
$color_success: #4caf50;
$color_warning: #ffc107;

%icon_size {
  font-size: 35px;
}

.play {
  @extend %icon_size;
  color: $color_success;  
}

.info {
  @extend %icon_size;
  color: $color_info;  
}

.delete{
  @extend %icon_size;
  color: $color_error;
}

.warn{
  @extend %icon_size;
  color: $color_warning;
}

#warn_icon{
  @extend .warn;
}

#info_icon{
  @extend .info;
}

#play_icon{
  @extend .play;
}

#delete_icon{
  @extend .delete;
}

.corporative_background {
  background: #d1406b;
}

#info_link {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
  text-decoration: none;
}

#sanity_icon {
  position: absolute;
  top: 60px;
  right: 10px;
}
</style>