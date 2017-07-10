<template>
  <aside class="menu app-sidebar animated slideInDown">
    <ul class="menu-list">
      <li v-for="menuItem in menuItems" v-bind:key="menuItem">
        <router-link v-bind:to="menuItem.path" v-on:click.native="onClick(menuItem)">
          {{ menuItem.name }}
          <span class="icon is-small is-angle fa" v-if="menuItem.children && menuItem.children.length > 0">
            <i v-if="menuItem.meta.expanded" class="fa-angle-down"></i>
            <i v-else class="fa-angle-right"></i>
          </span>
        </router-link>
        <expanding v-show="menuItem.meta.expanded">
          <ul>
            <li v-for="subItem in menuItem.children" v-bind:key="subItem">
              <router-link v-bind:to="subItem.path">
                {{ subItem.name }}
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

  onClick(menuItem): void {
    this.$store.dispatch('toggleMenuItemExpanded', { menuItem });
  }
}
</script>
<style lang="scss" scoped>
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
  z-index: 1;
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