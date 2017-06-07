<template>
    <div>
        <p>NEW VOLUME RESERVARION</p>
        <p>Prefix:
            <input v-model="prefix">
        </p>
        <p>Number of Chunks
            <inputnumber v-bind:value="chunkNum" v-on:input="updateInputValue" />
        </p>
        <p v-for="n in chunkNum">Chunk {{n}}
            <inputnumber v-bind:value="chunkSize(n)" v-bind:numElement="n" v-on:input="updateInputValue" /> GB </p>
    
        <p>Size: {{totalGB}}GB</p>
        <button class="button" v-on:click="addDataVolume" v-bind:disabled="prefix.length<=0">ADD</button>
    </div>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import InputNumber from './InputNumber.vue';

@Component({
    name: 'addvolume',
    components: {
        'inputnumber': InputNumber
    }
})
export default class AddVolume extends Vue {
    prefix: string = '';
    chunkNum: number = 1;
    size: Array<number> = [0, 1];
    totalGB: number = 1;

    mounted() {
        this.$watch('chunkNum', function (value) {
            this.size = new Array<number>(value + 1);
            this.size[0] = 0;
            for (let index = 1; index <= value; index++) {
                this.size[index] = 1;
            }
        });
    }
    get chunkSize() {
        return (chunkIndex) => {
            return this.size[chunkIndex];
        }
    }
    set chunkSize(chunkIndex) {
        (value) => {
            this.size[chunkIndex(1)] = value;
        }
    }

    addDataVolume() {
        this.size.shift(); // Eliminamos el 0 inicial
        let params = {
            'prefix': this.prefix,
            'chunks': this.size
        };
        this.size = [0].concat(this.size); // Restauramos el 0 inicial
        this.$store.dispatch('addDataVolume', params);
    }

    updateInputValue(value) {
        console.log('Recivimos valor: ' + JSON.stringify(value));
        let index, propertyType, newValue;
        [index, propertyType, newValue] = value;

        if (index == null) {
            this.chunkNum = newValue;
            this.totalGB = newValue;
        }
        else {
            this.size[index] = newValue;
            let res = 0;
            for (let i = 1; i < this.size.length; i++) {
                res += this.size[i];
            }
            this.totalGB = res;
        }


    }
}
</script>