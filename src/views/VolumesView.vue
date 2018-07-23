<!--
  Component for volumes view.
-->
<template>
  <v-card id="volumes-view">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Volumes</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Add a volume -->
        <v-btn outline to="/addPersistentVolume">
          <span>Add Volume</span>
          <v-icon right>storage</v-icon>
        </v-btn>

      </v-card-actions>

    </v-card-title>

    <!-- Divides different sections of the view -->
    <v-divider></v-divider>

    <v-container fluid>
      <v-data-table v-bind:headers="headers" v-bind:items="volumes" hide-actions>
        <template slot="items" scope="props">


          <td class="text-xs-left">
            <v-icon v-if="props.item[0]">storage</v-icon>
            <v-icon v-else>sd_card</v-icon>
          </td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[1] }}</td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[2] }}</td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[3] }}</td>
          <td class="text-xs-left">{{ props.item[5]? null : props.item[4] }}</td>
          <td class="text-xs-left">{{ props.item[5] }}</td>
          <td class="text-xs-left">{{ props.item[5]? itemUsage(props.item[5]):null}}</td>
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
            <v-btn v-if="!props.item[5]"
            v-bind:disabled="props.item[8].length > 0"
              icon v-on:click="showDialog(props.item._urn)">
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
import {
  Deployment,
  PersistentVolume,
  Volume,
  VolatileVolume
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
  name: "volumes-view"
})
export default class VolumesView extends Vue {
  
  /** Headers for the data table. */
  headers: any[] = [
    {
      text: "",
      align: "center",
      sortable: false,
      value: "persistent"
    },
    {
      text: "URN",
      align: "center",
      sortable: false,
      value: "_urn"
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

  /** Show/Hide the dialog to remove volumes. */
  dialog: boolean = false;

  /** Stores the selected element. */
  selectedElement: string = null;

  /**
   * Obtains the available volumes in the system.
   */
  get volumes(): [
    boolean, // persistent
    string, // urn
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
      string, // urn
      string, // name
      Volume.FILESYSTEM, // filesystem
      number, // total size
      string, // item id
      string, // associated role
      string, // associated instance
      string[] // usedBy
    ][] = [];

    /* Persistent volumes */
    let persistentVolumes: {
      [volume: string]: PersistentVolume;
    } = ((<SSGetters>this.$store.getters).persistentVolumes as any) as {
      [urn: string]: PersistentVolume;
    };

    for (let key in persistentVolumes) {
      if (!persistentVolumes[key]) {
        this.$store.dispatch("getElementInfo", key);
      } else {
        res.push([
          true, // persistent
          persistentVolumes[key]._urn, // urn
          persistentVolumes[key].name, // name
          persistentVolumes[key].filesystem, // filesystem
          persistentVolumes[key].size, // size
          null, // item id
          null, // associated role
          null, // associated instance
          persistentVolumes[key].usedBy // used by
        ]);

        for (let inst in persistentVolumes[key].items) {
          res.push([
            true, // persistent
            persistentVolumes[key]._urn, // urn
            persistentVolumes[key].name, // name
            persistentVolumes[key].filesystem, // filesystem
            persistentVolumes[key].size, // size
            persistentVolumes[key].items[inst].id, // item id
            persistentVolumes[key].items[inst].associatedRole, // associated role
            persistentVolumes[key].items[inst].associatedInstance, // associated instance
            persistentVolumes[key].usedBy // used by
          ]);
        }
      }
    }

    /* Volatile volumes */
    let volatileVolumes: { [urn: string]: VolatileVolume } = ((<SSGetters>this
      .$store.getters).volatileVolumes as any) as {
      [urn: string]: VolatileVolume;
    };

    for (let volvol in volatileVolumes) {
      res.push([
        false, // persistent
        volatileVolumes[volvol]._urn, // urn
        volatileVolumes[volvol].name, // name
        null, // filesystem
        volatileVolumes[volvol].size, // size
        null, // item id
        null, // associated role
        null, // associated instance
        volatileVolumes[volvol].usedBy // used by
      ]);

      for (let item in volatileVolumes[volvol].items) {
        res.push([
          false, // persistent
          volatileVolumes[volvol]._urn, // urn
          volatileVolumes[volvol].name, // name
          null, // filesystem
          volatileVolumes[volvol].size, // size
          volatileVolumes[volvol].items[item].id, // item id
          volatileVolumes[volvol].items[item].associatedRole, // associated role
          volatileVolumes[volvol].items[item].associatedInstance, // associated instance
          volatileVolumes[volvol].usedBy // used by
        ]);
      }
    }
    return res;
  }

  /** Obtains a deployment from the storage. */
  get deployment(): (stri: string) => Deployment {
    return (deploymentURN: string) => {
      return this.$store.getters.deployments[deploymentURN];
    };
  }

  /** Obtains the ussage of a volume. */
  get itemUsage() {
    return (id: string) => {
      let res = null;
      let met = this.$store.getters.volumeMetrics[id];
      if (met && met.length > 0)
        res = met[met.length - 1] ? met[met.length - 1].usage : "-";
      return res;
    };
  }

  /** Method to show the delete dialog. */
  showDialog(elementURN: string): void {
    this.dialog = true;
    this.selectedElement = elementURN;
  }

  /** Confirmed to remove an element. */
  removeElement(): void {
    this.$store.dispatch("deleteElement", this.selectedElement);
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