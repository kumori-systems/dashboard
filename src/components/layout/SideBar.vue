<template>
  <aside class="menu app-sidebar animated" :class="{ slideInLeft: show, slideOutLeft: !show }">
    <p class="menu-label">
      General
    </p>
    <ul class="menu-list">
      <li v-for="(item, index) in menu">
        <router-link :to="item.path" :exact="true" :aria-expanded="isExpanded(item) ? 'true' : 'false'" v-if="item.path" @click.native="toggle(index, item)">
          <span class="icon is-small"><i :class="['fa', item.meta.icon]"></i></span> {{ item.meta.label || item.name }}
          <span class="icon is-small is-angle" v-if="item.children && item.children.length">
            <i class="fa fa-angle-down"></i>
          </span>
        </router-link>
        <a :aria-expanded="isExpanded(item)" v-else @click="toggle(index, item)">
          <span class="icon is-small"><i :class="['fa', item.meta.icon]"></i></span> {{ item.meta.label || item.name }}
          <span class="icon is-small is-angle" v-if="item.children && item.children.length">
                            <i class="fa fa-angle-down"></i>
                          </span>
        </a>
  
        <expanding v-if="item.children && item.children.length">
          <ul v-show="isExpanded(item)">
            <li v-for="subItem in item.children" v-if="subItem.path">
              <router-link :to="generatePath(item, subItem)">
                {{ subItem.meta && subItem.meta.label || subItem.name }}
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
  },
  props: {
    show: Boolean,
  }
})
export default class Sidebar extends Vue {
  /* DATA */
  title: string = "";
  isReady: boolean = false;

  /* GETTERS */
  get menu() {
    return this.$store.getters.menuitems;
  }

  /* LIFEHOOK CYCLE */
  mounted() {
    let route = this.$route;
    if (route.name) {
      this.isReady = true;
      this.shouldExpandMatchItem(route);
    }
  }

  /* METHODS */
  // returns if a item is expanded or not
  isExpanded(item):Boolean {
    return item.meta.expanded;
  }

  // change the state of the menuItem
  toggle(index, item) {
    this.expandMenu({
      index: index,
      expanded: !item.meta.expanded
    });
  }

  // checks if the item should be expanded and expands it if we should
  shouldExpandMatchItem(route) {
    let matched = route.matched;
    let lastMatched = matched[matched.length - 1];
    let parent = lastMatched.parent || lastMatched;
    const isParent = parent === lastMatched;
    if (isParent) {
      const p = this.findParentFromMenu(route);
      if (p) { parent = p; }
    }
    if ('expanded' in parent.meta && !isParent) {
      this.expandMenu({
        item: parent,
        expanded: true
      });
    }
  }

  // returns a path for the router
  generatePath(item, subItem) {
    return `${item.component ? item.path + '/' : ''}${subItem.path}`;
  }

  // finds the parent of the actual view in the menu
  findParentFromMenu(route) {
    const menu = this.menu;
    for (let i = 0; i < menu.length; i++) {
      const item = menu[i];
      const k = item.children && item.children.length;
      if (k) {
        for (let j = 0; j < k; j++) {
          if (item.children[j].name === route.name) { return item; }
        }
      }
    }
  }

  // expands the item in the menu matching the actual route
  expandMenu(argument: any) {
    let payload: any = {};
    if (argument.index) payload.index = argument.index;
    if (argument.item) payload.item = argument.item;
    if (argument.expanded) payload.expanded = argument.expanded;
    this.$store.dispatch('expandMenu', payload);
  }


  watch() {
    // Tenemos que comprobar que efectivamente se llama al método watch como corresponde
    /*$route(route){
      this.isReady = true;
      this.shouldExpandMatchItem(route);
    }*/
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