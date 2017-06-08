<template>
    <div>
        <textarea v-model="bundle" placeholder="text/json"></textarea>
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
        if (this.bundle.length > 0) {
            this.$store.dispatch('addNewElement', this.bundle);
        }

    }
}
</script>