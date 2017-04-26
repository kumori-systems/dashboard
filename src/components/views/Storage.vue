<template>
    <div>
        <input type="checkbox" id="showpublic3rdpartyelements">
        <label for="showpublic3rdpartyelements">Show public 3rd party elements</label>
        <collapse>
            <collapse-item title="Comonents">
                    <p>Component 1</p>
                    <p>Component 2</p>
                    <p>Component 3</p>
            </collapse-item>
            <collapse-item title="Services">
                    <p>Service 1</p>
                    <p>Service 2</p>
                    <p>Service 3</p>
            </collapse-item>
            <collapse-item title="Runtimes">
                    <p>Runtime 1</p>
                    <p>Runtime 2</p>
                    <p>Runtime 3</p>
            </collapse-item>
        </collapse>
    </div>
</template>

<script lang="ts">

import Vue from 'vue'
import Component from 'vue-class-component'
import {Collapse, Item as CollapseItem}from 'vue-bulma-collapse';

@Component({
    name: 'Storage',
    components: {
        'collapse':Collapse,
        'collapse-item':CollapseItem
    }
})
export default class Storage extends Vue{

}
</script>
<style lang="scss">
</style>