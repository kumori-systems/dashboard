<template>
  <div
    :updater="updater"
    class="my-background modal-content content xl"
    heith="100">
    <div class="modal-header">
      <button
        type="button"
        class="close white--text"
        data-dismiss="modal">
        &times;
      </button>
      <h4 class="modal-title">
        <i :class="modalProp.icon"/> {{ modalProp.title }}
      </h4>
    </div>
    <div class="modal-body">
      <div
        v-for="(key, index) in Object.keys(runtimeSttings)"
        :key="index"
        class="row">
        <div class="col-sm-12">
          <label>
            {{ key[0].toUpperCase() + key.substring(1) }}
          </label>
          <div
            :class="{
              'form-group':true, 'has-error':validation[key].err,
              'has-feedback':validation[key].err
            }"
          >
            <div class="form-group input-group">
              <input
                type="text"
                :ref="key"
                :value="runtimeSttings[key]"
                class="form-control black--text"
                @input="updatedField(key)">
              <span class="input-group-addon">
                {{ $t('modals.deployParams.labels.string') }}
              </span>
            </div>
            <span
              v-if="validation[key].err"
              class="help-block">
              {{ $t('validation.' + validation[key].msg) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-default white--text"
        data-dismiss="modal">
        <i class="fa fa-times"/> {{ $t('panel.buttons.close') }}
      </button>
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
      return this.$store.getters.getDeployParams;
    },

    runtimeSttings() {
      return this.$store.state.manifesteditor.runtimeState.runsettings;
    },

    validation() {
      return this.$store.state.manifesteditor.runtimeState.validation;
    },

    updater() {
      return this.$store.state.manifesteditor.runtimeState.updater;
    },

    modalProp() {
      return this.getSettings.modalProps.runtimeSettings;
    }
  },
  methods: {
    updateRuntimeState(payload) {
      return this.$store.dispatch("updateRuntimeState", payload);
    },
    updatedField(key) {
      this.updateRuntimeState({
        key: key,
        value: this.$refs[key][0].value,
        type: "string",
        parent: "runsettings"
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
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>