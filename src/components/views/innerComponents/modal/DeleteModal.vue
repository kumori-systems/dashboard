<template>
    <modal v-bind:visible="visible" v-on:close="close" v-bind:primaryButtonText="primaryButtonText" v-bind:primaryButtonClass="primaryButtonClass" v-bind:primaryButtonCallback="primaryButtonCallback">
        <div slot="title">
            <span>Are you </span>
            <strong>ABSOLUTELY</strong>
            <span> sure?</span>
        </div>
        <div slot="body">
            This action
            <strong>CAN'T BE UNDONE</strong> and will
            <strong>ERASE</strong> the {{elementType}}
            <strong>'{{elementName}}{{elementVersion}}'</strong> in the system.
        </div>
    </modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Modal from './Modal.vue';

@Component({
    name: 'delete-modal',
    components: {
        'modal': Modal
    },
    props: {
        visible: { required: true, type: Boolean },
        elementId: { required: true, type: String },
        elementName: { required: true, type: String },
        elementVersion: { required: true, type: String },
        elementType: { required: true, type: String }
    }
})
export default class DeleteModal extends Vue {
    visible: boolean = this.visible;
    elementId: string = this.elementId;
    elementName: string = this.elementName;
    elementVersion: string = this.elementVersion;
    primaryButtonText: string = "Delete";
    primaryButtonCallback: Function = () => {
        this.$store.dispatch('deleteElement', this.elementId);
        this.close();
    };
    primaryButtonClass: string = 'is-danger';

    close() {
        this.$emit('close');
    }
}
</script>