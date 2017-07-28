<template>
    <i id="checkbox" v-bind:disabled="disabled" ref="checkbox" type="checkbox" class="is-unselectable fa" v-bind:class="selected" v-on:click="updateValue(checked)">
        <strong>
            <slot></slot>
        </strong>
    </i>
</template>
<script lang="ts">
const throwTypeError = () => { throw new Error('TypeError: Type of prop checked should be Boolean or Array<any>') };

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Deployment, Resource } from '../../../../store/classes';
@Component({
    name: 'checkbox-input',

    props: {
        checked: { required: true },
        value: { required: false },
        disabled: { required: false, default: false }
    },
    model: {
        prop: 'checked',
        event: 'change'
    }
})
export default class CheckboxInput extends Vue {
    checked = this.checked;
    value = this.value;
    disabled = this.disabled;

    updateValue(checked) {
        if (this.disabled) return;
        switch (typeof checked) {
            case 'boolean':
                this.$emit('change', !checked);
                break;
            case 'object':
                if (checked.length === undefined) throwTypeError();
                let index = (<Array<any>>checked).indexOf(this.value);
                if (index === -1) {
                    (<Array<any>>checked).push(this.value);
                    (<HTMLInputElement>this.$refs.checkbox).checked = true;
                    this.$emit('change', checked);
                } else {
                    (<HTMLInputElement>this.$refs.checkbox).checked = false;
                    this.$emit('change', (<Array<any>>checked).splice(0, index).concat((<Array<any>>checked).splice(index + 1, (<Array<any>>checked).length)));
                }
                break;
            default:
                throwTypeError();
        }
    }
    get selected() {
        let res: string;
        switch (typeof this.checked) {
            case 'boolean':
                res = this.checked ? 'fa-check-square-o' : 'fa-square-o';
                break;
            case 'object':
                if (this.checked.length === undefined) throwTypeError();
                res = (<Array<any>>this.checked).indexOf(this.value) !== -1 ? 'fa-check-square-o' : 'fa-square-o';
                break;
            default:
                throwTypeError();
        }
        return res;
    }
}
</script>
<style lang="scss">
i[disabled] {
    cursor: not-allowed;
}
</style>