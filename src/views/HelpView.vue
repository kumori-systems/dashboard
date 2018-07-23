<!--
  This component represents the help view
-->
<template>
  <div id="help-view">
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

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
  name: "help-view"
})
export default class HelpView extends Vue {
  /**
   * Redirects the user to the kumori-systems documentation page in a new
   * window. Also makes a go(-1) to stay on the last view the user was on.
   */
  created() {
    window.open("https://github.com/kumori-systems/documentation");
    this.$router.go(-1);
  }

}
</script>