<template>
  <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body">
      <div  v-for="(key, index) in Object.keys(parameters)" v-bind:key="index" class="row">
        <div class="col-sm-12">
          <label> {{key}} </label>
          <div :class="{'form-group':true, 'has-error':validation[key].err, 'has-feedback':validation[key].err}">
            <div v-if="['list','json', 'vhost'].indexOf(types[key].type) > -1" class="form-group input-group">
              <textarea v-model="parameters[key]" class="form-control" rows="3" :ref="key" style=" min-height: 35px; height: 300px; resize: vertical;" @input="updatedField(key)"></textarea>
                <span class="input-group-addon">{{$t('modals.deployParams.labels.'+types[key].type)}}</span>                   
            </div>
            <div v-if="['number', 'integer', 'string'].indexOf(types[key].type) > -1" class="form-group input-group">
              <input class="form-control" type="integer" :ref="key" :value="parameters[key]"  @input="updatedField(key)">
              <span class="input-group-addon">{{$t('modals.deployParams.labels.'+types[key].type)}}</span>
            </div>
            <div v-if="['boolean'].indexOf(types[key].type) > -1" >
              <select  class="form-control" :value="parameters[key]" :ref="key" @change="updatedField(key)">
                <option>true</option>
                <option>false</option>
              </select>
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
    return {};
  },

  computed: {
    getSettings() {
      return this.$store.getters.getSettings;
    },

    getDeployParams() {
      return this.$store.getters.getDeployParams;
    },

    parameters() {
      return this.$store.state.resourceState.parameters;
    },

    validation() {
      return this.$store.state.resourceState.validation;
    },

    updater() {
      return this.$store.state.deploymentState.updater;
    },

    types() {
      return this.$store.state.Settings.resourceFields;
    },

    modalProp() {
      return this.getSettings.modalProps.parameters;
    }
  },

  methods: {
    updateResourceState() {
      this.$store.dispatch("updateResourceState", payload);
    },

    updatedField(key) {
      this.updateResourceState({
        key: key,
        value: this.$refs[key][0].value,
        type: this.types[key].type
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