<template>
    <info-modal v-bind:visible="visible" v-bind:elementId="runtimeId" v-bind:elementName="runtimeName" v-bind:elementVersion="runtimeVersion" v-on:close="close">
        <div slot="info-body">
            <p>uri: {{runtimeId}}</p>
            <p>name: {{runtimeName}}</p>
            <p>version: {{runtimeVersion}}</p>
            <p>owner: {{runtimeOwner}}</p>
        </div>
    </info-modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import InfoModal from './InfoModal.vue';


@Component({
    name: 'runtime-info-modal',
    components: {
        'info-modal': InfoModal
    },
    props: {
        visible: { required: true, type: Boolean },
        runtimeId: { required: true, type: String }
    }
})
export default class RuntimeInfoModal extends Vue {
    visible: boolean = this.visible;
    runtimeId: string = this.runtimeId;

    close() {
        this.$emit('close');
    }

    get runtimeName() {
        return this.$store.getters.getRuntimeName(this.runtimeId);
    }
    get runtimeVersion() {
        return this.$store.getters.getRuntimeVersion(this.runtimeId);
    }
    get runtimeOwner() {
        return this.$store.getters.getRuntimeOwner(this.runtimeId);
    }
}
</script>