<template>
    <card-modal v-bind:title="title || 'Tittle'" v-bind:visible="visible" v-on:close="close" v-bind:okText="leftButtonText" v-on:ok="LeftButtonCallback" v-on:cancel="close">
        <div class="content">
            {{bodyText||'Content'}}
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
        title: { required: true, type: String },
        visible: { required: true, type: Boolean },
        leftButtonText: { required: true, type: String },
        leftButtonCallback: { required: true, type: Function },
        bodyText: { required: true, type: String }
    }
})
export default class Modal extends Vue {
    title = this.title;
    visible = this.visible;
    leftButtonText = this.leftButtonText;
    leftButtonCallback = this.leftButtonCallback;
    bodyText = this.bodyText;

    close() {
        this.$emit('close');
    }
}
</script>