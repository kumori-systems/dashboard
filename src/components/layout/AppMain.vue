<template>
    <div id="app-main">
        <router-view class="content"/>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import LevelBar from './LevelBar.vue'

@Component({
    name: 'app-main'
})
export default class AppMain extends Vue{}
</script>
<style lang="scss" scoped>

$default_padding:10px;
$default_margin_left:180px;

#app-main{
    padding: $default_padding;
    padding-top: 50px + $default_padding;
    margin-left: $default_margin_left;
}
</style>