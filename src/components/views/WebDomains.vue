<template>
    <div>
        <div class="tile is-4">
            <input class="input" v-model="newWebDomain" placeholder="New web domain">
            <button class="button is-primary" v-on:click="addWebDomain">add</button>
        </div>
        <table class="table">
            <tr v-for="usedWebdomain in usedWebDomainList" v-bind:key="usedWebdomain">
                <th>
                    <a v-bind:href="'http://'+usedWebdomain[1]">
                        {{usedWebdomain[1]}}
                    </a>
                </th>
                <th>
                    <i class="fa fa-circle CONNECTED_FONT_COLOR" aria-hidden="true" />
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
                    <i class="fa fa-circle" v-bind:class="getWebdomainState(freeWebdomain)" aria-hidden="true" />
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
import { FabElement, State } from '../../store/classes';
@Component({
    name: 'WebDomains'
})
export default class WebDomains extends Vue {
    newWebDomain = null;
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        // fabElementsList.push(new FabElement('Add new web domain', ''));
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
                case State.CONNECTED:
                    return 'CONNECTED_FONT_COLOR';
                case State.DISCONNECTED:
                    return 'DISCONNECTED_FONT_COLOR';
                default:
                    return 'ON_PROGRESS_FONT_COLOR';
            }
        }
    }

    deleteWebDomain(webdomain) {
        this.$store.dispatch('deleteWebdomain', webdomain);
    }
    addWebDomain() {
        if (this.newWebDomain != null && this.newWebDomain.length > 0)
            this.$store.dispatch('addWebDomain', this.newWebDomain);
    }
}
</script>