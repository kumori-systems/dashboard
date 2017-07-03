<template>
    <div>
        <input type="file" v-on:change="onFileChange">
        <!--<input type="file" name="bundle" id="file">-->
        </input>
        <div>
            <button v-on:click="addElement">Add new Element</button>
            <!--<input type="submit" class="button">-->
            </input>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../../../store/classes';

@Component({
    name: 'NewBundle'
})
export default class NewBundle extends Vue {
    bundle: string = '';

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }

    // Escuchamos cambios en el fichero que se quiere cargar
    onFileChange(e) {
        console.log('El tipo de e es: ' + typeof e);
        let files = e.target.files || e.dataTransfer.files;
        if (!files.length)
            return;
        this.loadFile(files[0]);
    }

    loadFile(file) {
        let reader: FileReader = new FileReader();
        let vm: NewBundle = this;

        reader.onload = (e) => {
            vm.bundle = (<any>e.target).result;
        };
        reader.readAsDataURL(file);
    }

    addElement() {
        if (this.bundle !== null && this.bundle.length > 0) {
            this.$store.dispatch('addNewElement', this.bundle);
        }
    }
}
</script>
<style lang="scss">

</style>