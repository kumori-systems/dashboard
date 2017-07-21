<template>
    <div>
        <table class="table">
            <tr v-for="usedWebdomain in usedWebDomainList" v-bind:key="usedWebdomain">
                <th>
                    <a v-bind:href="'http://'+usedWebdomain[1]">
                        {{usedWebdomain[1]}}
                    </a>
                </th>
                <th>
                    <i class="fa fa-check-circle" aria-hidden="true" />
                </th>
                <th>
                    <span class="ON_PROGRESS">in use</span> by {{usedWebdomain[0]}}
                </th>
                <th>
                    <button class="button is-danger">
                        <i class="fa fa-trash" aria-hidden="true" v-on:click="deleteWebDomain(usedWebdomain)"></i>
                    </button>
                </th>
            </tr>
            <tr v-for="freeWebdomain in freeWebDomainList" v-bind:key="freeWebdomain">
                <th>{{freeWebdomain}}
                </th>
                <th>
                    <i v-bind:class="getWebdomainState(freeWebdomain)" aria-hidden="true" />
                </th>
                <th></th>
                <th>
                    <button class="button is-danger" v-on:click="deleteWebDomain(freeWebdomain)">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </th>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Webdomain } from '../../store/classes';
@Component({
    name: 'WebDomains'
})
export default class WebDomains extends Vue {
    created() {
        this.$store.dispatch('getDeploymentList');
    }
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        fabElementsList.push(new FabElement('Add new domain', '/newDomain'));
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }

    get usedWebDomainList() {
        return this.$store.getters.getUsedWebDomainList;
    }
    get freeWebDomainList() {
        return this.$store.getters.getFreeWebDomainList;
    }
    get getWebdomainState() {
        return (webdomain) => {
            switch (this.$store.getters.getWebdomainState(webdomain)) {
                case Webdomain.State.VALIDATED:
                    return 'fa fa-check-circle';
                case Webdomain.State.ERRONEUS:
                    return 'fa fa-exclamation-circle';
                case Webdomain.State.ON_VALIDATION:
                    return 'fa fa-exclamation-triangle';
                default:
                    console.error('Webdomains view received a non-covered webdomain state \'' + JSON.stringify(this.$store.getters.getWebdomainState(webdomain)) + '\' when asking for ' + webdomain + '\'s state');
                    return '';
            }
        }
    }

    deleteWebDomain(webdomain) {
        this.$store.dispatch('deleteWebdomain', this.$store.getters.getWebdomainResource(webdomain));
    }
}
</script>
<style lang="scss" scoped>
$color_green:#93c47d;
$color_yellow:#f5d164;
$color_red:#ff6666;
$icon_size: 20px;

.fa-check-circle {
    color: $color_green;
    font-size: $icon_size;
}

.fa-exclamation-triangle {
    color: $color_yellow;
    font-size: $icon_size;
}

.fa-exclamation-circle {
    color: $color_red;
    font-size: $icon_size;
}
</style>