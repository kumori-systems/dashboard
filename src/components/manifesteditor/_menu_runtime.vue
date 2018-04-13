<template>   
  <div class="navbar-default sidebar" role="navigation" :updater="updater">
    <div class="sidebar-nav navbar-collapse"  role="navigation">
      <ul class="nav in" id="side-menu">
        <li :ref="option.name" v-for="(option,i) in menuOptions" v-bind:key="i" v-if="['ui', 'runtime'].indexOf(option.id)>-1 || state[option.id]"  :class="{active: option.name == active}" @click="updateActive(option.name, $event)" >
          <a href="#" @click="option.clear? cleanCurrent(option.target): null" :data-toggle="option.target ? 'modal':''" :data-target="option.target ? option.target : ''" class="menu-title activator">
            <i  v-bind:class="option.icon+' activator'"></i> {{ $t(option.name) }}
            <span  v-if="option.secondLevel  || option.id == 'deployment'" class="fa arrow activator"></span>
            <i  v-if="option.add && active==option.name" v-bind:id="option.add.id" class="menuAddr fa fa-plus-square pull-right activator"  @click="openAdd(option.add.target, $event)"></i>
          </a>
          <span  v-if="option.add"  :ref="'simulate-'+option.add.target"  data-toggle="modal" v-bind:data-target="option.add.target"></span>
          <ul  v-if="option.secondLevel" :id="option.name" class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;">         
            <li v-if="option.id == 'runtime' ">
              <div class="row" >
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
                <div class="col-sm-3"><label class="control-label">{{$t('menu.resource.form.name')}}</label></div>
                <div class="col-sm-9">
                  <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
                    <input :disabled="blockEditName" class="form-control" @input="updateName('name')" ref="name" :value="nameMani.name">
                    <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                    <span v-if="validation.name.err" class="help-block">{{$t('validation.'+validation.name.msg)}}</span>
                  </div>
                </div>
              </div> 
              <div class="row">
                <div class="col-sm-3"><label class="control-label">{{$t('menu.resource.form.version')}}</label></div>
                <div class="col-sm-9">
                  <div :class="{'form-group':true, 'has-error':validation.version.err, 'has-feedback':validation.name.err}">
                    <input :disabled="blockEditName" class="form-control" @input="updateName('version')" ref="version" :value="nameMani.version">
                    <span v-if="validation.version.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                    <span v-if="validation.version.err" class="help-block">{{$t('validation.'+validation.version.msg)}}</span>
                  </div>
                </div>
              </div> 
            </li>        
            <li  v-for="(secondOpt, ind) in option.enum" v-bind:key="ind">
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
      <modal :modalProp="getSettings.modalProps.runtimeDerived" modalSize="xs">
        <modalDerived  slot="body"></modalDerived>
      </modal>
      <modal :modalProp="getSettings.modalProps.runtimeSettings" modalSize="xs">
        <modalSettings  slot="body"></modalSettings>
      </modal>
      <modal :modalProp="getSettings.modalProps.runtimeMetadata" modalSize="xs">
        <modalMetadata  slot="body"></modalMetadata>
      </modal>
    </div>
  </div>
</template>


<script>
import ModalDerived from "./_modal_runtime_derived.vue";
import ModalMetadata from "./_modal_runtime_metadata.vue";
import ModalSettings from "./_modal_runtime_settings.vue";

export default {
  components: {
    modalDerived: ModalDerived,
    modalMetadata: ModalMetadata,
    modalSettings: ModalSettings
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

    getChannels() {
      return this.$store.getters.getChannels;
    },

    getArrangements() {
      return this.$store.getters.getArrangements;
    },

    blockEditName() {
      return this.$store.getters.blockEditName;
    },

    nameMani() {
      return this.$store.state.runtimeState.name;
    },

    validation() {
      return this.$store.state.runtimeState.validation;
    },

    updater() {
      return this.$store.state.runtimeState.updater;
    },

    state() {
      return this.$store.state.runtimeState;
    }
  },
  methods: {
    cleanCurrent(payload) {
      return this.$store.dispatch("cleanCurrent", payload);
    },

    updateServiceName(payload) {
      return this.$store.dispatch("updateServiceName", payload);
    },

    updateDeployState(payload) {
      return this.$store.dispatch("updateDeployState", payload);
    },

    resetService(payload) {
      return this.$store.dispatch("resetService", payload);
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
