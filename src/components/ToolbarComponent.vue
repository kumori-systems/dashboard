<template>
    <v-toolbar id="main-toolbar" app>

      <!-- Shows or hides the menu -->
      <v-toolbar-side-icon light v-on:click.stop="showNavigation = !showNavigation"></v-toolbar-side-icon>

      <!-- Toolbar title -->
      <v-toolbar-title>{{ names[route] }}</v-toolbar-title>
    
    </v-toolbar>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import PSGetters from "../store/pagestate/getters";

@VueClassComponent({
  name: "toolbar-component",
  components: {}
})
export default class ToolbarComponent extends Vue {
  get names() {
    let res = {
      "/overview": "Overview",
      "/elements": "Elements",
      "/domains": "Domains",
      "/addHTTPEntrypoint": "Add a http entrypoint",
      "/addDeployment": "Add a deployment"
    };

    if (!res[this.route]) {
      res[this.route] = this.$store.getters.deploymentFromPath(this.route).name;
    }
    return res;
  }

  get route(): string {
    return this.$route.path;
  }

  /** Getter for showing or hinding this component */
  get showNavigation(): Boolean {
    return ((<PSGetters>this.$store.getters).showNavigation as any) as boolean;
  }

  /** Setter for showing or hinding this component */
  set showNavigation(value) {
    this.$store.dispatch("showNavigation", value);
  }
}
</script>
<style lang="stylus">
#main-toolbar .toolbar {
  &__logo, &__title {
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__links {
    margin: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;

    a {
      color: #fff;
      text-align: center;
      text-decoration: none;
      margin: 0 0.5rem;

      img {
        height: 25px;
      }

      i {
        padding: 0;
      }

      h1 {
        font-size: 4vw;
      }
    }
  }
}
</style>