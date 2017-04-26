<template>
  <aside class="menu app-sidebar animated"
         v-bind:class="{ slideInLeft: show, slideOutLeft: !show }">
    <ul class="menu-list">
      <li v-for="(item, index) in menu">
        <router-link v-bind:to="item.path"
                     v-bind:exact="true"
                     v-bind:aria-expanded="isExpanded(item) ? 'true' : 'false'"
                     v-if="item.path"
                     v-on:click.native="toggle(index, item)">
            <p class="element">{{ item.name }}</p>
          <span class="icon is-small is-angle"
                v-if="item.children && item.children.length">
              <i class="fa fa-angle-down"></i>
            </span>
        </router-link>
        
      </li>
    </ul>
  </aside>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import Expanding from 'vue-bulma-expanding/src/Expanding.vue'

@Component({
    name: 'side-bar',
    components:{
        'expanding':Expanding
    },
    props:{
      show:true,
      title:""
    }
})
export default class Sidebar extends Vue{
  title:string;
  isReady:boolean = false;
  watch= {
    $route (route) {
      this.isReady = true;
      this.shouldExpandMatchItem(route);
    }
  }

  mounted () {
    let route = this.$route
    if (route.name) {
      this.isReady = true
      this.shouldExpandMatchItem(route)
    }
  }

  toggle (index, item) {
   /* this.expandMenu({
      index: index,
      expanded: !item.meta.expanded
    })*/
  }

  shouldExpandMatchItem (route) {
    /*
    // Es una función interesante pero que ahora mismo no nos interesa
    let matched = route.matched
    let lastMatched = matched[matched.length - 1]
    let parent = lastMatched.parent || lastMatched
    const isParent = parent === lastMatched
    if (isParent) {
      const p = this.findParentFromMenu(route)
      if (p) {
        parent = p
      }
    }
    if ('expanded' in parent.meta && !isParent) {
      this.expandMenu({
        item: parent,
        expanded: true
      })
    }
    */
  }

  generatePath (item, subItem) {
    return `${item.component ? item.path + '/' : ''}${subItem.path}`
  }

  findParentFromMenu (route) {
    const menu = this.menu
    for (let i = 0, l = menu.length; i < l; i++) {
      const item = menu[i]
      const k = item.children && item.children.length
      if (k) {
        for (let j = 0; j < k; j++) {
          if (item.children[j].name === route.name) {
            return item
          }
        }
      }
    }
  }

  get menu(){
    return this.$store.getters.menuitems;
  }

  isExpanded(item){
      return item.expanded;
  }

  get expandMenu(){
    return this.$store.getters.menu;
  }
  
  set expandMenu(item){
    this.$store.dispatch('expandMenu',item);
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
  .menu-label {
    padding-left: 5px;
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