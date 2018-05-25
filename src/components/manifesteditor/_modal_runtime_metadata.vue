<template>
  <div
    :updater="updater"
    class="modal-content content xl"
    heith="100">
    <div class="modal-header my-background">
      <button
        type="button"
        data-dismiss="modal"
        class="close white--text">
        &times;
      </button>
      <h4 class="modal-title">
        <i :class="modalProp.icon"/> {{ modalProp.title }}
      </h4>
    </div>
    <div class="modal-body my-background">
      <div class="row">
        <div class="col-sm-12">
          <label>
            {{ key[0].toUpperCase() + key.substring(1) }}
          </label>
          <div
            :class="{
              'form-group': true, 
              'has-error': validation[key] ? validation[key].err: false,
              'has-feedback': validation[key] ? validation[key].err: false
            }"
          >
            <div  class="form-group input-group">
              <textarea
                v-model="metadata"
                :ref="key"
                rows="3"
                style="min-height: 35px; height: 300px; resize: vertical;"
                class="form-control"
                @input="updatedField(key)">
              </textarea>
              <span class="input-group-addon">
                {{ $t('modals.deployParams.labels.json') }}
              </span>
            </div>
            <span
              v-if="validation[key] && validation[key].err"
              class="help-block">
              {{ $t('validation.' + validation[key].msg) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer my-background">
      <button
        type="button"
        data-dismiss="modal"
        class="btn btn-default white--text">
        <i class="fa fa-times"/> {{$t('panel.buttons.close')}}
      </button>
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
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="__static__/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="__static__/css/graph-creator.css"></style>