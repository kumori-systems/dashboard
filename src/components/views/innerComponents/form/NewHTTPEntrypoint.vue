<template>
    <div class="tile is-6">
        <table>
            <tr>
                <th>
                    <span class="select">
                        <select v-model="selectedDomain" v-bind:disabled="usePlatformGeneratedDomain">
                            <option disabled value="">Please select one</option>
                            <option v-for="domain in domainList" v-bind:key="domain">{{domain}}</option>
                        </select>
                    </span>
    
                </th>
                <th>
                    <checkbox-input v-model="usePlatformGeneratedDomain" v-bind:text="' Use platform-generated domain'"></checkbox-input>
                </th>
                <th>
                    <button class="button is-primary" v-on:click="createNewDeployment" v-bind:disabled="selectedDomain.length<1 && !usePlatformGeneratedDomain">Deploy</button>
                </th>
            </tr>
            <tr>
                <th>
                    <checkbox-input v-model="acceptTLSSSL" v-bind:text="' Accept TLS/SSL'"></checkbox-input>
                    <span class="select">
                        <select v-model="selectedCertificate" v-bind:disabled="!acceptTLSSSL">
                            <option disabled value="">Please select one</option>
                            <option v-for="certificate in certificateList" v-bind:key="certificate">{{certificate}}</option>
                        </select>
                    </span>
                </th>
            </tr>
            <tr>
                <th>
                    <checkbox-input v-model="requireClientCertificates" v-bind:text="' Require client certificates'"></checkbox-input>
                </th>
            </tr>
            <tr>
                <th>
                    <div class="tile is-6">
                        <span class="name">Instances</span>
                        <number-input class="tile is-3" v-model="instances"></number-input>
                    </div>
                </th>
            </tr>
            <tr>
                <th>
                    <div class="tile is-6">
                        <span class="name">Resilence</span>
                        <number-input class="tile is-3" v-model="resilience"></number-input>
                    </div>
                </th>
            </tr>
    
        </table>
    </div>
</template>
<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement } from '../../../../store/classes';
import CheckboxInput from '../input/CheckboxInput.vue'
import NumberInput from '../input/NumberInput.vue';

@Component({
    name: 'new-httpentrypoint',
    components: {
        'number-input': NumberInput,
        'checkbox-input': CheckboxInput
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
        this.$router.go(-1);
    }
}
</script>
<style lang="scss" scoped>
#usePlatformGeneratedDomain {
    margin-top: 0.5em;
}

#acceptTLSSSL {
    margin-top: 0.5em;
}


table {
    border-collapse: collapse;
    border-bottom-width: 0px;
    tr,
    th {
        border-bottom-width: 0px;
    }
}
</style>