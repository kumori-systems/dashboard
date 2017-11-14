<template>
    <div id="help-view">
        <p>Help</p>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "help-view"
})
export default class HelpView extends Vue {}
</script>