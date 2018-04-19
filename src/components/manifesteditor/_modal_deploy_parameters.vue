<template>
  <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
    <div class="modal-header my-background">
      <button type="button" class="close white--text" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body my-background">
      <collapsegrp @updated="updatedField" :listP="getDeployParams" lvl="base"></collapsegrp>
    </div>
    <div class="modal-footer my-background">
      <button type="button" class="btn btn-default white--text" data-dismiss="modal">  <i class="fa fa-times"></i> {{$t('panel.buttons.close')}}</button>
    </div>
  </div>
</template>
<script>

import CollapseGrp from "./helper_collapse_grp.vue";
export default {
  components:{
    collapsegrp:CollapseGrp
  },
  data() {
    return {};
  },
  computed: {
    getSettings() {
      return this.$store.getters.getSettings;
    },
    getDeployParams() {
      return this.$store.getters.getDeployparams;
    },
    parameters() {
      return this.$store.state.manifesteditor.deploymentState.parameters;
    },
    updater() {
      return this.$store.state.manifesteditor.deploymentState.updater;
    },
    modalProp() {
      return this.getSettings.modalProps.parameters;
    }
  },
  methods: {
    updateDeployParamState(payload) {
      this.$store.dispatch("updateDeployParamState", payload);
    },
    updatedField(data) {
      this.updateDeployParamState(data);
    }
  }
};
</script>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>