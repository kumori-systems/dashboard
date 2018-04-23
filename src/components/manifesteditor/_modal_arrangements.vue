<template>
  <div :class="'modal-content content'+'xs'" heith="100" :updater="updater">
    <div class="modal-header my-background">
      <button type="button" class="close white--text" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body my-background">
      <div class="row" v-for="(param, key) in getArragementRes" v-bind:key="key">
        <div class="col-md-1"></div>
        <div class="col-md-3">
          <label> {{humanizeLabel(key)}} </label>
        </div>
        <div class="col-md-6" >
          <div :class="{'form-group':true, 'has-error':validation[key].err, 'has-feedback':validation[key].err}">
            <input type="text" class="form-control" @input="updateArrangement(key)" :ref="key" :value="param">
            <span v-if="validation[key].err" class="glyphicon glyphicon-remove form-control-feedback"></span>
            <span v-if="validation[key].err" class="help-block">{{$t('validation.'+validation[key].msg)}}</span>
          </div>
        </div>
        <div class="col-md-2" v-if="getMainArrangements.indexOf(key)==-1">
          <div class="action-btn" @click="delteArrangement(key)"><i class="btn-private red fa fa-minus-square my-background"></i></div>
        </div>
      </div>
      <div class="row" v-if="availablesArrs().length>0">
        <hr/>
        <div class="col-md-1">
        </div>
        <div class="col-md-9">
          <select class="form-control" ref="newArr">
            <option v-for="(arr,i) in availablesArrs()" :value="arr" v-bind:key="i">{{ humanizeLabel(arr) }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <div class="action-btn" @click="addNewArr()"><i class="btn-private blue fa fa-plus-square my-background"></i></div>
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

    getArragementRes() {
      return this.$store.getters.getArragementRes;
    },

    getMainArrangements() {
      return this.$store.getters.getMainArrangements;
    },

    getOptArrangements() {
      return this.$store.getters.getOptArrangements;
    },

    validation() {
      return this.$store.state.manifesteditor.deploymentState.arrValidation;
    },

    updater() {
      return this.$store.state.manifesteditor.deploymentState.updater;
    },

    modalProp() {
      return this.getSettings.modalProps.arrangement;
    }
  },
  methods: {
    updateArrangementState(payload) {
      return this.$store.dispatch("updateArrangementState", payload);
    },

    deleteArrangement(payload) {
      return this.$store.dispatch("deleteArrangement", payload);
    },

    addArrangement(payload) {
      return this.$store.dispatch("addArrangement", payload);
    },

    availablesArrs() {
      return this.getOptArrangements.filter(x => {
        return Object.keys(this.getArragementRes).indexOf(x) == -1;
      });
    },

    humanizeLabel(key) {
      return key.replace("__", "").replace(/\b\w/g, l => l.toUpperCase());
    },

    updateArrangement(key) {
      this.updateArrangementState({
        key: key,
        value: this.$refs[key][0].value
      });
    },

    addNewArr() {
      this.addArrangement(this.$refs["newArr"][0].value);
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