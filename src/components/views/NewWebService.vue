<template>
    <div>
        newServiceBody
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';

@Component({
    name: 'new-webservice'
})
export default class NewWebService extends Vue {
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
}
</script>