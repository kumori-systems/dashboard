<template>
  <div :class="'modal-content content'+'xl'" heith="100" :updater="updater">
    <div class="modal-header my-background">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
  <div class="modal-body my-background">
  <div class="panel panel-default">
    <div class="panel-heading my-background white--text">
      <i class="fa fa-cubes fa-fw"></i> {{$t('modals.components.labels.res')}}
    </div> 
    <div class="panel-body my-background">
      <div class="row my-background">
        <div class="col-md-3" >
          <label style="text-decoration: underline;">{{$t('modals.components.labels.name')}}</label>
        </div>
        <div class="col-md-8" >
          <label style="text-decoration: underline;">{{$t('modals.components.labels.type')}}</label>
        </div>
      </div>
      <rowlist v-if="resources.length>0"  v-bind:list="resources"  :type="getSettings.listTypes.component.resources"> </rowlist>
      <hr  v-if="resources.length>0"/>
        <div class="row my-background">
          <div class="col-md-3" >
            <div :class="{'form-group':true, 'has-error':validation.rname.err, 'has-feedback':validation.rname.err}">
              <input class="form-control" ref="res_name" :value="rname" @input="updateStateRes" :placeholder="$t('modals.components.labels.name')"  @keyup.enter="addRes">
              <span v-if="validation.rname.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
              <span v-if="validation.rname.err" class="help-block">{{$t('validation.'+validation.rname.msg)}}</span>
            </div>
          </div>
          <div class="col-md-8" >
            <select class="form-control" ref="res_type"  @keyup.enter="addRes">
              <option v-for="(res,i) in getSettings.manifestStructure.elementtype.resource.enum" v-bind:key="i" :value="res.eslap">{{res.eslap}}</option>
            </select>
          </div>
          <div class="col-md-1" >
            <div class="action-btn">
              <i  class="btn-private fa fa-plus-square my-background blue" @click="addRes()"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel panel-default">
      <div class="panel-heading my-background white--text">
        <i class="fa fa-sliders fa-fw"></i> {{$t('modals.components.labels.param')}}
      </div>
      <div class="panel-body my-background">
        <div class="row">   
          <div class="col-md-3" >
            <label style="text-decoration: underline;">{{$t('modals.components.labels.name')}}</label>
          </div>
          <div class="col-md-8" >
            <label style="text-decoration: underline;">{{$t('modals.components.labels.type')}}</label>
          </div>
        </div>
        <rowlist v-if="parameters.length>0" v-bind:list="parameters"  :type="getSettings.listTypes.component.parameters"> </rowlist>
        <hr v-if="parameters.length>0" />
          <div class="row">   
            <div class="col-md-3" >
              <div :class="{'form-group':true, 'has-error':validation.pname.err, 'has-feedback':validation.pname.err}">
                <input  ref="param_name" class="form-control" :value="pname" @input="updateStateParam" :placeholder="$t('modals.components.labels.name')" @keyup.enter="addParam">
                <span v-if="validation.pname.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                <span v-if="validation.pname.err" class="help-block">{{$t('validation.'+validation.pname.msg)}}</span>
              </div>
            </div>
            <div class="col-md-8">
              <select class="form-control" @keyup.enter="addParam"  ref="param_type">
                <option v-for="(param, j) in getSettings.manifestStructure.elementtype.parameter.enum" v-bind:key="j" :value="param.eslap">{{param.eslap}}</option>
              </select>
            </div>
            <div class="col-md-1" >
              <div class="action-btn">
                <i class="btn-private fa fa-plus-square blue my-background" @click="addParam()"></i>
              </div>
            </div>
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
import RowList from "./helper_list.vue";
export default {
  components: {
    rowlist: RowList
  },
  data() {
    return {};
  },
  computed: {
    getSettings() {
      return this.$store.getters.getSettings;
    },
    pname() {
      return this.$store.state.manifesteditor.configurationState.pname;
    },
    rname() {
      return this.$store.state.manifesteditor.configurationState.rname;
    },
    resources() {
      return this.$store.state.manifesteditor.configurationState.resources;
    },
    parameters() {
      return this.$store.state.manifesteditor.configurationState.parameters;
    },
    validation() {
      return this.$store.state.manifesteditor.configurationState.validation;
    },
    updater() {
      return this.$store.state.manifesteditor.configurationState.updater;
    },
    modalProp() {
      return this.getSettings.modalProps.configuration;
    }
  },
  methods: {
    addComponentResource(payload) {
      this.$store.dispatch("addComponentResource", payload);
    },

    addComponentParameter(payload) {
      this.$store.dispatch("addComponentParameter", payload);
    },

    updateConfigState(payload) {
      this.$store.dispatch("updateConfigState", payload);
    },

    addParam() {
      this.addComponentParameter({
        name: this.$refs.param_name.value,
        type: this.$refs.param_type.value
      });
    },

    addRes() {
      this.addComponentResource({
        name: this.$refs.res_name.value,
        type: this.$refs.res_type.value
      });
    },

    updateStateParam() {
      this.updateConfigState({
        key: "pname",
        value: this.$refs.param_name.value
      });
    },

    updateStateRes() {
      this.updateConfigState({
        key: "rname",
        value: this.$refs.res_name.value
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