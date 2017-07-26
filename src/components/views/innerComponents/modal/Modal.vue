<template>
    <vue-modal v-bind:visible="visible" v-on:close="close">
        <div class="modal-card">
            <header class="modal-card-head">
                <slot class="modal-card-title" name="title">
                </slot>
                <button id="modal-close-button" class="delete" @click="close"></button>
            </header>
            <section class="modal-card-body">
                <slot name="body">
                </slot>
            </section>
            <a class="button is-primary" v-bind:class="primaryButtonClass" v-on:click="primaryButtonCallback">{{primaryButtonText}}</a>
            <a class="button is-primary" v-if="secondaryButtonText" v-bind:class="secondaryButtonClass" v-on:click="secondaryButtonCallback">{{secondaryButtonText}}</a>
            <footer>
                <slot name="footer">
                </slot>
            </footer>
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
        primaryButtonText: { required: false, type: String },
        primaryButtonClass: { required: false, type: String },
        primaryButtonCallback: { required: false, type: Function },
        secondaryButtonText: { required: false, type: String },
        secondaryButtonClass: { required: false, type: String },
        secondaryButtonCallback: { required: false, type: Function }
    }
})
export default class Modal extends Vue {
    buttonText = this.buttonText;
    buttonCallback = this.buttonCallback;
    buttonClass = this.buttonClass;
    close() {
        this.$emit('close');
    }

    get vueClass() {
        switch (this.buttonClass) {
            case 'is-primary':
            case 'is-info':
            case 'is-success':
            case 'is-warning':
            case 'is-danger':
                break;
            default:
                throw new Error('TypeError: prop buttonClass should be one of \'is-primary\'|\'is-info\'|\'is-success\'|\'is-warning\'|\'is-danger\'');
        }
        return this.buttonClass;
    }
}
</script>
<style lang="scss">
#modal-close-button {
    position: absolute;
    top: 2vh;
    right: 1vw;
}
</style>