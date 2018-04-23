<template>
  <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
    <div class="modal-header my-background">
      <button type="button" class="close white--text" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body my-background">
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
    <div class="modal-footer my-background">
      <button type="button" class="btn btn-default white--text" data-dismiss="modal">  <i class="fa fa-times"></i> {{$t('panel.buttons.close')}}</button>
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
      return this.$store.state.manifesteditor.runtimeState.metadata;
    },
    validation() {
      return this.$store.state.manifesteditor.runtimeState.validation;
    },
    updater() {
      return this.$store.state.manifesteditor.runtimeState.updater;
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
<!--
  There is a bug in which relative css paths are not correctly solved
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>