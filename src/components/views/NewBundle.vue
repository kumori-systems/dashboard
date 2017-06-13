<template>
    <div>
        <input type="file" v-on:change="onFileChange">
        <p>
            <button v-on:click="addElement">Add new Element</button>
        </p>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';

@Component({
    name: 'NewBundle'
})
export default class NewBundle extends Vue {
    bundle: string = '';

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    addElement() {
        if (this.bundle !== null && this.bundle.length > 0) {
            this.$store.dispatch('addNewElement', this.bundle);
        }
    }
    onFileChange(e) {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length)
            return;
        this.loadFile(files[0]);
    }


    loadFile(file) {
        var reader = new FileReader();
        var vm = this;

        reader.onload = (e) => {
            vm.bundle = (<any>e.target).result;
        };
        reader.readAsDataURL(file);
    }
}
</script>