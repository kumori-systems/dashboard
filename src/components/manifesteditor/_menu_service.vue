<template>
  <div class="sidebar-nav navbar-collapse">
    <ul
      id="side-menu"
      class="nav in">
      <li
        v-for="(option, index) in menuOptions"
        :key="index"
        :class="{active: option.name == active}"
        :ref="option.name"
        @click="updateActive(option.name, $event)" >
        <a
          :data-toggle="option.target ? 'modal':''"
          :data-target="option.target ? option.target : ''"
          class="menu-title activator subheading white--text"
          @click="option.clear? cleanCurrent(option.target): null">
          <v-icon class="activator">{{ option.icon }}</v-icon>
          {{ $t(option.name) }}
          <span
            v-if="option.secondLevel || option.id == 'service'"
            class="fa arrow activator"/>
          <i
            v-if="option.add && active == option.name"
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
          v-if="option.secondLevel || option.id == 'service'"
          :id="option.name"
          class="nav nav-second-level collapse"
          aria-expanded="false"
          style="height: 0px;">
          <li v-if="option.id === 'service'">
            <div class="row">
              <div class="col-sm-3">
                <label class="control-label">
                  {{ $t('menu.service.form.domain') }}
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
                    :value="servName.domain"
                    class="form-control"
                    @input="updateName('domain')"
                  >
                  <span
                    v-if="validation.domain.err"
                    class="glyphicon glyphicon-remove form-control-feedback"/>
                  <span
                    v-if="validation.domain.err"
                    class="help-block">
                    {{ $t('validation.' + validation.domain.msg) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-3">
                <label class="control-label">
                  {{ $t('menu.service.form.name') }}
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
                    :value="servName.name"
                    :disabled="blockEditName"
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
                  {{ $t('menu.service.form.version') }}
                </label>
              </div>
              <div class="col-sm-9">
                <div
                  :class="{
                    'form-group':true, 'has-error':validation.version.err,
                    'has-feedback':validation.version.err
                  }"
                >
                  <input
                    ref="version"
                    :value="servName.version"
                    :disabled="blockEditName"
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
          <li v-if="option.id == 'roles'">
            <rowlist
              :list="getManifest.roles"
              :type="getSettings.listTypes.role"/>
          </li>
          <li v-if="option.id == 'channels'">
            <rowlist
              :list="getChannels.provides"
              :type="getSettings.listTypes.channel.provides"/>
            <rowlist
              :list="getChannels.requires"
              :type="getSettings.listTypes.channel.requires"/>
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
      :modal-prop="getSettings.modalProps.roles"
      modal-size="xs">
      <modalRoles slot="body"/>
    </modal>
    <modal
      :modal-prop="getSettings.modalProps.channels"
      modal-size="xs">
      <modalChannels slot="body"/>
    </modal>
    <modal
      :modal-prop="getSettings.modalProps.connectors"
      modal-size="xl">
      <modalConnectors slot="body"/>
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
    downloadTemporalManifest() {
      this.$store.dispatch("downloadTemporalManifest");
    },

    cleanCurrent(payload) {
      this.$store.dispatch("cleanCurrent", payload);
    },

    updateServiceName(payload) {
      this.$store.dispatch("updateServiceName", payload);
    },

    updateServState(payload) {
      this.$store.dispatch("updateServState", payload);
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

    resetService() {
      this.$store.dispatch("resetService");
    },

    activeList(name, event) {

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
        let filter = "#" + nameFilter;
        let item = $(filter);
        // let item=$("#menu\\.service\\.label");
        item.collapse("show");
      }

    }
  }
};
</script>
<style scoped>
ul {
  list-style-type: none;
  padding-left: 0px;
}
a {
  text-decoration-color: white !important;
  color: white !important;
}
</style>
<!--
  There is a bug in which relative css paths are not correctly solved
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>