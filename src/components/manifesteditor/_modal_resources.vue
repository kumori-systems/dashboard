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
        <div class="col-xs-3" >
          <label style="text-decoration: underline;">
            {{ $t('modals.components.labels.name') }}
          </label>
        </div>
        <div class="col-md-8" >
          <label style="text-decoration: underline;">
            {{ $t('modals.resources.labels.resource') }}
          </label>
        </div>
      </div>

      <div
        v-for="(resource, key) in resources" v-bind:key="key"
        class="row">
        <div class="col-xs-3">
          {{ key }}
        </div>
        <div class="col-xs-9" >
          <div
            :class="{
              'form-group':true, 'has-error':validation[key].err,
              'has-feedback':validation[key].err
            }"
          >
            <select
              :ref="'res_type' + key"
              :value="resource"
              :text="resource.name"
              class="form-control"
              @change="updateStateRes(key)">
              <option
                v-for="(res,i) in filteredResources(key)"
                :key="i"
                :value="res"
                :text="res._urn">
                {{ res._urn }}
              </option>
            </select>
            <span
              v-if="validation[key].err"
              class="glyphicon glyphicon-remove form-control-feedback"/>
            <span
              v-if="validation[key].err"
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
    getResources() {
      return this.$store.getters.getResources;
    },
    currentManifest() {
      return this.$store.state.manifesteditor.currentManifest;
    },
    manifests() {
      return this.$store.getters.manifests;
    },
    resources() {
      return this.$store.state.manifesteditor.deploymentState.resources;
    },
    validation() {
      return this.$store.state.manifesteditor.deploymentState.resValidation;
    },
    updater() {
      return this.$store.state.manifesteditor.deploymentState.updater;
    },
    modalProp() {
      return this.getSettings.modalProps.resources;
    }
  },
  methods: {
    updateDeployResState(payload) {
      this.$store.dispatch("updateDeployResState", payload);
    },

    filteredResources(key) {
      // Contains all resources
      let allRes = this.getResources;

      // Contains the current deployment
      let deploy = this.manifests[this.currentManifest];

      console.debug("key contains", key);

      let res = [];

      if (deploy && deploy.resources) {

        console.debug('deploy');
        console.debug('deploy.resources', deploy.resources);
        console.debug('all resources', allRes);
        res = allRes.filter(resource => {
          return resource._type === deploy.resources[key].type;
        });

        console.debug('res contains', res);
      }

      return res;
    },

    updateStateRes(res_name) {
      this.updateDeployResState({
        key: res_name,
        value: this.$refs[res_name][0].value
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