<template>
    <vue-modal v-bind:title="title || 'Tittle'" v-bind:visible="visible" v-on:close="close">
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{ title }}</p>
            </header>
            <section class="modal-card-body">
                {{bodyText}}
            </section>
            <footer class="modal-card-foot">
                <a class="button is-primary" v-bind:class="primaryButtonClass" v-on:click="leftButtonClick">Ok</a>
                <a class="button" v-on:click="close">Cancel</a>
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
        bodyText: { required: true, type: String },
        leftButtonCallback: { required: true, type: Function },
        primaryButtonClass: { required: false, type: String }
    }
})
export default class Modal extends Vue {
    title = this.title;
    visible = this.visible;
    primaryButtonClass = this.primaryButtonClass;
    leftButtonCallback = this.leftButtonCallback;
    bodyText = this.bodyText;

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
.button {
    position: absolute;
    right: 10px;
}

.button.is-primary {
    right: 80px;
}
</style>