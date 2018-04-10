<template>
  <div class="navbar-default sidebar" role="navigation" :updater="updater">
    <div class="sidebar-nav navbar-collapse"  role="navigation">
      <ul class="nav in" id="side-menu">
        <li :ref="option.name" v-for="(option, i) in menuOptions" v-bind:key="i" :class="{active: option.name == active}" @click="updateActive(option.name, $event)" >
          <a href="#" @click="option.clear? cleanCurrent(option.target): null" :data-toggle="option.target ? 'modal':''" :data-target="option.target ? option.target : ''" class="menu-title activator">
            <i v-bind:class="option.icon+' activator'"></i> {{ $t(option.name) }}
            <span v-if="option.secondLevel  || option.id == 'deployment'" class="fa arrow activator"></span>
            <i v-if="option.add && active==option.name" v-bind:id="option.add.id" class="menuAddr fa fa-plus-square pull-right activator"  @click="openAdd(option.add.target, $event)"></i>
          </a>
          <span v-if="option.add"  :ref="'simulate-'+option.add.target"  data-toggle="modal" v-bind:data-target="option.add.target"></span>
          <ul v-if="option.secondLevel" :id="option.name" class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;">
            <li v-if="option.id == 'resource'">
              <div class="row">
                <div class="col-sm-3"><label class="control-label">{{$t('menu.resource.form.domain')}}</label></div>
                <div class="col-sm-9">
                  <div :class="{'form-group':true, 'has-error':validation.domain.err, 'has-feedback':validation.domain.err}">
                    <input :disabled="blockEditName" class="form-control" @input="updateName('domain')" ref="domain" :value="nameMani.domain">
                    <span v-if="validation.domain.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                    <span v-if="validation.domain.err" class="help-block">{{$t('validation.'+validation.domain.msg)}}</span>
                  </div>
                </div>               
              </div>
              <div class="row">
                <div class="col-sm-3"><label class="control-label">{{$t('menu.resource.form.type')}}</label></div>
                <div class="col-sm-9">
                  <div :class="{'form-group':true, 'has-error':validation.type.err, 'has-feedback':validation.type.err}">
                    <input :disabled="blockEditName" class="form-control" @input="updateName('type')" ref="type" :value="nameMani.type">
                    <span v-if="validation.type.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                    <span v-if="validation.type.err" class="help-block">{{$t('validation.'+validation.type.msg)}}</span>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-3"><label class="control-label">{{$t('menu.resource.form.name')}}</label></div>
                <div class="col-sm-9">
                  <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
                    <input :disabled="blockEditName" class="form-control" @input="updateName('name')" ref="name" :value="nameMani.name">
                    <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                    <span v-if="validation.name.err" class="help-block">{{$t('validation.'+validation.name.msg)}}</span>
                  </div>
                </div>
              </div> 
            </li>
            <li v-if="option.id == 'arrangements'">
              <rowlist v-bind:list="getArrangements" v-bind:type="getSettings.listTypes.arrangement"> </rowlist>
            </li>
            <li v-for="(secondOpt,j) in option.enum" v-bind:key="j">
              <template v-if="secondOpt.type=='link'">
                <a id="show-channels" href="#" @click="optLink(secondOpt.action)" >{{ $t(secondOpt.id) }}</a>
              </template>
              <template v-if="secondOpt.type=='other'">
                <a id="show-channels" href="#" title="show channels" alt="show channels">{{ $t('menu.uielements.form.show_hide')}}</a>
              </template> 
            </li>
          </ul>
        </li>
      </ul>
      <modal :modalProp="getSettings.modalProps.parameters" modalSize="xs">
        <modal-parameters slot="body"></modal-parameters>
      </modal>
    </div>
  </div>
</template>
<script>

import  HelperModal  from "./helper_modal.vue";

import ModalDeployParameters from "./_modal_deploy_parameters.vue";

export default {
  components: {
    'modal': HelperModal,
    'modal-parameters': ModalDeployParameters
  },
  data() {
    return {
      active: "",
      delay: 300,
      clicks: 0,
      timer: null
    };
  },
  computed: {
    getChannels() {
      return this.$store.getters.getChannels;
    },

    getSettings() {
      return this.$store.getters.getSettings;
    },

    menuOptions() {
      return this.$store.getters.menuOptions;
    },

    getCurrentRoleIndex() {
      return this.$store.getters.getCurrentRoleIndex;
    },

    getArrangements() {
      return this.$store.getters.getArrangements;
    },

    blockEditName() {
      return this.$store.getters.blockEditName;
    },

    nameMani() {
      return this.$store.state.manifesteditor.resourceState.name;
    },

    validation() {
      return this.$store.state.manifesteditor.resourceState.validation;
    },

    updater() {
      return this.$store.state.manifesteditor.resourceState.updater;
    },

    state() {
      return this.$store.state.manifesteditor.resourceState;
    }
  },
  methods: {
    cleanCurrent(payload) {
      this.$store.dispatch("cleanCurrent", payload);
    },

    updateServiceName(payload) {
      this.$store.dispatch("updateServiceName", payload);
    },

    updateDeployState(payload) {
      this.$store.dispatch("updateDeployState", payload);
    },

    resetService(payload) {
      this.$store.dispatch("resetService", payload);
    },

    optLink(action) {
      this[action]();
    },

    updateName(prop) {
      this.updateDeployState({ key: prop, value: this.$refs[prop][0].value });
    },

    openAdd(target, event) {
      if (event.stopPropagation) {
        event.stopPropagation();
      }
      event.cancelBubble = true;
      this.cleanCurrent(target);
      this.$refs["simulate-" + target][0].click();
    },

    updateActive(name, event) {
      this.clicks++;
      if (this.clicks == 1) {
        this.activeList(name, event);
        setTimeout(() => {
          this.clicks = 0;
        }, 400);
      }
    },

    activeList(name, event) {
      let nameFilter = name.replace(/(:|\.|\[|\])/g, "\\$1");
      let activeFilter = this.active.replace(/(:|\.|\[|\])/g, "\\$1");
      if (event.target.classList.contains("activator") && this.active == name) {
        $("#" + nameFilter).collapse("hide");
        this.active = "";
      } else if (this.active != name) {
        if (this.active.length > 0) $("#" + activeFilter).collapse("hide");
        this.active = name;
        $("#" + nameFilter).collapse("show");
      }
    }
  }
};
</script>
