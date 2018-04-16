<template>
  <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-sm-12">
          <label> {{key[0].toUpperCase() + key.substring(1)}} </label>
          <div :class="{'form-group':true, 'has-error':validation[key].err, 'has-feedback':validation[key].err}">
            <div  class="form-group input-group">
              <textarea class="form-control" rows="3" :ref="key" style=" min-height: 35px; height: 300px; resize: vertical;" @input="updatedField(key)" v-model="metadata"></textarea>
              <span class="input-group-addon">{{$t('modals.deployParams.labels.json')}}</span>                   
            </div>
            <span v-if="validation[key].err" class="help-block">{{$t('validation.'+validation[key].msg)}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" data-dismiss="modal">  <i class="fa fa-times"></i> {{$t('panel.buttons.close')}}</button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      key: "metadata"
    };
  },
  computed: {
    getSettings() {
      return this.$store.getters.getSettings;
    },
    getDeployParams() {
      return this.$store.getters.getDeployParams;
    },
    metadata() {
      return this.$store.state.runtimeState.metadata;
    },
    validation() {
      return this.$store.state.runtimeState.validation;
    },
    updater() {
      return this.$store.state.runtimeState.updater;
    },
    modalProp() {
      return this.getSettings.modalProps.runtimeMetadata;
    }
  },
  methods: {
    updateRuntimeState(payload) {
      this.$store.dispatch("updateRuntimeState", payload);
    },
    updatedField(key) {
      this.updateRuntimeState({
        key: key,
        value: this.$refs[key].value,
        type: "json"
      });
    }
  }
};
</script>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>