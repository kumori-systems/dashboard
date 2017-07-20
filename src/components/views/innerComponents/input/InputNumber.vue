<template>
    <input class="input" ref="input" v-bind:value="value" type="number" min=1 v-on:input="updateValue($event.target.value)" v-on:focus="selectAll">
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, Resource } from '../../../../store/classes';
@Component({
    name: 'numberinput',
    props: {
        value: { required: false, type: Number, default: 0 }
    }
})
export default class NumberInput extends Vue {
    value: number = this.value;
    numElement: number = this.numElement;
    property: string = this.property;



    updateValue(value: string) {
        let formattedValue: number = isNaN(Number.parseInt(value.trim())) ? 1 : Number.parseInt(value.trim());
        if (formattedValue < 1) formattedValue = 1;
        formattedValue = Math.fround(formattedValue);
        (<HTMLInputElement>this.$refs.input).value = formattedValue.toString();
        this.$emit('input', formattedValue);
    }

    selectAll(event) {
        setTimeout(function () {
            event.target.select()
        }, 0)
    }
}
</script>