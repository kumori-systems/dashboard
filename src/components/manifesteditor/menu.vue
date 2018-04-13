<template>
  <div>
    <v-card-title class="mybackground"> <!-- View title-->
      <h3 class="headline mb-0">{{ $t('menu.' + manifests[currentManifest]._type + '.label' )}} {{ manifests[currentManifest].name }}</h3>
    </v-card-title>
    <v-card-text> <!-- View body -->
      <slot name="menu"></slot>
    </v-card-text>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    manifests() {
      return this.$store.getters.manifests;
    },
    currentManifest() {
      return this.$store.state.manifesteditor.currentManifest;
    }
  }
};
</script>







