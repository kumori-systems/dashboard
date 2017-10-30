<template>
    <modal v-on:close="close" v-bind:visible="visible" v-bind:primaryButtonText="primaryButtonText" v-bind:primaryButtonCallback="primaryButtonCallback" v-bind:primaryButtonClass="primaryButtonClass">
        <div slot="title">
            Are you
            <strong>ABSOLUTELY</strong> sure?
        </div>
        <div slot="body">
            This action
            <strong>CAN'T BE UNDONE</strong> and will
            <strong>DESTROY</strong>
            {{deploymentName}} and
            <strong>ALL DATA WILL BE LOST</strong>.
        </div>
    </modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Modal from './Modal.vue';

@Component({
    name: 'undeploy-modal',
    components: {
        'modal': Modal
    },
    props: {
        visible: { required: true, type: Boolean },
        deploymentId: { required: true, type: String },
        deploymentName: { required: true, type: String }
    }
})
export default class UndeployModal extends Vue {
    visible: boolean = this.visible;
    deploymentId: string = this.deploymentId;
    deploymentName: string = this.deploymentName;

    primaryButtonText: string = 'Undeploy';
    primaryButtonCallback: Function = () => {
        this.undeploy();
        this.close();
    };
    primaryButtonClass: string = 'is-danger';


    undeploy(){
        this.$emit('undeploy', { 'deploymentId': this.deploymentId });
    }

    close() {
        this.$emit('close');
    }
}
</script>