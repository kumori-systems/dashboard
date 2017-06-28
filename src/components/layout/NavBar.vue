<template>
    <section class="app-navbar animated" :class="{ slideInDown: show, slideOutDown: !show }">
        <nav class="nav">
            <div class="nav-left">
                <a class="nav-item hero-brand" href="/">
                    <img src="../../assets/logo_m_text.png" />
                </a>
            </div>
            <div class="nav-center">
            </div>
            <div class="nav-right">
                <i class="fa fa-bell" aria-hidden="true" />
                <p>{{username}}</p>
            </div>
        </nav>
    </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Tooltip from 'vue-bulma-tooltip'

@Component({
    name: 'navbar',
    components: {
        'tooltip': Tooltip
    },
    props: {
        show: Boolean
    }
})
export default class NavBar extends Vue {

    get username() {
        return this.$store.getters.getUsername;
    }
}
</script>

<style lang="scss">
.app-navbar {
    position: fixed;
    min-width: 100%;
    z-index: 1024;
    box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);
    .container {
        margin: auto 10px;
    }
    .nav-right {
        margin: auto 10px;
        .fa {
            margin: auto 10px;
        }
    }
}
</style>