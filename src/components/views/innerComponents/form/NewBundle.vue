<template>
    <div>
      <input type="file" class="box" v-on:change="onFileChange">  
      <button v-bind:disabled="fileList === null || fileList.length === 0" class="button is-primary" v-on:click="addElement">Upload bundle</button>
    
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  name: "NewBundle"
})
export default class NewBundle extends Vue {
  fileList: FileList = null;

  onFileChange(e) {
    console.log('Llamamos a onFileChange');
    this.fileList =
      (<HTMLInputElement>e.target).files ||
      (<DataTransfer>e.dataTransfer).files;
  }

  addElement() {
    if (this.fileList!==null) {
      this.$store.dispatch("addNewBundle", this.fileList.item(0));
      this.$router.push("/elements");
    }
  }
}
</script>