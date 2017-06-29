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
                    <span>This action will </span>
                    <strong>DESTROY</strong>
                    <span> {{deploymentName}} and</span>
                    <strong>ALL DATA WILL BE LOST</strong>.
                </p>
    
            </section>
            <a class="button is-primary is-danger" v-on:click="leftButtonClick">Undeploy</a>
    
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
        deploymentId: { required: true, type: String },
        deploymentName: { required: true, type: String }
    }
})
export default class Modal extends Vue {
    visible: boolean = this.visible;
    deploymentId: string = this.deploymentId;
    deploymentName: string = this.deploymentName;

    close() {
        this.$emit('close');
    }
    leftButtonClick() {
        this.$store.dispatch('undeployDeployment', { 'deploymentId': this.deploymentId });
        this.close();
    }
}
</script>