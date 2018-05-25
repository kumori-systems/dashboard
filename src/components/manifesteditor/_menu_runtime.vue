<template>   
  <div
    role="navigation"
    :updater="updater"
    class="navbar-default sidebar">
    <div
      role="navigation"
      class="sidebar-nav navbar-collapse">
      <ul
        id="side-menu"
        class="nav in">
        <li
          v-if="['ui', 'runtime'].indexOf(option.id)>-1 || state[option.id]"
          v-for="(option,i) in menuOptions"
          :ref="option.name"
          :key="i"
          :class="{active: option.name == active}"
          class="my-background"
          @click="updateActive(option.name, $event)">
          <a
            @click="option.clear? cleanCurrent(option.target): null"
            :data-toggle="option.target ? 'modal':''"
            :data-target="option.target ? option.target : ''"
            class="menu-title activator my-background white--text">
            <i
              :class="option.icon"
              class="activator"/>
              {{ $t(option.name) }}
            <span
              v-if="option.secondLevel || option.id === 'deployment'"
              class="fa arrow activator"/>
            <i
              v-if="option.add && active==option.name"
              :id="option.add.id"
              class="menuAddr fa fa-plus-square pull-right activator"
              @click="openAdd(option.add.target, $event)"/>
          </a>
          <span
            v-if="option.add"
            :ref="'simulate-'+option.add.target"
            :data-target="option.add.target"
            data-toggle="modal"/>
          <ul
            v-if="option.secondLevel"
            :id="option.name"
            class="nav nav-second-level collapse my-background"
            aria-expanded="false"
            style="height: 0px;">         
            <li v-if="option.id === 'runtime' ">
              <div class="row" >
                <div class="col-sm-3">
                  <label class="control-label">
                    {{$t('menu.resource.form.domain')}}
                  </label>
                </div>
                <div class="col-sm-9">
                  <div
                    :class="{
                      'form-group':true, 'has-error':validation.domain.err,
                      'has-feedback':validation.domain.err
                    }"
                  >
                    <input
                      ref="domain"
                      :disabled="blockEditName"
                      :value="nameMani.domain"
                      class="form-control"
                      @input="updateName('domain')">
                    <span
                      v-if="validation.domain.err"
                      class="glyphicon glyphicon-remove form-control-feedback"/>
                    <span
                      v-if="validation.domain.err"
                      class="help-block">
                      {{ $t('validation.'+validation.domain.msg) }}
                    </span>
                  </div>
                </div>               
              </div>
              <div class="row">
                <div class="col-sm-3">
                  <label class="control-label">
                    {{ $t('menu.resource.form.name') }}
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
                      ref="name"
                      :disabled="blockEditName"
                      :value="nameMani.name"
                      class="form-control"
                      @input="updateName('name')">
                    <span
                      v-if="validation.name.err"
                      class="glyphicon glyphicon-remove form-control-feedback"/>
                    <span
                      v-if="validation.name.err"
                      class="help-block">
                      {{ $t('validation.'+validation.name.msg) }}
                    </span>
                  </div>
                </div>
              </div> 
              <div class="row">
                <div class="col-sm-3">
                  <label class="control-label">
                    {{ $t('menu.resource.form.version') }}
                  </label>
                </div>
                <div class="col-sm-9">
                  <div
                    :class="{
                      'form-group':true, 'has-error':validation.version.err,
                      'has-feedback':validation.name.err
                    }"
                  >
                    <input
                      ref="version"
                      :disabled="blockEditName"
                      :value="nameMani.version"
                      class="form-control"
                      @input="updateName('version')">
                    <span
                      v-if="validation.version.err"
                      class="glyphicon glyphicon-remove form-control-feedback"/>
                    <span
                      v-if="validation.version.err"
                      class="help-block">
                      {{ $t('validation.'+validation.version.msg) }}
                    </span>
                  </div>
                </div>
              </div> 
            </li>        
             <template v-for="(secondOpt, index) in option.enum">
              <li
                :key="index"
                v-if="secondOpt.type=='link'">
                <a
                  id="show-channels"
                  class="white--text"
                  @click="optLink(secondOpt.action)">
                  {{ $t(secondOpt.id) }}
                </a>
              </li>
              <li
                :key="index"
                v-if="secondOpt.type=='other'">
                <a
                  id="show-channels"
                  title="show channels"
                  alt="show channels">
                  {{ $t('menu.uielements.form.show_hide')}}
                </a>
              </li>
              <li :key="index">
                <a
                  class="white--text"
                  @click="downloadTemporalManifest">
                  Download Temporal Manifest
                </a>
              </li>
            </template>
          </ul>
        </li>
      </ul>
      <modal
        :modalProp="getSettings.modalProps.runtimeDerived"
        modalSize="xs">
        <modalDerived slot="body"/>
      </modal>
      <modal
        :modalProp="getSettings.modalProps.runtimeSettings"
        modalSize="xs">
        <modalSettings  slot="body"/>
      </modal>
      <modal
        :modalProp="getSettings.modalProps.runtimeMetadata"
        modalSize="xs">
        <modalMetadata  slot="body"/>
      </modal>
    </div>
  </div>
</template>
<script>
import ModalDerived from "./_modal_runtime_derived.vue";
import ModalMetadata from "./_modal_runtime_metadata.vue";
import ModalSettings from "./_modal_runtime_settings.vue";
import Modal from "./helper_modal.vue";

export default {
  components: {
    modalDerived: ModalDerived,
    modalMetadata: ModalMetadata,
    modalSettings: ModalSettings,
    modal: Modal
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
      return this.$store.state.manifesteditor.runtimeState.name;
    },

    validation() {
      return this.$store.state.manifesteditor.runtimeState.validation;
    },

    updater() {
      return this.$store.state.manifesteditor.runtimeState.updater;
    },

    state() {
      return this.$store.state.manifesteditor.runtimeState;
    }
  },
  methods: {
    downloadTemporalManifest() {
      this.$store.dispatch("downloadTemporalManifest");
    },

    cleanCurrent(payload) {
      return this.$store.dispatch("cleanCurrent", payload);
    },

    updateServiceName(payload) {
      return this.$store.dispatch("updateServiceName", payload);
    },

    updateDeployState(payload) {
      return this.$store.dispatch("updateDeployState", payload);
    },

    resetService() {
      return this.$store.dispatch("resetService");
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
<!--
  There is a bug in which relative css paths are not correctly solved
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>
