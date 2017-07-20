<template>
    <div>
        <div>
            <span class="select">
                <select v-model="selectedDomain" v-bind:disabled="usePlatformGeneratedDomain">
                    <option disabled value="">Please select one</option>
                    <option v-for="domain in domainList" v-bind:key="domain">{{domain}}</option>
                </select>
            </span>
            <input class="checkbox" type="checkbox" id="usePlatformGeneratedDomain" v-model="usePlatformGeneratedDomain"></input>
            <label for="usePlatformGeneratedDomain"> Use platform-generated domain</label>
            <button class="button is-primary" v-on:click="createNewDeployment" v-bind:disabled="selectedDomain.length<1 && !usePlatformGeneratedDomain">Deploy</button>
        </div>
        <div>
            <div>
                <input class="checkbox" type="checkbox" id="acceptTLSSSL" v-model="acceptTLSSSL"></input>
                <label for="acceptTLSSSL"> Accept TLS/SSL</label>
                <span class="select">
                    <select v-model="selectedCertificate" v-bind:disabled="!acceptTLSSSL">
                        <option disabled value="">Please select one</option>
                        <option v-for="certificate in certificateList" v-bind:key="certificate">{{certificate}}</option>
                    </select>
                </span>
            </div>
            <div>
                <input class="checkbox is-large" type="checkbox" id="requireClientCertificates" v-model="requireClientCertificates"></input>
                <label for="requireClientCertificates"> Require Client Certificates</label>
            </div>
        </div>
    
        <div class="tile is-6">
            <span class="name">Instances</span>
            <inputnumber class="tile is-1" v-model="instances"></inputnumber>
        </div>
        <div class="tile is-6">
            <span class="name">Resilence</span>
            <inputnumber class="tile is-1" v-model="resilience"></inputnumber>
        </div>
    </div>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../../../store/classes';
import InputNumber from '../input/InputNumber.vue';

@Component({
    name: 'new-httpentrypoint',
    components: {
        'inputnumber': InputNumber
    }
})
export default class NewHTTPEntrypoint extends Vue {
    usePlatformGeneratedDomain: boolean = false;
    selectedDomain: string = "";
    selectedCertificate: string = "";
    acceptTLSSSL: boolean = false;
    requireClientCertificates: boolean = false;
    instances: number = 1;
    resilience: number = 1;

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }

    get domainList() {
        return this.$store.getters.getFreeWebDomainList;
    }
    get certificateList() {
        return this.$store.getters.getCertificateList;
    }
    createNewDeployment() {
        this.usePlatformGeneratedDomain
        this.$store.dispatch('createNewHTTPENtrypoint', {
            'usePlatformGeneratedDomain': this.usePlatformGeneratedDomain,
            'domain': this.selectedDomain,
            'certificate': this.selectedCertificate,
            'accept-tls': this.acceptTLSSSL,
            'require-client-certificates': this.requireClientCertificates,
            'instances': this.instances,
            'resilience': this.resilience
        });
    }
}
</script>
<style lang="scss">
#acceptTLSSSL {
    margin-top: 1em;
}

.name {
    padding-top: 1em;
}
</style>