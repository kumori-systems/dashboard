<template>
    <i ref="checkbox" type="checkbox" class="is-unselectable fa" v-bind:class="inputClass" v-on:click="updateValue(!value)">
        <strong>{{text}}</strong>
    </i>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, Resource } from '../../../../store/classes';
@Component({
    name: 'check-input',
    props: {
        value: { required: true, type: Boolean },
        text: { required: true, type: String }
    }
})
export default class CheckboxInput extends Vue {
    value: boolean = this.value;
    text: string = this.text;

    updateValue(value) {
        if (value === 'on') value = true;
        (<HTMLInputElement>this.$refs.checkbox).checked = value;

        this.$emit('input', value);
    }

    get inputClass(): string {
        return this.value ? 'fa-check-square-o' : 'fa-square-o';
    }
}
</script>