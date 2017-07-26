<template>
    <modal v-on:close="close" v-bind:visible="visible" v-bind:primaryButtonText="primaryButtonText" v-bind:primaryButtonCallback="primaryButtonCallback" v-bind:primaryButtonClass="primaryButtonClass">
        <div slot="title">
            {{elementName}} {{elementVersion}} info
        </div>
        <div slot="body">
           <slot name="info-body"></slot>
        </div>
    </modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Modal from './Modal.vue';

@Component({
    name: 'info-modal',
    components: {
        'modal': Modal
    },
    props: {
        visible: { required: true, type: Boolean },
        elementId: { required: true, type: String },
        elementName: { required: true, type: String },
        elementVersion: { required: true, type: String }
    }
})
export default class InfoModal extends Vue {
    visible: boolean = this.visible;
    elementId: string = this.elementId;
    elementName: string = this.elementName;
    elementVersion: string = this.elementVersion;

    primaryButtonText: string = 'Download Manifest';
    primaryButtonCallback: Function = () => {
        this.$store.dispatch('downloadManifest', this.elementId);
        this.close();
    };
    primaryButtonClass: string = 'is-info';

    close() {
        this.$emit('close');
    }
}
</script>