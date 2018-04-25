<template>
  <div
    :updater="updater"
    class="my-background modal-content content xs"
    heith="100">
    <div class="modal-header">
      <button
        type="button"
        data-dismiss="modal"
        class="close">
        &times;
      </button>
      <h4 class="modal-title">
        <i :class="modalProp.icon"/> {{ modalProp.title }}
      </h4>
    </div>
    <div class="modal-body">
      <div>

        <!-- Nav tabs -->
        <ul class="nav nav-tabs">
          <li
            v-if="channel.index === -1 ||
              (channel.index >= 0 && channel.inout === 'provides')" 
            :class="{ active: channel.inout === 'provides' }"
            @click="changeDir('provides')">
            <a
              :class="{active: 'black--text'}"
              data-toggle="tab"
              aria-expanded="true">
              {{ $t('modals.channels.labels.prov') }}
            </a>
          </li>
          <li
            v-if="channel.index === -1 ||
              (channel.index >= 0 && channel.inout === 'requires')"
            :class="{active: channel.inout=='requires'}"
            @click="changeDir('requires')">
            <a
              data-toggle="tab"
              aria-expanded="false">
              {{ $t('modals.channels.labels.req') }}
            </a>
          </li>
        </ul>

        <!-- Tab panes -->
        <br/>
        <div class="tab-content">
          <div
            id="tab" 
            class="tab-pane fade active in">
            <div class="row">
              <div class="col-sm-3">
                <label>
                  {{ $t('modals.channels.labels.name') }}
                </label>
              </div>
              <div class="col-sm-9">
                <div
                  :class="{
                    'form-group': true, 'has-error': validation.name.err,
                    'has-feedback': validation.name.err
                  }"
                >
                  <input
                    ref="name"
                    :value="channel.data.name"
                    class="form-control"
                    @input="updateName()">
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
                <label>
                  {{ $t('modals.channels.labels.type') }}
                </label>
              </div>
              <div class="col-sm-9">
                <div
                  :class="{
                    'form-group': true, 'has-error': validation.type.err,
                    'has-feedback': validation.type.err
                  }"
                >
                  <select
                    id="componentsList"
                    ref="type"
                    :value="getType(channel.data.type)"
                    class="form-control"
                    @change="updateType()">
                    <option
                      v-for="(chType, i) in getChannelTypes(channel.inout)"
                      :key="i"
                      :value="chType.eslap"
                      :selected="chType.eslap === getType(channel.data.type)">
                      {{ chType.name }}
                    </option>
                  </select>
                  <span
                    v-if="validation.type.err"
                    class="glyphicon glyphicon-remove form-control-feedback"/>
                  <span
                    v-if="validation.type.err"
                    class="help-block">
                    {{ $t('validation.' + validation.type.msg) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-3">
                <label>
                  {{ $t('modals.channels.labels.proto') }}
                </label>
              </div>
              <div class="col-sm-9">
                <div
                  :class="{'form-group':true,
                    'has-error':validation.protocol.err,
                    'has-feedback':validation.protocol.err
                  }"
                >
                  <select
                    id="componentsList"
                    ref="protocol"
                    :value="getProtocol(channel.data.protocol)"
                    class="form-control black--text"
                    @change="updateProtocol()">
                    <option
                      v-for="(chProt, i) in getSettings.manifestStructure.elementtype.protocol.enum"
                      :key="i"
                      :value="chProt.eslap">
                      {{ chProt.name }}
                    </option>
                  </select>
                  <span
                    v-if="validation.protocol.err"
                    class="glyphicon glyphicon-remove form-control-feedback"/>
                  <span
                    v-if="validation.protocol.err"
                    class="help-block">
                    {{ $t('validation.' + validation.protocol.msg) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        v-if="channel.index === -1"
        @click="createChannel()"
        type="button"
        class="btn btn-primary"
        slot="add">
        <i class="fa fa-plus"/> {{ $t('panel.buttons.add') }}
      </button>
      <button
        type="button"
        data-dismiss="modal"
        class="white--text btn btn-default">
        <i class="fa fa-times"/> {{ $t('panel.buttons.close') }}
      </button>
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

    channel() {
      return this.$store.state.manifesteditor.channelState.channel;
    },

    validation() {
      return this.$store.state.manifesteditor.channelState.validation;
    },

    updater() {
      return this.$store.state.manifesteditor.channelState.updater;
    },

    modalProp() {
      return this.getSettings.modalProps.channels;
    }
  },
  methods: {
    setChannelDirect(payload) {
      this.$store.dispatch("setChannelDirect", payload);
    },

    updateCurrentChannel(payload) {
      this.$store.dispatch("updateCurrentChannel", payload);
    },

    addChannel(payload) {
      this.$store.dispatch("addChannel", payload);
    },

    updateChannState(payload) {
      this.$store.dispatch("updateChannState", payload);
    },

    getType(eslap) {
      let hasChannel = this.getSettings.manifestStructure.elementtype.channel.enum.filter(
        elem => {
          return elem.eslap === eslap;
        }
      );
      return hasChannel.length > 0 ? hasChannel[0].eslap : "";
    },

    getProtocol(eslap) {
      let hasProtocol = this.getSettings.manifestStructure.elementtype.protocol.enum.filter(
        elem => {
          return elem.eslap === eslap;
        }
      );
      return hasProtocol.length > 0 ? hasProtocol[0].eslap : "";
    },

    getChannelTypes(inout) {
      let negateDir = inout === "provides" ? "requires" : "provides";
      return this.getSettings.manifestStructure.elementtype.channel.enum.filter(
        elem => {
          return elem.type != negateDir;
        }
      );
    },

    updateName() {
      this.updateChannState({ key: "name", value: this.$refs.name.value });
      if (this.channel.index > -1) this.updateChannel();
    },

    updateType() {
      this.updateChannState({ key: "type", value: this.$refs.type.value });
      if (!this.updateTypeOpts) {
        if (this.channel.index > -1) {
          this.updateChannel();
        }
      }
      this.updateTypeOpts = false;
    },

    updateProtocol() {
      this.updateChannState({
        key: "protocol",
        value: this.$refs.protocol.value
      });
      if (this.channel.index > -1) {
        this.updateChannel();
      }
    },

    updateChannel() {
      this.updateCurrentChannel({
        inout: this.channel.inout,
        index: this.channel.index,
        data: {
          name: this.$refs.name.value,
          type: this.$refs.type.value,
          protocol: this.$refs.protocol.value
        }
      });
    },

    createChannel() {
      this.addChannel({
        inout: this.channel.inout,
        data: {
          name: this.$refs.name.value,
          type: this.$refs.type.value,
          protocol: this.$refs.protocol.value
        }
      });
    },

    changeDir(dir) {
      this.setChannelDirect(dir);
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
<style scoped>
a {
  color: white;
}
</style>