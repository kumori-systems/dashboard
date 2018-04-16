<template>
  <div>
    <div v-for="(elem, index) in list" v-bind:key="index" class="my-background"
      v-bind:class="{row: true, 'bg-info': index%2==0 && getCurrent(type)!=elem.id, 'bg-success': getCurrent(type)==elem.id}" 
      @click="Settings.listProps[type].rowSelection ? setDef(elem.id,type,$event) : null ">
      <div v-if="Settings.listProps[type].icon"  class="" v-bind:class="{'col-sm-2': true, listElem: true}">
        <i class="my-background" :class ="'ico-private blue fa '+Settings.listProps[type].iconImg"></i>
      </div>
      <div :class="'col-sm-'+Settings.listProps[type].fullSize+ ' listElem'"><div v-html="getName(elem, type)"></div></div>
      <div v-if="Settings.listProps[type].extraCol" :class="'col-sm-'+Settings.listProps[type].extraCol+ ' listElem'"><div v-html="getExtra(elem, type)"></div></div>
      <div :class="'col-sm-'+Settings.listProps[type].btnsSize+ ' listElem'">
        <div class="action-btn">
          <i v-if="Settings.listProps[type].buttons.edit" class="my-background btn-private yellow fa fa-pencil-square" @click="setDef(index,type)" data-toggle="modal" v-bind:data-target="Settings.listProps[type].target" ></i>
          <i v-if="Settings.listProps[type].buttons.delete" class ="my-background btn-private red fa fa-minus-square" @click="deleteDef(index,type)"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import { mapState } from "vuex";

export default {
  props: ["list", "type"],
  data() {
    return {
      data: {}
    };
  },
  computed: {
    getCurrentConnector() {
      return this.$store.getters.getCurrentConnector;
    },
    getSettings() {
      return this.$store.getters.getSettings;
    },
    getCurrentDeployParam() {
      return this.$store.getters.getCurrentDeployParam;
    },
    Settings() {
      return this.$store.state.manifesteditor.Settings;
    }
  },
  methods: {
    setRole(payload) {
      return this.$store.dispatch("setRole", payload);
    },

    deleteRole(payload) {
      return this.$store.dispatch("deleteRole", payload);
    },

    setChannel(payload) {
      return this.$store.dispatch("setChannel", payload);
    },

    deleteChannel(payload) {
      return this.$store.dispatch("deleteChannel", payload);
    },

    setConnector(payload) {
      return this.$store.dispatch("setConnector", payload);
    },

    deleteConnector(payload) {
      return this.$store.dispatch("deleteConnector", payload);
    },

    deleteConnList(payload) {
      return this.$store.dispatch("deleteConnList", payload);
    },

    deleteComponentResource(payload) {
      return this.$store.dispatch("deleteComponentResource", payload);
    },

    deleteComponentParameter(payload) {
      return this.$store.dispatch("deleteComponentParameter", payload);
    },

    setArrangement(payload) {
      return this.$store.dispatch("setArrangement", payload);
    },

    setCurrentDeployParam(payload) {
      return this.$store.dispatch("setCurrentDeployParam", payload);
    },

    selectRow(index) {
      this.data.selectedRow = index;
    },

    getCurrent(type) {
      switch (type) {
        case this.Settings.listTypes.deployment.parameters:
          return this.getCurrentDeployParam;
        case this.Settings.listTypes.connector:
          return this.getCurrentConnector;

        default:
          return -1;
      }
    },

    getName(elem, type) {
      switch (type) {
        case this.Settings.listTypes.role:
          return "<label>" + elem.name + "</label>";

        case this.Settings.listTypes.connectorList.provided:
          return "<label>" + elem.name[0] + "</label>:" + elem.name[1];
          break;
        case this.Settings.listTypes.connectorList.depended:
          return "<label>" + elem.name[0] + "</label>:" + elem.name[1];
          break;

        default:
          return "<label>" + elem.name + "</label>";
      }
    },

    getExtra(elem, type) {
      switch (type) {
        case this.Settings.listTypes.component.resources:
          return "<label>" + elem.type + "</label>";
          break;
        case this.Settings.listTypes.component.parameters:
          return "<label>" + elem.type + "</label>";
          break;
        default:
          return "";
      }
    },

    setDef(index, type, event) {
      if (event === undefined || event.target.tagName != "I")
        switch (type) {
          case this.Settings.listTypes.role:
            this.setRole(index);
            break;
          case this.Settings.listTypes.channel.provides:
            this.setChannel({
              index: index,
              inout: this.Settings.listProps[type].channelType
            });
            break;
          case this.Settings.listTypes.channel.requires:
            this.setChannel({
              index: index,
              inout: this.Settings.listProps[type].channelType
            });
            break;
          case this.Settings.listTypes.connector:
            this.setConnector(index);
            break;
          case this.Settings.listTypes.arrangement:
            this.setArrangement(this.list[index].name);
            break;
          case this.Settings.listTypes.deployment.parameters:
            this.setCurrentDeployParam(index);
            break;
          default:
            break;
        }
    },

    deleteDef(index, type) {
      switch (type) {
        case this.Settings.listTypes.role:
          this.deleteRole(index);
          break;
        case this.Settings.listTypes.channel.provides:
          this.deleteChannel({
            index: index,
            inout: this.Settings.listProps[type].channelType
          });
          break;
        case this.Settings.listTypes.channel.requires:
          this.deleteChannel({
            index: index,
            inout: this.Settings.listProps[type].channelType
          });
          break;
        case this.Settings.listTypes.channel.requires:
          this.deleteChannel({
            index: index,
            inout: this.Settings.listProps[type].channelType
          });
          break;
        case this.Settings.listTypes.connector:
          this.deleteConnector(index);
          break;
        case this.Settings.listTypes.connectorList:
          this.deleteConnectorElement(index);
          break;
        case this.Settings.listTypes.connectorList.depended:
          this.deleteConnList({ index: index, type: type });
          break;
        case this.Settings.listTypes.connectorList.provided:
          this.deleteConnList({ index: index, type: type });
          break;
        case this.Settings.listTypes.component.resources:
          this.deleteComponentResource({ index: index });
          break;
        case this.Settings.listTypes.component.parameters:
          this.deleteComponentParameter({ index: index });
          break;
        default:
          break;
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