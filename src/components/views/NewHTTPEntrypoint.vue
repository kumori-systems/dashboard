<template>
    <div>
        newHTTPEntryPOintBOdy
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';

@Component({
    name: 'new-httpentrypoint'
})
export default class NewHTTPEntrypoint extends Vue {
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
}
</script>
<style lang="scss">

</style>