<template>
  <v-speed-dial v-if="elements[route]" v-model="open" fixed bottom right hover
  transition="scale-transition">

  <v-btn slot="activator" v-bind:class="elements[route].bgColor" fab hover v-model="open">
    <v-icon>add</v-icon>
    <v-icon>close</v-icon>
  </v-btn>
  <v-btn fab small v-bind:class="elements[route].bgColor"
  v-for="(act, index) in elements[route].fabActions" v-bind:key="index"
  v-on:click="goTo(act.to)">
    <v-icon>{{ act.icon }}</v-icon>
  </v-btn>
  </v-speed-dial>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "fab-component"
})
export default class FABComponent extends Vue {
  open: boolean = false;
  elements = {
    "/overview": {
      bgColor: "blue",
      fabActions: [
        {
          icon: "input",
          to: "/addHTTPEntrypoint"
        },
        {
          icon: "widgets",
          to: "/addDeployment"
        }
      ]
    },
    "/elements": {
      bgColor: "yellow",
      fabActions: [
        {
          icon: "file_upload",
          to: "/uploadbundle"
        }
      ]
    },
    "/domains": {
      bgColor: "red",
      fabActions: [
        {
          icon: "domain",
          to: "/adddomain"
        }
      ]
    }
  };

  /**
   * Obtains the actual route. This allows to change the actions inside the
   * FAB.
   */
  get route(): string {
    return this.$route.path;
  }

  /** Loads a new view */
  goTo(to: string): void {
    // console.debug('Changing to view %s', to);
    this.$router.push(to);
  }
}
</script>
<style lang="stylus">
@import '../stylus/main';
</style>
