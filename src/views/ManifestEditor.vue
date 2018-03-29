<template>
    <v-layout id="manifest-editor-view" pa-0 ma-0>
      <v-flex xs-12 pa-0 ma-0 ref="wrapper">
        <iframe pa-0 ma-0  src="http://localhost:8080/" style="border-style:none; width:100%; height:100vmin;"></iframe> 
      </v-flex>
    </v-layout>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

@VueClassComponent({
  name: "manifest-editor-view"
})
export default class ManifestEditorView extends Vue {
  windowSize: { x: number; y: number } = { x: -1, y: -1 };
  mounted() {
    this.onResize();
  }
  onResize() {
    console.log('(<any>this.$refs.wrapper)', this.$refs);
    this.windowSize = { x: (<any>this.$refs.wrapper).x, y: (<any>this.$refs.wrapper).y };
  }
}
</script>