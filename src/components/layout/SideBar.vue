<template>
  <aside class="menu app-sidebar animated slideInDown">
    <ul class="menu-list">
      <li v-for="menuItem in menuItems">
        <router-link v-bind:to="menuItem.path" v-bind:exact="true" v-bind:aria-expanded="expanded(menuItem) ? 'true' : 'false'" v-on:click.native="menuItemExpandToggle(menuItem)">
          {{ menuItem.name }}
          <span class="icon is-small is-angle fa" v-if="hasChildren(menuItem)">
            <i v-if="expanded" class="fa-angle-up"></i>
            <i v-else class="fa-angle-left"></i>
          </span>
        </router-link>
  
        <expanding v-if="hasChildren(menuItem)">
          <ul v-if="expanded(menuItem)">
            <li v-for="subItem in menuItem.children">
              <router-link v-bind:to="menuItem.path">
                {{ subItem.meta && subItem.name }}
              </router-link>
            </li>
          </ul>
        </expanding>
  
      </li>
    </ul>
  </aside>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Expanding from 'vue-bulma-expanding/src/Expanding.vue';

@Component({
  name: 'side-bar',
  components: {
    'expanding': Expanding
  }
})
export default class Sidebar extends Vue {

  // Computed
  get menuItems() {
    return this.$store.getters.menuItems;
  }

  get hasChildren(): Function {
    return function (menuItem): boolean {
      return this.$store.getters.menuItemHasChildren(menuItem);
    }
  }

  get expanded(): Function {
    return function (menuItem): boolean {
      return this.$store.getters.menuItemIsExpanded(menuItem);
    }
  }

  menuItemExpandToggle(menuItem) {
    if (this.hasChildren(menuItem))
      this.$store.dispatch('menuItemExpandToggle', { menuItem });
  }
}
</script>
<style lang="scss">
@import '~bulma/sass/utilities/variables';
@import '~bulma/sass/utilities/mixins';
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
  z-index: 1024 - 1;
  background: #FFF;
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
      transition: transform .377s ease;
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
    li a+ul {
      margin: 0 10px 0 15px;
    }
  }
}
</style>