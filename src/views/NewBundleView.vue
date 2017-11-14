<template>
    <div>
      <!-- 
        input-file on process: https://github.com/vuetifyjs/vuetify/issues/238
      -->
      <input type="file" class="box" v-on:change="onFileChange">  
      <v-btn class="blue" v-bind:disabled="fileList === null || fileList.length === 0"
      v-on:click="addElement">Upload bundle</v-btn>

    </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "new-bundle-view"
})
export default class NewBundleView extends Vue {
  fileList: FileList = null;

  onFileChange(e): void {
    this.fileList =
      (<HTMLInputElement>e.target).files ||
      (<DataTransfer>e.dataTransfer).files;
  }

  addElement(): void {
    if (this.fileList !== null) {
      this.$store.dispatch("addNewBundle", this.fileList.item(0));
      this.$router.push("/elements");
    }
  }
}
</script>