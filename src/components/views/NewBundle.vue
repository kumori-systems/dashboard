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
    image: string = '';

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    addElement() {
        if (this.image !== null && this.image.length > 0) {
            this.$store.dispatch('addNewElement', this.image);
        }
        console.log('image vale: ' + JSON.stringify(this.image));
    }
    onFileChange(e) {
        var files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.createImage(files[0]);
    }


    createImage(file) {
        var reader = new FileReader();
        var vm = this;

        reader.onload = (e) => {
            vm.image = (<any>e.target).result;
        };
        reader.readAsDataURL(file);
    }
}
</script>