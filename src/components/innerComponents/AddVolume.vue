<template>
    <div>
        <p>NEW VOLUME RESERVARION</p>
        <p>Prefix:
            <input>
        </p>
        <p>Number of Chunks
            <input v-model.number="chunkNum" type="number" min=1>
        </p>
        <p v-for="n in chunkNum">Chunk {{n}}
            <input v-model.number="size[n]" type="number" min=1> GB </p>
    
        <p>Size: {{getTotalGB}}GB</p>
        <button class="button">ADD</button>
    </div>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    name: 'addvolume'
})
export default class AddVolume extends Vue {
    chunkNum: number = 1;
    size: Array<number> = [null, 1];

    mounted() {
        this.$watch('chunkNum', function (value) {
            this.size = new Array<number>(value + 1);
            console.log('El valor es; ' + value);
            this.size[0] = 0;
            for (let index = 1; index <= value; index++) {
                this.size[index] = 1;
            }
        });
    }

    get getTotalGB() {
        let res:number = 0;
        for (let index in this.size) {
            res += this.size[index];
        }
        return res;
    }
}
</script>