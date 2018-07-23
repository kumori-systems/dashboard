<!--
  Component which represents the new volume view.
-->
<template>
<v-card id="volumes-view" style="max-width:1300px">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">New Volume Reservation</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Adds a volume to the system -->
        <v-btn class="elevation-0" outline v-on:click="addPersistentVolume" v-bind:disabled="!valid">
          <span>Add Volume</span>
          <v-icon right>storage</v-icon>
        </v-btn>

        <!-- Cancels the action -->
        <v-btn flat v-on:click="cancel">Cancel</v-btn>

      </v-card-actions>

    </v-card-title>
    <v-container>
       <v-form v-model="valid" ref="form">

        <!-- Volume URN -->
        <v-layout>
          <v-flex xs12 md6>
            <v-text-field label="Volume URN" v-model="urn" required
              v-bind:rules="[
                (v) => !!v || 'A URN is required',
                (v)=> checkURN(v) || 'Invalid URN. Format eslap://namespace/resources/volume/myvolume/persistent'
                ]">
            </v-text-field>
          </v-flex>
        </v-layout>

        <!-- Volume filesystem -->
        <v-layout>
          <v-flex xs12 md2>
            <v-select label="Filesystem" v-model="selectedFilesystem" v-bind:items="filesystem"
              required autocomplete v-bind:rules="[(v) => !!v || 'A filesystem is required']">
            </v-select>
          </v-flex>
        </v-layout>

        <!-- Volume size -->
        <v-layout>
          <v-flex xs12 md2>
            <v-text-field type="number" label="Size in GB" v-model="size" required
              v-bind:rules="[
                (v) => !!v || 'A size is required',
                (v) => ( parseInt(v) > 0 )|| 'Size must be higher than 0'
              ]">
            </v-text-field>
          </v-flex>
        </v-layout>

      </v-form>
    </v-container>
  </v-card>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import { Volume } from "../store/stampstate/classes";

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
  name: "new-volume-view",
  components: {}
})
export default class NewVolumeView extends Vue {

  /** Template for the component. */
  urn: string = "eslap://<namespace>/resources/volume/<volume_name>/persistent";

  /** Default selected file system. */
  selectedFilesystem: Volume.FILESYSTEM = Volume.FILESYSTEM.XFS;

  /** Default selected volume size. */
  size: number = 1;

  /** Marks if the form has got valid params. */
  valid: boolean = false;

  /** Obtains the actual filesystem. */
  get filesystem() {
    let res: string[] = [];
    for (let filesys in Volume.FILESYSTEM) {
      res.push(Volume.FILESYSTEM[filesys]);
    }
    return res;
  }

  /** Method to confirm the addition of a persistent volume. */
  addPersistentVolume() {
    this.$store.dispatch("addPersistentVolume", {
      urn: this.urn,
      filesystem: this.selectedFilesystem,
      size: this.size
    });
    this.$router.go(-1);
  }

  /** Checks the correctness of the component urn. */
  checkURN(value: string) {
    return RegExp(
      "^eslap://(\\w+)/resource(s)?/volume/(\\w+)/persistent$"
    ).test(value);
  }

  /** Cancels the creation of a new volume. */
  cancel() {
    this.$router.go(-1);
  }
  
}
</script>