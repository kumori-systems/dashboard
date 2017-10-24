<template>
  <aside class="menu app-sidebar animated slideInDown">
    <ul class="menu-list">
      <li>
        <router-link v-bind:to="'/'" v-on:click.native="expanded=!expanded">
          Overview
          <span class="icon is-small is-angle fa">
            <i v-if="expanded" class="fa-angle-down"></i>
            <i v-else class="fa-angle-right"></i>
          </span>
        </router-link>
        <expanding v-show="expanded">
          <ul>
            <li v-for="(subItem, index) in deploymentItems" v-bind:key="index">
              <router-link v-bind:to="subItem.path">
                {{ subItem.name }}
              </router-link>
            </li>
          </ul>
        </expanding>
      </li>
      <li>
        <router-link v-bind:to="'/elements'">Elements</router-link>
      </li>
      <li>
        <router-link v-bind:to="'/domains'">Domains</router-link>
      </li>
      <li>
        <router-link v-bind:to="'/dataVolumes'">Data Volumes</router-link>
      </li>
      <li>
        <router-link v-bind:to="'/alarmsAndLogs'">Alarms and logs</router-link>
      </li>
      <li>
        <router-link v-bind:to="'/help'">Help</router-link>
      </li>
    </ul>
  </aside>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Expanding from "vue-bulma-expanding/src/Expanding.vue";
import {
  Overview,
  Elements,
  Domains,
  DataVolumes,
  DeploymentItem,
  AlarmsAndLogs,
  Help
} from "../index";

import { Deployment } from "../../store/classes";

@Component({
  name: "side-bar",
  components: {
    expanding: Expanding
  }
})
export default class Sidebar extends Vue {
  expanded: boolean = true;

  get deployments() {
    return this.$store.getters.deployments;
  }

  get deploymentItems() {
    let res = [];
    for (let deploymentId in this.deployments) {
      res.push({
        path: (<Deployment>this.deployments[deploymentId]).path,
        name: (<Deployment>this.deployments[deploymentId]).name,
        component: DeploymentItem,
        meta: { expanded: false }
      });
    }
    return res;
  }
}
</script>
<style lang="scss" scoped>
@import "~bulma/sass/utilities/variables";
@import "~bulma/sass/utilities/mixins";
.app-sidebar {
  position: fixed;
  top: 50px;
  left: 0;
  bottom: 0;
  padding: 20px 0 50px;
  width: 180px;
  min-width: 45px;
  max-height: 100vh;
  height: calc(100% - 50px);
  z-index: 1;
  background: #fff;
  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  @include mobile() {
    transform: translate3d(-180px, 0, 0);
  }
  .icon {
    vertical-align: baseline;
    &.is-angle {
      position: absolute;
      right: 10px;
      transition: transform 0.377s ease;
    }
  }
  .menu-list {
    li a {
      &[aria-expanded="true"] {
        .is-angle {
          transform: rotate(180deg);
        }
      }
    }
    li a + ul {
      margin: 0 10px 0 15px;
    }
  }
}
</style>