<template>
    <section class="app-navbar animated" :class="{ slideInDown: show, slideOutDown: !show }">
        <nav class="nav">
            <div class="nav-left">
                <a class="nav-item hero-brand" href="/">
                    <img src="../../assets/logo_m_text.png" alt="logo"></img>
                </a>
            </div>
            <div class="nav-center">
            </div>
            <div class="nav-right tile">
                <div id="notification-box" class="box">
                    <i class="fa fa-bell" aria-hidden="true"></i>
                    <span id="numNotifications">{{numNotifications}}</span>
                </div>
                <i class="fa fa-user fa-2x"></i>
                <div id="username">{{user}}</div>
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

    get user() {
        return this.$store.getters.getUser;
    }
    get numNotifications(){
        return this.$store.getters.getNumNotifications;
    }
}
</script>

<style lang="scss" scoped>
.app-navbar {
    position: fixed;
    min-width: 100%;
    z-index: 2;
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
    #notification-box{
        padding:10px;
        margin:2px;
        .fa-bell{
            margin-top: 5px;
        }
        #numNotifications{
            padding:0px;
            margin: 0px;
        }
    }
    #username{
        margin:10px;
    }
}
</style>