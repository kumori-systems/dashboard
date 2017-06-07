<template>
    <span>
        <input ref="input" v-model.number="this.value" type="number" min=1 v-bind:value="value" v-on:input="updateValue($event.target.value)">
    </span>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, DeploymentRol, Resource } from '../../store/classes';
@Component({
    name: 'number-input',
    props: {
        value: { required: true, type: Number }
    }
})
export default class NumberInput extends Vue {
    value: number = this.value;

    updateValue(value) {
        var formattedValue = value
            // Remove whitespace on either side
            .trim()
            // Shorten to no decimal places
            .slice(
            0,
            value.indexOf('.') === -1 ? value.length : value.indexOf('.') + 0
            );
        formattedValue = formattedValue.slice(0,
            value.indexOf('-') === -1 ? value.length : value.indexOf('.') + 0
        );
        if (formattedValue < 0) formattedValue = -formattedValue;
        if (formattedValue.length <= 0) formattedValue = 1;
        // If the value was not already normalized,
        // manually override it to conform
        if (formattedValue !== value) {
            (<any>this.$refs.input).value = formattedValue;
        }
        // Emit the number value through the input event
        this.$emit('input', Number(formattedValue));
    }
}
</script>