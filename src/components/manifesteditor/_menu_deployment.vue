<template>   
  <div class="navbar-default sidebar" role="navigation" :updater="updater">
    <div class="sidebar-nav navbar-collapse"  role="navigation">
      <ul class="nav in" id="side-menu">
        <li class="my-background" :ref="option.name" v-for="(option,ind) in menuOptions" v-bind:key="ind" :class="{active: option.name == active}" @click="updateActive(option.name, $event)" >
          <a @click="option.clear? cleanCurrent(option.target): null" :data-toggle="option.target ? 'modal':''" :data-target="option.target ? option.target : ''" class="menu-title activator white--text">
            <i v-bind:class="option.icon+' activator'"></i> {{ $t(option.name) }}
            <span  v-if="option.secondLevel  || option.id == 'deployment'" class="fa arrow activator"></span>
            <i v-if="option.add && active==option.name" v-bind:id="option.add.id" class="menuAddr fa fa-plus-square pull-right activator"  @click="openAdd(option.add.target, $event)"></i>
          </a>
          <span  v-if="option.add"  :ref="'simulate-'+option.add.target"  data-toggle="modal" v-bind:data-target="option.add.target"></span>
          <ul v-if="option.secondLevel" :id="option.name" class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;">         
            <li v-if="option.id == 'deployment' ">
              <div class="row">
                <div class="col-sm-6"><label class="control-label">{{$t('menu.deployments.form.domain')}}: </label></div>
                <div class="col-sm-6">{{service.domain}}</div>
              </div>
              <div class="row">
                <div class="col-sm-6"><label class="control-label">{{$t('menu.deployments.form.servname')}}: </label></div>
                <div class="col-sm-6">{{service.name}}</div>
              </div>
              <div class="row">
                <div class="col-sm-6"><label class="control-label">{{$t('menu.deployments.form.version')}}: </label></div>
                <div class="col-sm-6">{{service.version}}</div>
              </div>
              <div class="row">
                <div class="col-sm-3"><label class="control-label">{{$t('menu.deployments.form.name')}}</label></div>
                <div class="col-sm-9">
                  <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
                    <input class="form-control" @input="updateName('name')" ref="name" :value="state.name">
                    <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                    <span v-if="validation.name.err" class="help-block">{{$t('validation.'+validation.name.msg)}}</span>
                  </div>
                </div>
              </div> 
              <div class="row" v-if="state.interconnection!=null"> 
                <div class="col-sm-9"><label class="control-label">{{$t('menu.deployment.form.interconnection')}}</label></div>
                <div class="col-sm-3">
                  <input disabled="true" :checked="state.interconnection" type="checkbox" class="pull-right">
                </div>
              </div> 
              <br/>
            </li>
            <li v-if="option.id == 'arrangements'">
              <rowlist v-bind:list="getArrangements" v-bind:type="getSettings.listTypes.arrangement"> </rowlist>
            </li>
            <template v-for="(secondOpt, index) in option.enum">
              <li v-bind:key="index" v-if="secondOpt.type=='link'">
                <a class="white--text" id="show-channels" @click="optLink(secondOpt.action)">{{ $t(secondOpt.id) }}</a>
              </li>
              <li v-bind:key="index" v-if="secondOpt.type=='other'">
                <a id="show-channels" title="show channels" alt="show channels">{{ $t('menu.uielements.form.show_hide')}}</a>
              </li>
              <li v-bind:key="index">
                <a class="white--text" v-on:click="downloadTemporalManifest">Download Temporal Manifest</a>
              </li>
            </template>
          </ul>
        </li>
      </ul>
      <modal :modalProp="getSettings.modalProps.resources" modalSize="xs">
        <modalResources  slot="body"></modalResources>
      </modal>
      <modal :modalProp="getSettings.modalProps.parameters" modalSize="xs">
        <modalParameters  slot="body"></modalParameters>
      </modal>
      <modal :modalProp="getSettings.modalProps.arrangement" modalSize="xs">
        <modalArrangement slot="body"></modalArrangement>
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
  mounted() {
    console.debug("MENU deployment has been mounted");
    console.debug("Servicie", this.service);
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
      let manifesteditor = this.$store.state.manifesteditor;
      let deploymentState = manifesteditor.deploymentState;
      let service = deploymentState.service;
      console.debug("El valor de manifesteditor es ", manifesteditor);
      console.debug("El valor de deploymentState es ", deploymentState);
      console.debug("El valor de service es ", service);
      return service;
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
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>