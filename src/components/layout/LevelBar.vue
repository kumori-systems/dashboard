<template>
    <div>
        <nav class="level app-levelbar">
            <div class="level-left">
                <div class="level-item">
                    <h3 class="subtitle is-5">
                        <strong>
                            <breadcrumb v-bind:list="list"></breadcrumb>
                        </strong>
                    </h3>
                </div>
            </div>
        </nav>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Breadcrumb from 'vue-bulma-breadcrumb/src/Breadcrumb.vue'

@Component({
    name: 'navbar',
    components: {
        'breadcrumb': Breadcrumb
    },
    props: {
        show: Boolean
    }
})
export default class NavBar extends Vue {
    get list() {
        let res: any = this.$route.matched.filter(item => item.name);
        let parents = res[0].path.split('/');

        // Ignoramos el primer y el último elemento
        // primer elemento = ''
        // último elemento es el elemento que tenemos
        for (let i = parents.length - 2; i > 0; i--) {
            res = [{ name: parents[i], path: '/' + parents[i] }].concat(res);
        }

        return res;
    }

    // computed
    get codelink() {
        if (this.$route.meta && this.$route.meta.link) {
            return 'https://github.com/vue-bulma/vue-admin/blob/master/client/views/' + this.$route.meta.link
        } else {
            return null
        }
    }
    get name() {
        return this.$route.name
    }
}
</script>