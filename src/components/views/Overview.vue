<template>
    <div>
        <router-view v-if="this.$route.name !== 'Overview'"></router-view>
        <div v-else-if="deploymentList.length > 0">
            <checkbox-input v-model="showEntrypoints"> Show HTTP entrypoints</checkbox-input>
            <div class="tile">
            <div class="columns">
              <div class="column" >
                    <deployment-card  class="deployment-card" v-for="(deployment, index) in deploymentList" v-bind:key="index" v-if="index%2===0 && (!deployment.isEntrypoint || showEntrypoints)" v-bind:deployment="deployment"></deployment-card>
              </div>              
              <div class="column" >
                    <deployment-card class="deployment-card" v-for="(deployment, index) in deploymentList" v-bind:key="index" v-if="index%2!==0 && (!deployment.isEntrypoint || showEntrypoints)" v-bind:deployment="deployment"></deployment-card>
              </div>
            </div>
            </div>
        </div>
        <div v-else>
            <!-- No deployment found -->
            Start making some deployments!
        </div>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

// Componentes
import DeploymentCard from "./innerComponents/card/DeploymentCard.vue";
import CheckboxInput from "./innerComponents/input/CheckboxInput.vue";
import { Collapse, Item as CollapseItem } from "vue-bulma-collapse";
import { Deployment } from "../../store/classes";

@Component({
  name: "Overview",
  components: {
    "deployment-card": DeploymentCard,
    collapse: Collapse,
    "collapse-item": CollapseItem,
    "checkbox-input": CheckboxInput
  }
})
export default class Overview extends Vue {
  showEntrypoints: boolean = true;

  get deploymentList(): Array<string> {
    return this.$store.getters.getDeploymentList;
  }
}
</script>