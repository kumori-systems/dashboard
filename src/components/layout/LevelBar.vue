<template>
    <nav class="level app-levelbar">
        <div class="level-left">
            <div class="level-item">
                <h3 class="subtitle is-5">
                    <strong>{{ name }}</strong>
                </h3>
            </div>
            <div class="level-item" v-if="!!codelink">
                <tooltip label="View code" placement="right" size="small" v-bind:rounded="true">
                    <span class="icon">
                        <a  v-bind:href="codelink">
                            <i class="fa fa-github"></i>
                        </a>
                    </span>
                </tooltip>
            </div>
        </div>
        <div class="level-right is-hidden-mobile">
            <breadcrumb v-bind:list="list"></breadcrumb>
        </div>
    </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Breadcrumb from 'vue-bulma-breadcrumb/src/Breadcrumb.vue'
import Tooltip from 'vue-bulma-tooltip'

@Component({
    name: 'navbar',
    components: {
        'tooltip':Tooltip,
        'breadcrumb':Breadcrumb
    },
    props: {
        show: Boolean
    }
})
export default class NavBar extends Vue{
     watch= {
        $route () {
            this.getList()
        }
    };
    // data
    list = null;
    getList = function(){
        let matched = this.$route.matched.filter(item => item.name);
        let first = matched[0];
        if (first && (first.name !== 'Home' || first.path !== '')) {
            matched = [{ name: 'Home', path: '/' }].concat(matched);
        }
        this.list = matched;
    }
    
    // lifecycle hook
    created () {
       this.getList();
    };

    // computed
    get codelink () {
      if (this.$route.meta && this.$route.meta.link) {
        return 'https://github.com/vue-bulma/vue-admin/blob/master/client/views/' + this.$route.meta.link
      } else {
        return null
      }
    }
    get name () {
      return this.$route.name
    }
}
</script>

<style lang="scss">
</style>