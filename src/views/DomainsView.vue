<template>
  <v-card style="max-width:1300px">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Domains</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Upload bundle button -->
        <v-btn outline class="elevation-0" to="/adddomain">
          <span>Add domain</span>
          <v-icon right>domain</v-icon>
        </v-btn>
        
      </v-card-actions>
    </v-card-title>

    <!-- Divides different sections of the view -->
    <v-divider></v-divider>

    <v-container fluid>
    <v-data-table
      v-bind:headers="headers"
      v-bind:items="domains"
      hide-actions>
      <template slot="items" scope="props">
        <td class="text-xs-left">{{ props.item.url }}</td>
        <td class="text-xs-left">{{ props.item.state }}</td>
        <td class="text-xs-left">
          <div v-for="(elem, index) in props.item.usedBy" v-bind:key="index">
            
            <router-link :to="deployment(elem)._path">
            {{ deployment(elem).name }}
            </router-link>

          </div>
        </td>
        <td class="text-xs-left">
          <v-btn v-bind:disabled="props.item.usedBy.length>0" icon v-on:click="showDialog(props.item._urn)">
            <v-tooltip right>

              <v-icon id="delete_icon" slot="activator">delete</v-icon>
              <span>delete</span>

            </v-tooltip>
          </v-btn>
        </td>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="headline">Delete domain?</v-card-title>
        <v-card-text>
          This action <strong>CANNOT BE UNDONE</strong> and will
          permanently delete the {{ selectedDomain }} volume.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click.native="deleteDomain">Delete domain</v-btn>
          <v-btn color="green darken-1" flat @click.native="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import SSGetters from "../store/stampstate/getters";

import {
  Deployment,
  Domain,
  HTTPEntryPoint
} from "../store/stampstate/classes";

@VueClassComponent({
  name: "domains-view",
  components: {}
})
export default class DomainsView extends Vue {
  dialog: boolean = false;
  selectedDomain: string = null;

  // Modal Arguments
  deleteModalIsVisible: boolean = false;
  modalElementId: string = "";
  modalElementName: string = "";

  headers: any[] = [
    {
      text: "URL",
      align: "left",
      sortable: false,
      value: "domain"
    },
    {
      text: "State",
      align: "left",
      sortable: false,
      value: "state"
    },
    {
      text: "Used by",
      align: "left",
      sortable: false,
      value: "usedBy"
    }
  ];

  get domains(): Domain[] {
    let domains: Domain[] = [];
    for (let domainURN in this.$store.getters.domains) {
      if (this.$store.getters.domains[domainURN]) {
        domains.push(this.$store.getters.domains[domainURN]);
      } else {
        this.$store.dispatch("getElementInfo", domainURN);
      }
    }
    return domains;
  }

  get deployment(): (stri: string) => HTTPEntryPoint {
    return (deploymentURN: string) => {
      return (<SSGetters>this.$store.getters).deployments[deploymentURN];
    };
  }

  get hasCertificate() {
    return (deployment: Deployment) => {
      return deployment.resources["server_cert"] ? true : false;
    };
  }

  showDialog(domainURN): void {
    this.dialog = true;
    this.selectedDomain = domainURN;
  }

  deleteDomain(): void {
    this.$store.dispatch("deleteElement", this.selectedDomain);
    this.dialog = false;
  }
}
</script>
<style lang="scss" scoped>
$color_unkown: #bdbdbd;
$color_error: #ff5252;
$color_info: #2196f3;
$color_success: #4caf50;
$color_warning: #ffc107;

%icon_size {
  font-size: 35px;
}

.play {
  @extend %icon_size;
  color: $color_success;  
}

.info {
  @extend %icon_size;
  color: $color_info;  
}

.delete{
  @extend %icon_size;
  color: $color_error;
}

#info_icon{
  @extend .info;
}

#play_icon{
  @extend .play;
}

#delete_icon{
  @extend .delete;
}

.corporative_background {
  background: #d1406b;
}

#info_link {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
  text-decoration: none;
}

#sanity_icon {
  position: absolute;
  top: 60px;
  right: 10px;
}
</style>