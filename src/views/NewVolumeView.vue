<template>
<v-card id="volumes-view">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">New Volume Reservation</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Adds a volume to the system -->
        <v-btn class="elevation-0" color="primary" v-on:click="addPersistentVolume" v-bind:disabled="!valid">Add Volume</v-btn>

        <!-- Cancels the action -->
        <v-btn outline v-on:click="cancel">Cancel</v-btn>

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

@VueClassComponent({
  name: "new-volume-view",
  components: {}
})
export default class NewVolumeView extends Vue {
  urn: string = "eslap://<namespace>/resources/volume/<volume_name>/persistent";
  selectedFilesystem: Volume.FILESYSTEM = Volume.FILESYSTEM.XFS;
  size: number = 1;
  valid: boolean = false;

  get filesystem() {
    let res: string[] = [];
    for (let filesys in Volume.FILESYSTEM) {
      res.push(Volume.FILESYSTEM[filesys]);
    }
    return res;
  }

  addPersistentVolume() {
    this.$store.dispatch("addPersistentVolume", {
      urn: this.urn,
      filesystem: this.selectedFilesystem,
      size: this.size
    });
    this.$router.go(-1);
  }

  checkURN(value: string) {
    return RegExp(
      "^eslap://(\\w+)/resource(s)?/volume/(\\w+)/persistent$"
    ).test(value);
  }

  cancel() {
    this.$router.go(-1);
  }
}
</script>