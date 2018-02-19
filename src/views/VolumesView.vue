<template>
  <v-card id="volumes-view">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Volumes</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Cancels the action -->
        <v-btn outline to="/addVolume">Add Volume</v-btn>

      </v-card-actions>

    </v-card-title>
    <v-container>
      <v-data-table v-bind:headers="headers" v-bind:items="volumes" hide-actions>
        <template slot="items" scope="props">
          <td class="text-xs-left">{{ props.item[4]? null : props.item[0] }}</td>
          <td class="text-xs-left">{{ props.item[4]? null : props.item[1] }}</td>
          <td class="text-xs-left">{{ props.item[4]? null : props.item[2] }}</td>
          <td class="text-xs-left">{{ props.item[4]? null : props.item[3] }}</td>
          <td class="text-xs-left">{{ props.item[4] }}</td>
          <td class="text-xs-left">{{  props.item[4]? itemUsage(props.item[0], props.item[4], props.item[7][0], props.item[5], props.item[6]) : null }}</td>
          <td class="text-xs-left">
            <router-link v-if="!props.item[4]" v-for="elem in props.item[7]" v-bind:key="elem"
              v-bind:to="deployment(elem)._path">
              {{ deployment(elem).name }}
            </router-link>
            <span v-else>
              {{ props.item[6] }}
            </span>
          </td>
          <td class="text-xs-left">
            <v-btn color="error" v-if="props.item[4] === null" icon v-on:click="showDialog(props.item._uri)">
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
            permanently delete the {{ selectedElement }} domain.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat @click.native="removeElement">Remove volume</v-btn>
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
import { Deployment, Volume } from "../store/stampstate/classes";

@VueClassComponent({
  name: "volumes-view"
})
export default class VolumesView extends Vue {
  headers: any[] = [
    {
      text: "URI",
      align: "center",
      sortable: false,
      value: "_uri"
    },
    {
      text: "Name",
      align: "center",
      sortable: false,
      value: "_name"
    },
    {
      text: "Filesystem",
      align: "center",
      sortable: false,
      value: "filesystem"
    },
    {
      text: "Size",
      align: "center",
      sortable: false,
      value: "size"
    },
    {
      text: "ItemId",
      align: "center",
      sortable: false,
      value: "itemId"
    },
    {
      text: "Usage",
      align: "center",
      sortable: false,
      value: "usage"
    },
    {
      text: "Used by",
      align: "center",
      sortable: false,
      value: "usedBy"
    }
  ];
  dialog: boolean = false;
  selectedElement: string = null;

  /**
   * Obtains the available volumes in the system.
   */
  get volumes(): [
    string, // uri
    string, // name
    Volume.FILESYSTEM, // filesystem
    number, // total size
    string, // item id
    string, // associated role
    string, // associated instance
    string[] // usedBy
  ][] {
    let res: [
      string, // uri
      string, // name
      Volume.FILESYSTEM, // filesystem
      number, // total size
      string, // item id
      string, // associated role
      string, // associated instance
      string[] // usedBy
    ][] = [];
    let volumes: { [volume: string]: Volume } = ((<SSGetters>this.$store
      .getters).volumes as any) as {
      [uri: string]: Volume;
    };

    for (let key in volumes) {
      res.push([
        volumes[key]._uri,
        volumes[key].name,
        volumes[key].filesystem,
        volumes[key].size,
        null,
        null,
        null,
        volumes[key].usedBy
      ]);

      for (let inst in volumes[key].items) {
        res.push([
          volumes[key]._uri,
          volumes[key].name,
          volumes[key].filesystem,
          volumes[key].size,
          volumes[key].items[inst].id,
          volumes[key].items[inst].associatedRole,
          volumes[key].items[inst].associatedInstance,
          volumes[key].usedBy
        ]);
      }
    }
    return res;
  }

  get deployment(): (stri: string) => Deployment {
    return (deploymentURI: string) => {
      return ((<SSGetters>this.$store.getters).deployment as any)(
        deploymentURI
      );
    };
  }

  get itemUsage() {
    return (
      urn: string,
      id: string,
      dep: string,
      role: string,
      inst: string
    ) => {
      let met = this.$store.getters.metrics(dep);
      let res = null;
      
      if(met.length > 0)
      res = met[met.length - 1].roles[role].instances[inst].volumes?met[met.length - 1].roles[role].instances[inst].volumes[id].usage: '-';

      return res;
    };
  }

  showDialog(elementURI: string): void {
    this.dialog = true;
    this.selectedElement = elementURI;
  }

  removeElement(): void {
    this.$store.dispatch("deleteElement", this.selectedElement);
    this.dialog = false;
  }
}
</script>