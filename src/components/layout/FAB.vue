<template>
    <div>
        <collapse class="tile" id="fab" v-if="fabElements.length > 0">
            <collapse-item title="+" class="fab">
                <div class="fab-element" v-for="element in fabElements" v-bind:key="element">
                    <router-link v-bind:to="element.to">
                        {{ element.name }}
                    </router-link>
                </div>
            </collapse-item>
        </collapse>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';
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
<style lang="scss" scoped>
#fab {
    z-index: 2;
    margin-left: 70vw;
    margin-top: 10vh;
    position: fixed;
}
</style>