<template>
    <div class="inner-content">
        <div>
            <span class="select">
                <select v-model="selectedDomain" v-bind:disabled="usePlatformGeneratedDomain">
                    <option disabled value="">Please select one</option>
                    <option v-for="domain in domainList">{{domain}}</option>
                </select>
            </span>
            <input class="checkbox" type="checkbox" id="usePlatformGeneratedDomain" v-model="usePlatformGeneratedDomain" />
            <label for="usePlatformGeneratedDomain"> Use platform-generated domain</label>
            <button class="button is-primary" v-on:click="createNewDeployment" v-bind:disabled="selectedDomain.length<1 && !usePlatformGeneratedDomain">Deploy</button>
        </div>
        <div class="inner-content">
            <div>
                <input class="checkbox" type="checkbox" id="acceptTLSSSL" v-model="acceptTLSSSL" />
                <label for="acceptTLSSSL"> Accept TLS/SSL</label>
                <span class="select">
                    <select v-model="selectedCertificate" v-bind:disabled="!acceptTLSSSL">
                        <option disabled value="">Please select one</option>
                        <option v-for="certificate in certificateList">{{certificate}}</option>
                    </select>
                </span>
            </div>
            <div>
                <input class="checkbox is-large" type="checkbox" id="requireClientCertificates" v-model="requireClientCertificates" />
                <label for="requireClientCertificates"> Require Client Certificates</label>
            </div>
        </div>
        <div>
            Instances {{instances}}
            <button class="button is-small fa fa-angle-up" v-on:click="instances += 1"></button>
            <button class="button is-small fa fa-angle-down" v-on:click="instances>1? instances--:1"></button>
        </div>
        <div>
            Resilence {{resilence}}
            <button class="button is-small fa fa-angle-up" v-on:click="resilence += 1"></button>
            <button class="button is-small fa fa-angle-down" v-on:click="resilence>1? resilence--:1"></button>
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
    instances: number = 1;
    resilence: number = 1;

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

