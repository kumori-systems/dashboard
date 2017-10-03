<template>
    <info-modal v-bind:visible="visible" v-bind:elementId="serviceId" v-bind:elementName="serviceName" v-bind:elementVersion="serviceVersion" v-on:close="close">
        <div slot="info-body">
            <p>uri: {{serviceId}}</p>
            <p>name: {{serviceName}}</p>
            <p>version: {{serviceVersion}}</p>
            <p>owner: {{serviceOwner}}</p>
            <p>parameters: {{serviceParameters}}</p>
            <p>proChannels: {{serviceProChannels}}</p>
            <p>reqChannels: {{serviceReqChannels}}</p>
            <p>resources: {{serviceResources}}</p>
            <p>roles: {{serviceRoles}}</p>
        </div>
    </info-modal>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import InfoModal from './InfoModal.vue';
import { getElementName, getElementOwner, getElementVersion } from '../../../../store/proxy/utils';

@Component({
    name: 'service-info-modal',
    components: {
        'info-modal': InfoModal
    },
    props: {
        visible: { required: true, type: Boolean },
        serviceId: { required: true, type: String }
    }
})
export default class ServiceInfoModal extends Vue {
    visible: boolean = this.visible;
    serviceId: string = this.serviceId;

    close() {
        this.$emit('close');
    }

    get serviceName() {
        return getElementName(this.serviceId) || '';
    }

    get serviceVersion() {
        return getElementVersion(this.serviceId) || '';
    }
    get serviceOwner() {
        return getElementOwner(this.serviceId) || '';
    }
    get serviceParameters() {
        return this.$store.getters.getServiceParameters(this.serviceId);
    }
    get serviceProChannels() {
        return this.$store.getters.getServiceProChannels(this.serviceId);
    }
    get serviceReqChannels() {
        return this.$store.getters.getServiceReqChannels(this.serviceId);
    }
    get serviceResources() {
        return this.$store.getters.getServiceResources(this.serviceId);
    }
    get serviceRoles() {
        return this.$store.getters.getServiceRoles(this.serviceId);
    }
}
</script>