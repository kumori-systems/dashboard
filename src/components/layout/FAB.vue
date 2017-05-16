<template>
    <collapse class="tile" id="fab"  v-if="fabElements.length > 0">
        <collapse-item title="+">
            <div v-for="element in fabElements">
                <router-link v-bind:to="element.to">
                {{ element.name }}
              </router-link>
            </div>
        </collapse-item>
    </collapse>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';

// Components
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';

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
<style lang="scss">
#fab {
    margin-left: 180px;
}
</style>