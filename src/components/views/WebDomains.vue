<template>
    <div>
        <div v-for="webdomain, index in webdomainList" v-bind:key="index">
            {{webdomain}}
            <span class="warning">In use</span>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';

@Component({
    name: 'WebDomains'
})
export default class WebDomains extends Vue {
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        fabElementsList.push(new FabElement('Add new web domain', ''));
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    
    get webdomainList() {
        return this.$store.getters.getWebDomainList;
    }
}
</script>
<style lang="scss">

</style>