<template>
    <div id="help-view">
        <p>Help</p>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';

@Component({
    name: 'help'
})
export default class Help extends Vue {
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
}
</script>