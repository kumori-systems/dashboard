<template>
    <div class="tile is-4">
        <input class="input" v-model="newWebDomain" placeholder="New domain">
        <button class="button is-primary" v-on:click="addWebDomain">add</button>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../../../store/classes';
@Component({
    name: 'AddDomain'
})
export default class AddDomain extends Vue {
    newWebDomain = null;
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    addWebDomain() {
        if (this.newWebDomain != null && this.newWebDomain.length > 0)
            this.$store.dispatch('addWebDomain', this.newWebDomain);
    }
}
</script>