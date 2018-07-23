<!--
  This component represents the new bundle view.
-->
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
          <v-btn class="elevation-0" outline
          v-bind:disabled="fileList === null || fileList.length === 0"
          v-on:click="addElement">
            <span>Upload bundle</span>
            <v-icon right>file_upload</v-icon>
          </v-btn>

          <!-- Cancels the action -->
          <v-btn flat v-on:click="cancel">Cancel</v-btn>
          
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
  name: "new-bundle-view"
})
export default class NewBundleView extends Vue {
  fileList: FileList = null;

  /**
   * Method which is called when a file changes.
   */
  onFileChange(e): void {
    this.fileList =
      (<HTMLInputElement>e.target).files ||
      (<DataTransfer>e.dataTransfer).files;
  }

  /**
   * Method called when an element is selected.
   */
  addElement(): void {
    if (this.fileList !== null) {
      this.$store.dispatch("addNewBundle", this.fileList.item(0));
      this.$router.push("/elements");
    }
  }

  /**
   * Method called when the user cancels changes.
   */
  cancel() {
    this.$router.go(-1);
  }
}
</script>