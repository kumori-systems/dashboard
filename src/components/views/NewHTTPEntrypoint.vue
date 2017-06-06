<template>
    <div class="inner-content">
        <div>
            <select v-model="selectedDomain" v-bind:disabled="usePlatformGeneratedDomain">
                <option disabled value="">Please select one</option>
                <option v-for="domain in domainList">{{domain}}</option>
            </select>
            <input type="checkbox" id="usePlatformGeneratedDomain" v-model="usePlatformGeneratedDomain" />
            <label for="usePlatformGeneratedDomain"> Use platform-generated domain</label>
            <button v-on:click="createNewDeployment" v-bind:disabled="selectedDomain.length<1 && !usePlatformGeneratedDomain">Deploy</button>
        </div>
        <div class="inner-content">
            <div>
                <input type="checkbox" id="acceptTLSSSL" v-model="acceptTLSSSL" />
                <label for="acceptTLSSSL"> Accept TLS/SSL</label>
                <select v-model="selectedCertificate" v-bind:disabled="!acceptTLSSSL">
                    <option disabled value="">Please select one</option>
                    <option v-for="certificate in certificateList">{{certificate}}</option>
                </select>
            </div>
            <div>
                <input type="checkbox" id="requireClientCertificates" v-model="requireClientCertificates" />
                <label for="requireClientCertificates"> Require Client Certificates</label>
            </div>
        </div>
        <div>
            Instances {{instances}}
            <button class="button fa fa-angle-up" v-on:click="instances += 1"></button>
            <button class="button fa fa-angle-down" v-on:click="instances>0? instances--:0"></button>
        </div>
        <div>
            Resilence {{resilence}}
            <button class="button fa fa-angle-up" v-on:click="resilence += 1"></button>
            <button class="button fa fa-angle-down" v-on:click="resilence>0? resilence--:0"></button>
        </div>
    
    </div>
</template>

<script lang="ts">

// TODO: No se pueden listar dominios que ya estén en uso
// TODO: Los certificados los tenemos que obtener de otro documento distinto al stamp state

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../store/classes';

@Component({
    name: 'new-httpentrypoint'
})
export default class NewHTTPEntrypoint extends Vue {
    usePlatformGeneratedDomain: boolean = false;
    selectedDomain: string = "";
    selectedCertificate: string = "";
    acceptTLSSSL: boolean = false;
    requireClientCertificates: boolean = false;
    instances: number = 0;
    resilence: number = 0;

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
            'accept-tls': this.acceptTLSSSL,
            'require-client-certificates': this.requireClientCertificates,
            'instances': this.instances,
            'resilence': this.resilence
        });
    }
}
</script>

