<template>
    <div id="volumes-view">
        <table class="table">
            <tr v-for="(dataVolume, index) in dataVolumeList" v-bind:key="index">
                <th>{{dataVolume}}</th>
                <th>
                    <span v-if="isDataVolumeUsed(dataVolume)" class="ON_PROGRESS" >in use by {{deploymentUsingDataVolume(dataVolume)}}, {{rolUsingDataVolume(dataVolume)}}</span>
                    <span v-else>in use?: unavailable</span>
                </th>
                <th>{{numberOfChunks(dataVolume)}} chunks</th>
                <th>
                    <button class="button fa fa-info is-info" />
                    <button class="button fa fa-trash is-danger" v-on:click="deleteVolume(dataVolume)" />
                </th>
            </tr>
        </table>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "volumes-view"
})
export default class VolumesView extends Vue {
  addVolume: boolean = true;

  get dataVolumeList() {
    return this.$store.getters.getDataVolumesList;
  }
  get isDataVolumeUsed() {
    return dataVolume => {
      return this.$store.getters.getIsDataVolumeUsed(dataVolume);
    };
  }

  get deploymentUsingDataVolume() {
    return dataVolume => {
      return this.$store.getters.getDeploymentName(
        this.$store.getters.getDeploymentUsingDataVolume(dataVolume)
      );
    };
  }

  get rolUsingDataVolume() {
    return dataVolume => {
      return this.$store.getters.getRolUsingDataVolume(dataVolume);
    };
  }
  get numberOfChunks() {
    return dataVolume => {
      return this.$store.getters.getNumberOfChunksDataVolume(dataVolume);
    };
  }

  deleteVolume(dataVolumeId) {
    return this.$store.dispatch("deleteElement", dataVolumeId);
  }
}
</script>