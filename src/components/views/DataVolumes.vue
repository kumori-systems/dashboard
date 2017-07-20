<template>
    <div id="datavolumes-view">
        <table class="table">
            <tr v-for="(dataVolume, index) in dataVolumeList" v-bind:key="index">
                <th>{{dataVolume}}</th>
                <th>
                    <span class="ON_PROGRESS" v-if="isDataVolumeUsed(dataVolume)">in use</span>
                    <span>by {{deploymentUsingDataVolume(dataVolume)}}, {{rolUsingDataVolume(dataVolume)}}</span>
                </th>
                <th>{{numberOfChunks(dataVolume)}} chunks</th>
                <th>
                    <button class="button fa fa-info is-info" />
                    <button class="button fa fa-trash is-danger" v-on:click="deleteVolume(dataVolume)" />
                </th>
            </tr>
        </table>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';


@Component({
    name: 'DataVolumes'
})
export default class DataVolumes extends Vue {
    addVolume: boolean = true;
    created() {
        this.$store.dispatch('getDeploymentList');
    }
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        fabElementsList.push(new FabElement('Add new volume', '/newVolume'));
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