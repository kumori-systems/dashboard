<template>
  <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
    <div class="modal-header my-background">
      <button type="button" class="close white--text" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body my-background">
      <div class="row">   
        <div class="col-xs-3" >
          <label style="text-decoration: underline;">{{$t('modals.components.labels.name')}}</label>
        </div>
        <div class="col-md-8" >
          <label style="text-decoration: underline;">{{$t('modals.resources.labels.resource')}}</label>
        </div>
      </div>
      <div class="row" v-for="(resource, key) in resources" v-bind:key="key">   
        <div class="col-xs-3" >{{key}}</div>
        <div class="col-xs-9" >
          <div :class="{'form-group':true, 'has-error':validation[key].err, 'has-feedback':validation[key].err}">
            <select class="form-control" v-bind:ref="'res_type' + key" :value="resource" @change="updateStateRes(key)">
              <option v-for="(res,i) in filteredResources(key)" v-bind:key="i"  :value="res.name">{{res.name}}</option>
            </select>
            <span v-if="validation[key].err" class="glyphicon glyphicon-remove form-control-feedback"></span>
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
      let allRes = this.getResources;
      let deploy = this.manifests[this.currentManifest];
      let service = this.manifests[deploy.servicename];
      if (service) {
        let resources = service.configuration.resources.filter(x => {
          return x.name == key;
        });
        if (resources.length == 1) {
          return allRes.filter(x => {
            return x.spec == resources[0].type;
          });
        }
      }
      return [];
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
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>