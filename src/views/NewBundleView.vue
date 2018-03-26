<template>
    <v-card id="upload-bundle-view" style="max-width:1300px">
      <v-card-title>

        <!-- View title -->
        <h3 class="headline mb-0">Upload bundle</h3>

        <!-- Applies spaces between elements -->
        <v-spacer></v-spacer>

        <!-- View actions -->
        <v-card-actions>

          <!-- Upload bundle button -->
          <v-btn color="primary" class="elevation-0"
          v-bind:disabled="fileList === null || fileList.length === 0"
          v-on:click="addElement">
            <span>Upload bundle</span>
            <v-icon right>file_upload</v-icon>
          </v-btn>

          <!-- Cancels the action -->
          <v-btn outline v-on:click="cancel">Cancel</v-btn>
          
        </v-card-actions>
      </v-card-title>
      <v-container>
          <!--input-file on process: https://github.com/vuetifyjs/vuetify/issues/238-->
          <input type="file" class="box" v-on:change="onFileChange">  
      </v-container>
    </v-card>
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

  cancel() {
    this.$router.go(-1);
  }
}
</script>