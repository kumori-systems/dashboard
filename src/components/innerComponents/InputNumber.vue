<template>
    <span>
        <input ref="input" v-bind:value="value" type="number" min=1 v-on:input="updateValue($event.target.value)" v-on:focus="selectAll" v-on:blur="formatValue">
    </span>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, DeploymentRol, Resource } from '../../store/classes';
@Component({
    name: 'numberinput',
    props: {
        value: { required: false, type: Number, default: 0 }, // El valor del campo
        numElement: { required: false, type: Number }, // El número de elemento, para hagamos emit, saber qué elemento emite
        property: { required: false, type: String } // Esto se utiliza pra la pagina newWebServiceAdvanced. Para diferenciar en cada rol, cual es el input que emite
    }
})
export default class NumberInput extends Vue {
    value: number = this.value;
    numElement: number = this.numElement;
    property: string = this.property;



    updateValue(value: string) {
        let formattedValue: number = isNaN(Number.parseInt(value.trim()))?1: Number.parseInt(value.trim());
        if (formattedValue < 1) formattedValue = 1;
        formattedValue = Math.fround(formattedValue);
        (<HTMLInputElement>this.$refs.input).value = formattedValue.toString();
        // Emit the number value through the input event
        this.$emit('input', [this.numElement, this.property, formattedValue]);
    }

    formatValue() {
    }

    selectAll(event) {
        setTimeout(function () {
            event.target.select()
        }, 0)
    }
}
</script>