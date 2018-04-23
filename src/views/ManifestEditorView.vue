<template>
  <div>
    <div class="notifier alertNoty">
      <notifier/>
    </div>
    <div id="container">
      <alertpan v-show="alertPan"/>
      <graph
        v-if="false" 
        @d3-event="listener"/>
      <appmenu v-if="currentManifest!=''">
        <menuservice 
          v-if="getManifest.type=='service'" 
          slot="menu"/>
        <menucomp
          v-if="getManifest.type=='component'"
          slot="menu"/>
        <menudep
          v-if="getManifest.type=='deployments'"
          slot="menu"/>
        <menures
          v-if="getManifest.type=='resource'"
          slot="menu"/>
        <menurun
          v-if="getManifest.type=='runtime'"
          slot="menu"/>
      </appmenu>
      <div
        v-if="currentManifest==''"
        id="manifesteditor"
        class="panel panel-default alertModal">
        <div class="panel-heading white--text">
          {{ $t('panel.selector.title') }}
        </div>
        <div class="panel-body">
          <div class="form-group">
            <label class="checkbox-inline">
              <input
                v-model="filterManifests"
                type="checkbox"
                value="service">
              {{ $t('panel.selector.options.services') }}
            </label>
            <label class="checkbox-inline">
              <input 
                v-model="filterManifests"
                type="checkbox" 
                value="component">
              {{ $t('panel.selector.options.components') }}
            </label>
            <label class="checkbox-inline">
              <input
                v-model="filterManifests"
                type="checkbox"
                value="deployments">
              {{ $t('panel.selector.options.deployments') }}
            </label>
            <label class="checkbox-inline">
              <input
                v-model="filterManifests"
                type="checkbox"
                value="resource">
              {{ $t('panel.selector.options.resources') }}
            </label>
            <label class="checkbox-inline">
              <input
                v-model="filterManifests"
                type="checkbox"
                value="runtime">
              {{ $t('panel.selector.options.runtimes') }}
            </label>
          </div>
          <v-select
            ref="select"
            :options="options"
            :value="selected"
            :on-change="setSelect"
            class="searchinput"/>
        </div>
        <div class="panel-footer">
          <button
            ref="btnaccept"
            :class="{
              btn:true,
              'btn-success':true,
              disabled:manifestList.length==0 || selectedManifest==null
            }"
            type="button"
            @click="selectModal">
            <i class="fa fa-check"/>
            {{ $t('panel.warning.buttons.accept') }}
          </button>
        </div>
      </div>
    </div>
  
    <maindep v-if="currentManifest!='' && getManifest.type=='deployments'"/>

    <footer
      v-if="currentManifest!=''" 
      id="footer">
      <div>
        <p class="footext">Manifest: {{ manifests[currentManifest]._urn }}</p>
      </div>
    </footer>
  </div>
</template>
<script>
/** MetisMenu */
require("/home/osmuogar/workspace/dashboard/static/css/metisMenu/" +
  "metisMenu.min.js");
/** Bootstrap */
require("/home/osmuogar/workspace/dashboard/static/css/bootstrap/js/" +
  "bootstrap.min.js");
/** D3 */
require("/home/osmuogar/workspace/dashboard/static/js/d3.v3.js");
/** FileSaver */
require("/home/osmuogar/workspace/dashboard/static/js/FileSaver.min.js");

import {
  Graph,
  Menu,
  RowList,
  AlertPanel,
  Collapsegrp,
  Notifier,
  MenuService,
  MenuComponent,
  MenuResource,
  MenuRuntime,
  MenuDeployment,
  MainDeployment,
  HelperAlertPanel
} from "../components";
import i18n from "../store/manifesteditor/i18n";
import vSelect from "vue-select";

export default {
  i18n: i18n,
  components: {
    alertpan: HelperAlertPanel,
    appmenu: Menu,
    graph: Graph,
    notifier: Notifier,
    menuservice: MenuService,
    menucomp: MenuComponent,
    menudep: MenuDeployment,
    menures: MenuResource,
    maindep: MainDeployment,
    menurun: MenuRuntime,
    "v-select": vSelect
  },
  data() {
    return {
      filterManifests: [
        "service",
        "component",
        "deployments",
        "resource",
        "runtime"
      ],
      selectedManifest: null,
      selected: null
    };
  },
  computed: {
    alertPan() {
      return this.$store.getters.alertPan;
    },

    getManifest() {
      return this.$store.getters.getManifest;
    },

    manifests() {
      return this.$store.getters.manifests;
    },

    currentManifest() {
      return this.$store.getters.currentManifest;
    },

    manifestList() {
      let res = [];
      let manifests = this.manifests;
      for (let i in manifests) {
        res.push(manifests[i]);
      }
      return res;
    },

    clearAllModals() {
      return this.$store.getters.clearModals;
    },

    options() {
      return this.manifestList.filter(x => {
        return this.filterManifests.indexOf(x.type) > -1;
      });
    }
  },
  mounted() {
    console.debug("Manifest Editor has been mounted");
    this.clear();
  },
  methods: {
    clear() {
      if (this.clearAllModals) {
        console.debug("Clear method is called");
        $(".modal").modal("hide");
      }
      this.clearModals(false);
    },

    listener(data) {},

    setManifest(manifest) {
      this.$store.dispatch("setManifest", manifest);
    },

    clearModals(modals) {
      this.$store.dispatch("clearModals", modals);
    },

    selectModal() {
      if (this.manifestList.length > 0 && this.selectedManifest != null) {
        this.setManifest(this.selectedManifest);
      }
    },
    setSelect(val) {
      if (val) {
        this.selectedManifest = val._urn;
        this.$refs.btnaccept.focus();
      } else {
        this.selectedManifest = null;
      }
    }
  }
};
</script>
<!--
  There is a bug in which relative css paths are not correctly solved:
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style src="/home/osmuogar/workspace/dashboard/static/css/font-awesome/css/font-awesome.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>
<style scoped>
.panel,
.panel-default,
.panel-footer,
.panel-heading {
  background-color: #424242 !important;
  border-color: #424242 !important;
}
#manifesteditor {
  position: inherit !important;
}
</style>
<style>
.clear {
  bottom: 0px !important;
  top: 7px;
}

#control {
  background-color: #424242 !important;
  border-color: #424242 !important;
  max-height: 840px;
}

#footer {
  overflow: hidden !important;
}

.my-background {
  background-color: #424242 !important;
  border-color: #424242 !important;
}

.searchinput {
  background-color: #fdfdfd;
}
</style>