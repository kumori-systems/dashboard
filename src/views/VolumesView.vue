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
          <td class="text-xs-left">{{ props.item._uri }}</td>
          <td class="text-xs-left">{{ props.item._uri }}</td>
          <td class="text-xs-left">{{ props.item._name }}</td>
          <td class="text-xs-left">{{ props.item.filesystem }}</td>
          <td class="text-xs-left">{{ props.item.size }}</td>
          <td class="text-xs-left">
            <router-link v-for="elem in props.item.usedBy" v-bind:key="elem"
              v-bind:to="deployment(elem)._path">
              {{ deployment(elem).name }}
            </router-link>
          </td>
          <td class="text-xs-left">
            <v-btn color="error" icon v-on:click="showDialog(props.item._uri)">
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
      align: "left",
      sortable: false,
      value: "_uri"
    },
    {
      text: "Item nº",
      align: "left",
      sortable: false,
      value: "_uri"
    },
    {
      text: "Name",
      align: "left",
      sortable: false,
      value: "_name"
    },
    {
      text: "Filesystem",
      align: "left",
      sortable: false,
      value: "filesystem"
    },
    {
      text: "Size",
      align: "left",
      sortable: false,
      value: "size"
    },
    {
      text: "Used by",
      align: "left",
      sortable: false,
      value: "usedBy"
    }
  ];
  dialog: boolean = false;
  selectedElement: string = null;

  /**
   * Obtains the available volumes in the system.
   */
  get volumes(): Volume[] {
    let res = [];
    let volumes: { [volume: string]: Volume } = ((<SSGetters>this.$store
      .getters).volumes as any) as {
      [uri: string]: Volume;
    };

    for (let key in volumes) {
      res.push(volumes[key]);
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