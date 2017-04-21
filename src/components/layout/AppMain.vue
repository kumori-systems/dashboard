<template>
    <div id="app-main">
        <level-bar/>
        <router-view/>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import LevelBar from './LevelBar'

@Component({
    name: 'app-main',
    components:{
        'level-bar': LevelBar
    }
})
export default class AppMain extends Vue{

}
</script>
<style lang="scss">
#app-main{
    padding-top: 50px;
    margin-left: 180px;
}
</style>