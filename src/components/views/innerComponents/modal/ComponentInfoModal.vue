<template>
    <info-modal v-bind:visible="visible" v-bind:elementId="componentId" v-bind:elementName="componentName" v-bind:elementVersion="componentVersion" v-on:close="close">
        <div slot="info-body">
            <p>uri: {{componentId}}</p>
            <p>name: {{componentName}}</p>
            <p>version: {{componentVersion}}</p>
            <p>owner: {{componentOwner}}</p>
            <p>proChannels: {{componentProChannels}}</p>
            <p>reqChannels: {{componentReqChannels}}</p>
            <p>resourcesConfig: {{componentResourcesConfig}}</p>
            <p>runtime: {{componentRuntime}}</p>
        </div>
    </info-modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import InfoModal from './InfoModal.vue';
import { getElementName, getElementOwner, getElementVersion } from '../../../../store/proxy/utils';

@Component({
    name: 'component-info-modal',
    components: {
        'info-modal': InfoModal
    },
    props: {
        visible: { required: true, type: Boolean },
        componentId: { required: true, type: String }
    }
})
export default class ComponentInfoModal extends Vue {
    visible: boolean = this.visible;
    componentId: string = this.componentId;

    close() {
        this.$emit('close');
    }

    get componentName() {
        return getElementName(this.componentId) || '';
    }

    get componentVersion() {
        return getElementVersion(this.componentId) || '';
    }

    get componentOwner() {
        return getElementOwner(this.componentId) || '';
    }

    get componentProChannels() {
        return this.$store.getters.getComponentProChannels(this.componentId);
    }

    get componentReqChannels() {
        return this.$store.getters.getComponentReqChannels(this.componentId);
    }

    get componentResourcesConfig() {
        return this.$store.getters.getComponentResourcesConfig(this.componentId);
    }

    get componentRuntime() {
        return this.$store.getters.getComponentRuntime(this.componentId);
    }
}
</script>