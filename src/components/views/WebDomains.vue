<template>
    <div>
        <div v-for="webdomain, index in webdomainList" v-bind:key="index">
            {{webdomain}}
            <span class="warning">In use</span>
        </div>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    name: 'WebDomains'
})
export default class WebDomains extends Vue {

    get webdomainList() {
        return this.$store.getters.getWebDomainList;
    }
}
</script>
<style lang="scss">

</style>