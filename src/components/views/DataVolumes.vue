<template>
    <div>
        <p v-for="dataVolume in dataVolumeList">
            {{dataVolume.name}}
            <span class="warning">in use</span>
            by {{dataVolume.user}} {{dataVolume.number}} chunks
            <button class="fa fa-info" />
            <button class="fa fa-times" />
        </p>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name: 'DataVolumes'
})
export default class DataVolumes extends Vue {
    get dataVolumeList() { 
        return this.$store.getters.getDataVolumesList;
    }

}
</script>