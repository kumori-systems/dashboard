<template>
  <div :class="'modal-content content'+'xs'" height="100px" :updater="updater">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body">
      <div class="panel panel-default">
        <div class="panel-heading">
          <i class="fa fa-gears fa-fw"></i> {{getCurrentRoleIndex>-1 ? $t('modals.heads.settings') : $t('modals.heads.new')+' '+$t('modals.roles.name') }}
        </div>
        <div class="panel-body">
          <div class="row">
            <div class="col-sm-3"><label  class="rowText">{{$t('modals.roles.labels.name')}}</label></div>
            <div class="col-sm-9">
              <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
                <input class="form-control"  v-model="role.name" @input="updateName" ref="rolename">
                <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                <span v-if="validation.name.err" class="help-block">{{$t('validation.'+validation.name.msg)}}</span>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-3"><label  class="rowText">{{$t('modals.roles.labels.comp')}}</label></div>
            <div class="col-sm-9">
              <div :class="{'form-group':true, 'has-error':validation.component.err, 'has-feedback':validation.component.err}">
                <select id="componentsList" class="form-control" :value="role.component" @change="updateComponent" ref="rolecomp">
                  <optgroup :label="$t('modals.roles.labels.chcomp')">
                    <option  v-for="comp in getComponents" :value="comp.name" :key="comp.name" >{{ comp.name }}</option>
                  </optgroup>
                </select>
                <span v-if="validation.component.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                <span v-if="validation.component.err" class="help-block">{{$t('validation.'+validation.component.msg)}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="panel panel-default" v-if="getCurrentRoleResource.rows.length>0">
        <div class="panel-heading">
          <i class="fa fa-cubes fa-fw"></i> {{$t('modals.roles.labels.res')}}
        </div> 
        <div class="panel-body">
          <gridform v-bind:form="getCurrentRoleResource" :type="getSettings.inlineForms.types.resource" :validation="resourceValidation"> </gridform>
        </div>
      </div>
      <div class="panel panel-default" v-if="getCurrentRoleParams.length>0">
        <div class="panel-heading">
          <i class="fa fa-sliders fa-fw"></i> {{$t('modals.roles.labels.param')}}
        </div>
        <div class="panel-body">
          <div class="row">
            <div class="col-sm-2"> <label class="rowText">{{$t('modals.roles.labels.byPass')}}</label></div>
            <div class="col-sm-1"><input  type="checkbox" :checked="getBypassParams ? 'checked':null" @change="changeParams()"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button v-if="getCurrentRoleIndex==-1" @click="addValidRole" type="button" class="btn btn-primary" slot="add">  <i class="fa fa-plus"></i> {{$t('panel.buttons.add')}}</button>
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
    getComponents() {
      return this.$store.getters.getComponents;
    },

    getSettings() {
      return this.$store.getters.getSettings;
    },

    getCurrentRoleResource() {
      return this.$store.getters.getCurrentRoleResource;
    },

    getCurrentRoleParams() {
      return this.$store.getters.getCurrentRoleParams;
    },

    getBypassParams() {
      return this.$store.getters.getBypassParams;
    },

    getCurrentRoleIndex() {
      return this.$store.getters.getCurrentRoleIndex;
    },

    role() {
      return this.$store.state.manifesteditor.roleState.role;
    },

    validation() {
      return this.$store.state.manifesteditor.roleState.validation;
    },

    resourceValidation() {
      return this.$store.state.manifesteditor.roleState.resourceValidation;
    },

    updater() {
      return this.$store.state.manifesteditor.roleState.updater;
    },

    roleName() {
      return this.$store.state.manifesteditor.currentRole.name;
    },

    modalProp() {
      return this.getSettings.modalProps.roles;
    }
  },
  methods: {
    updateRoleName(payload) {
      this.$store.dispatch("updateRoleName", payload);
    },

    updateRoleComp(payload) {
      this.$store.dispatch("updateRoleComp", payload);
    },

    changeBypass(payload) {
      this.$store.dispatch("changeBypass", payload);
    },

    addRole(payload) {
      this.$store.dispatch("addRole", payload);
    },

    updateRoleState(payload) {
      this.$store.dispatch("updateRoleState", payload);
    },

    updateName() {
      if (this.getCurrentRoleIndex != -1) {
        this.updateRoleName(this.$refs.rolename.value);
      } else {
        this.updateRoleState({ key: "name", value: this.$refs.rolename.value });
      }
    },

    updateComponent() {
      if (this.getCurrentRoleIndex != -1) {
        this.updateRoleComp(this.$refs.rolecomp.value);
      } else {
        this.updateRoleState({
          key: "component",
          value: this.$refs.rolecomp.value
        });
      }
    },

    changeParams() {
      this.changeBypass();
    },

    addValidRole() {
      this.addRole({
        name: this.$refs.rolename.value,
        component: this.$refs.rolecomp.value
      });
    }
  }
};
</script>