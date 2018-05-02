<template>
  <div
    :updater="updater"
    class="my-background modal-content content xs"
    height="100px">
    <div class="modal-header">
      <button
        type="button"
        class="close white--text"
        data-dismiss="modal">
        &times;
      </button>
      <h4 class="modal-title">
        <i :class="modalProp.icon"/>
        {{ modalProp.title }}
      </h4>
    </div>
    <div class="modal-body">
      <div class="panel panel-default">
        <div class="panel-heading my-background white--text">
          <i class="fa fa-gears fa-fw"/>
          {{ getCurrentRoleIndex>-1 ? $t('modals.heads.settings')
          : $t('modals.heads.new') + ' ' + $t('modals.roles.name') }}
        </div>
        <div class="panel-body my-background">
          <div class="row">
            <div class="col-sm-3">
              <label class="rowText">
                {{ $t('modals.roles.labels.name') }}
              </label>
            </div>
            <div class="col-sm-9">
              <div
                :class="{
                  'form-group':true, 'has-error':validation.name.err,
                  'has-feedback':validation.name.err
                }"
              >
                <input
                  ref="rolename"
                  v-model="roleName"
                  class="form-control">
                
                <span
                  v-if="validation.name.err"
                  class="glyphicon glyphicon-remove form-control-feedback"/>

                <span
                  v-if="validation.name.err"
                  class="help-block">
                  {{ $t('validation.' + validation.name.msg) }}
                </span>

              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-3">
              <label class="rowText">
                {{ $t('modals.roles.labels.comp') }}
              </label>
            </div>
            <div class="col-sm-9">
              <div
                :class="{
                  'form-group':true, 'has-error':validation.component.err,
                  'has-feedback':validation.component.err
                }"
              >
                <select
                  id="componentsList"
                  ref="rolecomp"
                  :value="role.component"
                  class="form-control"
                  @change="updateComponent">
                  <optgroup :label="$t('modals.roles.labels.chcomp')">

                    <option
                      v-for="comp in getComponents"
                      :value="comp.name"
                      :key="comp.name">
                      {{ comp.name }}
                    </option>

                  </optgroup>
                </select>
                <span
                  v-if="validation.component.err"
                  class="glyphicon glyphicon-remove form-control-feedback"/>
                <span
                  v-if="validation.component.err"
                  class="help-block">
                  {{ $t('validation.' + validation.component.msg) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="getCurrentRoleResource.rows.length>0"
        class="panel panel-default">
        <div class="panel-heading my-background white--text">
          <i class="fa fa-cubes fa-fw"/> {{ $t('modals.roles.labels.res') }}
        </div> 
        <div class="panel-body my-background white--text">
          <gridform
            :form="getCurrentRoleResource"
            :type="getSettings.inlineForms.types.resource"
            :validation="resourceValidation"/>
        </div>
      </div>
      <div
        v-if="getCurrentRoleParams.length>0"
        class="panel panel-default">
        <div class="panel-heading my-background white--text">
          <i class="fa fa-sliders fa-fw"/> {{ $t('modals.roles.labels.param') }}
        </div>
        <div class="panel-body my-background white--text">
          <div class="row">
            <div class="col-sm-2">
              <label class="rowText">
                {{ $t('modals.roles.labels.byPass') }}
              </label>
            </div>
            <div class="col-sm-1">
              <input
                :checked="getBypassParams ? 'checked':null"
                type="checkbox"
                @change="changeParams()">
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        v-if="getCurrentRoleIndex==-1"
        slot="add"
        type="button"
        class="btn btn-primary"        
        @click="addValidRole">
        <i class="fa fa-plus"/> {{ $t('panel.buttons.add') }}
      </button>
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
import GridForm from "./helper_grid_form.vue";
export default {
  components: {
    gridform: GridForm
  },
  data() {
    return {};
  },
  mounted: function() {
    console.debug("Modal roles has been mounted");
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

    role: {
      get() {
        return this.$store.state.manifesteditor.roleState.role;
      },

      set(role) {
        this.$store.dispatch("updateRoleName", role);
      }
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

    roleName: {
      get() {
        let res = "";

        if (this.$store.state.manifesteditor.currentRole > -1) {
          res = this.$store.state.manifesteditor.manifests[
            this.$store.state.manifesteditor.currentManifest
          ].roles[this.$store.state.manifesteditor.currentRole].name;
        }else{
          res = this.$store.state.manifesteditor.roleState.role.name;
        }

        return res;
      },
      set(newName) {
        this.$store.dispatch("updateRoleName", newName);
      }
    },

    modalProp() {
      return this.getSettings.modalProps.roles;
    }
  },
  methods: {
    updateRoleName(payload) {
      this.$store.dispatch("updateRoleName", payload);
    },

    updateRoleComp(newComponent) {
      this.$store.dispatch("updateRoleComp", newComponent);
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
      if (this.getCurrentRoleIndex !== -1) {
        this.updateRoleName(this.$refs.rolename.value);
      } else {
        this.updateRoleState({
          key: "name",
          value: this.$refs.rolename.value
        });
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
<!--
  There is a bug in which relative css paths are not correctly solved
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>