<template>
    <collapse class="tile" id="fab">
        <collapse-item title="+">
            <p>A</p>
            <p>B</p>
            <p>C</p>
        </collapse-item>
    </collapse>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

// Components
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';

@Component({  
    name: 'FAB',
    components:{
        'collapse':Collapse,
        'collapse-item':CollapseItem
    }
})
export default class FAB extends Vue{}
</script>
<style lang="scss">
#fab{
     margin-left: 180px;
}
</style>