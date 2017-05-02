<template>
    <div>
        <p>Vista general de deployments</p>
    <router-view></router-view>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    name: 'Deployments'
})
export default class Deployments extends Vue {}
</script>
<style lang="scss">

</style>