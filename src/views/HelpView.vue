<template>
  <div id="help-view">
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "help-view"
})
export default class HelpView extends Vue {
  created() {
    window.open("https://github.com/kumori-systems/documentation");
    this.$router.go(-1);
  }
}
</script>