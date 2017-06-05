<template>
    <card-modal v-bind:visible="visible" v-on:close="close" v-bind:title="title">
        <div class="content has-text-centered">
            Información del componente
        </div>
    </card-modal>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { CardModal } from 'vue-bulma-modal';

@Component({
    name: 'modal',
    components: {
        'card-modal': CardModal
    },
    props: {
        visible: { required: true, type: Boolean },
        title: { required: true, type: String }
    }
})
export default class Modal extends Vue {
    visible = this.visible;
    close() {
        this.$emit('close')
    }
}
</script>