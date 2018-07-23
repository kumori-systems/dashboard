<!--
  This represents the domain views
-->
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

    <v-container>
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
          <v-btn color="error" v-bind:disabled="props.item.usedBy.length>0" icon v-on:click="showDialog(props.item._urn)">
            <v-icon class="white--text">delete_forever</v-icon>
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

/*
  This is a decorator and it's used because typescript doesn't implement all
  required properties of a vue component.

  All properties of the typescript class will be compiled as vue data.
  All methods inside the class will be compiled as computed properties (get, set
  methods)
  or common methods (non-get, non-set).
  There are special methods like mounted, created or destroy which are part of
  the vue lifecycle and will be rendered as special lifecycle methods.
*/
@VueClassComponent({
  name: "domains-view",
  components: {}
})
export default class DomainsView extends Vue {
  
  /** Shows the  delete domain dialog. */
  dialog: boolean = false;

  /** Stores the selected domain for the dialog. */
  selectedDomain: string = null;

  /** Stores if the delete modal dialog should be visible. */
  deleteModalIsVisible: boolean = false;

  /** Stores the element id */
  modalElementId: string = "";

  /** Stores the element name. */
  modalElementName: string = "";

  /** Headers for the data table. */
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

  /** Returns domains stored in the storage. */
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

  /** Returns deployments stored in the storage. */
  get deployment(): (stri: string) => HTTPEntryPoint {
    return (deploymentURN: string) => {
      return (<SSGetters>this.$store.getters).deployments[deploymentURN];
    };
  }

  /** Returns if a deployment has a certificate. */
  get hasCertificate() {
    return (deployment: Deployment) => {
      return deployment.resources["server_cert"] ? true : false;
    };
  }

  /** Shows the delete domain dialog. */
  showDialog(domainURN): void {
    this.dialog = true;
    this.selectedDomain = domainURN;
  }

  /** Confirms the deletion of a domain. */
  deleteDomain(): void {
    this.$store.dispatch("deleteElement", this.selectedDomain);
    this.dialog = false;
  }
}
</script>
<style lang="scss" scoped>
$color_green: #93c47d;
$color_yellow: #f5d164;
$color_red: #ff6666;
$icon_size: 20px;

.fa-check-circle {
  color: $color_green;
  font-size: $icon_size;
}

.fa-exclamation-triangle {
  color: $color_yellow;
  font-size: $icon_size;
}

.fa-exclamation-circle {
  color: $color_red;
  font-size: $icon_size;
}
</style>