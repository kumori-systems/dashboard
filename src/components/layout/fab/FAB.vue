<template>
    <div>
        <collapse class="tile fab" v-if="fabElements.length > 0">
            <collapse-item>
                <router-link v-for="element in fabElements" v-bind:key="element" v-bind:to="element.to">
                    <div>
                    {{ element.name }}
                    </div>
                </router-link>
            </collapse-item>
        </collapse>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from './fab-base';
import { FabElement } from '../../../store/classes';

@Component({
    name: 'FAB',
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem
    }
})
export default class FAB extends Vue {
    get fabElements(): Array<FabElement> {
        return this.$store.getters.getFabElements;
    }
}
</script>