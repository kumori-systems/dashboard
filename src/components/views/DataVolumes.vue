<template>
    <div>
        <div v-if="addVolume">
            <add-volume></add-volume>
        </div>
        <table class="table">
            <tr v-for="dataVolume in dataVolumeList">
                <th>{{dataVolume}}</th>
                <th>
                    <span class="ON_PROGRESS" v-if="isDataVolumeUsed(dataVolume)">in use</span>
                </th>
                <th>by {{deploymentUsingDataVolume(dataVolume)}}, {{rolUsingDataVolume(dataVolume)}}</th>
                <th>{{numberOfChunks(dataVolume)}} chunks</th>
                <th>
                    <button class="button fa fa-info" />
                    <button class="button fa fa-trash" v-on:click="deleteVolume(dataVolume)" />
                </th>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';
import AddVolume from './innerComponents/form/AddVolume.vue';

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

    get deploymentUsingDataVolume() {
        return (dataVolume) => {
            return this.$store.getters.getDeploymentName(this.$store.getters.getDeploymentUsingDataVolume(dataVolume));
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