<template>
  <div>
    <div class="notifier alertNoty">
      <notifier></notifier>
    </div>
    <div id="container">
      <alertpan  v-show="alertPan"></alertpan>
      <graph v-if="false" @d3-event="listener"></graph>
      <appmenu v-if="currentManifest!=''">
        <menuservice v-if="getManifest.type=='service'" slot="menu"></menuservice>
        <menucomp v-if="getManifest.type=='component'" slot="menu"></menucomp>
        <menudep v-if="getManifest.type=='deployment'" slot="menu"></menudep>
        <menures v-if="getManifest.type=='resource'" slot="menu"></menures>
        <menurun v-if="getManifest.type=='runtime'" slot="menu"></menurun>
      </appmenu>
      <div v-if="currentManifest==''" id="manifesteditor" class="panel panel-default alertModal">
        <div class="panel-heading white--text">{{$t('panel.selector.title')}}</div>
        <div class="panel-body">
          <div class="form-group">
            <label class="checkbox-inline">
              <input type="checkbox" value="service" v-model="filterManifests">
              {{ $t('panel.selector.options.services') }}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox"  value="component"  v-model="filterManifests">{{$t('panel.selector.options.components')}}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox"  value="deployment"  v-model="filterManifests">{{$t('panel.selector.options.deployments')}}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox"  value="resource"  v-model="filterManifests">{{$t('panel.selector.options.resources')}}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox"  value="runtime"  v-model="filterManifests">{{$t('panel.selector.options.runtimes')}}
            </label>
          </div>
          <v-select id="maininput" :value="selected" :on-change="setSelect" :options="options" ref="select"></v-select>
        </div>
        <div class="panel-footer">
          <button  type="button" @click="selectModal" ref="btnaccept" :class="{btn:true, 'btn-success':true, disabled:manifestList.length==0 || selectedManifest==null}">  <i class="fa fa-check"></i> {{$t('panel.warning.buttons.accept')}}</button>
        </div>
      </div>
    </div>
    <maindep v-if=" currentManifest!='' && getManifest.type=='deployment'">{{setDeployCharts()}}</maindep>
    <footer v-if="currentManifest!=''" id="footer">
      <div>
        <p class="footext">Manifest: {{manifests[currentManifest].name}} &nbsp;&nbsp;|&nbsp;&nbsp; Path: {{manifests[currentManifest].filePath}}</p>
      </div>
    </footer>
  </div>
</template>
<script>
/** MetisMenu */
require("/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.js");
/** Bootstrap */
require("/home/osmuogar/workspace/dashboard/static/css/bootstrap/js/bootstrap.min.js");
/** D3 */
require("/home/osmuogar/workspace/dashboard/static/js/d3.v3.js");
/** FileSaver */
require("/home/osmuogar/workspace/dashboard/static/js/FileSaver.min.js");

import {
  Graph,
  Menu,
  RowList,
  RGridForm,
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
  mounted() {
    console.debug("Manifest Editor has been mounted");
    this.clear();
  },
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
        "deployment",
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

    setDeployCharts() {
      this.$store.dispatch("setDeployCharts");
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
      this.selectedManifest = val._urn;
      this.$refs.btnaccept.focus();
    }
  }
};
</script>
<!-- Bootstrap -->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>

<!-- MetisMenu CSS -->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>

<!-- Custom CSS -->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>

<!-- Custom Fonts -->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/font-awesome/css/font-awesome.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>
<style scoped>
.panel,
.panel-default,
.panel-footer,
.panel-heading {
  background-color: #303030 !important;
  border-color: #303030 !important;
}
#manifesteditor{
  position:inherit !important;
}
#maininput{
  background-color:#fdfdfd;
}
</style>
<style>
.clear{
  bottom: 0px !important;
  top: 7px;
}
</style>