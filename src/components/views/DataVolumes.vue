<template>
    <div>
        <div v-if="addVolume">
            <add-volume></add-volume>
        </div>
        <p v-for="dataVolume in dataVolumeList">
            {{dataVolume}}
            <span class="ON_PROGRESS" v-if="isDataVolumeUsed(dataVolume)">in use</span>
            by {{serviceUsingDataVolume(dataVolume)}}, {{rolUsingDataVolume(dataVolume)}} {{numberOfChunks(dataVolume)}} chunks
            <button class="button fa fa-info" />
            <button class="button fa fa-trash" v-on:click="deleteVolume(dataVolume)" />
        </p>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';
import AddVolume from '../innerComponents/AddVolume.vue';

@Component({
    name: 'DataVolumes',
    components: {
        'add-volume': AddVolume
    }
})
export default class DataVolumes extends Vue {
    addVolume: boolean = true;
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    get dataVolumeList() {
        return this.$store.getters.getDataVolumesList;
    }
    get isDataVolumeUsed() {
        return (dataVolume) => {
            return this.$store.getters.getIsDataVolumeUsed(dataVolume);
        }
    }

    get serviceUsingDataVolume() {
        return (dataVolume) => {
            return this.$store.getters.getServiceName(this.$store.getters.getServiceUsingDataVolume(dataVolume));
        }
    }

    get rolUsingDataVolume() {
        return (dataVolume) => {
            return this.$store.getters.getRolUsingDataVolume(dataVolume);
        }
    }
    get numberOfChunks() {
        return (dataVolume) => {
            return this.$store.getters.getNumberOfChunksDataVolume(dataVolume)
        }
    }

    deleteVolume(dataVolumeId) {
        return this.$store.dispatch('deleteElement', dataVolumeId);
    }

}
</script>