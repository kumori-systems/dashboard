<template>
    <fab v-if="elements[route]"
   v-bind:position="position"
   v-bind:bg-color="elements[route].bgColor"
   v-bind:actions="elements[route].fabActions"
   v-bind:z-index="zindex"
   v-on:addentrypoint="addEntrypoint"
   v-on:addservicedeployment="addServiceDeployment"
   v-on:uploadbundle="uploadBundle"
   v-on:adddomain="addDomain"
   ></fab> 
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import fab from "vue-fab";
import { FabElement } from "../../../store/classes";

@Component({
  name: "FAB",
  components: {
    fab: fab
  }
})
export default class FAB extends Vue {
  // bgColor: string = "#c91432";
  position: string = "top-right";
  zindex: number = 20;
  elements = {
    "/": {
      bgColor: "#C70039",
      fabActions: [
        {
          name: "addentrypoint",
          icon: "input",
          tooltip: "Add entrypoint"
        },
        {
          name: "addservicedeployment",
          icon: "widgets",
          tooltip: "Add service deployment"
        }
      ]
    },
    "/elements": {
      bgColor: "#FFC300",
      fabActions: [
        {
          name: "uploadbundle",
          icon: "file_upload",
          tooltip: "Upload bundle"
        }
      ]
    },
    "/domains": {
      bgColor: "#FF1B00",
      fabActions: [
        {
          name: "adddomain",
          icon: "domain",
          tooltip: "Add domain"
        }
      ]
    }
  };

  addEntrypoint() {
    (<Vue>this).$router.push("/newHTTPEntrypoint");
    console.log("addEntrypoint callback");
  }

  addServiceDeployment() {
    (<Vue>this).$router.push("/newDeployment");
    console.log("addServiceDeployment callback");
  }

  uploadBundle() {
    (<Vue>this).$router.push("/newBundle");
  }
  addDomain() {
    (<Vue>this).$router.push("/newDomain");
  }

  get route() {
    return this.$route.path;
  }
  get fabElements(): Array<FabElement> {
    return this.$store.getters.getFabElements;
  }
}
</script>