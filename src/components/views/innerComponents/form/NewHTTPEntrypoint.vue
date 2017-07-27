<template>
    <div class="tile is-6">
        <table>
            <tr>
                <th>
                    <span class="select">
                        <select v-model="selectedDomain" v-bind:disabled="usePlatformGeneratedDomain">
                            <option disabled value="">Please select one</option>
                            <option disabled v-for="domain in freeDomainList" v-bind:key="domain">{{domain}}</option>
                            <option disabled v-for="domain in usedDomainList" v-bind:key="domain">{{domain}}</option>
                        </select>
                    </span>
    
                </th>
                <th>
                    <checkbox-input v-model="usePlatformGeneratedDomain"> Use platform-generated domain</checkbox-input>
                </th>
                <th>
                    <button class="button is-primary" v-on:click="createNewDeployment" v-bind:disabled="selectedDomain.length<1 && !usePlatformGeneratedDomain">Deploy</button>
                </th>
            </tr>
            <tr>
                <th>
                    <checkbox-input v-model="acceptTLSSSL"> Accept TLS/SSL</checkbox-input>
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
                    <checkbox-input v-model="requireClientCertificates"> Require client certificates</checkbox-input>
                </th>
            </tr>
            <tr>
                <th>
                    <table>
                        <tr>
                            <th>Instances</th>
                            <th>
                                <number-input class="tile is-3" v-model="instances"></number-input>
                            </th>
                        </tr>
                    </table>
                </th>
            </tr>
            <tr>
                <th>
                    <table>
                        <tr>
                            <th>Resilence</th>
                            <th>
                                <number-input class="tile is-3" v-model="resilience"></number-input>
                            </th>
                        </tr>
                    </table>
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

    get freeDomainList() {
        return this.$store.getters.getFreeWebDomainList;
    }

    get usedDomainList() {
        return this.$store.getters.getUsedWebDomainList;
    }

    get certificateList() {
        return this.$store.getters.getCertificateList;
    }

    createNewDeployment() {
        this.$store.dispatch('createNewHTTPEntrypoint', {
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
.input {
    min-width: 5em;
}

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