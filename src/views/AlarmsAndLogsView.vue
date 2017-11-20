<template>
    <div id="alarmsandlogs-view">
        <p>Alarms and logs</p>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "alarms-and-logs-view"
})
export default class AlarmsAndLogsView extends Vue {}
</script>