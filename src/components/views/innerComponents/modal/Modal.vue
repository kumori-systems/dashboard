<template>
    <vue-modal v-bind:title="title || 'Tittle'" v-bind:visible="visible" v-on:close="close" v-on:ok="okButtonCallback" v-on:cancel="close">
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">{{ title }}</p>
            </header>
            <footer class="modal-card-foot">
                <a class="button is-primary">Ok</a>
                <a class="button">Cancel</a>
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
        okButtonCallback: { required: true, type: Function },
        bodyText: { required: true, type: String }
    }
})
export default class Modal extends Vue {
    title = this.title;
    visible = this.visible;

    okButtonCallback = this.okButtonCallback;
    bodyText = this.bodyText;

    close() {
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.button {
    position:absolute;
    right: 20px;
}
.button.is-primary{
    right: 90px;
}
</style>