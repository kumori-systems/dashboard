<template>
  <div id="control">
    <div id="control-panel" class="panel panel-default menuPannel">
      <div class="panel-heading text-center"><label> {{ $t('menu.' + manifests[currentManifest].type + '.label' )}}</label> </div>
      <div class="panel-body">
        <slot name="menu" ></slot>
      </div>
    </div>  
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    manifests() {
      return this.$store.state.manifests;
    },
    currentManifest() {
      return this.$store.state.currentManifest;
    }
  }
};
</script>







