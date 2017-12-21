<template>
  <v-toolbar id="view-toolbar" color="grey lighten-3" flat dense>
    <v-spacer></v-spacer>
    <v-btn small outline>
      add deployment<v-icon right>cloud</v-icon>
    </v-btn>
    <v-btn small outline>
      add entrypoint<v-icon right>language</v-icon>
    </v-btn>
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
      "/addDeployment": "Add a deployment",
      "/uploadbundle": "Upload bundle",
      "/adddomain": "Add domain",
      "/volumes": "Volumes",
      "/alarmsAndLogs": "Alarms and logs",
      "/help": "Help"
    };

    let route_path = this.$route.path;

    if (!res[route_path]) {
      res[route_path] = this.$store.getters.deploymentFromPath(route_path).name;
    }
    return res;
  }
}
</script>