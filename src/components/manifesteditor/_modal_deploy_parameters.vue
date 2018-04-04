<template>
  <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body">
      <collapsegrp @updated="updatedField" :listP="getDeployParams" lvl="base"></collapsegrp>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" data-dismiss="modal">  <i class="fa fa-times"></i> {{$t('panel.buttons.close')}}</button>
    </div>
  </div>
</template>
<script>
export default {
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
      return this.$store.state.deploymentState.parameters;
    },
    updater() {
      return this.$store.state.deploymentState.updater;
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
