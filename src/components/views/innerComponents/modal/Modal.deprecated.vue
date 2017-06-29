<template>
    <vue-modal v-bind:title="title || 'Tittle'" v-bind:visible="visible" v-on:close="close">
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{ title }}</p>
                 <button class="delete" @click="close"></button>
            </header>
            <section class="modal-card-body">
                <slot></slot>
            </section>
            <footer class="modal-card-foot" v-if="leftButtonText">
                <a  class="button is-primary" v-bind:class="leftButtonClass" v-on:click="leftButtonClick">{{leftButtonText}}</a>
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
        title: { required: true, type: String },
        visible: { required: true, type: Boolean },
        leftButtonCallback: { required: false, type: Function },
        leftButtonText: { required: false, type: String },
        leftButtonClass: { required: false, type: String }
    }
})
export default class Modal extends Vue {
    title = this.title;
    visible = this.visible;
    leftButtonClass = this.leftButtonClass;
    leftButtonCallback = this.leftButtonCallback;

    close() {
        this.$emit('close');
    }
    leftButtonClick() {
        this.leftButtonCallback();
        this.close();
    }
}
</script>
<style lang="scss" scoped>
/*
.button {
    position: absolute;
    right: 10px;
}

.button.is-primary {
    right: 80px;
}
*/
</style>