<template>   
  <div
    :updater="updater"
    class="navbar-default sidebar"
    role="navigation">
    <div
      class="sidebar-nav navbar-collapse"
      role="navigation">
      <ul
        id="side-menu"
        class="nav in">
        <li
          v-for="(option,ind) in menuOptions"
          :ref="option.name"
          :key="ind"
          :class="{active: option.name == active}"
          class="my-background"
          @click="updateActive(option.name, $event)">
          <a
            :data-toggle="option.target ? 'modal':''"
            :data-target="option.target ? option.target : ''"
            class="menu-title activator white--text"
            @click="option.clear? cleanCurrent(option.target): null">
            <i :class="option.icon + ' activator'"/>
            {{ $t(option.name) }}
            <span
              v-if="option.secondLevel || option.id == 'deployment'"
              class="fa arrow activator"/>
            <i
              v-if="option.add && active==option.name"
              :id="option.add.id"
              class="menuAddr fa fa-plus-square pull-right activator"
              @click="openAdd(option.add.target, $event)"/>
          </a>
          <span
            v-if="option.add"
            :ref="'simulate-' + option.add.target"
            :data-target="option.add.target"
            data-toggle="modal"/>
          <ul
            v-if="option.secondLevel"
            :id="option.name"
            class="nav nav-second-level collapse"
            aria-expanded="false"
            style="height: 0px;">         
            <li v-if="option.id == 'deployment' ">
              <div class="row">
                <div class="col-sm-6">
                  <label class="control-label">
                    {{ $t('menu.deployments.form.domain') }}:
                  </label>
                </div>
                <div class="col-sm-6">{{ service.domain }}</div>
              </div>
              <div class="row">
                <div class="col-sm-6">
                  <label class="control-label">
                    {{ $t('menu.deployments.form.servname') }}:
                  </label>
                </div>
                <div class="col-sm-6">{{ service.name }}</div>
              </div>
              <div class="row">
                <div class="col-sm-6">
                  <label class="control-label">
                    {{ $t('menu.deployments.form.version') }}:
                  </label>
                </div>
                <div class="col-sm-6">{{ service.version }}</div>
              </div>
              <div class="row">
                <div class="col-sm-3">
                  <label class="control-label">
                    {{ $t('menu.deployments.form.name') }}
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
                      :value="state.name"
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
              <div
                v-if="state.interconnection!=null"
                class="row"> 
                <div class="col-sm-9">
                  <label class="control-label">
                    {{ $t('menu.deployment.form.interconnection') }}
                  </label>
                </div>
                <div class="col-sm-3">
                  <input
                    :checked="state.interconnection"
                    disabled="true"
                    type="checkbox"
                    class="pull-right">
                </div>
              </div> 
              <br>
            </li>
            <li v-if="option.id == 'arrangements'">
              <rowlist
                :type="getSettings.listTypes.arrangement"
                :list="getArrangements"/>
            </li>
            <template v-for="(secondOpt, index) in option.enum">
              <li
                v-if="secondOpt.type=='link'"
                :key="index">
                <a
                  id="show-channels"
                  class="white--text"
                  @click="optLink(secondOpt.action)">
                  {{ $t(secondOpt.id) }}
                </a>
              </li>
              <li
                v-if="secondOpt.type=='other'"
                :key="index">
                <a
                  id="show-channels"
                  title="show channels"
                  alt="show channels">
                  {{ $t('menu.uielements.form.show_hide') }}
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
        :modal-prop="getSettings.modalProps.resources"
        modal-size="xs">
        <modalResources slot="body"/>
      </modal>
      <modal
        :modal-prop="getSettings.modalProps.parameters"
        modal-size="xs">
        <modalParameters slot="body"/>
      </modal>
      <modal
        :modal-prop="getSettings.modalProps.arrangement"
        modal-size="xs">
        <modalArrangement slot="body"/>
      </modal>
    </div>
  </div>
</template>
<script>
import ModalResources from "./_modal_resources.vue";
import ModalParameters from "./_modal_deploy_parameters.vue";
import ModalArrangements from "./_modal_arrangements.vue";
import RowList from "./helper_list.vue";
import Modal from "./helper_modal.vue";

export default {
  components: {
    modalResources: ModalResources,
    modalParameters: ModalParameters,
    modalArrangement: ModalArrangements,
    rowlist: RowList,
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

    getArrangements() {
      return this.$store.getters.getArrangements;
    },

    validation() {
      return this.$store.state.manifesteditor.deploymentState.validation;
    },

    service() {
      return this.$store.state.manifesteditor.deploymentState.service;
    },

    updater() {
      return this.$store.state.manifesteditor.deploymentState.updater;
    },

    state() {
      return this.$store.state.manifesteditor.deploymentState;
    }
  },
  methods: {
    downloadTemporalManifest() {
      this.$store.dispatch("downloadTemporalManifest");
    },
    cleanCurrent(payload) {
      this.$store.dispatch("cleanCurrent", payload);
    },

    updateServiceName(payload) {
      this.$store.dispatch("updateServiceName", payload);
    },

    updateDeployState(payload) {
      this.$store.dispatch("updateDeployState", payload);
    },

    resetService() {
      this.$store.dispatch("resetService");
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
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>