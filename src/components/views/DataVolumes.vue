<template>
    <div>
        <p>
            <span>CALC_WORKER_DATA</span>
            <span class="warning">in use</span>
            <span>by worker</span>
            <span>3 chunks</span>
            <button class="fa fa-info"/>
            <button class="fa fa-times"/>
        </p>
        <p>
            <span>BLABLA_DATA</span>
            <span>2 chunks</span>
            <button class="fa fa-info"/>
            <button class="fa fa-times"/>
        </p>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name: 'DataVolumes'
})
export default class DataVolumes extends Vue{

}
</script>
<style lang="scss">
</style>