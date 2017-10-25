<template>
    <div>
        <input type="file" class="box" v-on:change="onFileChange">
        <div>
            <button class="button is-primary" v-on:click="addElement">Upload bundle</button>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    name: 'NewBundle'
})
export default class NewBundle extends Vue {
    fileList: FileList;

    onFileChange(e) {
        this.fileList = (<HTMLInputElement>e.target).files || (<DataTransfer>e.dataTransfer).files;
    }

    addElement() {
        if (this.fileList) {
            this.$store.dispatch('addNewBundle', this.fileList.item(0));
            this.$router.push('/elements');
        }
    }

}
</script>