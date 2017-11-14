<template>
 </v-dialog>
       <v-dialog v-model="dialog2">
            <v-card> 
        <v-card-title>
            Dialog 2
          </v-card-title>
         <v-card-text>
           <v-btn color="primary" dark @click.stop="dialog3 = !dialog3">Open Dialog 3</v-btn>
           <v-select
              v-bind:items="select"
              label="A Select List"
              item-value="text"
            ></v-select>
           </v-card-text>
        <v-card-actions>
            <v-btn color="primary" flat @click.stop="dialog2=false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "new-bundle-view"
})
export default class NewBundleView extends Vue {
  fileList: FileList = null;

  onFileChange(e) {
    this.fileList =
      (<HTMLInputElement>e.target).files ||
      (<DataTransfer>e.dataTransfer).files;
  }

  addElement() {
    if (this.fileList !== null) {
      this.$store.dispatch("addNewBundle", this.fileList.item(0));
      this.$router.push("/elements");
    }
  }
}
</script>