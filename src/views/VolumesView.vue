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


          <td class="text-xs-left">
            <v-icon v-if="props.item[0]" class="indigo--text">storage</v-icon>
            <v-icon v-else class="light-blue--text text--lighten-2">storage</v-icon>
          </td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[1] }}</td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[2] }}</td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[3] }}</td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[4] }}</td>
          <td class="text-xs-left">{{ props.item[5] }}</td>
          <td class="text-xs-left">{{ props.item[5]? itemUsage(props.item[1], props.item[5], props.item[8][0], props.item[6], props.item[7]) : null }}</td>
          <td class="text-xs-left">
            <router-link v-if="!props.item[5]" v-for="elem in props.item[8]" v-bind:key="elem"
              v-bind:to="deployment(elem)._path">
              {{ deployment(elem).name }}
            </router-link>
            <span v-else>
              {{ props.item[7] }}
            </span>
          </td>
          
          <td class="text-xs-left">
            <v-btn color="error" v-if="props.item[0] && !props.item[5]" icon v-on:click="showDialog(props.item._uri)">
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
      text: "Persistent",
      align: "center",
      sortable: false,
      value: "persistent"
    },
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
      align: "left",
      sortable: false,
      value: "usage"
    },
    {
      text: "Used by",
      align: "left",
      sortable: false,
      value: "usedBy"
    },
    {
      text: "",
      align: "center",
      sortable: false,
      value: "actions"
    }
  ];
  dialog: boolean = false;
  selectedElement: string = null;

  /**
   * Obtains the available volumes in the system.
   */
  get volumes(): [
    boolean, // persistent
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
      boolean, // persistent
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
        true, // persistent
        volumes[key]._uri, // uri
        volumes[key].name, // name
        volumes[key].filesystem, // filesystem
        volumes[key].size, // size
        null, // item id
        null, // associated role
        null, // associated instance
        volumes[key].usedBy // used by
      ]);

      for (let inst in volumes[key].items) {
        res.push([
          true, // persistent
          volumes[key]._uri, // uri
          volumes[key].name, // name
          volumes[key].filesystem, // filesystem
          volumes[key].size, // size
          volumes[key].items[inst].id, // item id
          volumes[key].items[inst].associatedRole, // associated role
          volumes[key].items[inst].associatedInstance, // associated instance
          volumes[key].usedBy // used by
        ]);
      }
    }

    // Volatile volumes
    let deployments = this.$store.getters.deployments;
    for (let dep in deployments) {
      for (let volvol in (<Deployment>deployments[dep]).volatileVolumes) {
        res.push([
          false, // persistent
          "volatile", // uri
          (<Deployment>deployments[dep]).volatileVolumes[volvol].id, // name
          null, // filesystem
          (<Deployment>deployments[dep]).volatileVolumes[volvol].size, // size
          null, // item id
          null, // associated role
          null, // associated instance
          [dep] // used by
        ]);

        for (let item in (<Deployment>deployments[dep]).volatileVolumes[volvol].items) {
          res.push([
            false, // persistent
            "volatile", // uri
            (<Deployment>deployments[dep]).volatileVolumes[volvol].id, // name
            null, // filesystem
            (<Deployment>deployments[dep]).volatileVolumes[volvol].size, // size
            (<Deployment>deployments[dep]).volatileVolumes[volvol].items[item].id, // item id
            (<Deployment>deployments[dep]).volatileVolumes[volvol].items[item].associatedRole, // associated role
            (<Deployment>deployments[dep]).volatileVolumes[volvol].items[item].associatedInstance, // associated instance
            [dep] // used by
          ]);
        }
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
      console.debug("Entramos en intem usage con", urn, id, dep, role, inst);
      let res = null;
      if (dep && role && inst) {
        let met = this.$store.getters.metrics(dep);
        if (met.length > 0)
          res = met[met.length - 1].roles[role].instances[inst].volumes
            ? met[met.length - 1].roles[role].instances[inst].volumes[id].usage
            : "-";
      }

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