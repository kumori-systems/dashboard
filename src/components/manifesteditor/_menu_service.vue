<template>
  <div class="sidebar-nav navbar-collapse">
    <ul class="nav in" id="side-menu">
      <li v-for="(option, index) in menuOptions"  v-bind:key="index" :class="{active: option.name == active}" :ref="option.name" @click="updateActive(option.name, $event)" >
        <a @click="option.clear? cleanCurrent(option.target): null" :data-toggle="option.target ? 'modal':''" :data-target="option.target ? option.target : ''" class="menu-title activator">
          <i v-bind:class="option.icon + ' activator'"></i>{{ $t(option.name) }}
          <span v-if="option.secondLevel || option.id == 'service'" class="fa arrow activator"></span>
          <i v-if="option.add && active == option.name" v-bind:id="option.add.id" class="menuAddr fa fa-plus-square pull-right activator" @click="openAdd(option.add.target, $event)"></i>
        </a>
        <span v-if="option.add" :ref="'simulate-' + option.add.target" data-toggle="modal" v-bind:data-target="option.add.target"></span>
        <ul v-if="option.secondLevel || option.id == 'service' " :id="option.name" class="nav nav-second-level collapse" aria-expanded="false" style="height: 0px;">
          <li v-if="option.id == 'service'">
            <div class="row">
              <div class="col-sm-3"><label class="control-label">{{$t('menu.service.form.domain')}}</label></div>
              <div class="col-sm-9">
                <div :class="{'form-group':true, 'has-error':validation.domain.err, 'has-feedback':validation.domain.err}">
                  <input :disabled="blockEditName" class="form-control" @input="updateName('domain')" ref="domain" :value="servName.domain">
                  <span v-if="validation.domain.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                  <span v-if="validation.domain.err" class="help-block">{{$t('validation.'+validation.domain.msg)}}</span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-3"><label class="control-label">{{$t('menu.service.form.name')}}</label></div>
              <div class="col-sm-9">
                <div :class="{'form-group':true, 'has-error':validation.name.err, 'has-feedback':validation.name.err}">
                  <input :disabled="blockEditName" class="form-control" @input="updateName('name')" ref="name" :value="servName.name">
                  <span v-if="validation.name.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                  <span v-if="validation.name.err" class="help-block">{{$t('validation.'+validation.name.msg)}}</span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-3"><label class="control-label">{{$t('menu.service.form.version')}}</label></div>
              <div class="col-sm-9">
                <div :class="{'form-group':true, 'has-error':validation.version.err, 'has-feedback':validation.version.err}">
                  <input :disabled="blockEditName" class="form-control" @input="updateName('version')" ref="version" :value="servName.version">
                  <span v-if="validation.version.err" class="glyphicon glyphicon-remove form-control-feedback"></span>
                  <span v-if="validation.version.err" class="help-block">{{$t('validation.'+validation.version.msg)}}</span>
                </div>
              </div>
            </div>
          </li>
          <li v-if="option.id == 'roles'">
            <rowlist v-bind:list="getManifest.roles" v-bind:type="getSettings.listTypes.role"> </rowlist>
          </li>
          <li v-if="option.id == 'channels'">
            <rowlist v-bind:list="getChannels.provides" v-bind:type="getSettings.listTypes.channel.provides"></rowlist>
            <rowlist v-bind:list="getChannels.requires" v-bind:type="getSettings.listTypes.channel.requires"></rowlist>
          </li>
          <li v-for="(secondOpt, indx) in option.enum" v-bind:key="indx">
            <template v-if="secondOpt.type=='link'">
              <a id="show-channels" @click="optLink(secondOpt.action)" >{{ $t(secondOpt.id) }}</a>
            </template>
            <template v-if="secondOpt.type=='other'">
              <a id="show-channels" href="#" title="show channels" alt="show channels">{{ $t('menu.uielements.form.show_hide')}}</a>
            </template>
          </li>
        </ul>
      </li>
    </ul>
    <modal :modalProp="getSettings.modalProps.roles" modalSize="xs">
      <modalRoles slot="body"></modalRoles>
    </modal>
    <modal :modalProp="getSettings.modalProps.channels" modalSize="xs">
      <modalChannels slot="body"></modalChannels>
    </modal>
    <modal :modalProp="getSettings.modalProps.connectors" modalSize="xl">
      <modalConnectors slot="body"></modalConnectors>
    </modal>
  </div>
</template>
<script>
import ModalRoles from "./_modal_roles.vue";
import ModalChannels from "./_modal_channels.vue";
import ModalConnectors from "./_modal_connectors.vue";
import RowList from "./helper_list.vue";
import Modal from "./helper_modal.vue";

export default {
  components: {
    modalRoles: ModalRoles,
    modalChannels: ModalChannels,
    modalConnectors: ModalConnectors,
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
  mounted() {
    console.debug("Se monta un servicio");
    require("../../../static/css/dist/js/sb-admin-2");
    console.debug("Se ha llamado lo que toca");
  },
  computed: {
    getManifest() {
      return this.$store.getters.getManifest;
    },
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
    blockEditName() {
      return this.$store.getters.blockEditName;
    },
    validation() {
      return this.$store.getters.validation;
    },
    servName() {
      return this.$store.getters.servName;
    },
    updater() {
      return this.$store.getters.updater;
    }
  },
  methods: {
    cleanCurrent(payload) {
      this.$store.dispatch("cleanCurrent", payload);
    },

    updateServiceName(payload) {
      this.$store.dispatch("updateServiceName", payload);
    },

    updateServState(payload) {
      this.$store.dispatch("updateServState", payload);
    },

    resetService(payload) {
      this.$store.dispatch("resetService", payload);
    },

    optLink(action) {
      this[action]();
    },

    updateName(prop) {
      this.$refs.version[0].value.replace("/", "");
      this.$refs.domain[0].value.replace("/", "");
      this.$refs.name[0].value = this.$refs.name[0].value.replace("/", "");

      this.updateServState({ key: prop, value: this.$refs[prop][0].value });
      let fullName = {
        domain: this.$refs.domain[0].value,
        name: this.$refs.name[0].value,
        version: this.$refs.version[0].value
      };
      this.updateServiceName(fullName);
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
      console.debug("Se llama a active list con ", name, event);
      console.debug("this.active contiene", this.active);

      let nameFilter = name.replace(/(:|\.|\[|\])/g, "\\$1");
      let activeFilter = this.active.replace(/(:|\.|\[|\])/g, "\\$1");

      // Si el elemento es un activador y tienen el nombre que buscamos
      if (
        event.target.classList.contains("activator") &&
        this.active === name
      ) {
        $("#" + nameFilter).collapse("hide");
        this.active = "";
      } else if (this.active !== name) {
        if (this.active.length > 0) {
          $("#" + activeFilter).collapse("hide");
        }
        this.active = name;

        console.debug("Active contains", this.active);
        let filter = "#" + nameFilter;
        console.debug("Filter contains", filter);
        let item = $(filter);
        // let item=$("#menu\\.service\\.label");
        console.debug("item contains", item);
        item.collapse("show");
      }
    }
  }
};
</script>