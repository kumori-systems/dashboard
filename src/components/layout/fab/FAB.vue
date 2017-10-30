<template>
    <fab v-if="elements[route]"
   v-bind:position="position"
   v-bind:bg-color="elements[route].bgColor"
   v-bind:actions="elements[route].fabActions"
   v-bind:z-index="zindex"
   v-bind:icon-size="iconsize"
   v-bind:rippleShow="rippleShow"
   v-bind:fixed-tooltip="fixedtooltip"
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
  iconsize: string = "small"; // small | medium | large
  fixedtooltip: boolean = false;
  rippleShow:boolean = true; // shadow
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
  }

  addServiceDeployment() {
    (<Vue>this).$router.push("/newDeployment");
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

}
</script>
<style lang="scss">

.pointer,
#top-right-action{
  right: 20vw;
  margin-top: -15px;
}

</style>