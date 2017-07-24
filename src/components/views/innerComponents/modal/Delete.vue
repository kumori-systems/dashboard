<template>
    <vue-modal v-bind:visible="visible" v-on:close="close">
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    <span>Are you </span>
                    <strong>ABSOLUTELY</strong>
                    <span> sure?</span>
                </p>
                <button class="delete" @click="close"></button>
            </header>
            <section class="modal-card-body">
                <p>
                    <span>This action
                        <strong>CAN'T BE UNDONE</strong> and will </span>
                    <strong>ERASE</strong>
                    <span> the {{elementType}}
                        <strong>'{{elementName}}{{elementVersion}}'</strong> in the system</span>.
                </p>
            </section>
            <a class="button is-primary is-danger" v-on:click="deleteElement">Delete</a>
        </div>
    </vue-modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import vueModal from 'vue-bulma-modal/src/Modal.vue';

@Component({
    name: 'modal',
    components: {
        'vue-modal': vueModal
    },
    props: {
        visible: { required: true, type: Boolean },
        elementId: { required: true, type: String },
        elementName: { required: true, type: String },
        elementVersion: { required: true, type: String },
        elementType: { required: true, type: String }
    }
})
export default class Modal extends Vue {
    visible: boolean = this.visible;
    elementId: string = this.elementId;
    elementName: string = this.elementName;
    elementVersion: string = this.elementVersion;

    close() {
        this.$emit('close');
    }
    deleteElement() {
        this.$store.dispatch('deleteElement', this.elementId);
        this.close();
    }
}
</script>